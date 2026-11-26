import { shortCode } from '../../components/kitchen/format'
import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState, type ChangeEvent } from 'react'
import { money, dateLabel } from '../../api/manager/dates'
import type { MenuItem } from '../../api/manager/types'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { DishThumb } from '../../components/billing/ui'
import { managerPath } from '../../routes/managerRouter'
import {
  Button,
  DataTable,
  Filter,
  FormDialog,
  Icon,
  Link,
  PageHeading,
  Panel,
  RowAction,
  Search,
  Status,
} from '../../components/manager/ui'
import { matchesSearch, optionsOf, statusOptions } from '../../api/manager/labels'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'
import { managerService } from '../../api/manager/service'

const UNIT_OPTIONS = [
  { value: 'portion', label: 'Theo phần' },
  { value: 'kg', label: 'Theo kg' },
]
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function imageError(reason: unknown) {
  if (reason instanceof ApiError) {
    if (reason.status === 400) return 'Ảnh không hợp lệ. Chỉ nhận PNG, JPG hoặc WebP tối đa 5 MB.'
    if (reason.status === 503) return 'Máy chủ chưa cấu hình lưu trữ ảnh.'
    if (reason.status === 502) return 'Không tải được ảnh lên, vui lòng thử lại.'
    if (reason.status === 401 || reason.status === 403) return 'Bạn không có quyền tải ảnh.'
    if (reason.status === 0) return 'Không kết nối được máy chủ hoặc tải ảnh quá lâu.'
  }
  return reason instanceof Error ? reason.message : 'Không tải được ảnh lên.'
}

