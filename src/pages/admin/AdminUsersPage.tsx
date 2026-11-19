import { useState, type FormEvent } from 'react'
import { AccountStats } from '../../components/admin/AccountStats'
import { ADMIN_ROLES, type AccountStatus, type AdminRole } from '../../api/admin/types'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { useAdminUser } from '../../api/admin/auth'
import { ApiError } from '../../api/client'
import { adminPath } from '../../routes/adminRouter'
import { AdminLink, Button, DataTable, Field, Modal, PageHeader, RoleBadge, StatusBadge } from '../../components/admin/ui'
import { ROLE_LABELS } from '../../components/admin/constants'

const STAFF_ROLES = ADMIN_ROLES.filter(role => role !== 'CUSTOMER')
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMPTY_FORM = { fullName: '', email: '', role: 'WAITER' as AdminRole | '' }
type FormErrors = { fullName?: string; email?: string; role?: string; form?: string }

function validate(form: typeof EMPTY_FORM): FormErrors {
  const fullName = form.fullName.trim()
  const email = form.email.trim()
  const errors: FormErrors = {}
  if (fullName.length < 2 || fullName.length > 150) errors.fullName = 'Nhập họ tên từ 2 đến 150 ký tự.'
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = 'Nhập email hợp lệ.'
  if (!form.role || form.role === 'CUSTOMER') errors.role = 'Chọn vai trò.'
  return errors
}

function createError(reason: unknown): FormErrors {
  if (reason instanceof ApiError) {
    if (reason.status === 409) return { email: 'Email này đã có tài khoản.' }
    if (reason.status === 503) return { form: 'Máy chủ chưa cấu hình gửi email nên chưa tạo được tài khoản.' }
    if (reason.status === 502) return { form: 'Không gửi được email. Tài khoản chưa được tạo, vui lòng thử lại.' }
    if (reason.status === 400) return { form: 'Thông tin chưa hợp lệ.' }
    if (reason.status === 401 || reason.status === 403) return { form: 'Bạn không có quyền tạo tài khoản.' }
  }
  return { form: reason instanceof Error ? reason.message : 'Không tạo được tài khoản.' }
}

