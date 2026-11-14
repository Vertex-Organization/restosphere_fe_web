import type {
  Incident, KitchenData, KitchenNotification, KitchenOrder, KitchenOrderItem, MenuCategory, MenuItem, OutboxMessage,
  SentItemStatus, StaffMember, StatusChange,
} from './types'

// Demo data for the kitchen workspace. Identities, menu and table codes match
// the RestoSphere staff app demo (waiter / waiter2, password 123456).

export const DEMO_PASSWORD = '123456'

export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function shiftFor(now: Date) {
  const hour = now.getHours()
  if (hour >= 6 && hour < 14) return 'Ca sáng · 06:00–14:00'
  if (hour >= 14 && hour < 22) return 'Ca chiều · 14:00–22:00'
  return 'Ca đêm · 22:00–06:00'
}

function createStaff(now: Date): StaffMember[] {
  const shift = shiftFor(now)
  return [
    {
      id: 'NV010', name: 'Phạm Minh Khoa', username: 'kitchen', role: 'KITCHEN', position: 'Bếp trưởng', shift,
      permissions: ['kitchen.items.update', 'kitchen.incidents.create', 'kitchen.menu.availability'],
    },
    {
      id: 'NV011', name: 'Đỗ Thị Lan', username: 'kitchen2', role: 'KITCHEN', position: 'Phụ bếp', shift,
      permissions: ['kitchen.items.update', 'kitchen.incidents.create'],
    },
    { id: 'NV002', name: 'Trần Hoài Nam', username: 'waiter', role: 'WAITER', position: 'Phục vụ', shift: 'Ca phục vụ demo', permissions: [] },
    { id: 'NV003', name: 'Lê Thu Hà', username: 'waiter2', role: 'WAITER', position: 'Phục vụ', shift: 'Ca phục vụ demo', permissions: [] },
    { id: 'NV001', name: 'Vũ Thị Mai', username: 'manager', role: 'MANAGER', position: 'Quản lý ca', shift, permissions: [] },
  ]
}

const categories: MenuCategory[] = [
  { id: 'seafood', name: 'Hải sản' },
  { id: 'rice', name: 'Cơm & mì' },
  { id: 'hotpot', name: 'Lẩu' },
  { id: 'main', name: 'Món khác' },
  { id: 'drink', name: 'Đồ uống' },
]

// Same menu as the staff app (restosphere-fe-mobile/src/mocks/waiter-data.ts).
// Photos are the licensed stand-ins listed in docs/kitchen/menu-photo-credits.md.
const menu: [id: string, name: string, categoryId: string, photo: string | null, status?: MenuItem['status']][] = [
  ['grilled-shrimp', 'Tôm nướng', 'seafood', 'shrimp'],
  ['steamed-crab', 'Cua hấp', 'seafood', 'crab'],
  ['grilled-squid', 'Mực nướng', 'seafood', 'squid'],
  ['grilled-fish', 'Cá nướng', 'seafood', 'fish'],
  ['seafood-rice', 'Cơm chiên hải sản', 'rice', 'seafood-rice'],
  ['noodles', 'Mì xào hải sản', 'rice', 'noodles'],
  ['thai-pot', 'Lẩu Thái', 'hotpot', 'hotpot'],
  ['old-pot', 'Lẩu nấm', 'hotpot', 'mushroom-hotpot', 'DISCONTINUED'],
  ['beef', 'Bò lúc lắc', 'main', 'beef'],
  ['chicken', 'Gà nướng muối ớt', 'main', 'chicken', 'SOLD_OUT'],
  ['peach-tea', 'Trà đào', 'drink', 'peach-tea'],
  ['water', 'Nước suối', 'drink', null],
]

interface SeedLine {
  menu: string
  qty: number
  note?: string
  status: SentItemStatus
  /** Minutes ago. */
  start?: number
  ready?: number
  served?: number
  cook?: string
  cancel?: { at: number; reason: string }
}

interface SeedOrder {
  code: number
  table: string
  area: string
  guests: number
  waiter: string
  session: string
  seq?: number
  at: number
  priority?: { at: number; reason: string }
  lines: SeedLine[]
}