function MenuImageField({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Chỉ nhận ảnh PNG, JPG hoặc WebP.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Ảnh tối đa 5 MB.')
      return
    }
    setBusy(true)
    setError('')
    try {
      onChange(await managerService.uploadMenuImage(file.type, await readBase64(file)))
    } catch (reason) {
      setError(imageError(reason))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="k-field">
      <span className="k-label">Ảnh món</span>
      <div className="m-image-field">
        <DishThumb url={url || undefined} size={72} />
        <div>
          <label className="k-btn k-btn--secondary">
            {busy ? 'Đang tải…' : url ? 'Đổi ảnh' : 'Chọn ảnh'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              disabled={busy}
              onChange={upload}
            />
          </label>
          {url && (
            <Button
              disabled={busy}
              onClick={() => {
                setError('')
                onChange('')
              }}
            >
              Gỡ ảnh
            </Button>
          )}
          <small className="m-muted">
            PNG, JPG hoặc WebP · tối đa 5 MB. Ảnh được lưu khi bấm Lưu món ăn.
          </small>
          {error && (
            <span className="k-field-error" role="alert">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const { data: d, execute } = useManagerData()
  const user = useManagerUser()!
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<{ item: MenuItem; creating: boolean } | null>(null)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  if (!d) return null
  const canManage = user.permissions.includes('menu.manage')
  const categories = [...d.categories].sort((a, b) => a.sort - b.sort)
  const rows = d.menu.filter(
    (m) =>
      matchesSearch(query, m.name, m.id) &&
      (!category || m.categoryId === category) &&
      (!status || m.status === status),
  )
  const create = () =>
    setEditing({
      creating: true,
      item: {
        id: '',
        name: '',
        categoryId: categories.find((c) => c.visible)?.id ?? '',
        price: 0,
        description: '',
        image: '',
        status: 'AVAILABLE',
        updatedAt: '',
      },
    })
  return (
    <>
      <PageHeading
        title="Thực đơn"
        description="Quản lý món, giá bán và tình trạng kinh doanh của nhà hàng."
        actions={
          <>
            <Link className="k-btn" to={managerPath('categories')}>
              Quản lý danh mục
            </Link>
            {canManage && (
              <Button primary icon="plusCircle" onClick={create}>
                Thêm món ăn
              </Button>
            )}
          </>
        }
      />
      <WorkspaceSummary page="menu" />
      <Panel title="Danh sách món ăn" aside={<span className="m-muted">{rows.length} món</span>}>
        <div className="m-toolbar">
          <Search value={query} onChange={setQuery} placeholder="Tìm tên món, mã món…" />
          <Filter
            label="Danh mục"
            value={category}
            onChange={setCategory}
            options={[{ value: '', label: 'Tất cả danh mục' }, ...optionsOf(categories)]}
          />
          <Filter
            label="Tình trạng kinh doanh"
            value={status}
            onChange={setStatus}
            options={statusOptions(['AVAILABLE', 'SOLD_OUT', 'DISCONTINUED']).map((o) =>
              o.value === 'AVAILABLE' ? { ...o, label: 'Còn bán' } : o,
            )}
          />
        </div>
        <DataTable
          headers={['Món ăn', 'Mã món', 'Danh mục', 'Giá bán', 'Trạng thái', 'Cập nhật', '']}
          empty={!rows.length}
          count={rows.length}
        >
          {rows.map((m) => (
            <tr key={m.id}>
              <td>
                <div className="m-dish">
                  <span
                    className="m-dish-photo"
                    onErrorCapture={(e) => {
                      e.currentTarget.dataset.failed = 'true'
                    }}
                  >
                    <DishThumb url={m.image} size={36} />
                    <Icon name="utensils" size={16} />
                  </span>
                  <div>
                    <strong>{m.name}</strong>
                    {m.description && <small>{m.description}</small>}
                  </div>
                </div>
              </td>
              <td className="m-code">{shortCode(m.id)}</td>
              <td>{d.categories.find((c) => c.id === m.categoryId)?.name}</td>
              <td className="m-num">
                {money(m.price)}
                {m.unit === 'kg' && '/kg'}
              </td>
              <td>
                <Status value={m.status} label={m.status === 'AVAILABLE' ? 'Còn bán' : undefined} />
              </td>
              <td>{dateLabel(m.updatedAt)}</td>
              <td>
                {canManage && (
                  <div className="m-row-actions">
                    <RowAction onClick={() => setEditing({ item: m, creating: false })}>
                      Chỉnh sửa
                    </RowAction>
                    <button
                      type="button"
                      className="m-row-action m-danger"
                      onClick={() => setDeleting(m)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      <p className="m-footnote">
        Thay đổi giá bán chỉ áp dụng cho lượt gọi mới. Giá của các món đã gọi được giữ nguyên.
      </p>
      {editing && (
        <FormDialog
          title={editing.creating ? 'Thêm món ăn' : `Chỉnh sửa ${editing.item.name}`}
          initial={{
            ...editing.item,
            price: String(editing.item.price),
            unit: editing.item.unit ?? 'portion',
          }}
          fields={[
            ...(editing.creating ? [] : [{ key: 'id', label: 'Mã món', disabled: true }]),
            { key: 'name', label: 'Tên món' },
            {
              key: 'categoryId',
              label: 'Danh mục',
              type: 'select',
              options: optionsOf(categories.filter((c) => c.visible)),
            },
            { key: 'price', label: 'Giá bán (đồng)', type: 'number' },
            { key: 'unit', label: 'Đơn vị giá', type: 'select', options: UNIT_OPTIONS },
            { key: 'description', label: 'Mô tả món', type: 'textarea' },
            {
              key: 'status',
              label: 'Tình trạng kinh doanh',
              type: 'select',
              options: [
                { value: 'AVAILABLE', label: 'Còn bán' },
                { value: 'SOLD_OUT', label: 'Tạm hết' },
                { value: 'DISCONTINUED', label: 'Ngừng bán' },
              ],
            },
          ]}
          extra={
            <MenuImageField
              url={editing.item.image}
              onChange={(url) => setEditing((e) => e && { ...e, item: { ...e.item, image: url } })}
            />
          }
          onClose={() => setEditing(null)}
          onSubmit={async (v) => {
            const name = String(v.name).trim()
            const categoryId = String(v.categoryId ?? '')
            const price = v.price === '' ? NaN : Number(v.price)
            if (!name || name.length > 100)
              throw new ManagerError('Tên món bắt buộc, tối đa 100 ký tự.', 'name')
            if (!categoryId)
              throw new ManagerError('Chọn một danh mục đang hiển thị.', 'categoryId')
            if (!Number.isSafeInteger(price) || price < 0)
              throw new ManagerError('Giá món phải là số đồng nguyên không âm.', 'price')
            await execute({
              type: 'menu.save',
              creating: editing.creating,
              item: {
                ...editing.item,
                name,
                categoryId,
                price,
                image: editing.item.image,
                description: String(v.description),
                status: v.status as MenuItem['status'],
                unit: v.unit === 'kg' ? 'kg' : 'portion',
              },
            })
          }}
          submitLabel="Lưu món ăn"
        />
      )}
      {deleting && (
        <FormDialog
          title={`Xóa món ${deleting.name}`}
          description="Món đã được gọi trong đơn hàng phải dùng trạng thái Ngừng bán. Chỉ xóa được món chưa có tham chiếu."
          fields={[]}
          initial={{}}
          onClose={() => setDeleting(null)}
          onSubmit={async () => {
            try {
              await execute({ type: 'menu.delete', id: deleting.id })
            } catch (e) {
              throw e instanceof ApiError && e.status === 409
                ? new Error(
                    'Món đã được gọi hoặc đặt trước nên không xóa được. Hãy chỉnh sửa và chuyển sang Ngừng bán.',
                  )
                : e
            }
          }}
          submitLabel="Xóa món ăn"
        />
      )}
    </>
  )
}