export default function AdminUsersPage() {
  const { data, execute } = useAdminData()
  const me = useAdminUser()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<AdminRole | ''>('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const users = data?.users ?? []
  const selected = users.find(user => user.id === selectedId)
  const filtered = users.filter(user => `${user.fullName} ${user.email}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')) && (!role || user.role === role) && (!status || user.status === status))
  const pages = Math.max(1, Math.ceil(filtered.length / 5))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * 5, current * 5)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [createdEmail, setCreatedEmail] = useState('')
  const close = () => { setSelectedId(''); setConfirming(false); setError('') }
  const openCreate = () => { setCreatedEmail(''); setCreating(true) }
  const closeCreate = () => { setCreating(false); setForm(EMPTY_FORM); setFormErrors({}) }
  const changeForm = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm(current => ({ ...current, [key]: value }))
    setFormErrors(current => ({ ...current, [key]: undefined, form: undefined }))
  }
  const createUser = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const errors = validate(form)
    setFormErrors(errors)
    if (Object.keys(errors).length || !form.role) return
    const email = form.email.trim()
    setSubmitting(true)
    try {
      await execute({ type: 'user.create', user: { fullName: form.fullName.trim(), email, role: form.role } })
      closeCreate()
      setCreatedEmail(email)
    } catch (reason) { setFormErrors(createError(reason)) }
    finally { setSubmitting(false) }
  }
  const changeStatus = async () => {
    if (!selected || busy) return
    setBusy(true); setError('')
    try {
      await execute({ type: 'user.status', id: selected.id, status: selected.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })
      setConfirming(false)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được trạng thái.') }
    finally { setBusy(false) }
  }
  return <>
    <PageHeader title="Quản lý tài khoản" description="Tìm kiếm, lọc và quản lý quyền truy cập tài khoản." actions={<Button tone="primary" onClick={openCreate}>Tạo tài khoản</Button>} />
    {createdEmail && <p role="status">Đã tạo tài khoản và gửi mật khẩu tạm tới {createdEmail}.</p>}
    <p>Đặt lại mật khẩu chưa được máy chủ hỗ trợ.</p>
    <AccountStats />
    <section className="a-panel a-users-panel">
      <div className="a-toolbar">
        <input className="a-input" aria-label="Tìm tài khoản" placeholder="Tên hoặc email" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} />
        <select className="a-select" aria-label="Lọc vai trò" value={role} onChange={event => { setRole(event.target.value as AdminRole | ''); setPage(1) }}><option value="">Tất cả vai trò</option>{ADMIN_ROLES.map(item => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select>
        <select className="a-select" aria-label="Lọc trạng thái" value={status} onChange={event => { setStatus(event.target.value as AccountStatus | ''); setPage(1) }}><option value="">Tất cả trạng thái</option><option value="ACTIVE">Hoạt động</option><option value="LOCKED">Đã khóa</option></select>
      </div>
      <DataTable labels={['Tài khoản', 'Vai trò', 'Trạng thái', 'Ngày tạo', '']} empty={!rows.length} emptyText="Không có tài khoản phù hợp.">
        <>{rows.map(user => <tr key={user.id}>
          <td><strong>{user.fullName}</strong><div>{user.email}</div></td>
          <td><RoleBadge role={user.role} /></td><td><StatusBadge status={user.status} /></td>
          <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
          <td><Button onClick={() => setSelectedId(user.id)}>Xem chi tiết</Button></td>
        </tr>)}</>
      </DataTable>
      <div className="a-toolbar"><Button disabled={current <= 1} onClick={() => setPage(current - 1)}>Trước</Button><span>{current} / {pages}</span><Button disabled={current >= pages} onClick={() => setPage(current + 1)}>Sau</Button></div>
    </section>
    {selected && <Modal title={selected.fullName} description={selected.email} onClose={close} footer={<Button onClick={close}>Đóng</Button>}>
      <p>{selected.id}</p><RoleBadge role={selected.role} /> <StatusBadge status={selected.status} />
      <p><AdminLink to={`${adminPath('roles')}?user=${encodeURIComponent(selected.id)}`}>Mở phân quyền</AdminLink></p>
      {selected.id === me?.id ? <p>Không thể tự khóa tài khoản của mình.</p> : confirming ? <><p>Xác nhận {selected.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản?</p><Button disabled={busy} onClick={() => setConfirming(false)}>Hủy</Button><Button disabled={busy} onClick={changeStatus}>Xác nhận</Button></> : <Button onClick={() => setConfirming(true)}>{selected.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</Button>}
      {error && <p role="alert">{error}</p>}
    </Modal>}
    {creating && <Modal title="Tạo tài khoản nhân viên" description="Mật khẩu tạm sẽ được gửi tới email của nhân viên." onClose={closeCreate} footer={<><Button onClick={closeCreate}>Hủy</Button><Button type="submit" form="create-user" tone="primary" disabled={submitting}>{submitting ? 'Đang tạo…' : 'Tạo tài khoản'}</Button></>}>
      <form id="create-user" className="a-form" onSubmit={createUser} noValidate>
        <Field label="Họ và tên" error={formErrors.fullName}><input className="a-input" value={form.fullName} onChange={event => changeForm('fullName', event.target.value)} /></Field>
        <Field label="Email" error={formErrors.email}><input className="a-input" type="email" value={form.email} onChange={event => changeForm('email', event.target.value)} /></Field>
        <Field label="Vai trò" error={formErrors.role}><select className="a-select" value={form.role} onChange={event => changeForm('role', event.target.value)}>{STAFF_ROLES.map(item => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select></Field>
        {formErrors.form && <p className="a-form-error" role="alert">{formErrors.form}</p>}
      </form>
    </Modal>}
  </>
}
