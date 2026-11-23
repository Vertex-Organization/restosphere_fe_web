import { formatDate, formatTime, formatWaitLabel } from '../kitchen/format'

/** Elapsed time shared with the kitchen: "8 phút", "1 giờ 15 phút", "2 ngày". */
export const shortDuration = formatWaitLabel

/** "vừa xong", "5 phút trước", "2 giờ trước". */
export function ago(minutes: number) {
  if (minutes < 1) return 'vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  return `${Math.floor(minutes / 60)} giờ trước`
}

/** "21/11 10:00" for shift open times. */
export function formatShiftOpened(value: string) {
  return `${formatDate(value).slice(0, 5)} ${formatTime(value)}`
}
