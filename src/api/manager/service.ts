import { authenticatedRequest } from '../auth'
import type { Approval, Area, Employee, ManagerCommand, ManagerData, MenuCategory, MenuItem, Reservation, ReservationStatus, RestaurantTable, Shift } from './types'

interface CategoryDto { id: string; name: string; sortOrder: number; visible: boolean; group: 'food' | 'drink' }
interface ItemDto {
  id: string; name: string; categoryId: string; categoryName: string; price: number; description: string | null
  imageUrl: string | null; status: MenuItem['status']; unit: 'portion' | 'kg'; updatedAt: string
}

interface ManagerTableDto {
  id: string; code: string; areaId: string; areaName: string; seats: number
  status: RestaurantTable['status']; sessionId: string | null; hasActiveReservation: boolean
}

interface ReservationDto {
  id: string; code: string; customer: string; phone: string; email: string; occasion: string; areaId: string; areaName: string
  source: 'WEB' | 'PHONE' | 'WALK_IN'; guests: number; actualGuests: number | null; at: string; until: string
  tableId: string | null; tableCode: string | null; status: ReservationStatus; employeeId: string; note: string
  preorder: { menuItemId: string; menuItemName: string; quantity: number; note: string }[]
}

interface EmployeeDto {
  id: string; name: string; email: string; role: string; department: Employee['department']; position: string
  status: 'ACTIVE' | 'INACTIVE'; areaId: string; areaName: string
}

const toEmployee = ({ id, name, email, role, department, position, status, areaId, areaName }: EmployeeDto): Employee => ({
  id, name, email, role, department, position, status, areaId, areaName,
})
type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] | null }
type ApprovalDto = Nullable<Approval, 'billId' | 'paymentId' | 'itemId' | 'menuStatus' | 'decidedBy' | 'decidedAt' | 'decisionNote'> & { targetLabel: string }

const toApproval = ({ billId, paymentId, itemId, menuStatus, decidedBy, decidedAt, decisionNote, amount, ...rest }: ApprovalDto): Approval => ({
  ...rest, amount: Number(amount ?? 0), billId: billId ?? undefined, paymentId: paymentId ?? undefined, itemId: itemId ?? undefined,
  menuStatus: menuStatus ?? undefined, decidedBy: decidedBy ?? undefined, decidedAt: decidedAt ?? undefined, decisionNote: decisionNote ?? undefined,
})
const toReservation = ({ tableId, tableCode, actualGuests, ...rest }: ReservationDto): Reservation => ({
  ...rest, tableId: tableId ?? '', tableCode: tableCode ?? undefined, actualGuests: actualGuests ?? undefined,
})
const toTable = ({ id, code, areaId, seats, status, sessionId, hasActiveReservation }: ManagerTableDto): RestaurantTable => ({
  id, code, areaId, seats, status, sessionId: sessionId ?? undefined, hasActiveReservation,
})
const toCategory = ({ id, name, visible, sortOrder, group }: CategoryDto): MenuCategory => ({ id, name, visible, sort: sortOrder, group })
const toItem = ({ id, name, categoryId, price, imageUrl, description, status, unit, updatedAt }: ItemDto): MenuItem => ({
  id, name, categoryId, price: Number(price), image: imageUrl ?? '', description: description ?? '', status, unit, updatedAt,
})

