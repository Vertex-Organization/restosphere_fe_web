import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import type { Approval } from '../../api/manager/types'
import { dateLabel, money, time } from '../../api/manager/dates'
import { employeeName } from '../../api/manager/selectors'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import { Button, DataTable, DetailDialog, Facts, Filter, FormDialog, Link, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { APPROVAL_TYPE, matchesSearch, statusOptions } from '../../api/manager/labels'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'

function target(a: Approval) {
  const label = a.targetLabel ?? a.targetId
  if (a.targetType === 'RESERVATION') return <Link className="m-text-link" to={managerPath('reservations', a.targetId)}>{label}</Link>
  if (a.targetType === 'MENU_ITEM') return <Link className="m-text-link" to={managerPath('menu', a.targetId)}>{label}</Link>
  if (a.targetType === 'ORDER_ITEM') return <Link className="m-text-link" to={managerPath('orders')}>{label}</Link>
  return <span>{label}</span>
}

export default function ApprovalsPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData(); const user = useManagerUser()!
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [type, setType] = useState(''); const [selected, setSelected] = useState(selectedId); const [deciding, setDeciding] = useState(false)
  if (!d) return null
  const rows = d.approvals.filter(a => matchesSearch(query, a.id, a.code, a.targetId, a.targetLabel ?? '', employeeName(d, a.requestedBy)) && (!status || a.status === status) && (!type || a.type === type))
  const a = d.approvals.find(a => a.id === selected)
  const pending = d.approvals.filter(a => a.status === 'PENDING').length
  return <><PageHeading title="Phê duyệt" description={`${pending} yêu cầu đang chờ xử lý · Hạn mức được cấp: ${money(user.approvalLimit)}`} /><WorkspaceSummary page="approvals" /><Panel title="Yêu cầu nghiệp vụ" aside={<span className="m-count">{pending} chờ duyệt</span>}><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm mã yêu cầu, đơn, người gửi…" /><Filter label="Loại yêu cầu" value={type} onChange={setType} options={[{ value: '', label: 'Tất cả loại yêu cầu' }, ...Object.entries(APPROVAL_TYPE).map(([value, label]) => ({ value, label }))]} /><Filter label="Trạng thái phê duyệt" value={status} onChange={setStatus} options={statusOptions(['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'])} /></div><DataTable headers={['Yêu cầu', 'Người gửi', 'Liên quan', 'Giá trị ảnh hưởng', 'Thời gian', 'Trạng thái', '']} empty={!rows.length} count={rows.length}>{rows.map(a => <tr key={a.id} className={a.status === 'PENDING' ? 'm-request-pending' : undefined}><td><strong>{APPROVAL_TYPE[a.type]}</strong><small>{a.code}</small><span className="m-request-reason" title={a.reason}>{a.reason}</span></td><td>{employeeName(d, a.requestedBy)}</td><td>{a.targetLabel ?? a.targetId}</td><td className="m-num m-request-amount">{a.amount ? money(a.amount) : '—'}{a.amount > user.approvalLimit && <small className="m-danger">Vượt hạn mức</small>}</td><td>{time(a.requestedAt)}<small>{dateLabel(a.requestedAt)}</small></td><td><Status value={a.status} /></td><td><RowAction onClick={() => setSelected(a.id)} /></td></tr>)}</DataTable></Panel>
    {a && !deciding && <DetailDialog title={`${a.code} · ${APPROVAL_TYPE[a.type]}`} subtitle={`Gửi bởi ${employeeName(d, a.requestedBy)}`} entityId={a.id} onClose={() => setSelected('')} actions={a.status === 'PENDING' && a.requestedBy !== user.id && user.permissions.includes('approvals.decide') ? <Button primary onClick={() => setDeciding(true)}>Xử lý yêu cầu</Button> : undefined}><Facts items={[["Đối tượng", target(a)], ['Giá trị ảnh hưởng', a.amount ? money(a.amount) : 'Không có'], ['Trạng thái', <Status value={a.status} />], ['Thời gian gửi', `${dateLabel(a.requestedAt)} · ${time(a.requestedAt)}`]]} /><div className="m-detail-block"><h3>Lý do yêu cầu</h3><p>{a.reason}</p></div>{a.amount > user.approvalLimit && <p className="m-note m-danger">Yêu cầu vượt hạn mức. Chỉ có thể từ chối, hoặc chuyển cấp có thẩm quyền qua quy trình nội bộ.</p>}{a.decisionNote && <div className="m-note">{a.decisionNote}<small>{employeeName(d, a.decidedBy ?? '')} · {a.decidedAt && time(a.decidedAt)}</small></div>}<p className="m-footnote">Khi phê duyệt, hệ thống tự áp dụng và gửi kết quả về người gửi.</p></DetailDialog>}
    {a && deciding && <FormDialog title={`Xử lý ${a.code}`} description={`${APPROVAL_TYPE[a.type]} · ${a.amount ? money(a.amount) : a.targetLabel ?? a.targetId}`} initial={{ decision: a.amount > user.approvalLimit ? 'REJECTED' : 'APPROVED', reason: '' }} fields={[{ key: 'decision', label: 'Quyết định', type: 'select', options: [...(a.amount <= user.approvalLimit ? [{ value: 'APPROVED', label: 'Phê duyệt yêu cầu' }] : []), { value: 'REJECTED', label: 'Từ chối yêu cầu' }] }, { key: 'reason', label: 'Lý do xử lý', type: 'textarea' }]} onClose={() => setDeciding(false)} onSubmit={async v => {
      const reason = String(v.reason ?? '').trim()
      if (reason.length < 5) throw new ManagerError('Nhập lý do xử lý ít nhất 5 ký tự.', 'reason')
      try { await execute({ type: 'approval.decide', id: a.id, approve: v.decision === 'APPROVED', reason }) }
      catch (e) { throw e instanceof ApiError && e.status === 409 ? new Error('Không xử lý được: yêu cầu đã được xử lý, do chính bạn gửi, vượt hạn mức phê duyệt của bạn, hoặc đối tượng đã thay đổi (món đã hủy, hóa đơn đã khóa…).') : e }
    }} submitLabel="Lưu quyết định" />}
  </>
}
