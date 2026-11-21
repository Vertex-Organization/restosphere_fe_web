import { authenticatedRequest } from '../auth'
import { ApiError } from '../client'
import { KitchenError } from './types'
import type {
  CommandResult,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  KitchenCommand,
  KitchenData,
  KitchenNotification,
  KitchenOrder,
  KitchenOrderItem,
  MenuAvailability,
  MenuItem,
  MenuStatusRequest,
  NotificationKind,
  StaffMember,
} from './types'

export interface KitchenService {
  /** Current kitchen state. Called on start and by polling. */
  load(): Promise<KitchenData>
  /** Applies one command; rejects with KitchenError (CONFLICT when the item changed meanwhile). */
  execute(actor: StaffMember, command: KitchenCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

type KitchenOrderDto = KitchenOrder & { items?: KitchenOrderItem[] }

const STATUS_CODES: Record<number, 'FORBIDDEN' | 'CONFLICT' | 'INVALID' | 'NOT_FOUND'> = {
  403: 'FORBIDDEN',
  409: 'CONFLICT',
  400: 'INVALID',
  404: 'NOT_FOUND',
}

/** Maps HTTP failures to KitchenError; other errors (e.g. 401, 5xx) pass through unchanged. */
async function call<T>(request: Promise<T>): Promise<T> {
  try {
    return await request
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 0) throw new KitchenError('NETWORK', error.message)
      const code = STATUS_CODES[error.status]
      if (code) throw new KitchenError(code, error.message)
    }
    throw error
  }
}

const send = <T>(method: 'POST' | 'PATCH', path: string, body: unknown) =>
  call(authenticatedRequest<T>(path, { method, body: JSON.stringify(body) }))
const post = <T>(path: string, body: unknown) => send<T>('POST', path, body)
const patch = <T>(path: string, body: unknown) => send<T>('PATCH', path, body)

// --- Backend DTOs (Kitchen*Response.java) -> types.ts -----------------------
// The backend serialises absent values as null and has a few wider enums.

interface MenuItemDto {
  id: string
  name: string
  categoryId: string
  imageUrl?: string | null
  status: MenuAvailability
  updatedAt: string
}
interface MenuRequestDto {
  id: string
  menuItemId: string
  requested: string
  requestedBy: string
  requestedAt: string
  status: string
  decidedAt?: string | null
  decidedBy?: string | null
}
interface IncidentDto {
  id: string
  code: string
  type: string
  severity: string
  status: string
  title: string
  description: string
  orderId?: string | null
  itemId?: string | null
  reporterId: string
  at: string
  notifiedStaffIds?: string[] | null
  response?: { by: string; at: string; text: string } | null
}
interface NotificationDto {
  id: string
  kind: string
  title: string
  body: string
  at: string
  orderId?: string | null
  readBy?: string[] | null
}

const INCIDENT_TYPES: IncidentType[] = [
  'OUT_OF_STOCK',
  'EQUIPMENT',
  'CANNOT_PREPARE',
  'NOTE_CLARIFICATION',
  'OTHER',
]
const MENU_AVAILABILITY: MenuAvailability[] = ['AVAILABLE', 'SOLD_OUT', 'DISCONTINUED']

const orUndefined = <T>(value: T | null | undefined): T | undefined => value ?? undefined

function toMenuItem(dto: MenuItemDto): MenuItem {
  return {
    id: dto.id,
    name: dto.name,
    categoryId: dto.categoryId,
    ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
    status: MENU_AVAILABILITY.includes(dto.status) ? dto.status : 'AVAILABLE',
    updatedAt: dto.updatedAt,
  }
}

/** WITHDRAWN requests have no counterpart in the UI model and are dropped by the caller. */
function toMenuRequest(dto: MenuRequestDto): MenuStatusRequest | null {
  if (dto.status !== 'PENDING' && dto.status !== 'APPROVED' && dto.status !== 'REJECTED')
    return null
  return {
    id: dto.id,
    menuItemId: dto.menuItemId,
    requested: dto.requested === 'AVAILABLE' ? 'AVAILABLE' : 'SOLD_OUT',
    requestedBy: dto.requestedBy,
    requestedAt: dto.requestedAt,
    status: dto.status,
    ...(dto.decidedAt ? { decidedAt: dto.decidedAt } : {}),
    ...(dto.decidedBy ? { decidedBy: dto.decidedBy } : {}),
  }
}

