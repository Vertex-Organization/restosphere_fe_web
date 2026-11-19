import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { businessDay, dateLabel, minutes, time } from '../../api/manager/dates'
import { activeReservation, ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'
import { employeeName, tableCode } from '../../api/manager/selectors'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import { Button, DataTable, DateFilter, DetailDialog, Facts, Filter, FormDialog, Link, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { useNow } from '../../hooks/kitchen/useNow'
import { matchesSearch, statusOptions } from '../../api/manager/labels'

export default function ReservationsPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData(); const user = useManagerUser()!
  const nowTime = useNow()
  const [query, setQuery] = useState(''); const [date, setDate] = useState(businessDay()); const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(selectedId); const [editing, setEditing] = useState(false)
  const [onlyLate, setOnlyLate] = useState(false)
  if (!d) return null
  const isLate = (res: typeof d.reservations[number]) => (res.status === 'CONFIRMED' || res.status === 'PENDING') && minutes(res.at, nowTime) > 15
  const areaName = (res: typeof d.reservations[number]) => res.areaName || d.areas.find(a => a.id === res.areaId)?.name || res.areaId
  const rows = d.reservations.filter(r => matchesSearch(query, r.id, r.code ?? '', r.customer, tableCode(d, r.tableId), r.phone ?? '') && (!date || businessDay(r.at) === date) && (!status || r.status === status) && (!onlyLate || isLate(r)))
  const r = d.reservations.find(r => r.id === selected)
  return <><PageHeading title="Quản lý đặt bàn" description="Theo dõi lịch đặt và xử lý các trường hợp cần điều chỉnh." actions={<Link className="k-btn" to={managerPath('tables')}>Xem bàn & khu vực</Link>} /><WorkspaceSummary page="reservations" /><Panel title="Danh sách đặt bàn" aside={<span className="m-muted">{rows.length} lịch đặt</span>}><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm mã đặt, tên khách, bàn, SĐT…" /><DateFilter value={date} onChange={setDate} /><Filter label="Trạng thái đặt bàn" value={status} onChange={setStatus} options={statusOptions(['PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'NO_SHOW']).map(o => o.value === 'PENDING' ? { ...o, label: 'Chờ xác nhận' } : o)} /><label className="m-checkbox"><input type="checkbox" checked={onlyLate} onChange={(e) => setOnlyLate(e.target.checked)} />Chỉ xem khách trễ</label></div><DataTable headers={['Mã đặt bàn', 'Khách hàng', 'Ngày · giờ', 'Số khách', 'Khu vực · Bàn', 'Trạng thái', 'Nhân viên', '']} empty={!rows.length} count={rows.length}>{rows.map(r => <tr key={r.id} className={isLate(r) ? 'm-row-warning' : undefined}><td className="m-code">{r.code ?? r.id}</td><td><strong>{r.customer}</strong>{r.phone && <small>{r.phone}</small>}</td><td>{dateLabel(r.at)}<small>{time(r.at)} – {time(r.until)}</small>{isLate(r) && <small className="m-danger">Trễ giờ</small>}</td><td>{r.guests} khách</td><td><span className="m-table-code">{tableCode(d, r.tableId)}</span>{r.areaId && <small>{areaName(r)}</small>}</td><td><Status value={r.status} label={r.status === 'PENDING' ? 'Chờ xác nhận' : undefined} /></td><td>{employeeName(d, r.employeeId)}</td><td><RowAction onClick={() => setSelected(r.id)} /></td></tr>)}</DataTable></Panel>
    {r && !editing && <DetailDialog title={`Đặt bàn ${r.code ?? r.id}`} subtitle={r.customer} entityId={r.id} onClose={() => setSelected('')} actions={activeReservation(r.status) && user.permissions.includes('reservations.edit') ? <Button primary onClick={() => setEditing(true)}>Điều chỉnh bàn</Button> : undefined}><Facts items={[["Khách hàng", r.customer], ['Số điện thoại', r.phone || 'Không có'], ['Email', r.email || 'Không có'], ['Dịp đặc biệt', r.occasion || 'Không có'], ['Số khách', `${r.guests} khách`], ['Thời gian', `${dateLabel(r.at)} · ${time(r.at)}–${time(r.until)}`], ['Khu vực · Bàn', `${r.areaId ? `${areaName(r)} · ` : ''}${tableCode(d, r.tableId)}`], ['Trạng thái', <Status value={r.status} />], ['Người xử lý', employeeName(d, r.employeeId)]]} />{r.note && <p className="m-note">{r.note}</p>}{r.preorder?.length ? <div className="m-detail-block"><h3>Món đặt trước ({r.preorder.length})</h3>{r.preorder.map((p, idx) => <p key={idx} className="m-booking-line">{p.menuItemName || d.menu.find(m => m.id === p.menuItemId)?.name || p.menuItemId} × {p.quantity}{p.note && ` · ${p.note}`}</p>)}</div> : null}</DetailDialog>}
    {r && editing && <FormDialog title={`Điều chỉnh ${r.code ?? r.id}`} description={`${r.guests} khách · ${time(r.at)}–${time(r.until)}. Kiểm tra sức chứa và lịch giữ bàn khi lưu.`} initial={{ tableId: '', reason: '' }} fields={[{ key: 'tableId', label: 'Bàn thay thế', type: 'select', options: [{ value: '', label: 'Chọn bàn sẵn sàng' }, ...d.tables.filter(t => t.status === 'AVAILABLE' && t.id !== r.tableId && (!r.areaId || t.areaId === r.areaId) && t.seats >= (r.actualGuests ?? r.guests)).map(t => ({ value: t.id, label: `${t.code} · ${t.seats} ghế` }))] }, { key: 'reason', label: 'Lý do điều chỉnh', type: 'textarea' }]} onSubmit={async v => {
      const tableId = String(v.tableId ?? ''); const reason = String(v.reason ?? '').trim()
      if (!tableId) throw new ManagerError('Chọn bàn thay thế.', 'tableId')
      if (reason.length < 5) throw new ManagerError('Nhập lý do điều chỉnh ít nhất 5 ký tự.', 'reason')
      try { await execute({ type: 'reservation.move', id: r.id, tableId, reason }) }
      catch (e) { throw e instanceof ApiError && e.status === 409 ? new ManagerError('Không đổi được bàn: bàn không cùng khu vực, không đủ ghế, đang bận hoặc đã có lịch trong khung giờ này (gồm thời gian đệm).', 'tableId') : e }
    }} onClose={() => setEditing(false)} submitLabel="Lưu điều chỉnh" />}
  </>
}
