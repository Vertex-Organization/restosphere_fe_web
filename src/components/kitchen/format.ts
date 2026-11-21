const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const weekdayFormat = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
})

export function formatTime(value?: string | number) {
  return value === undefined ? '—' : timeFormat.format(new Date(value))
}

/** "21:30" today, "21:30 · 11/11" on another day. */
export function formatWhen(value: string, now: number) {
  return localDayKey(value) === localDayKey(now)
    ? formatTime(value)
    : `${formatTime(value)} · ${formatDate(value).slice(0, 5)}`
}

export function formatDate(value: string | number) {
  return dateFormat.format(new Date(value))
}

export function formatDayShort(value: number) {
  return weekdayFormat.format(new Date(value))
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`
}

/** Lower-case text without Vietnamese diacritics, for forgiving search. */
export function searchable(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const letters =
    parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2)
  return letters.toUpperCase()
}

export function localDayKey(value: string | number) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
