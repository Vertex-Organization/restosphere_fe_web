import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { Button, DemoNotice, Field, Icon, PageHeader, SectionCard } from '../../components/admin/ui'

function UploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [error, setError] = useState('')
  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Chỉ nhận JPG, PNG hoặc WebP.'); return }
    if (file.size > 3 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 3 MB.'); return }
    onChange(URL.createObjectURL(file))
  }
  return <div className="a-upload"><div className="a-upload-preview">{value ? <img src={value} alt="Ảnh xem trước sẽ được tải lên" /> : <Icon name="inbox" size={24} />}</div><div><strong>{label}</strong><p>JPG, PNG hoặc WebP · tối đa 3 MB</p><label className="a-button a-button--secondary"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />Chọn ảnh</label>{value && <Button tone="quiet" onClick={() => onChange('')}>Xóa ảnh</Button>}{error && <small className="a-field-error">{error}</small>}</div></div>
}

export default function AdminRestaurantPage() {
  const { data } = useAdminData()
  const source = data?.restaurant
  const [form, setForm] = useState(() => source)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!form || !source) return null
  const change = (key: keyof typeof form, value: string) => { setForm((current) => current ? { ...current, [key]: value } : current); setMessage(''); setError('') }
  const submit = (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setError('')
    if (form.name.trim().length < 2) { setError('Tên nhà hàng cần ít nhất 2 ký tự.'); return }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { setError('Email liên hệ chưa đúng định dạng.'); return }
    for (const key of ['facebook', 'instagram', 'tiktok'] as const) { if (form[key] && !/^https:\/\//.test(form[key])) { setError(`${key} cần URL bắt đầu bằng https://.`); return } }
    setMessage('Thông tin đã hợp lệ nhưng chưa được lưu: Backend chưa có API cập nhật hồ sơ nhà hàng.')
  }
  return <>
    <PageHeader title="Thông tin nhà hàng" description="Quản lý hồ sơ hiển thị và các kênh liên hệ cơ bản." actions={<><Button onClick={() => { setForm(source); setMessage(''); setError('') }}>Hủy thay đổi</Button><Button tone="primary" type="submit" form="restaurant-form">Lưu thay đổi</Button></>} />
    <DemoNotice>Ảnh chỉ được xem trước cục bộ. Customer Web chưa bị thay đổi.</DemoNotice>
    <form id="restaurant-form" className="a-settings-stack" onSubmit={submit} noValidate><SectionCard title="Thông tin cơ bản" description="Nội dung nhận diện nhà hàng trên các kênh được hỗ trợ."><div className="a-form-grid"><Field label="Tên nhà hàng"><input className="a-input" value={form.name} onChange={(event) => change('name', event.target.value)} /></Field><Field label="Email liên hệ"><input className="a-input" type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="Để trống khi chưa cấu hình" /></Field><Field label="Mô tả ngắn"><textarea className="a-input" rows={3} value={form.description} onChange={(event) => change('description', event.target.value)} /></Field><div className="a-form-pair"><Field label="Địa chỉ"><input className="a-input" value={form.address} onChange={(event) => change('address', event.target.value)} /></Field><Field label="Hotline"><input className="a-input" value={form.hotline} onChange={(event) => change('hotline', event.target.value)} placeholder="Để trống khi chưa cấu hình" /></Field></div><Field label="Giờ mở cửa"><input className="a-input" value={form.openingHours} onChange={(event) => change('openingHours', event.target.value)} placeholder="Để trống khi chưa có dữ liệu" /></Field></div></SectionCard><SectionCard title="Hình ảnh" description="Ảnh xem trước chưa được tải lên server."><div className="a-upload-grid"><UploadField label="Logo nhà hàng" value={form.logoUrl} onChange={(value) => change('logoUrl', value)} /><UploadField label="Ảnh bìa" value={form.coverUrl} onChange={(value) => change('coverUrl', value)} /></div></SectionCard><SectionCard title="Mạng xã hội" description="Chỉ thêm URL chính thức; có thể để trống."><div className="a-form-three"><Field label="Facebook"><input className="a-input" type="url" value={form.facebook} onChange={(event) => change('facebook', event.target.value)} placeholder="https://" /></Field><Field label="Instagram"><input className="a-input" type="url" value={form.instagram} onChange={(event) => change('instagram', event.target.value)} placeholder="https://" /></Field><Field label="TikTok"><input className="a-input" type="url" value={form.tiktok} onChange={(event) => change('tiktok', event.target.value)} placeholder="https://" /></Field></div></SectionCard>{error && <p className="a-form-error a-form-message" role="alert">{error}</p>}{message && <p className="a-inline-warning a-form-message" role="status">{message}</p>}</form>
  </>
}