export const managerService = {
  mode: 'api' as const,
  async load() {
    const [snapshot, categories, menu, areas, tables, reservations, employees, shifts, approvals] = await Promise.all([
      authenticatedRequest<ManagerData>('workspaces/manager'),
      authenticatedRequest<CategoryDto[]>('menu/categories?all=true'),
      authenticatedRequest<ItemDto[]>('menu/items?all=true'),
      authenticatedRequest<Area[]>('areas'),
      authenticatedRequest<ManagerTableDto[]>('manager/tables'),
      authenticatedRequest<ReservationDto[]>('manager/reservations'),
      authenticatedRequest<EmployeeDto[]>('manager/employees'),
      authenticatedRequest<Shift[]>('manager/shifts'),
      authenticatedRequest<ApprovalDto[]>('manager/approvals'),
    ])
    // Merge onto the snapshot row: ManagerDataProvider reads the signed-in manager's permissions,
    // approvalLimit, shift… from data.employees and the REST list lacks them. R1 replaces this with a profile API.
    const snapshotEmployees = new Map(snapshot.employees.map(e => [e.id, e]))
    return {
      ...snapshot, categories: categories.map(toCategory), menu: menu.map(toItem), areas, tables: tables.map(toTable), reservations: reservations.map(toReservation),
      employees: employees.map(dto => ({ ...snapshotEmployees.get(dto.id), ...toEmployee(dto) })), shifts,
      approvals: approvals.map(toApproval),
    }
  },
  async execute(command: ManagerCommand): Promise<ManagerData> {
    if (command.type === 'category.save') {
      const { id, name, sort, visible, group } = command.category
      await authenticatedRequest<CategoryDto>(command.creating ? 'menu/categories' : `menu/categories/${encodeURIComponent(id)}`, {
        method: command.creating ? 'POST' : 'PUT', body: JSON.stringify({ name, sortOrder: sort, visible, group: group ?? 'food' }),
      })
      return managerService.load()
    }
    if (command.type === 'category.delete') {
      await authenticatedRequest<void>(`menu/categories/${encodeURIComponent(command.id)}`, { method: 'DELETE' })
      return managerService.load()
    }
    if (command.type === 'menu.save') {
      const { id, name, categoryId, price, description, image, status, unit } = command.item
      await authenticatedRequest<ItemDto>(command.creating ? 'menu/items' : `menu/items/${encodeURIComponent(id)}`, {
        method: command.creating ? 'POST' : 'PUT', body: JSON.stringify({ name, categoryId, price, description, imageUrl: image, status, unit: unit ?? 'portion' }),
      })
      return managerService.load()
    }
    if (command.type === 'approval.decide') {
      await authenticatedRequest<ApprovalDto>(`manager/approvals/${encodeURIComponent(command.id)}/decision`, {
        method: 'POST', body: JSON.stringify({ approve: command.approve, reason: command.reason }),
      })
      return managerService.load()
    }
    if (command.type === 'shift.save') {
      const { id, name, date, start, end, minimum, employeeIds } = command.shift
      await authenticatedRequest<Shift>(id ? `manager/shifts/${encodeURIComponent(id)}` : 'manager/shifts', {
        method: id ? 'PUT' : 'POST', body: JSON.stringify({ name, date, start, end, minimum, employeeIds }),
      })
      return managerService.load()
    }
    if (command.type === 'employee.assign') {
      await authenticatedRequest<EmployeeDto>(`manager/employees/${encodeURIComponent(command.id)}/area`, {
        method: 'PATCH', body: JSON.stringify({ areaId: command.areaId }),
      })
      return managerService.load()
    }
    if (command.type === 'reservation.move') {
      await authenticatedRequest<ReservationDto>(`manager/reservations/${encodeURIComponent(command.id)}/table`, {
        method: 'PATCH', body: JSON.stringify({ tableId: command.tableId, reason: command.reason }),
      })
      return managerService.load()
    }
    if (command.type === 'table.update') {
      const { id, code, areaId, seats, inactive } = command
      await authenticatedRequest<unknown>(`tables/${encodeURIComponent(id)}`, {
        method: 'PUT', body: JSON.stringify({ code, areaId, capacity: seats, outOfService: inactive }),
      })
      return managerService.load()
    }
    if (command.type === 'menu.delete') {
      await authenticatedRequest<void>(`menu/items/${encodeURIComponent(command.id)}`, { method: 'DELETE' })
      return managerService.load()
    }
    return authenticatedRequest<ManagerData>('workspaces/manager/commands', {
      method: 'POST', body: JSON.stringify(command),
    })
  },
  subscribe(listener: () => void) {
    const timer = window.setInterval(() => { if (!document.hidden) listener() }, 5000)
    return () => window.clearInterval(timer)
  },
}
