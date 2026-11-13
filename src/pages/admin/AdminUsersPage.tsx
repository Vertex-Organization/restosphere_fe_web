import { useMemo, useState, type FormEvent } from 'react'
import { ADMIN_ROLES, type AccountStatus, type AdminRole, type AdminUser } from '../../api/admin/types'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { adminPath } from '../../routes/adminRouter'
import { AdminLink, Button, DataTable, DemoNotice, Field, Icon, Modal, PageHeader, RoleBadge, StatusBadge } from '../../components/admin/ui'
import { ROLE_LABELS } from '../../components/admin/constants'

const pageSize = 5
const EMPTY_USERS: AdminUser[] = []
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))

function UserDetail({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  return <Modal wide title={user.fullName} description={user.email} onClose={onClose} footer={<><Button onClick={onClose}>Đóng chi tiết</Button><AdminLink className="a-button a-button--primary" to={`${adminPath('roles')}?user=${encodeURIComponent(user.id)}`}>Mở phân quyền</AdminLink></>}><div className="a-user-detail"><div className="a-user-identity"><span className="a-avatar a-avatar--xl">{user.initials}</span><div><h3>{user.fullName}</h3><p>{user.email}</p><div><RoleBadge role={user.role} /><StatusBadge status={user.status} /></div></div></div><dl className="a-facts"><div><dt>Mã tài khoản</dt><dd>{user.id}</dd></div><div><dt>Vai trò hiện tại</dt><dd>{ROLE_LABELS[user.role]}</dd></div><div><dt>Ngày tạo</dt><dd>{date(user.createdAt)}</dd></div><div><dt>Trạng thái</dt><dd>{user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</dd></div></dl><div className="a-detail-actions"><div><h3>Kiểm soát tài khoản</h3><p>Thao tác khóa hoặc mở khóa cần endpoint quản trị và xác nhận từ Backend.</p></div>{confirming ? <div className="a-confirm-inline"><p>Xác nhận {user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản này?</p><Button tone="quiet" onClick={() => setConfirming(false)}>Hủy</Button><Button tone={user.status === 'ACTIVE' ? 'danger' : 'primary'} onClick={() => { setMessage('Chưa thể gửi thay đổi: Backend chưa có API cập nhật trạng thái tài khoản.'); setConfirming(false) }}>Xác nhận thay đổi</Button></div> : <Button tone={user.status === 'ACTIVE' ? 'danger' : 'secondary'} icon={user.status === 'ACTIVE' ? 'alert' : 'checkCircle'} onClick={() => setConfirming(true)}>{user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</Button>}{message && <p className="a-inline-warning" role="status">{message}</p>}</div></div></Modal>
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('WAITER')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault(); setError(''); setStatus('')
    if (name.trim().length < 2) { setError('Nhập họ tên có ít nhất 2 ký tự.'); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Nhập email cá nhân hợp lệ.'); return }
    if (role === 'ADMIN') { setError('Không thể tự cấp quyền ADMIN trong luồng tạo tài khoản.'); return }
    setStatus('Thông tin đã hợp lệ nhưng chưa được gửi: Backend chưa có API tạo tài khoản nhân viên.')
  }
  return <Modal title="Tạo tài khoản nhân viên" description="Form được kiểm tra ở Frontend; chưa có endpoint để lưu lên server." onClose={onClose} footer={<><Button onClick={onClose}>Hủy</Button><Button tone="primary" type="submit" form="create-admin-user">Kiểm tra thông tin</Button></>}><form id="create-admin-user" className="a-form" onSubmit={submit} noValidate><Field label="Họ và tên"><input className="a-input" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></Field><Field label="Email cá nhân"><input className="a-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></Field><Field label="Vai trò ban đầu" hint="ADMIN không được cấp từ form này."><select className="a-select" value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{ADMIN_ROLES.filter((item) => item !== 'ADMIN' && item !== 'CUSTOMER').map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select></Field>{error && <p className="a-form-error" role="alert">{error}</p>}{status && <p className="a-inline-warning" role="status">{status}</p>}</form></Modal>
}

export default function AdminUsersPage() {
  const { data } = useAdminData()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<AdminRole | ''>('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [tab, setTab] = useState<'all' | 'customer' | 'staff'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [creating, setCreating] = useState(false)
  const users = data?.users ?? EMPTY_USERS
  const filtered = useMemo(() => users.filter((user) => {
    const matchesTab = tab === 'all' || (tab === 'customer' ? user.role === 'CUSTOMER' : user.role !== 'CUSTOMER')
    const text = `${user.fullName} ${user.email}`.toLocaleLowerCase('vi')
    return matchesTab && (!query || text.includes(query.toLocaleLowerCase('vi'))) && (!role || user.role === role) && (!status || user.status === status)
  }), [users, tab, query, role, status])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize)
  const changeFilter = (callback: () => void) => { callback(); setPage(1) }

  return <>
    <PageHeader title="Quản lý tài khoản" description="Tìm kiếm, lọc và kiểm tra quyền truy cập của từng tài khoản." actions={<Button tone="primary" icon="plusCircle" onClick={() => setCreating(true)}>Tạo tài khoản</Button>} />
    <DemoNotice>Danh sách dưới đây là dữ liệu demo. Thao tác quan trọng không thay đổi dữ liệu server.</DemoNotice>
    <section className="a-panel a-users-panel"><div className="a-tabs" role="tablist" aria-label="Nhóm tài khoản">{([['all', 'Tất cả'], ['customer', 'Khách hàng'], ['staff', 'Nhân viên']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => changeFilter(() => setTab(value))}>{label}<span>{value === 'all' ? users.length : users.filter((user) => value === 'customer' ? user.role === 'CUSTOMER' : user.role !== 'CUSTOMER').length}</span></button>)}</div><div className="a-toolbar"><label className="a-search"><span className="a-sr-only">Tìm tài khoản</span><Icon name="search" size={17} /><input value={query} onChange={(event) => changeFilter(() => setQuery(event.target.value))} placeholder="Tìm theo tên hoặc email" /></label><select className="a-select" aria-label="Lọc theo vai trò" value={role} onChange={(event) => changeFilter(() => setRole(event.target.value as AdminRole | ''))}><option value="">Tất cả vai trò</option>{ADMIN_ROLES.map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select><select className="a-select" aria-label="Lọc theo trạng thái" value={status} onChange={(event) => changeFilter(() => setStatus(event.target.value as AccountStatus | ''))}><option value="">Tất cả trạng thái</option><option value="ACTIVE">Hoạt động</option><option value="LOCKED">Đã khóa</option></select></div><DataTable labels={['Tài khoản', 'Vai trò', 'Trạng thái', 'Ngày tạo', '']} empty={!rows.length} emptyText="Thử đổi từ khóa hoặc bộ lọc tài khoản."><>{rows.map((user) => <tr key={user.id}><td><div className="a-person"><span className="a-avatar a-avatar--soft">{user.initials}</span><div><strong>{user.fullName}</strong><small>{user.email}</small></div></div></td><td><RoleBadge role={user.role} /></td><td><StatusBadge status={user.status} /></td><td>{date(user.createdAt)}</td><td><button type="button" className="a-row-action" onClick={() => setSelected(user)}>Xem chi tiết <Icon name="chevronRight" size={14} /></button></td></tr>)}</></DataTable><div className="a-pagination"><span>Hiển thị {rows.length} trong {filtered.length} tài khoản</span><div><Button tone="quiet" disabled={current === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><Icon name="chevronLeft" size={15} />Trước</Button><span>Trang {current}/{totalPages}</span><Button tone="quiet" disabled={current === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Sau<Icon name="chevronRight" size={15} /></Button></div></div></section>
    {selected && <UserDetail user={selected} onClose={() => setSelected(null)} />}
    {creating && <CreateUserModal onClose={() => setCreating(false)} />}
  </>
}
