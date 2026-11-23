export const RECENT_DAYS = 3
export const NOTIFICATION_PAGE_SIZE = 20

export type NotifyRange = 'today' | '3days'
export type DayGroupId = 'today' | 'yesterday' | 'earlier'

export interface DayGroup<T> {
  id: DayGroupId
  label: string
  items: T[]
}

const LABELS: Record<DayGroupId, string> = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  earlier: 'Trước đó',
}

function startOfDay(value: number) {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function daysAgo(at: string | number, now: number) {
  return Math.round((startOfDay(now) - startOfDay(new Date(at).getTime())) / 86400000)
}

export function filterByRange<T extends { at: string }>(
  items: T[],
  now: number,
  range: NotifyRange,
) {
  const days = range === 'today' ? 1 : RECENT_DAYS
  return items.filter((item) => daysAgo(item.at, now) < days)
}

export function buildDayView<T extends { at: string }>(
  items: T[],
  now: number,
  range: NotifyRange,
  limit = NOTIFICATION_PAGE_SIZE,
) {
  const inRange = filterByRange(items, now, range)
  const buckets: Record<DayGroupId, T[]> = { today: [], yesterday: [], earlier: [] }
  for (const item of inRange.slice(0, limit)) {
    const age = daysAgo(item.at, now)
    buckets[age <= 0 ? 'today' : age === 1 ? 'yesterday' : 'earlier'].push(item)
  }
  const groups: DayGroup<T>[] = (Object.keys(buckets) as DayGroupId[])
    .filter((id) => buckets[id].length)
    .map((id) => ({ id, label: LABELS[id], items: buckets[id] }))
  return { groups, total: inRange.length, shown: Math.min(limit, inRange.length) }
}
