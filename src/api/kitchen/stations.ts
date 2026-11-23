import type { KitchenData } from './types'

export type StationId = 'all' | 'grill' | 'wok' | 'steam' | 'bar'
export type DishStationId = Exclude<StationId, 'all'>

export const STATIONS: readonly { id: StationId; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'grill', label: 'Bếp nướng' },
  { id: 'wok', label: 'Bếp chiên – xào' },
  { id: 'steam', label: 'Bếp hấp – lẩu' },
  { id: 'bar', label: 'Quầy nước' },
]

export const DEFAULT_STATION: StationId = 'all'

const FALLBACK_STATION: DishStationId = 'wok'

export function stationLabel(id: StationId) {
  return STATIONS.find((station) => station.id === id)?.label ?? ''
}

export function parseStationId(raw: unknown): StationId {
  return STATIONS.find((station) => station.id === raw)?.id ?? DEFAULT_STATION
}

function normalize(text: string) {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
}

function indexBy(station: DishStationId, names: string[]): [string, DishStationId][] {
  return names.map((name) => [normalize(name), station])
}

const STATION_BY_DISH = new Map<string, DishStationId>([
  ...indexBy('grill', ['Tôm nướng', 'Mực nướng', 'Cá nướng', 'Gà nướng muối ớt']),
  ...indexBy('steam', ['Cua hoàng đế', 'Tôm hùm bông', 'Cua hấp', 'Mực hấp gừng', 'Mâm hải sản']),
  ...indexBy('wok', ['Tôm sốt tỏi', 'Cơm chiên hải sản', 'Mì xào hải sản', 'Bò lúc lắc']),
  ...indexBy('steam', ['Lẩu Thái hải sản', 'Lẩu nấm', 'Gỏi hải sản chanh']),
])

const STATION_BY_CATEGORY = new Map<string, DishStationId>([
  ...indexBy('bar', ['Cà phê & trà', 'Nước ép', 'Bia & nước suối', 'Đồ uống']),
  ...indexBy('steam', ['Lẩu', 'Cua & tôm', 'Đặc sản', 'Món dùng chung', 'Hải sản']),
  ...indexBy('grill', ['Mực & cá']),
  ...indexBy('wok', ['Cơm & mì', 'Món khác']),
])

export function stationOf(
  data: Pick<KitchenData, 'menuItems' | 'menuCategories'>,
  menuItemId: string,
): DishStationId {
  const menu = data.menuItems.find((item) => item.id === menuItemId)
  if (!menu) return FALLBACK_STATION
  const byName = STATION_BY_DISH.get(normalize(menu.name))
  if (byName) return byName
  const category = data.menuCategories.find((c) => c.id === menu.categoryId)
  return (category && STATION_BY_CATEGORY.get(normalize(category.name))) ?? FALLBACK_STATION
}

export function inStation(
  data: Pick<KitchenData, 'menuItems' | 'menuCategories'>,
  menuItemId: string,
  station: StationId,
) {
  return station === 'all' || stationOf(data, menuItemId) === station
}

export function filterByStation<T extends { item: { menuItemId: string } }>(
  dishes: T[],
  data: Pick<KitchenData, 'menuItems' | 'menuCategories'>,
  station: StationId,
): T[] {
  return station === 'all'
    ? dishes
    : dishes.filter((dish) => stationOf(data, dish.item.menuItemId) === station)
}
