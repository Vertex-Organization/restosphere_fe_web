import { useEffect, useState } from 'react'
import { addDays, businessDay, dateLabel, dayAt, money } from '../../api/manager/dates'
import { useManagerUser } from '../../api/manager/auth'
import { managerService } from '../../api/manager/service'
import type { ManagerReport } from '../../api/manager/types'
import { ApiError } from '../../api/client'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { Button, DataTable, DateFilter, Filter, Metrics, PageHeading, Panel } from '../../components/manager/ui'

// Same limits as the server (from <= to, at most 366 days), checked first so a bad range never calls the API.
function rangeError(from: string, to: string) {
  if (!from || !to || from > to) return 'Chọn khoảng ngày hợp lệ; ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
  const days = (new Date(dayAt(to, '12:00')).getTime() - new Date(dayAt(from, '12:00')).getTime()) / 86400000 + 1
  return days > 366 ? 'Khoảng ngày tối đa 366 ngày.' : ''
}
const reportError = (e: unknown) => e instanceof ApiError && e.status === 400 ? 'Bộ lọc báo cáo không hợp lệ.'
  : e instanceof ApiError && (e.status === 401 || e.status === 403) ? 'Bạn không có quyền xem báo cáo.'
    : e instanceof Error ? e.message : 'Không tải được báo cáo.'

