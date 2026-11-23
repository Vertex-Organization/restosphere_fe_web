import { useEffect, useId, useRef, useState } from 'react'
import {
  buildQuickReport,
  QUICK_REPORTS,
  quickReportMessage,
  type QuickReportType,
} from '../../api/kitchen/quickReport'
import type { KitchenOrderItem as Item } from '../../api/kitchen/types'
import { useKitchenSnapshot } from '../../hooks/kitchen/kitchenDataContext'

const NOTE_MAX = 200

export function ReportManagerDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { data, run, isPending, announce } = useKitchenSnapshot()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [choice, setChoice] = useState<QuickReportType | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const key = `report:${item.id}`
  const pending = isPending(key)
  const tableCode = data.orders.find((order) => order.id === item.orderId)?.tableCode

  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  const submit = async () => {
    if (!choice || pending) return
    setError('')
    const summary = await run(
      { type: 'report-incident', input: buildQuickReport(choice, item, note) },
      [key],
    )
    if (summary === null) {
      setError('Không gửi được báo cáo. Vui lòng thử lại.')
      return
    }
    announce(quickReportMessage(choice, item.name))
    onClose()
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="k-panel k-reject-dialog"
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onClose()
      }}
    >
      <form
        className="k-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div>
          <h2 id={titleId} className="k-panel-title">
            Báo quản lý
          </h2>
          <p className="k-muted">
            {item.name}
            {tableCode ? ` · Bàn ${tableCode}` : ''}
          </p>
        </div>
        <div className="k-report-options" role="radiogroup" aria-label="Nội dung báo">
          {QUICK_REPORTS.map((report) => (
            <button
              key={report.type}
              type="button"
              role="radio"
              aria-checked={choice === report.type}
              className="k-report-option"
              onClick={() => setChoice(report.type)}
            >
              {report.label}
            </button>
          ))}
        </div>
        <label className="k-field">
          <span className="k-label">Ghi chú (không bắt buộc)</span>
          <textarea
            className="k-input"
            rows={2}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="k-form-error">
            {error}
          </p>
        )}
        <div className="k-form-row">
          <button type="button" className="k-btn" disabled={pending} onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            className="k-btn k-btn--primary"
            disabled={!choice || pending}
            aria-busy={pending}
          >
            {pending ? 'Đang gửi…' : 'Gửi'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
