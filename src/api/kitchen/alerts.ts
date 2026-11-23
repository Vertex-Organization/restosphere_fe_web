import { inStation, type StationId } from './stations'
import type { KitchenData } from './types'

export type NotifyMode = 'silent' | 'vibrate' | 'sound'

export const NOTIFY_MODES: readonly NotifyMode[] = ['silent', 'vibrate', 'sound']

export const DEFAULT_NOTIFY_MODE: NotifyMode = 'silent'

export function parseNotifyMode(raw: unknown): NotifyMode {
  return NOTIFY_MODES.find((mode) => mode === raw) ?? DEFAULT_NOTIFY_MODE
}

export const DEFAULT_NOTIFY_VOLUME = 0.8

export function parseNotifyVolume(raw: unknown): number {
  if (typeof raw !== 'string' || raw.trim() === '') return DEFAULT_NOTIFY_VOLUME
  const value = Number(raw)
  if (!Number.isFinite(value)) return DEFAULT_NOTIFY_VOLUME
  return Math.min(1, Math.max(0, value))
}

export function submittedDishIds(data: Pick<KitchenData, 'items'>): Set<string> {
  return new Set(data.items.filter((item) => item.status === 'SUBMITTED').map((item) => item.id))
}

export function hasNewDishesInStation(
  previous: ReadonlySet<string> | null,
  data: Pick<KitchenData, 'items' | 'menuItems' | 'menuCategories'>,
  station: StationId,
) {
  if (!previous) return false
  return data.items.some(
    (item) =>
      item.status === 'SUBMITTED' &&
      !previous.has(item.id) &&
      inStation(data, item.menuItemId, station),
  )
}

export function hasNewDishes(previous: ReadonlySet<string> | null, current: ReadonlySet<string>) {
  if (!previous) return false
  for (const id of current) if (!previous.has(id)) return true
  return false
}
