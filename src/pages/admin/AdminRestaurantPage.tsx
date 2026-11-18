import { useState, type FormEvent } from 'react'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { Button, DemoNotice, Field, PageHeader, SectionCard } from '../../components/admin/ui'

// Mirrors the server limits so most mistakes are caught before the PUT.
const MAX_LENGTHS = [['name', 'Tên nhà hàng', 150], ['hotline', 'Hotline', 30], ['address', 'Địa chỉ', 255], ['description', 'Mô tả ngắn', 255], ['openingHours', 'Giờ mở cửa', 255], ['email', 'Email liên hệ', 255]] as const
const IMAGE_FIELDS = [['logoUrl', 'Logo nhà hàng'], ['coverUrl', 'Ảnh bìa']] as const

function UploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  return <Field label={label}><input className="a-input" type="url" value={value} onChange={event => onChange(event.target.value)} placeholder="https://" /></Field>
}

export default function AdminRestaurantPage() {
  const { data, execute } = useAdminData()
  const source = data?.restaurant
  const [form, setForm] = useState(() => source)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!form || !source) return null
  const change = (key: keyof typeof form, value: string) => { setForm((current) => current ? { ...current, [key]: value } : current); setMessage(''); setError('') }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setError('')
    if (form.name.trim().length < 2) { setError('Tên nhà hàng cần ít nhất 2 ký tự.'); return }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { setError('Email liên hệ chưa đúng định dạng.'); return }
    for (const key of ['facebook', 'instagram', 'tiktok'] as const) { if (form[key] && !/^https:\/\//.test(form[key])) { setError(`${key} cần URL bắt đầu bằng https://.`); return } }
    for (const [key, label, max] of MAX_LENGTHS) { if (form[key].length > max) { setError(`${label} tối đa ${max} ký tự.`); return } }
    for (const [key, label] of IMAGE_FIELDS) { if (form[key] && !/^https:\/\//.test(form[key])) { setError(`${label} cần URL bắt đầu bằng https://.`); return } }
    try { await execute({ type: 'restaurant.update', restaurant: form }); setMessage('Đã lưu thông tin nhà hàng.') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được thông tin.') }
  }
  return <>
    <PageHeader title="Thông tin nhà hàng" description="Quản lý hồ sơ hiển thị và các kênh liên hệ cơ bản." actions={<><Button onClick={() => { setForm(source); setMessage(''); setError('') }}>Hủy thay đổi</Button><Button tone="primary" type="submit" form="restaurant-form">Lưu thay đổi</Button></>} />
    <DemoNotice>Nhập URL ảnh đã được lưu trên máy chủ.</DemoNotice>
    <form id="restaurant-form" className="a-settings-stack" onSubmit={submit} noValidate><SectionCard icon="utensils" title="Thông tin cơ bản" description="Nội dung nhận diện nhà hàng trên các kênh được hỗ trợ."><div className="a-form-grid"><Field label="Tên nhà hàng"><input className="a-input" value={form.name} onChange={(event) => change('name', event.target.value)} /></Field><Field label="Email liên hệ"><input className="a-input" type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="Để trống khi chưa cấu hình" /></Field><Field label="Mô tả ngắn"><textarea className="a-input" rows={3} value={form.description} onChange={(event) => change('description', event.target.value)} /></Field><div className="a-form-pair"><Field label="Địa chỉ"><input className="a-input" value={form.address} onChange={(event) => change('address', event.target.value)} /></Field><Field label="Hotline"><input className="a-input" value={form.hotline} onChange={(event) => change('hotline', event.target.value)} placeholder="Để trống khi chưa cấu hình" /></Field></div><Field label="Giờ mở cửa"><input className="a-input" value={form.openingHours} onChange={(event) => change('openingHours', event.target.value)} placeholder="Để trống khi chưa có dữ liệu" /></Field></div></SectionCard><SectionCard icon="board" title="Hình ảnh" description="Ảnh xem trước chưa được tải lên server."><div className="a-upload-grid"><UploadField label="Logo nhà hàng" value={form.logoUrl} onChange={(value) => change('logoUrl', value)} /><UploadField label="Ảnh bìa" value={form.coverUrl} onChange={(value) => change('coverUrl', value)} /></div></SectionCard><SectionCard icon="users" title="Mạng xã hội" description="Chỉ thêm URL chính thức; có thể để trống."><div className="a-form-three"><Field label="Facebook"><input className="a-input" type="url" value={form.facebook} onChange={(event) => change('facebook', event.target.value)} placeholder="https://" /></Field><Field label="Instagram"><input className="a-input" type="url" value={form.instagram} onChange={(event) => change('instagram', event.target.value)} placeholder="https://" /></Field><Field label="TikTok"><input className="a-input" type="url" value={form.tiktok} onChange={(event) => change('tiktok', event.target.value)} placeholder="https://" /></Field></div></SectionCard>{error && <p className="a-form-error a-form-message" role="alert">{error}</p>}{message && <p className="a-inline-warning a-form-message" role="status">{message}</p>}</form>
  </>
}
