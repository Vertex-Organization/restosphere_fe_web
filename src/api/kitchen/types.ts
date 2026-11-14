// Kitchen domain model. Status names and the OrderItem shape follow the
// RestoSphere staff app (restosphere-fe-mobile/src/features/orders/types.ts)
// so Waiter and Kitchen speak the same workflow.

export type StaffRole = 'KITCHEN' | 'WAITER' | 'RECEPTIONIST' | 'CASHIER' | 'MANAGER'

export type KitchenPermission =
  | 'kitchen.items.update'
  | 'kitchen.incidents.create'
  | 'kitchen.menu.availability'

export interface StaffMember {
  id: string
  name: string
  username: string
  role: StaffRole
  position: string
  shift: string
  permissions: KitchenPermission[]
}

export type OrderItemStatus = 'DRAFT' | 'SUBMITTED' | 'PREPARING' | 'READY' | 'SERVED' | 'REJECTED' | 'CANCELLED' | 'VOIDED'
/** DRAFT items stay on the waiter's device and never reach the kitchen. */
export type SentItemStatus = Exclude<OrderItemStatus, 'DRAFT'>

/** One ordering round ("lượt gọi") of a table: shown to the kitchen as one ticket. */
export interface KitchenOrder {
  id: string
  code: string
  sessionId: string
  tableCode: string
  area: string
  guests: number
  waiterId: string
  sequence: number
  submittedAt: string
  priority?: { at: string; by: string; reason: string }
}

export interface StatusChange {
  at: string
  status: SentItemStatus
  by: string
  note?: string
}

export interface KitchenOrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  quantity: number
  note: string
  status: SentItemStatus
  /** Incremented on every change; commands must send the version they saw. */
  version: number
  submittedAt: string
  startedAt?: string
  startedBy?: string
  readyAt?: string
  readyBy?: string
  servedAt?: string
  servedBy?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  /** Kitchen refused the item before cooking it. */
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
  history: StatusChange[]
}

export type MenuAvailability = 'AVAILABLE' | 'SOLD_OUT' | 'DISCONTINUED'

export interface MenuCategory {
  id: string
  name: string
}

export interface MenuItem {
  id: string
  name: string
  categoryId: string
  /** Dish photo; drinks may have none. */
  imageUrl?: string
  status: MenuAvailability
  updatedAt: string
  updatedBy?: string
}

export interface MenuStatusRequest {
  id: string
  menuItemId: string
  requested: 'AVAILABLE' | 'SOLD_OUT'
  requestedBy: string
  requestedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  decidedAt?: string
  decidedBy?: string
}

export type IncidentType = 'OUT_OF_STOCK' | 'EQUIPMENT' | 'CANNOT_PREPARE' | 'NOTE_CLARIFICATION' | 'OTHER'
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'

export interface Incident {
  id: string
  code: string
  type: IncidentType
  severity: IncidentSeverity
  title: string
  description: string
  orderId?: string
  itemId?: string
  reporterId: string
  at: string
  status: IncidentStatus
  /** Who was told about it; the kitchen cannot cancel items from here. */
  notifiedStaffIds: string[]
  response?: { by: string; at: string; text: string }
}

export type NotificationKind = 'NEW_ORDER' | 'ADD_ON' | 'CANCELLED' | 'INCIDENT_REPLY' | 'PRIORITY' | 'MENU_REQUEST'

export interface KitchenNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  orderId?: string
  incidentId?: string
  /** Read state is per kitchen employee. */
  readBy: string[]
}

/** Messages the kitchen sends to other roles (shown only in the dev simulator). */
export interface OutboxMessage {
  id: string
  /** Notification kind of the receiving role (see docs/domain-contract.md). */
  kind: string
  audience: StaffRole
  staffId?: string
  title: string
  body: string
  at: string
}

export interface KitchenData {
  schema: 1
  seedDay: string
  /** Monotonic data revision; a slower response never replaces newer data. */
  revision: number
  nextId: number
  nextTicket: number
  staff: StaffMember[]
  orders: KitchenOrder[]
  items: KitchenOrderItem[]
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]
  menuRequests: MenuStatusRequest[]
  incidents: Incident[]
  notifications: KitchenNotification[]
  outbox: OutboxMessage[]
}

export interface ItemRef {
  id: string
  version: number
}

export interface IncidentInput {
  type: IncidentType
  severity: IncidentSeverity
  description: string
  orderId?: string
  itemId?: string
}

/** Everything a kitchen employee can ask the system to do. There is
 * deliberately no command that marks an item SERVED. */
export type KitchenCommand =
  | { type: 'start'; items: ItemRef[] }
  | { type: 'complete'; items: ItemRef[] }
  | { type: 'reject'; itemId: string; version: number; reason: string }
  | { type: 'report-incident'; input: IncidentInput }
  | { type: 'set-menu-status'; menuItemId: string; status: 'AVAILABLE' | 'SOLD_OUT' }
  | { type: 'request-menu-status'; menuItemId: string; status: 'AVAILABLE' | 'SOLD_OUT' }
  | { type: 'read-notifications'; ids?: string[] }

export interface CommandResult {
  data: KitchenData
  summary: string
}

export type KitchenErrorCode = 'FORBIDDEN' | 'CONFLICT' | 'INVALID' | 'NOT_FOUND' | 'NETWORK'

export class KitchenError extends Error {
  readonly code: KitchenErrorCode

  constructor(code: KitchenErrorCode, message: string) {
    super(message)
    this.name = 'KitchenError'
    this.code = code
  }
}
