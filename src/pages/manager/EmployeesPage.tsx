import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { businessDay } from '../../api/manager/dates'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import { Button, DataTable, DetailDialog, Facts, Filter, FormDialog, Link, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { DEPARTMENT, matchesSearch, optionsOf } from '../../api/manager/labels'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'

export default function EmployeesPage() {
  const { data: d, execute } = useManagerData(); const user = useManagerUser()!
  const [query, setQuery] = useState(''); const [department, setDepartment] = useState(''); const [selected, setSelected] = useState(''); const [editing, setEditing] = useState(false)
  if (!d) return null
  const rows = d.employees.filter(e => matchesSearch(query, e.name, e.id, e.email ?? '', e.position) && (!department || e.department === department))
  const areaName = (e: typeof d.employees[number]) => e.areaName || d.areas.find(a => a.id === e.areaId)?.name || 'Chưa phân khu'
  const employee = d.employees.find(e => e.id === selected)
  const shiftsOf = (id: string) => d.shifts.filter(s => s.employeeIds.includes(id) && s.date === businessDay())
  return <><PageHeading title="Nhân viên" description="Hồ sơ nhân sự vận hành, khu vực phụ trách và lịch làm việc." actions={<Link className="k-btn" to={managerPath('shifts')}>Xem lịch ca làm</Link>} /><WorkspaceSummary page="employees" /><Panel title="Danh sách nhân viên" aside={<span className="m-muted">{rows.length} nhân viên</span>}><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm tên, mã nhân viên…" /><Filter label="Bộ phận" value={department} onChange={setDepartment} options={[{ value: '', label: 'Tất cả bộ phận' }, ...Object.entries(DEPARTMENT).map(([value, label]) => ({ value, label }))]} /></div><DataTable headers={['Nhân viên', 'Bộ phận', 'Vai trò nghiệp vụ', 'Trạng thái', 'Lịch hôm nay', 'Khu vực', '']} empty={!rows.length} count={rows.length}>{rows.map(e => <tr key={e.id}><td><div className="m-person"><span className="m-avatar m-avatar--small">{e.name.split(' ').slice(-2).map(n => n[0]).join('')}</span><div><strong>{e.name}</strong><small>{e.email || e.id}</small></div></div></td><td>{DEPARTMENT[e.department]}</td><td>{e.position}</td><td><Status value={e.status} /></td><td>{shiftsOf(e.id).map(s => s.name).join(', ') || 'Chưa phân ca'}</td><td>{areaName(e)}</td><td><RowAction onClick={() => setSelected(e.id)} /></td></tr>)}</DataTable></Panel>
    {employee && !editing && <DetailDialog title={employee.name} subtitle={`${employee.email || employee.id} · ${employee.position}`} entityId={employee.id} onClose={() => setSelected('')} actions={user.permissions.includes('employees.assign') && employee.status === 'ACTIVE' ? <Button primary onClick={() => setEditing(true)}>Phân công khu vực</Button> : undefined}><Facts items={[["Bộ phận", DEPARTMENT[employee.department]], ['Trạng thái', <Status value={employee.status} />], ['Khu vực', d.areas.find(a => a.id === employee.areaId)?.name], ['Lịch hôm nay', shiftsOf(employee.id).map(s => `${s.name} (${s.start}–${s.end})`).join(', ') || 'Chưa phân ca']]} /><Link className="m-text-link" to={managerPath('shifts')}>Xem lịch làm việc</Link><p className="m-note">Thông tin ở đây phục vụ phân công vận hành. Tài khoản đăng nhập và quyền hệ thống do Admin quản lý.</p></DetailDialog>}
    {employee && editing && <FormDialog title={`Phân công ${employee.name}`} initial={{ areaId: employee.areaId }} fields={[{ key: 'areaId', label: 'Khu vực phụ trách', type: 'select', options: optionsOf(d.areas) }]} onClose={() => setEditing(false)} onSubmit={async v => {
      const areaId = String(v.areaId ?? '')
      if (!d.areas.some(a => a.id === areaId)) throw new ManagerError('Chọn khu vực hợp lệ.', 'areaId')
      try { await execute({ type: 'employee.assign', id: employee.id, areaId }) }
      catch (e) { throw e instanceof ApiError && e.status === 409 ? new Error('Nhân viên đang bị khóa, không thể phân công.') : e }
    }} />}
  </>
}
