import type { MenuItem } from './types'

export type MenuStatusFilter = 'all' | 'available' | 'soldout'

export function menuFilterCounts(items: readonly Pick<MenuItem, 'status'>[]) {
  return {
    all: items.length,
    available: items.filter((item) => item.status === 'AVAILABLE').length,
    soldout: items.filter((item) => item.status === 'SOLD_OUT').length,
  } satisfies Record<MenuStatusFilter, number>
}

export function applyMenuStatusFilter<T extends Pick<MenuItem, 'status'>>(
  items: T[],
  filter: MenuStatusFilter,
) {
  if (filter === 'available') return items.filter((item) => item.status === 'AVAILABLE')
  if (filter === 'soldout') return items.filter((item) => item.status === 'SOLD_OUT')
  return items
}

export function discontinuedLast<T extends Pick<MenuItem, 'status'>>(items: T[]) {
  return [
    ...items.filter((item) => item.status !== 'DISCONTINUED'),
    ...items.filter((item) => item.status === 'DISCONTINUED'),
  ]
}
