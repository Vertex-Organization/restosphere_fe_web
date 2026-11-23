import type { IncidentInput, IncidentType } from './types'

export type QuickReportType = Extract<
  IncidentType,
  'OUT_OF_STOCK' | 'EQUIPMENT' | 'NOTE_CLARIFICATION'
>

export const QUICK_REPORTS: readonly { type: QuickReportType; label: string }[] = [
  { type: 'OUT_OF_STOCK', label: 'Sắp hết nguyên liệu' },
  { type: 'EQUIPMENT', label: 'Thiết bị gặp sự cố' },
  { type: 'NOTE_CLARIFICATION', label: 'Cần hỏi lại ghi chú' },
]

const MAX_DESCRIPTION = 500

export function quickReportLabel(type: QuickReportType) {
  return QUICK_REPORTS.find((report) => report.type === type)?.label ?? ''
}

export function buildQuickReport(
  type: QuickReportType,
  item: { id: string; name: string; orderId: string },
  note: string,
): IncidentInput {
  const text = note.trim()
  const base = `${quickReportLabel(type)} · ${item.name}`
  const description = text ? `${base}: ${text}` : base
  return {
    type,
    severity: 'MEDIUM',
    description: description.slice(0, MAX_DESCRIPTION),
    orderId: item.orderId,
    itemId: item.id,
  }
}

export function quickReportMessage(type: QuickReportType, itemName: string) {
  return `Đã báo quản lý: ${quickReportLabel(type)} · ${itemName}`
}
