export type Permission = 'tables.edit' | 'reservations.edit' | 'employees.assign' | 'shifts.manage' | 'menu.manage' | 'approvals.decide' | 'incidents.manage' | 'reports.export'
export interface ManagerUser { id: string; name: string; role: 'MANAGER' | 'CASHIER'; position: string; permissions: Permission[]; approvalLimit: number }
export interface Area { id: string; name: string }
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'OUT_OF_SERVICE'
export interface RestaurantTable { id: string; code: string; areaId: string; seats: number; status: TableStatus; sessionId?: string }
export interface TableSession { id: string; tableId: string; guests: number; startedAt: string; waiterId: string; paymentRequested: boolean }
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'SEATED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'NO_SHOW'
export interface Reservation {
  id: string
  customer: string
  phone?: string
  email?: string
  occasion?: string
  areaId?: string
  source?: 'WEB' | 'PHONE' | 'WALK_IN'
  guests: number
  at: string
  until: string
  tableId: string
  status: ReservationStatus
  employeeId: string
  note: string
  preorder?: { menuItemId: string; quantity: number; note?: string }[]
}
export type ItemStatus = 'SUBMITTED' | 'PREPARING' | 'READY' | 'SERVED' | 'REJECTED' | 'CANCELLED' | 'VOIDED'
export interface OrderItem { id: string; menuId: string; name: string; quantity: number; unitPrice: number; status: ItemStatus; note: string; chefId: string; readyAt?: string }
export interface Order { id: string; sessionId: string; employeeId: string; at: string; round: number; paid: boolean; items: OrderItem[] }
export interface Employee { id: string; name: string; department: 'SERVICE' | 'KITCHEN' | 'RECEPTION' | 'CASHIER' | 'MANAGEMENT'; position: string; status: 'ACTIVE' | 'LEAVE' | 'INACTIVE'; areaId: string }
export interface Shift { id: string; name: string; date: string; start: string; end: string; employeeIds: string[]; minimum: number }
export interface MenuCategory { id: string; name: string; visible: boolean; sort: number; group?: 'food' | 'drink' }
export interface MenuItem { id: string; name: string; categoryId: string; price: number; image: string; description: string; status: 'AVAILABLE' | 'SOLD_OUT' | 'DISCONTINUED'; unit?: 'portion' | 'kg'; updatedAt: string }
export type ApprovalType = 'DISCOUNT' | 'BILL_ADJUSTMENT' | 'PAYMENT_VOID' | 'CANCEL_ITEM' | 'RESERVATION' | 'MENU_STATUS'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
export type ApprovalTargetType = 'BILL' | 'PAYMENT' | 'ORDER_ITEM' | 'RESERVATION' | 'MENU_ITEM'
export interface Approval { id: string; code: string; type: ApprovalType; status: ApprovalStatus; targetType: ApprovalTargetType; targetId: string; billId?: string; paymentId?: string; itemId?: string; amount: number; menuStatus?: 'AVAILABLE' | 'SOLD_OUT'; reason: string; requestedBy: string; requestedAt: string; decidedBy?: string; decidedAt?: string; decisionNote?: string }
export type IncidentType = 'OUT_OF_STOCK' | 'EQUIPMENT' | 'CANNOT_PREPARE' | 'NOTE_CLARIFICATION' | 'OTHER'
export type IncidentSeverity = 'HIGH' | 'MEDIUM' | 'LOW'
export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export interface IncidentResponse { by: string; at: string; text: string }
export interface Incident {
  id: string
  code: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  orderId?: string
  itemId?: string
  reporterId: string
  assigneeId?: string
  response?: IncidentResponse
  at: string
}
export interface ManagerNotification { id: string; title: string; body: string; at: string; path: string; readBy: string[]; kind: 'APPROVAL' | 'INCIDENT' | 'ORDER' | 'MENU_REQUEST' | 'CASHIER_SHIFT_CLOSED' | 'REQUEST_WITHDRAWN' }
export interface Bill { id: string; at: string; shift: 'LUNCH' | 'DINNER'; guests: number; discount: number; items: { name: string; categoryId: string; quantity: number; unitPrice: number }[] }
export interface Payment { id: string; billId: string; at: string; method: 'CASH' | 'TRANSFER'; amount: number; status: 'COMPLETED' | 'FAILED' | 'PENDING' }
/** Messages the manager side sends to other roles (shown only in dev tools until a backend exists). */
export interface OutboxMessage { id: string; kind: 'REQUEST_DECIDED' | 'INCIDENT_REPLY' | 'CANCELLED' | 'TABLE_REASSIGNED'; audience: 'CASHIER' | 'WAITER' | 'KITCHEN' | 'RECEPTIONIST' | 'MANAGER'; staffId: string; title: string; body: string; at: string }
export interface AuditEvent { id: string; at: string; actorId: string; entityId: string; text: string }
export interface ManagerData { schema: 1; revision: number; seedDay: string; areas: Area[]; tables: RestaurantTable[]; sessions: TableSession[]; reservations: Reservation[]; orders: Order[]; employees: Employee[]; shifts: Shift[]; categories: MenuCategory[]; menu: MenuItem[]; approvals: Approval[]; incidents: Incident[]; notifications: ManagerNotification[]; bills: Bill[]; payments: Payment[]; history: AuditEvent[]; outbox: OutboxMessage[] }
export type ManagerCommand =
  | { type: 'reservation.move'; id: string; tableId: string; reason: string }
  | { type: 'table.update'; id: string; seats: number; areaId: string; inactive: boolean }
  | { type: 'employee.assign'; id: string; areaId: string }
  | { type: 'shift.save'; shift: Shift }
  | { type: 'menu.save'; item: MenuItem; creating: boolean }
  | { type: 'menu.delete'; id: string }
  | { type: 'category.save'; category: MenuCategory; creating: boolean }
  | { type: 'category.delete'; id: string }
  | { type: 'approval.decide'; id: string; approve: boolean; reason: string }
  | { type: 'incident.update'; id: string; assigneeId?: string; status: IncidentStatus; note?: string; reply?: string }
  | { type: 'notification.read'; id?: string }
