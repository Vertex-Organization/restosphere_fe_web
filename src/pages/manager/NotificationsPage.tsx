import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { dateLabel, time } from '../../api/manager/dates'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { navigate } from '../../routes/managerRouter'
import { Button, Empty, Filter, Icon, PageHeading, Panel } from '../../components/manager/ui'

export default function NotificationsPage() {
  const { data: d, execute, busy } = useManagerData(); const user = useManagerUser()!
  const [filter, setFilter] = useState(''); const [error, setError] = useState('')
  if (!d) return null
  const unread = d.notifications.filter(n => !n.readBy.includes(user.id)).length
  const rows = d.notifications.filter(n => !filter || (filter === 'unread' ? !n.readBy.includes(user.id) : n.readBy.includes(user.id)))
  const read = async (id?: string, path?: string) => { setError(''); try { await execute({ type: 'notification.read', id }); if (path) navigate(path) } catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật thông báo.') } }
  return <><PageHeading title="Thông báo" description={`${unread} thông báo chưa đọc · Theo dõi yêu cầu và cảnh báo vận hành.`} actions={<Button icon="checkCircle" disabled={busy || !unread} onClick={() => { void read() }}>Đánh dấu tất cả đã đọc</Button>} /><WorkspaceSummary page="notifications" /><Panel title="Thông báo vận hành"><div className="m-toolbar"><Filter label="Lọc thông báo" value={filter} onChange={setFilter} options={[{ value: '', label: 'Tất cả thông báo' }, { value: 'unread', label: 'Chưa đọc' }, { value: 'read', label: 'Đã đọc' }]} /></div>{error && <p className="m-form-error" role="alert">{error}</p>}{!rows.length ? <Empty /> : <div className="m-notifications">{rows.map(n => <div key={n.id} className={`m-notification ${n.kind === 'INCIDENT' ? 'is-incident' : ''} ${n.readBy.includes(user.id) ? '' : 'is-unread'}`}><span className="m-notification-icon"><Icon name={n.kind === 'INCIDENT' ? 'alert' : n.kind === 'APPROVAL' || n.kind === 'MENU_REQUEST' ? 'checkCircle' : 'clock'} size={19} /></span><div><strong>{n.title}</strong><p>{n.body}</p><small>{time(n.at)} · {dateLabel(n.at)}{!n.readBy.includes(user.id) && ' · Chưa đọc'}</small></div><div className="m-notification-actions">{!n.readBy.includes(user.id) && <Button disabled={busy} onClick={() => { void read(n.id) }}>Đánh dấu đã đọc</Button>}<Button disabled={busy} onClick={() => { if (n.readBy.includes(user.id)) navigate(n.path); else void read(n.id, n.path) }}>Xem chi tiết</Button></div></div>)}</div>}</Panel></>
}