const AREA = { A: 'Tầng 1', B: 'Tầng 2', G: 'Sân vườn' } as const
const area = (table: string) => AREA[table[0] as keyof typeof AREA]

// Current service: tickets on both sides of the board, including one table
// (A03) whose items are split between the two columns and one add-on round (B04).
const activeOrders: SeedOrder[] = [
  { code: 97, table: 'B04', area: area('B04'), guests: 6, waiter: 'NV002', session: 's-b04', seq: 1, at: 38, lines: [
    { menu: 'seafood-rice', qty: 2, note: 'Không cay', status: 'READY', start: 30, ready: 7, cook: 'NV010' },
    { menu: 'beef', qty: 1, status: 'SERVED', start: 30, ready: 20, served: 17, cook: 'NV010' },
  ] },
  { code: 98, table: 'A02', area: area('A02'), guests: 2, waiter: 'NV003', session: 's-a02', at: 33, lines: [
    { menu: 'grilled-fish', qty: 1, status: 'SERVED', start: 30, ready: 22, served: 20, cook: 'NV011' },
    { menu: 'peach-tea', qty: 1, status: 'READY', start: 8, ready: 3, cook: 'NV011' },
  ] },
  { code: 101, table: 'A03', area: area('A03'), guests: 4, waiter: 'NV002', session: 's-a03', at: 22, lines: [
    { menu: 'seafood-rice', qty: 2, note: 'Ít cay', status: 'READY', start: 19, ready: 4, cook: 'NV011' },
    { menu: 'beef', qty: 1, status: 'PREPARING', start: 14, cook: 'NV010' },
    { menu: 'thai-pot', qty: 1, note: 'Nồi lớn, thêm rau', status: 'SUBMITTED' },
  ] },
  { code: 102, table: 'G01', area: area('G01'), guests: 2, waiter: 'NV003', session: 's-g01', at: 16, lines: [
    { menu: 'grilled-shrimp', qty: 1, status: 'READY', start: 13, ready: 1, cook: 'NV010' },
    { menu: 'grilled-squid', qty: 1, status: 'READY', start: 13, ready: 1, cook: 'NV010' },
  ] },
  { code: 103, table: 'B02', area: area('B02'), guests: 6, waiter: 'NV002', session: 's-b02', at: 18,
    priority: { at: 8, reason: 'Khách cần đi sớm, ưu tiên ra món' }, lines: [
      { menu: 'steamed-crab', qty: 1, status: 'PREPARING', start: 12, cook: 'NV010' },
      { menu: 'grilled-squid', qty: 1, note: 'Nướng kỹ', status: 'PREPARING', start: 10, cook: 'NV011' },
      { menu: 'water', qty: 2, status: 'READY', start: 16, ready: 13, cook: 'NV011' },
    ] },
  { code: 104, table: 'B05', area: area('B05'), guests: 3, waiter: 'NV003', session: 's-b05', at: 14, lines: [
    { menu: 'grilled-shrimp', qty: 1, status: 'PREPARING', start: 7, cook: 'NV011' },
    { menu: 'peach-tea', qty: 1, note: 'Ít đá', status: 'READY', start: 12, ready: 2, cook: 'NV011' },
  ] },
  { code: 105, table: 'A05', area: area('A05'), guests: 4, waiter: 'NV002', session: 's-a05', at: 12, lines: [
    { menu: 'thai-pot', qty: 1, status: 'PREPARING', start: 8, cook: 'NV010' },
    { menu: 'noodles', qty: 1, status: 'SUBMITTED' },
    { menu: 'chicken', qty: 1, status: 'CANCELLED', cancel: { at: 10, reason: 'Hết nguyên liệu' } },
  ] },
  { code: 106, table: 'G02', area: area('G02'), guests: 5, waiter: 'NV003', session: 's-g02', at: 9, lines: [
    { menu: 'grilled-shrimp', qty: 3, note: '1 phần không cay', status: 'SUBMITTED' },
    { menu: 'seafood-rice', qty: 1, status: 'SUBMITTED' },
  ] },
  { code: 107, table: 'B04', area: area('B04'), guests: 6, waiter: 'NV002', session: 's-b04', seq: 2, at: 6, lines: [
    { menu: 'noodles', qty: 1, status: 'SUBMITTED' },
    { menu: 'peach-tea', qty: 2, note: 'Ít đường', status: 'SUBMITTED' },
  ] },
  { code: 108, table: 'A01', area: area('A01'), guests: 2, waiter: 'NV003', session: 's-a01', at: 4, lines: [
    { menu: 'grilled-fish', qty: 1, status: 'SUBMITTED' },
    { menu: 'beef', qty: 1, note: 'Chín vừa', status: 'SUBMITTED' },
  ] },
  { code: 109, table: 'G04', area: area('G04'), guests: 4, waiter: 'NV002', session: 's-g04', at: 2, lines: [
    { menu: 'steamed-crab', qty: 2, status: 'SUBMITTED' },
    { menu: 'peach-tea', qty: 1, note: 'Không đá', status: 'SUBMITTED' },
  ] },
]

