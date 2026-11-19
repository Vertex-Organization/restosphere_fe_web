import { useEffect, useState } from 'react'
import { adminService } from '../../api/admin/service'
import type { AuditLog } from '../../api/admin/types'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { DataTable, EmptyState, Icon, PageHeader } from '../../components/admin/ui'

import { AUDIT_ACTION_LABELS as ACTIONS } from '../../components/admin/constants'

export default function AdminAuditLogsPage() {
  const { data } = useAdminData()
  const [action, setAction] = useState<AuditLog['action'] | ''>('')
  const [actor, setActor] = useState('')
  const [debouncedActor, setDebouncedActor] = useState('')
  const [from, setFrom] = useState('')
  // Result is tagged with the filters it answers, so a stale response never shows under newer filters.
  const [result, setResult] = useState<{ key: string; logs?: AuditLog[]; error?: string }>()
  const filtered = Boolean(action || debouncedActor || from)
  const key = JSON.stringify([action, debouncedActor, from])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedActor(actor.trim()), 300)
    return () => clearTimeout(timer)
  }, [actor])

  useEffect(() => {
    if (!filtered) return
    const controller = new AbortController()
    adminService.auditLogs({ action: action || undefined, actor: debouncedActor, from }, controller.signal)
      .then((logs) => setResult({ key, logs }))
      .catch((reason: unknown) => { if (!controller.signal.aborted) setResult({ key, error: reason instanceof Error ? reason.message : 'Không tải được nhật ký.' }) })
    return () => controller.abort()
  }, [filtered, key, action, debouncedActor, from])

  const current = result?.key === key ? result : undefined
  const loading = filtered && !current
  const error = filtered ? current?.error : undefined
  const logs = filtered ? current?.logs ?? [] : data?.auditLogs ?? []
  return <>
    <PageHeader title="Nhật ký hoạt động" description="Theo dõi các thao tác quản trị quan trọng và kết quả xử lý." />
    <section className="a-panel"><header><div className="a-panel-heading"><span className="a-section-icon"><Icon name="history" size={18} /></span><div><h2>Nhật ký quản trị</h2><p>{loading ? 'Đang tải nhật ký…' : `${logs.length} hoạt động phù hợp`}</p></div></div></header><div className="a-toolbar"><select className="a-select" aria-label="Lọc loại hành động" value={action} onChange={(event) => setAction(event.target.value as AuditLog['action'] | '')}><option value="">Tất cả hành động</option>{Object.entries(ACTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="a-search"><span className="a-sr-only">Tìm người thực hiện</span><Icon name="search" size={17} /><input value={actor} maxLength={100} onChange={(event) => setActor(event.target.value)} placeholder="Người thực hiện" /></label><label className="a-date-field"><span>Từ ngày</span><input className="a-input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label></div>{error ? <p className="a-form-error" role="alert">{error}</p> : loading ? <p role="status">Đang tải nhật ký…</p> : logs.length ? <DataTable labels={['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Kết quả']}><>{logs.map((log) => <tr key={log.id}><td>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.at))}</td><td>{log.actor}</td><td>{ACTIONS[log.action]}</td><td>{log.target}</td><td><span className={`a-badge a-badge--${log.result === 'SUCCESS' ? 'success' : 'danger'}`}>{log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}</span></td></tr>)}</></DataTable> : <EmptyState title="Chưa có dữ liệu nhật ký" description="Không có hoạt động nào phù hợp với bộ lọc." />}</section>
  </>
}
