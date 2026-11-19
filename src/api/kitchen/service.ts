import { authenticatedRequest } from '../auth'
import { ApiError } from '../client'
import { KitchenError } from './types'
import type { CommandResult, KitchenCommand, KitchenData, KitchenOrder, KitchenOrderItem, StaffMember } from './types'

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
  403: 'FORBIDDEN', 409: 'CONFLICT', 400: 'INVALID', 404: 'NOT_FOUND',
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

const post = <T>(path: string, body: unknown) =>
  call(authenticatedRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }))

async function load(): Promise<KitchenData> {
  const [snapshot, dtos] = await Promise.all([
    call(authenticatedRequest<KitchenData>('workspaces/kitchen')),
    call(authenticatedRequest<KitchenOrderDto[]>('kitchen/orders')),
  ])
  const orders: KitchenOrder[] = []
  const items: KitchenOrderItem[] = []
  for (const { items: orderItems, ...order } of dtos) {
    orders.push(order)
    items.push(...(orderItems ?? []))
  }
  return { ...snapshot, orders, items }
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
        version: command.version, reason: command.reason,
      })
      summary = 'Đã từ chối món'
    } else {
      return post<CommandResult>('workspaces/kitchen/commands', command)
    }
    return { data: await load(), summary }
  },
  subscribe: () => () => {},
}
