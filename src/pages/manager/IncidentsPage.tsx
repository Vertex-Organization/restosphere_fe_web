import { useState } from 'react'
import { dateLabel, time } from '../../api/manager/dates'
import { employeeName } from '../../api/manager/selectors'
import type { Incident } from '../../api/manager/types'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { Button, DataTable, DetailDialog, Facts, Filter, FormDialog, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { matchesSearch, optionsOf, statusOptions } from '../../api/manager/labels'

export default function IncidentsPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData(); const user = useManagerUser()!
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [severity, setSeverity] = useState(''); const [selected, setSelected] = useState(selectedId); const [editing, setEditing] = useState(false)
  if (!d) return null
  const rows = d.incidents.filter(i => matchesSearch(query, i.id, i.title, i.type, employeeName(d, i.reporterId)) && (!status || i.status === status) && (!severity || i.severity === severity))
  const incident = d.incidents.find(i => i.id === selected)
  return <><PageHeading title="Sự cố" description={`${d.incidents.filter(i => i.status !== 'RESOLVED').length} sự cố đang mở · Phân công người xử lý và theo dõi tiến độ.`} /><Panel title="Danh sách sự cố"><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm sự cố, người báo…" /><Filter label="Mức độ sự cố" value={severity} onChange={setSeverity} options={statusOptions(['HIGH', 'MEDIUM', 'LOW'], 'Tất cả mức độ')} /><Filter label="Trạng thái sự cố" value={status} onChange={setStatus} options={statusOptions(['OPEN', 'IN_PROGRESS', 'RESOLVED'])} /></div><DataTable headers={['Sự cố', 'Loại', 'Mức độ', 'Người báo', 'Thời gian', 'Người xử lý', 'Trạng thái', '']} empty={!rows.length} count={rows.length}>{rows.map(i => <tr key={i.id}><td><strong>{i.title}</strong><small>{i.id} · {i.relatedId}</small></td><td>{i.type}</td><td><Status value={i.severity} /></td><td>{employeeName(d, i.reporterId)}</td><td>{time(i.at)}<small>{dateLabel(i.at)}</small></td><td>{employeeName(d, i.assigneeId)}</td><td><Status value={i.status} /></td><td><RowAction onClick={() => setSelected(i.id)} /></td></tr>)}</DataTable></Panel>
    {incident && !editing && <DetailDialog title={`${incident.id} · ${incident.title}`} entityId={incident.id} onClose={() => setSelected('')} actions={incident.status !== 'RESOLVED' && user.permissions.includes('incidents.manage') ? <Button primary onClick={() => setEditing(true)}>Cập nhật xử lý</Button> : undefined}><Facts items={[["Loại sự cố", incident.type], ['Mức độ', <Status value={incident.severity} />], ['Người báo', employeeName(d, incident.reporterId)], ['Người xử lý', employeeName(d, incident.assigneeId)], ['Liên quan', incident.relatedId], ['Trạng thái', <Status value={incident.status} />]]} /><p className="m-note">{incident.note}</p><p className="m-footnote">Đóng sự cố chỉ kết thúc hồ sơ xử lý. Trạng thái đơn, món và hóa đơn được giữ theo quy trình nghiệp vụ.</p></DetailDialog>}
    {incident && editing && <FormDialog title={`Cập nhật ${incident.id}`} initial={{ assigneeId: incident.assigneeId, status: incident.status, note: incident.note }} fields={[{ key: 'assigneeId', label: 'Người xử lý', type: 'select', options: optionsOf(d.employees.filter(e => e.status === 'ACTIVE')) }, { key: 'status', label: 'Tiến độ xử lý', type: 'select', options: statusOptions(['OPEN', 'IN_PROGRESS', 'RESOLVED']).slice(1) }, { key: 'note', label: 'Ghi chú xử lý', type: 'textarea' }]} onClose={() => setEditing(false)} onSubmit={v => execute({ type: 'incident.update', id: incident.id, assigneeId: String(v.assigneeId), status: v.status as Incident['status'], note: String(v.note) })} />}
  </>
}
