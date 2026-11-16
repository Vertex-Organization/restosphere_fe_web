import { useState } from 'react'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { DataTable, DemoNotice, EmptyState, Icon, PageHeader } from '../../components/admin/ui'

import { AUDIT_ACTION_LABELS as ACTIONS } from '../../components/admin/constants'

export default function AdminAuditLogsPage() {
  const { data } = useAdminData()
  const [action, setAction] = useState('')
  const [actor, setActor] = useState('')
  const [from, setFrom] = useState('')
  const logs = (data?.auditLogs ?? []).filter((log) => (!action || log.action === action) && (!actor || log.actor.toLocaleLowerCase('vi').includes(actor.toLocaleLowerCase('vi'))) && (!from || new Date(log.at) >= new Date(from)))
  return <>
    <PageHeader title="Nhật ký hoạt động" description="Theo dõi các thao tác quản trị quan trọng và kết quả xử lý." />
    <DemoNotice>Backend chưa có audit API; trang hiển thị empty state thay vì dựng nhật ký giả.</DemoNotice>
    <section className="a-panel"><header><div className="a-panel-heading"><span className="a-section-icon"><Icon name="history" size={18} /></span><div><h2>Nhật ký quản trị</h2><p>{logs.length} hoạt động phù hợp</p></div></div></header><div className="a-toolbar"><select className="a-select" aria-label="Lọc loại hành động" value={action} onChange={(event) => setAction(event.target.value)}><option value="">Tất cả hành động</option>{Object.entries(ACTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="a-search"><span className="a-sr-only">Tìm người thực hiện</span><Icon name="search" size={17} /><input value={actor} onChange={(event) => setActor(event.target.value)} placeholder="Người thực hiện" /></label><label className="a-date-field"><span>Từ ngày</span><input className="a-input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label></div>{logs.length ? <DataTable labels={['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Kết quả']}><>{logs.map((log) => <tr key={log.id}><td>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.at))}</td><td>{log.actor}</td><td>{ACTIONS[log.action]}</td><td>{log.target}</td><td><span className={`a-badge a-badge--${log.result === 'SUCCESS' ? 'success' : 'danger'}`}>{log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}</span></td></tr>)}</></DataTable> : <EmptyState title="Chưa có dữ liệu nhật ký" description="Khi Backend cung cấp audit API, các thay đổi role, trạng thái tài khoản và thông tin nhà hàng sẽ xuất hiện tại đây." />}</section>
  </>
}
