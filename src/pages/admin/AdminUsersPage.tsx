import { useState } from 'react'
import { AccountStats } from '../../components/admin/AccountStats'
import { ADMIN_ROLES, type AccountStatus, type AdminRole } from '../../api/admin/types'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { adminPath } from '../../routes/adminRouter'
import { AdminLink, Button, DataTable, Modal, PageHeader, RoleBadge, StatusBadge } from '../../components/admin/ui'
import { ROLE_LABELS } from '../../components/admin/constants'

export default function AdminUsersPage() {
  const { data, execute } = useAdminData()
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
  const close = () => { setSelectedId(''); setConfirming(false); setError('') }
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
    <PageHeader title="Quản lý tài khoản" description="Tìm kiếm, lọc và quản lý quyền truy cập tài khoản." />
    <p>Tạo tài khoản và đặt lại mật khẩu chưa được máy chủ hỗ trợ.</p>
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
      {confirming ? <><p>Xác nhận {selected.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản?</p><Button disabled={busy} onClick={() => setConfirming(false)}>Hủy</Button><Button disabled={busy} onClick={changeStatus}>Xác nhận</Button></> : <Button onClick={() => setConfirming(true)}>{selected.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</Button>}
      {error && <p role="alert">{error}</p>}
    </Modal>}
  </>
}
