import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { ApiError } from '../../api/client'
import { Button, DemoNotice, Field, Icon, PageHeader, SectionCard } from '../../components/admin/ui'

// Mirrors the server limits so most mistakes are caught before the PUT.
const MAX_LENGTHS = [
  ['name', 'Tên nhà hàng', 150],
  ['hotline', 'Hotline', 30],
  ['address', 'Địa chỉ', 255],
  ['description', 'Mô tả ngắn', 255],
  ['openingHours', 'Giờ mở cửa', 255],
  ['email', 'Email liên hệ', 255],
] as const
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
    if (reason.status === 401 || reason.status === 403) return 'Bạn không có quyền cập nhật ảnh.'
    if (reason.status === 0) return 'Không kết nối được máy chủ hoặc tải ảnh quá lâu.'
  }
  return reason instanceof Error ? reason.message : 'Không cập nhật được ảnh.'
}

function UploadField({ kind, label, url }: { kind: 'logo' | 'cover'; label: string; url: string }) {
  const { execute } = useAdminData()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const name = kind === 'logo' ? 'logo' : 'ảnh bìa'
  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      await action()
      setStatus(done)
    } catch (reason) {
      setError(imageError(reason))
    } finally {
      setBusy(false)
    }
  }
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatus('')
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Chỉ nhận ảnh PNG, JPG hoặc WebP.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Ảnh tối đa 5 MB.')
      return
    }
    void run(
      async () =>
        execute({
          type: 'restaurant.image.upload',
          kind,
          contentType: file.type,
          data: await readBase64(file),
        }),
      `Đã cập nhật ${name}.`,
    )
  }
  const remove = () =>
    void run(() => execute({ type: 'restaurant.image.remove', kind }), `Đã gỡ ${name}.`)
  return (
    <div className="a-upload">
      <div className="a-upload-preview">
        {url ? <img src={url} alt={label} /> : <Icon name="board" size={22} />}
      </div>
      <div>
        <strong>{label}</strong>
        <p>PNG, JPG hoặc WebP · tối đa 5 MB</p>
        <label className="a-button a-button--secondary">
          {busy ? 'Đang tải…' : url ? 'Đổi ảnh' : 'Chọn ảnh'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={upload}
          />
        </label>
        {url && (
          <Button tone="quiet" disabled={busy} onClick={remove}>
            Gỡ ảnh
          </Button>
        )}
        {error ? (
          <small className="a-field-error" role="alert">
            {error}
          </small>
        ) : status ? (
          <small role="status">{status}</small>
        ) : null}
      </div>
    </div>
  )
}

export default function AdminRestaurantPage() {
  const { data, execute } = useAdminData()
  const source = data?.restaurant
  const [form, setForm] = useState(() => source)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!form || !source) return null
  const change = (key: keyof typeof form, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current))
    setMessage('')
    setError('')
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (form.name.trim().length < 2) {
      setError('Tên nhà hàng cần ít nhất 2 ký tự.')
      return
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Email liên hệ chưa đúng định dạng.')
      return
    }
    for (const key of ['facebook', 'instagram', 'tiktok'] as const) {
      if (form[key] && !/^https:\/\//.test(form[key])) {
        setError(`${key} cần URL bắt đầu bằng https://.`)
        return
      }
    }
    for (const [key, label, max] of MAX_LENGTHS) {
      if (form[key].length > max) {
        setError(`${label} tối đa ${max} ký tự.`)
        return
      }
    }
    try {
      await execute({ type: 'restaurant.update', restaurant: form })
      setMessage('Đã lưu thông tin nhà hàng.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được thông tin.')
    }
  }
  return (
    <>
      <PageHeader
        title="Thông tin nhà hàng"
        description="Quản lý hồ sơ hiển thị và các kênh liên hệ cơ bản."
        actions={
          <>
            <Button
              onClick={() => {
                setForm(source)
                setMessage('')
                setError('')
              }}
            >
              Hủy thay đổi
            </Button>
            <Button tone="primary" type="submit" form="restaurant-form">
              Lưu thay đổi
            </Button>
          </>
        }
      />
      <DemoNotice>
        Ảnh được lưu ngay khi tải lên. Các thông tin khác lưu bằng nút Lưu thay đổi.
      </DemoNotice>
      <form id="restaurant-form" className="a-settings-stack" onSubmit={submit} noValidate>
        <SectionCard
          icon="utensils"
          title="Thông tin cơ bản"
          description="Nội dung nhận diện nhà hàng trên các kênh được hỗ trợ."
        >
          <div className="a-form-grid">
            <Field label="Tên nhà hàng">
              <input
                className="a-input"
                value={form.name}
                onChange={(event) => change('name', event.target.value)}
              />
            </Field>
            <Field label="Email liên hệ">
              <input
                className="a-input"
                type="email"
                value={form.email}
                onChange={(event) => change('email', event.target.value)}
                placeholder="Để trống khi chưa cấu hình"
              />
            </Field>
            <Field label="Mô tả ngắn">
              <textarea
                className="a-input"
                rows={3}
                value={form.description}
                onChange={(event) => change('description', event.target.value)}
              />
            </Field>
            <div className="a-form-pair">
              <Field label="Địa chỉ">
                <input
                  className="a-input"
                  value={form.address}
                  onChange={(event) => change('address', event.target.value)}
                />
              </Field>
              <Field label="Hotline">
                <input
                  className="a-input"
                  value={form.hotline}
                  onChange={(event) => change('hotline', event.target.value)}
                  placeholder="Để trống khi chưa cấu hình"
                />
              </Field>
            </div>
            <Field label="Giờ mở cửa">
              <input
                className="a-input"
                value={form.openingHours}
                onChange={(event) => change('openingHours', event.target.value)}
                placeholder="Để trống khi chưa có dữ liệu"
              />
            </Field>
          </div>
        </SectionCard>
        <SectionCard icon="board" title="Hình ảnh" description="PNG, JPG hoặc WebP, tối đa 5 MB.">
          <div className="a-upload-grid">
            <UploadField kind="logo" label="Logo nhà hàng" url={source.logoUrl} />
            <UploadField kind="cover" label="Ảnh bìa" url={source.coverUrl} />
          </div>
        </SectionCard>
        <SectionCard
          icon="users"
          title="Mạng xã hội"
          description="Chỉ thêm URL chính thức; có thể để trống."
        >
          <div className="a-form-three">
            <Field label="Facebook">
              <input
                className="a-input"
                type="url"
                value={form.facebook}
                onChange={(event) => change('facebook', event.target.value)}
                placeholder="https://"
              />
            </Field>
            <Field label="Instagram">
              <input
                className="a-input"
                type="url"
                value={form.instagram}
                onChange={(event) => change('instagram', event.target.value)}
                placeholder="https://"
              />
            </Field>
            <Field label="TikTok">
              <input
                className="a-input"
                type="url"
                value={form.tiktok}
                onChange={(event) => change('tiktok', event.target.value)}
                placeholder="https://"
              />
            </Field>
          </div>
        </SectionCard>
        {error && (
          <p className="a-form-error a-form-message" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="a-inline-warning a-form-message" role="status">
            {message}
          </p>
        )}
      </form>
    </>
  )
}
