import { useState } from 'react'
import { businessDay, dateLabel, time } from '../../api/manager/dates'
import { activeReservation } from '../../api/manager/rules'
import { employeeName } from '../../api/manager/selectors'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import { Button, DataTable, DateFilter, DetailDialog, Facts, Filter, FormDialog, Link, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { matchesSearch, statusOptions } from '../../api/manager/labels'

export default function ReservationsPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData(); const user = useManagerUser()!
  const [query, setQuery] = useState(''); const [date, setDate] = useState(businessDay()); const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(selectedId); const [editing, setEditing] = useState(false)
  if (!d) return null
  const rows = d.reservations.filter(r => matchesSearch(query, r.id, r.customer, r.tableId) && (!date || businessDay(r.at) === date) && (!status || r.status === status))
  const r = d.reservations.find(r => r.id === selected)
  return <><PageHeading title="Quản lý đặt bàn" description="Theo dõi lịch đặt và xử lý các trường hợp cần điều chỉnh." actions={<Link className="k-btn" to={managerPath('tables')}>Xem bàn & khu vực</Link>} /><Panel title="Danh sách đặt bàn" aside={<span className="m-muted">{rows.length} lịch đặt</span>}><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm mã đặt, tên khách, bàn…" /><DateFilter value={date} onChange={setDate} /><Filter label="Trạng thái đặt bàn" value={status} onChange={setStatus} options={statusOptions(['PENDING', 'CONFIRMED', 'ARRIVED', 'LATE', 'CANCELLED', 'NO_SHOW']).map(o => o.value === 'PENDING' ? { ...o, label: 'Chờ xác nhận' } : o)} /></div><DataTable headers={['Mã đặt bàn', 'Khách hàng', 'Ngày · giờ', 'Số khách', 'Bàn', 'Trạng thái', 'Nhân viên', '']} empty={!rows.length} count={rows.length}>{rows.map(r => <tr key={r.id}><td className="m-code">{r.id}</td><td><strong>{r.customer}</strong></td><td>{dateLabel(r.at)}<small>{time(r.at)} – {time(r.until)}</small></td><td>{r.guests} khách</td><td><span className="m-table-code">{r.tableId}</span></td><td><Status value={r.status} label={r.status === 'PENDING' ? 'Chờ xác nhận' : undefined} /></td><td>{employeeName(d, r.employeeId)}</td><td><RowAction onClick={() => setSelected(r.id)} /></td></tr>)}</DataTable></Panel>
    {r && !editing && <DetailDialog title={`Đặt bàn ${r.id}`} subtitle={r.customer} entityId={r.id} onClose={() => setSelected('')} actions={activeReservation(r.status) && user.permissions.includes('reservations.edit') ? <Button primary onClick={() => setEditing(true)}>Điều chỉnh bàn</Button> : undefined}><Facts items={[["Khách hàng", r.customer], ['Số khách', `${r.guests} khách`], ['Thời gian', `${dateLabel(r.at)} · ${time(r.at)}–${time(r.until)}`], ['Bàn hiện tại', r.tableId], ['Trạng thái', <Status value={r.status} />], ['Người xử lý', employeeName(d, r.employeeId)]]} />{r.note && <p className="m-note">{r.note}</p>}</DetailDialog>}
    {r && editing && <FormDialog title={`Điều chỉnh ${r.id}`} description={`${r.guests} khách · ${time(r.at)}–${time(r.until)}. Kiểm tra sức chứa và lịch giữ bàn khi lưu.`} initial={{ tableId: '', reason: '' }} fields={[{ key: 'tableId', label: 'Bàn thay thế', type: 'select', options: [{ value: '', label: 'Chọn bàn sẵn sàng' }, ...d.tables.filter(t => t.status === 'AVAILABLE' && t.id !== r.tableId).map(t => ({ value: t.id, label: `${t.id} · ${t.seats} ghế` }))] }, { key: 'reason', label: 'Lý do điều chỉnh', type: 'textarea' }]} onSubmit={v => execute({ type: 'reservation.move', id: r.id, tableId: String(v.tableId), reason: String(v.reason) })} onClose={() => setEditing(false)} submitLabel="Lưu điều chỉnh" />}
  </>
}
