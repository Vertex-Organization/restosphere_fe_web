export type Permission = 'tables.edit' | 'reservations.edit' | 'employees.assign' | 'shifts.manage' | 'menu.manage' | 'approvals.decide' | 'incidents.manage' | 'reports.export'
export interface ManagerUser { id: string; name: string; role: 'MANAGER' | 'CASHIER'; position: string; permissions: Permission[]; approvalLimit: number }
export interface Area { id: string; name: string }
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'INACTIVE'
export interface RestaurantTable { id: string; areaId: string; seats: number; status: TableStatus; sessionId?: string }
export interface TableSession { id: string; tableId: string; guests: number; startedAt: string; waiterId: string; paymentRequested: boolean }
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'LATE' | 'CANCELLED' | 'NO_SHOW'
export interface Reservation { id: string; customer: string; guests: number; at: string; until: string; tableId: string; status: ReservationStatus; employeeId: string; note: string }
export type ItemStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export interface OrderItem { id: string; menuId: string; name: string; quantity: number; unitPrice: number; status: ItemStatus; note: string; chefId: string; readyAt?: string }
export interface Order { id: string; sessionId: string; employeeId: string; at: string; round: number; paid: boolean; items: OrderItem[] }
export interface Employee { id: string; name: string; department: 'SERVICE' | 'KITCHEN' | 'RECEPTION' | 'CASHIER' | 'MANAGEMENT'; position: string; status: 'ACTIVE' | 'LEAVE' | 'INACTIVE'; areaId: string }
export interface Shift { id: string; name: string; date: string; start: string; end: string; employeeIds: string[]; minimum: number }
export interface MenuCategory { id: string; name: string; visible: boolean; sort: number }
export interface MenuItem { id: string; name: string; categoryId: string; price: number; image: string; description: string; status: 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN'; updatedAt: string }
export interface Approval { id: string; type: 'DISCOUNT' | 'CANCEL_ITEM' | 'BILL_ADJUSTMENT' | 'RESERVATION'; senderId: string; at: string; relatedId: string; reason: string; amount: number; status: 'PENDING' | 'APPROVED' | 'REJECTED'; decisionNote?: string; decidedBy?: string; decidedAt?: string }
export interface Incident { id: string; type: string; title: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; reporterId: string; at: string; relatedId: string; assigneeId: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; note: string }
export interface ManagerNotification { id: string; title: string; body: string; at: string; path: string; readBy: string[]; kind: 'APPROVAL' | 'INCIDENT' | 'ORDER' }
export interface Bill { id: string; at: string; shift: 'LUNCH' | 'DINNER'; guests: number; discount: number; items: { name: string; categoryId: string; quantity: number; unitPrice: number }[] }
export interface Payment { id: string; billId: string; at: string; method: 'CASH' | 'TRANSFER'; amount: number; status: 'COMPLETED' | 'FAILED' | 'PENDING' }
export interface AuditEvent { id: string; at: string; actorId: string; entityId: string; text: string }
export interface ManagerData { schema: 1; revision: number; seedDay: string; areas: Area[]; tables: RestaurantTable[]; sessions: TableSession[]; reservations: Reservation[]; orders: Order[]; employees: Employee[]; shifts: Shift[]; categories: MenuCategory[]; menu: MenuItem[]; approvals: Approval[]; incidents: Incident[]; notifications: ManagerNotification[]; bills: Bill[]; payments: Payment[]; history: AuditEvent[] }
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
  | { type: 'incident.update'; id: string; assigneeId: string; status: Incident['status']; note: string }
  | { type: 'notification.read'; id?: string }