// Finished earlier (today and yesterday) so history and its filters have data.
const servedSpecs: [code: number, table: string, minutesAgo: number, lines: [menu: string, qty: number, note?: string][]][] = [
  [90, 'A04', 150, [['seafood-rice', 2], ['water', 2], ['beef', 1]]],
  [91, 'A06', 140, [['grilled-fish', 1, 'Ít xương'], ['noodles', 1], ['peach-tea', 2]]],
  [92, 'G03', 125, [['thai-pot', 1], ['water', 3]]],
  [93, 'B01', 110, [['steamed-crab', 2], ['grilled-shrimp', 1], ['peach-tea', 2, 'Ít đường']]],
  [94, 'B03', 95, [['noodles', 2], ['beef', 1]]],
  [95, 'G05', 80, [['steamed-crab', 1], ['grilled-squid', 1], ['water', 4]]],
  [96, 'A04', 60, [['grilled-shrimp', 1], ['peach-tea', 1]]],
  [41, 'A01', 1440 + 120, [['seafood-rice', 3], ['beef', 1]]],
  [42, 'B02', 1440 + 100, [['thai-pot', 1, 'Thêm nấm'], ['water', 4]]],
  [43, 'G02', 1440 + 80, [['grilled-shrimp', 2], ['peach-tea', 2]]],
  [44, 'A03', 1440 + 60, [['grilled-fish', 1], ['noodles', 1]]],
]

