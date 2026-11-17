import { KITCHEN_DATA_KEY } from '../kitchen/storageKey'
import { seedMenu } from './mockData'
import type { DishAvailability, MenuData } from './types'

/**
 * The seam between the customer menu and its data source.
 *
 * The backend has no menu endpoint yet, so the site runs on `mockMenuService`.
 * When one exists, add an HTTP implementation (using `apiRequest` from
 * ../client) and export it here instead; the menu page does not change.
 */
export interface MenuService {
  load(): Promise<MenuData>
  /** Notifies when availability changed elsewhere. */
  subscribe(listener: () => void): () => void
}

const STATUSES: readonly DishAvailability[] = ['AVAILABLE', 'SOLD_OUT', 'DISCONTINUED']

/** Availability set in the kitchen demo (/kitchen/menu-status) on this browser. */
function kitchenStatuses(): Map<string, DishAvailability> {
  const result = new Map<string, DishAvailability>()
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KITCHEN_DATA_KEY) ?? 'null')
    const items = (stored as { menuItems?: unknown } | null)?.menuItems
    if (!Array.isArray(items)) return result
    for (const item of items as { id?: unknown; status?: unknown }[]) {
      if (typeof item?.id === 'string' && STATUSES.includes(item.status as DishAvailability)) {
        result.set(item.id, item.status as DishAvailability)
      }
    }
  } catch {
    // No kitchen data or storage blocked: use the seed availability.
  }
  return result
}

export const mockMenuService: MenuService = {
  async load() {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const statuses = kitchenStatuses()
    return {
      categories: seedMenu.categories,
      dishes: seedMenu.dishes.map((dish) => ({ ...dish, status: statuses.get(dish.id) ?? dish.status })),
    }
  },

  subscribe(listener) {
    // `storage` fires when another tab (e.g. the kitchen) changes the store.
    const onStorage = (event: StorageEvent) => { if (event.key === KITCHEN_DATA_KEY) listener() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },
}

export const menuService: MenuService = mockMenuService