function toIncident(dto: IncidentDto): Incident {
  const type = INCIDENT_TYPES.find((value) => value === dto.type) ?? 'OTHER'
  const severity: IncidentSeverity =
    dto.severity === 'LOW' || dto.severity === 'MEDIUM' ? dto.severity : 'HIGH' // CRITICAL -> HIGH
  const status: IncidentStatus =
    dto.status === 'OPEN' || dto.status === 'ACKNOWLEDGED' ? dto.status : 'RESOLVED' // CLOSED -> RESOLVED
  return {
    id: dto.id,
    code: dto.code,
    type,
    severity,
    title: dto.title,
    description: dto.description ?? '',
    ...(dto.orderId ? { orderId: dto.orderId } : {}),
    ...(dto.itemId ? { itemId: dto.itemId } : {}),
    reporterId: dto.reporterId,
    at: dto.at,
    status,
    notifiedStaffIds: dto.notifiedStaffIds ?? [],
    ...(dto.response ? { response: dto.response } : {}),
  }
}

function toNotification(dto: NotificationDto): KitchenNotification {
  return {
    id: dto.id,
    // REQUEST_DECIDED (manager approved/rejected a menu request) is shown as MENU_REQUEST;
    // other unknown kinds pass through and get the fallback label.
    kind: (dto.kind === 'REQUEST_DECIDED' ? 'MENU_REQUEST' : dto.kind) as NotificationKind,
    title: dto.title,
    body: dto.body,
    at: dto.at,
    ...(orUndefined(dto.orderId) ? { orderId: dto.orderId as string } : {}),
    readBy: dto.readBy ?? [],
  }
}

async function load(): Promise<KitchenData> {
  const [snapshot, dtos, menuItems, menuRequests, incidents, notifications] = await Promise.all([
    call(authenticatedRequest<KitchenData>('workspaces/kitchen')),
    call(authenticatedRequest<KitchenOrderDto[]>('kitchen/orders')),
    call(authenticatedRequest<MenuItemDto[] | null>('kitchen/menu-items')),
    call(authenticatedRequest<MenuRequestDto[] | null>('kitchen/menu-requests')),
    call(authenticatedRequest<IncidentDto[] | null>('kitchen/incidents')),
    call(authenticatedRequest<NotificationDto[] | null>('kitchen/notifications')),
  ])
  const orders: KitchenOrder[] = []
  const items: KitchenOrderItem[] = []
  for (const { items: orderItems, ...order } of dtos ?? []) {
    orders.push(order)
    items.push(...(orderItems ?? []))
  }
  return {
    ...snapshot,
    orders,
    items,
    menuItems: (menuItems ?? []).map(toMenuItem),
    menuRequests: (menuRequests ?? []).flatMap((dto) => toMenuRequest(dto) ?? []),
    incidents: (incidents ?? []).map(toIncident),
    notifications: (notifications ?? []).map(toNotification),
  }
}

export const kitchenService: KitchenService = {
  load,
  async execute(_actor, command) {
    let summary: string
    if (command.type === 'start') {
      await post<KitchenOrderItem[]>('kitchen/items/start', { items: command.items })
      summary = `Đã bắt đầu ${command.items.length} món`
    } else if (command.type === 'complete') {
      await post<KitchenOrderItem[]>('kitchen/items/complete', { items: command.items })
      summary = `Đã hoàn thành ${command.items.length} món`
    } else if (command.type === 'reject') {
      await post<KitchenOrderItem[]>(`kitchen/items/${encodeURIComponent(command.itemId)}/reject`, {
        version: command.version,
        reason: command.reason,
      })
      summary = 'Đã từ chối món'
    } else if (command.type === 'set-menu-status') {
      await patch(`kitchen/menu-items/${encodeURIComponent(command.menuItemId)}/status`, {
        status: command.status,
      })
      summary = 'Đã cập nhật trạng thái món'
    } else if (command.type === 'request-menu-status') {
      await post('kitchen/menu-requests', {
        menuItemId: command.menuItemId,
        status: command.status,
      })
      summary = 'Đã gửi yêu cầu đổi trạng thái món'
    } else if (command.type === 'report-incident') {
      await post('kitchen/incidents', command.input)
      summary = 'Đã báo cáo sự cố'
    } else {
      await post('kitchen/notifications/read', command.ids ? { ids: command.ids } : {})
      summary = 'Đã đánh dấu đã đọc'
    }
    return { data: await load(), summary }
  },
  subscribe: () => () => {},
}
