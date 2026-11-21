import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import type { MenuCategory } from '../../api/manager/types'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'
import {
  Button,
  DataTable,
  FormDialog,
  Link,
  PageHeading,
  Panel,
  RowAction,
  Status,
} from '../../components/manager/ui'

const GROUP_OPTIONS = [
  { value: 'food', label: 'Món ăn' },
  { value: 'drink', label: 'Đồ uống' },
]

export default function MenuCategoriesPage() {
  const { data: d, execute } = useManagerData()
  const user = useManagerUser()!
  const [editing, setEditing] = useState<{ category: MenuCategory; creating: boolean } | null>(null)
  const [deleting, setDeleting] = useState<MenuCategory | null>(null)
  if (!d) return null
  const canManage = user.permissions.includes('menu.manage')
  const rows = [...d.categories].sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
  return (
    <>
      <PageHeading
        title="Danh mục thực đơn"
        description="Sắp xếp danh mục và kiểm soát khả năng hiển thị trên thực đơn."
        actions={
          <>
            <Link className="k-btn" to={managerPath('menu')}>
              Về danh sách món
            </Link>
            {canManage && (
              <Button
                primary
                icon="plusCircle"
                onClick={() =>
                  setEditing({
                    creating: true,
                    category: { id: '', name: '', sort: rows.length + 1, visible: true },
                  })
                }
              >
                Thêm danh mục
              </Button>
            )}
          </>
        }
      />
      <WorkspaceSummary page="categories" />
      <Panel title="Danh sách danh mục">
        <DataTable
          headers={['Thứ tự', 'Mã danh mục', 'Tên danh mục', 'Nhóm', 'Số món', 'Hiển thị', '']}
          empty={!rows.length}
          count={rows.length}
        >
          {rows.map((c) => (
            <tr key={c.id}>
              <td>{c.sort}</td>
              <td className="m-code">{c.id}</td>
              <td>
                <strong>{c.name}</strong>
              </td>
              <td>{c.group === 'drink' ? 'Đồ uống' : 'Món ăn'}</td>
              <td>{d.menu.filter((m) => m.categoryId === c.id).length} món</td>
              <td>
                <Status
                  value={c.visible ? 'AVAILABLE' : 'HIDDEN'}
                  label={c.visible ? 'Đang hiển thị' : 'Đã ẩn'}
                />
              </td>
              <td>
                {canManage && (
                  <div className="m-row-actions">
                    <RowAction onClick={() => setEditing({ category: c, creating: false })}>
                      Chỉnh sửa
                    </RowAction>
                    <button
                      type="button"
                      className="m-row-action m-danger"
                      onClick={() => setDeleting(c)}
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
      {editing && (
        <FormDialog
          title={editing.creating ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}
          initial={{
            id: editing.category.id,
            name: editing.category.name,
            group: editing.category.group ?? 'food',
            sort: String(editing.category.sort),
            visible: editing.category.visible,
          }}
          fields={[
            ...(editing.creating ? [] : [{ key: 'id', label: 'Mã danh mục', disabled: true }]),
            { key: 'name', label: 'Tên danh mục' },
            { key: 'group', label: 'Nhóm', type: 'select', options: GROUP_OPTIONS },
            { key: 'sort', label: 'Thứ tự hiển thị', type: 'number' },
            { key: 'visible', label: 'Hiển thị danh mục', type: 'checkbox' },
          ]}
          onClose={() => setEditing(null)}
          onSubmit={async (v) => {
            const name = String(v.name).trim()
            const sort = Number(v.sort)
            if (!name || name.length > 60)
              throw new ManagerError('Nhập tên danh mục, tối đa 60 ký tự.', 'name')
            if (!Number.isInteger(sort) || sort < 1 || sort > 999)
              throw new ManagerError('Thứ tự phải là số nguyên từ 1 đến 999.', 'sort')
            try {
              await execute({
                type: 'category.save',
                creating: editing.creating,
                category: {
                  id: editing.category.id,
                  name,
                  sort,
                  visible: !!v.visible,
                  group: v.group === 'drink' ? 'drink' : 'food',
                },
              })
            } catch (e) {
              throw e instanceof ApiError && e.status === 409
                ? new ManagerError('Tên danh mục đã tồn tại.', 'name')
                : e
            }
          }}
        />
      )}
      {deleting && (
        <FormDialog
          title={`Xóa danh mục ${deleting.name}`}
          description="Chỉ xóa được danh mục không còn món tham chiếu. Thao tác được ghi vào lịch sử."
          fields={[]}
          initial={{}}
          onClose={() => setDeleting(null)}
          onSubmit={async () => {
            try {
              await execute({ type: 'category.delete', id: deleting.id })
            } catch (e) {
              throw e instanceof ApiError && e.status === 409
                ? new Error('Danh mục còn món, hãy chuyển món trước khi xóa.')
                : e
            }
          }}
          submitLabel="Xóa danh mục"
        />
      )}
    </>
  )
}