const ago = (now: Date, minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString()

export const ticketCode = (n: number) => `K${String(n).padStart(3, '0')}`

function buildOrder(now: Date, spec: SeedOrder, menuItems: MenuItem[]) {
  const code = ticketCode(spec.code)
  const order: KitchenOrder = {
    id: `o-${code}`, code, sessionId: spec.session, tableCode: spec.table, area: spec.area,
    guests: spec.guests, waiterId: spec.waiter, sequence: spec.seq ?? 1, submittedAt: ago(now, spec.at),
    priority: spec.priority && { at: ago(now, spec.priority.at), by: spec.waiter, reason: spec.priority.reason },
  }
  const items = spec.lines.map((line, index): KitchenOrderItem => {
    const menuItem = menuItems.find((m) => m.id === line.menu)!
    const history: StatusChange[] = [{ at: order.submittedAt, status: 'SUBMITTED', by: spec.waiter }]
    const item: KitchenOrderItem = {
      id: `i-${code}-${index + 1}`, orderId: order.id, menuItemId: menuItem.id, name: menuItem.name,
      quantity: line.qty, note: line.note ?? '', status: line.status, version: 1, submittedAt: order.submittedAt, history,
    }
    if (line.start !== undefined) {
      item.startedAt = ago(now, line.start)
      item.startedBy = line.cook
      history.push({ at: item.startedAt, status: 'PREPARING', by: line.cook! })
    }
    if (line.ready !== undefined) {
      item.readyAt = ago(now, line.ready)
      item.readyBy = line.cook
      history.push({ at: item.readyAt, status: 'READY', by: line.cook! })
    }
    if (line.served !== undefined) {
      item.servedAt = ago(now, line.served)
      item.servedBy = spec.waiter
      history.push({ at: item.servedAt, status: 'SERVED', by: spec.waiter })
    }
    if (line.cancel) {
      item.cancelledAt = ago(now, line.cancel.at)
      item.cancelledBy = 'NV001'
      item.cancellationReason = line.cancel.reason
      history.push({ at: item.cancelledAt, status: 'CANCELLED', by: 'NV001', note: line.cancel.reason })
    }
    item.version = history.length
    return item
  })
  return { order, items }
}

export function createSeedData(now: Date): KitchenData {
  const menuItems: MenuItem[] = menu.map(([id, name, categoryId, photo, status = 'AVAILABLE']) => ({
    id, name, categoryId, status, updatedAt: ago(now, 600), ...(photo ? { imageUrl: `/kitchen/menu/${photo}.jpg` } : {}),
  }))
  const chicken = menuItems.find((m) => m.id === 'chicken')!
  chicken.updatedAt = ago(now, 10)
  chicken.updatedBy = 'NV001'

  const orders: KitchenOrder[] = []
  const items: KitchenOrderItem[] = []
  const add = (built: ReturnType<typeof buildOrder>) => { orders.push(built.order); items.push(...built.items) }

  servedSpecs.forEach(([code, table, minutesAgo, lines], index) => {
    const cook = index % 2 ? 'NV011' : 'NV010'
    const waiter = index % 2 ? 'NV003' : 'NV002'
    add(buildOrder(now, {
      code, table, area: area(table), guests: 4, waiter, session: `s-old-${code}`, at: minutesAgo,
      lines: lines.map(([menuId, qty, note], line) => {
        const ready = minutesAgo - 12 - line * 3
        return { menu: menuId, qty, note, status: 'SERVED', start: minutesAgo - 2, ready, served: ready - 2, cook }
      }),
    }, menuItems))
  })
  activeOrders.forEach((spec) => add(buildOrder(now, spec, menuItems)))

  const incidents: Incident[] = [
    {
      id: 'inc-2', code: 'SC-002', type: 'OUT_OF_STOCK', severity: 'HIGH', title: 'Hết nguyên liệu', orderId: 'o-K105', itemId: 'i-K105-3',
      description: 'Hết gà ta cho món Gà nướng muối ớt.', reporterId: 'NV011', at: ago(now, 11), status: 'RESOLVED',
      notifiedStaffIds: ['NV001', 'NV002'],
      response: { by: 'NV001', at: ago(now, 10), text: 'Đã hủy món, phục vụ báo khách đổi món. Món chuyển sang tạm hết.' },
    },
    {
      id: 'inc-1', code: 'SC-001', type: 'EQUIPMENT', severity: 'MEDIUM', title: 'Thiết bị hỏng',
      description: 'Bếp nướng số 2 lửa không đều, nướng chậm hơn bình thường.', reporterId: 'NV010', at: ago(now, 52),
      status: 'ACKNOWLEDGED', notifiedStaffIds: ['NV001'],
      response: { by: 'NV001', at: ago(now, 45), text: 'Đã gọi kỹ thuật, tạm dùng bếp nướng số 1.' },
    },
  ]

  const notifications: KitchenNotification[] = [
    { id: 'n-6', kind: 'NEW_ORDER', title: 'Đơn mới · Bàn G04', body: '#K109 · 2 × Cua hấp, 1 × Trà đào', at: ago(now, 2), orderId: 'o-K109', readBy: [] },
    { id: 'n-5', kind: 'ADD_ON', title: 'Bàn B04 gọi thêm · lượt 2', body: '#K107 · 1 × Mì xào hải sản, 2 × Trà đào', at: ago(now, 6), orderId: 'o-K107', readBy: [] },
    { id: 'n-4', kind: 'PRIORITY', title: 'Ưu tiên Bàn B02', body: '#K103 · Khách cần đi sớm, ưu tiên ra món', at: ago(now, 8), orderId: 'o-K103', readBy: [] },
    { id: 'n-3', kind: 'CANCELLED', title: 'Hủy 1 × Gà nướng muối ớt · Bàn A05', body: '#K105 · Hết nguyên liệu', at: ago(now, 10), orderId: 'o-K105', readBy: ['NV010', 'NV011'] },
    { id: 'n-2', kind: 'INCIDENT_REPLY', title: 'Quản lý phản hồi sự cố SC-002', body: 'Đã hủy món, phục vụ báo khách đổi món.', at: ago(now, 10), incidentId: 'inc-2', readBy: ['NV010', 'NV011'] },
    { id: 'n-1', kind: 'INCIDENT_REPLY', title: 'Quản lý phản hồi sự cố SC-001', body: 'Đã gọi kỹ thuật, tạm dùng bếp nướng số 1.', at: ago(now, 45), incidentId: 'inc-1', readBy: ['NV010', 'NV011'] },
  ]

  const outbox: OutboxMessage[] = [
    { id: 'out-2', kind: 'INCIDENT', audience: 'WAITER', staffId: 'NV002', title: 'Sự cố SC-002: Hết nguyên liệu (Cao)', body: 'Bàn A05 · #K105 · Gà nướng muối ớt — Hết gà ta cho món Gà nướng muối ớt.', at: ago(now, 11) },
    { id: 'out-1', kind: 'INCIDENT', audience: 'MANAGER', staffId: 'NV001', title: 'Sự cố SC-001: Thiết bị hỏng (Trung bình)', body: 'Bếp nướng số 2 lửa không đều, nướng chậm hơn bình thường.', at: ago(now, 52) },
  ]

  return {
    schema: 1, seedDay: dayKey(now), revision: now.getTime(), nextId: 100, nextTicket: 110,
    staff: createStaff(now), orders, items, menuCategories: categories, menuItems, menuRequests: [],
    incidents, notifications, outbox,
  }
}

const isString = (v: unknown) => typeof v === 'string'
const isDate = (v: unknown) => isString(v) && Number.isFinite(new Date(v as string).getTime())

/** Rejects saved data from an older shape or a corrupted store. */
export function isValidKitchenData(value: unknown): value is KitchenData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<KitchenData>
  const lists = [data.staff, data.orders, data.items, data.menuCategories, data.menuItems, data.menuRequests, data.incidents, data.notifications, data.outbox]
  if (data.schema !== 1 || !isString(data.seedDay) || !Number.isFinite(data.revision) || !Number.isInteger(data.nextId)
    || !Number.isInteger(data.nextTicket) || !lists.every(Array.isArray)) return false
  const statuses = ['SUBMITTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED', 'CANCELLED', 'VOIDED']
  return data.orders!.every((o) => o && isString(o.id) && isString(o.code) && isString(o.tableCode) && isDate(o.submittedAt))
    && data.items!.every((i) => i && isString(i.id) && isString(i.name) && isString(i.note) && statuses.includes(i.status)
      && Number.isInteger(i.version) && Number.isInteger(i.quantity) && Array.isArray(i.history)
      && (i.status !== 'REJECTED' || (isString(i.rejectionReason) && !!i.rejectionReason.trim() && isDate(i.rejectedAt) && isString(i.rejectedBy)))
      && data.orders!.some((o) => o.id === i.orderId))
    && data.staff!.every((s) => s && isString(s.id) && isString(s.name) && Array.isArray(s.permissions))
    && data.menuItems!.every((m) => m && isString(m.id) && isString(m.name) && isString(m.status))
    && data.notifications!.every((n) => n && isString(n.id) && Array.isArray(n.readBy))
    && data.incidents!.every((i) => i && isString(i.id) && isString(i.code) && isString(i.title) && isString(i.reporterId) && isDate(i.at)
      && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(i.status) && (!i.response || (isString(i.response.by) && isDate(i.response.at) && isString(i.response.text))))
}