export default function ReportsPage() {
  const { data: d } = useManagerData(); const user = useManagerUser()!
  const [from, setFrom] = useState(addDays(businessDay(), -6)); const [to, setTo] = useState(businessDay()); const [shift, setShift] = useState(''); const [method, setMethod] = useState(''); const [tab, setTab] = useState('revenue')
  // Each response is stored with the filter that produced it; report/loading/loadError are derived below
  // (lint forbids synchronous setState inside an effect).
  const [result, setResult] = useState<{ filter: string; paymentsKey: string; report: ManagerReport | null; error: string }>()
  const paymentsKey = d ? d.payments.map(p => `${p.id}:${p.status}`).join('|') : ''
  const filter = `${from}|${to}|${shift}|${method}`
  useEffect(() => {
    if (rangeError(from, to)) return
    // A slower response for an older filter must not overwrite the current one.
    let active = true
    const key = { filter: `${from}|${to}|${shift}|${method}`, paymentsKey }
    managerService.report({ from, to, shift, method })
      .then(r => { if (active) setResult({ ...key, report: r, error: '' }) }, e => { if (active) setResult({ ...key, report: null, error: reportError(e) }) })
    return () => { active = false }
  }, [from, to, shift, method, paymentsKey])
  if (!d) return null
  const rangeMessage = rangeError(from, to); const invalid = !!rangeMessage
  const current = !invalid && result?.filter === filter ? result : undefined
  const report = current?.report ?? null; const loadError = current?.error ?? ''
  const loading = !invalid && (result?.filter !== filter || result.paymentsKey !== paymentsKey)
  const s = report?.summary ?? { revenue: 0, payments: 0, bills: 0, averageBill: 0, guests: 0 }
  const op = report?.operations ?? { paidGuests: 0, reservations: 0, arrived: 0, cancelledOrNoShow: 0 }
  const daily = report?.daily ?? []; const dishes = report?.dishes ?? []
  const max = Math.max(1, ...daily.map(r => r.revenue))
  const exportCsv = () => {
    const rows: (string | number)[][] = tab === 'dishes' ? [['Món ăn', 'Số lượng', 'Doanh thu trước giảm giá'], ...dishes.map(r => [r.name, r.quantity, r.revenue])] : [['Ngày', 'Giao dịch thành công', 'Doanh thu đã thu'], ...daily.map(r => [r.day, r.payments, r.revenue])]
    const safe = (v: string | number) => `"${String(v).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`
    const blob = new Blob(['\ufeff', rows.map(r => r.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `restosphere-${tab}-${from}-${to}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <><PageHeading title="Doanh thu & báo cáo" description="Doanh thu đã thu từ giao dịch thành công; chưa bao gồm dữ liệu chi phí." actions={user.permissions.includes('reports.export') && tab !== 'operations' && <Button icon="list" onClick={exportCsv} disabled={invalid || !report || report.summary.payments === 0}>Xuất báo cáo CSV</Button>} /><Panel title="Phạm vi báo cáo"><div className="m-toolbar"><DateFilter label="Từ ngày" value={from} onChange={setFrom} /><DateFilter label="Đến ngày" value={to} onChange={setTo} /><Filter label="Ca làm báo cáo" value={shift} onChange={setShift} options={[{ value: '', label: 'Tất cả ca làm' }, { value: 'LUNCH', label: 'Ca trưa' }, { value: 'DINNER', label: 'Ca tối' }]} /><Filter label="Phương thức thanh toán" value={method} onChange={setMethod} options={[{ value: '', label: 'Tất cả phương thức' }, { value: 'CASH', label: 'Tiền mặt' }, { value: 'TRANSFER', label: 'Chuyển khoản' }]} /><Button onClick={() => { setFrom(businessDay()); setTo(businessDay()) }}>Xem hôm nay</Button><Button onClick={() => { setFrom(`${businessDay().slice(0, 7)}-01`); setTo(businessDay()) }}>Xem tháng này</Button></div>{invalid && <p className="m-form-error" role="alert">{rangeMessage}</p>}{!invalid && loading && <p className="m-muted">Đang tải báo cáo…</p>}{!invalid && loadError && <p className="m-form-error" role="alert">{loadError}</p>}</Panel><div className="m-tabs" role="tablist" aria-label="Nhóm báo cáo">{[['revenue', 'Doanh thu'], ['dishes', 'Món ăn'], ['operations', 'Hoạt động']].map(([id, name]) => <button id={`tab-${id}`} role="tab" type="button" aria-selected={tab === id} aria-controls="report-panel" key={id} onClick={() => setTab(id)}>{name}</button>)}</div><div id="report-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
    {tab !== 'operations' ? <><Metrics items={[{ label: 'Doanh thu đã thu', value: money(s.revenue), hint: `${s.payments} giao dịch thành công`, icon: 'cash' }, { label: 'Hóa đơn hoàn tất', value: s.bills, hint: 'Chỉ hóa đơn có thanh toán thành công', icon: 'receipt' }, { label: 'Giá trị hóa đơn trung bình', value: money(s.averageBill), icon: 'list' }, { label: 'Lượt khách đã thanh toán', value: s.guests, icon: 'users' }]} />{tab === 'revenue' ? <div className="m-grid-two"><Panel title="Doanh thu theo ngày" aside={<span className="m-muted">Đơn vị: đồng</span>}><div className="m-revenue-chart" role="img" aria-label={`Doanh thu từ ${from} đến ${to}: ${money(s.revenue)}`}>{daily.length ? daily.map(r => <div className="m-chart-row" key={r.day}><span>{r.day.slice(8)}/{r.day.slice(5, 7)}</span><div><i style={{ width: `${r.revenue / max * 100}%` }} /></div><strong>{money(r.revenue)}</strong></div>) : <p className="m-inline-empty">Không có giao dịch trong khoảng đã chọn.</p>}</div></Panel><Panel title="Chi tiết doanh thu"><DataTable headers={['Ngày', 'Giao dịch', 'Doanh thu']} empty={!daily.length}>{daily.map(r => <tr key={r.day}><td>{dateLabel(dayAt(r.day, '12:00'))}</td><td>{r.payments}</td><td className="m-num">{money(r.revenue)}</td></tr>)}</DataTable></Panel></div> : <Panel title="Món bán chạy" aside={<span className="m-muted">Doanh thu trước giảm giá</span>}><DataTable headers={['Thứ hạng', 'Món ăn', 'Số lượng bán', 'Doanh thu trước giảm giá']} empty={!dishes.length}>{dishes.map((r, i) => <tr key={r.name}><td>{String(i + 1).padStart(2, '0')}</td><td><strong>{r.name}</strong></td><td>{r.quantity}</td><td className="m-num">{money(r.revenue)}</td></tr>)}</DataTable></Panel>}</> : <><p className="m-note">Báo cáo hoạt động dùng bộ lọc ngày. Ca làm và phương thức thanh toán chỉ áp dụng cho báo cáo giao dịch.</p><Metrics items={[{ label: 'Lượt khách đã thanh toán', value: op.paidGuests, icon: 'users' }, { label: 'Lượt đặt bàn', value: op.reservations, icon: 'clipboard' }, { label: 'Khách đã đến', value: op.arrived, icon: 'checkCircle' }, { label: 'Đặt bàn hủy / không đến', value: op.cancelledOrNoShow, icon: 'xCircle' }]} /><Panel title="Định nghĩa dữ liệu vận hành"><div className="m-definition"><p><strong>Lượt khách đã thanh toán:</strong> tổng số khách trên các hóa đơn có giao dịch thành công trong phạm vi lọc.</p><p><strong>Tỷ lệ hủy / không đến:</strong> {op.reservations ? `${Math.round(op.cancelledOrNoShow / op.reservations * 100)}% (${op.reservations} lịch đặt)` : 'Chưa có lịch đặt trong khoảng ngày.'}</p><p><strong>Thời gian chế biến / phục vụ trung bình:</strong> chưa có đủ thời điểm bắt đầu và kết thúc cho từng món để tính.</p></div></Panel></>}
    </div><p className="m-footnote">Nguồn: dữ liệu máy chủ. Giao dịch thất bại và đang chờ được loại khỏi doanh thu. Doanh thu không phải lợi nhuận.</p></>
}
