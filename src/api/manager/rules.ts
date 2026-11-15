import { businessDay, dayAt } from './dates'
import type { ManagerCommand, ManagerData, ManagerUser, Permission } from './types'

export class ManagerError extends Error {
  readonly field?: string
  constructor(message: string, field?: string) { super(message); this.name = 'ManagerError'; this.field = field }
}
function requireValue(condition: unknown, message: string, field?: string): asserts condition {
  if (!condition) throw new ManagerError(message, field)
}
const permissions: Record<ManagerCommand['type'], Permission | null> = {
  'reservation.move': 'reservations.edit', 'table.update': 'tables.edit', 'employee.assign': 'employees.assign',
  'shift.save': 'shifts.manage', 'menu.save': 'menu.manage', 'menu.delete': 'menu.manage', 'category.save': 'menu.manage', 'category.delete': 'menu.manage',
  'approval.decide': 'approvals.decide', 'incident.update': 'incidents.manage', 'notification.read': null,
}
// Same default as the staff app's reservation settings (Admin `bufferMinutes`); copied, not imported across apps.
const BUFFER_MINUTES = 15
export const activeReservation = (status: string) => ['PENDING', 'CONFIRMED', 'ARRIVED'].includes(status)
export const overlap = (a: string, b: string, c: string, d: string) => new Date(a).getTime() < new Date(d).getTime() && new Date(c).getTime() < new Date(b).getTime()

/** Pure transaction: failure leaves the caller's state unchanged. An HTTP adapter must enforce these on the server. */
export function applyManagerCommand(source: ManagerData, actor: ManagerUser | null, command: ManagerCommand, expectedRevision: number, now = new Date()): ManagerData {
  requireValue(actor?.role === 'MANAGER', 'Bạn không có quyền quản lý nhà hàng.')
  const permission = permissions[command.type]
  requireValue(!permission || actor.permissions.includes(permission), 'Bạn không có quyền thực hiện thao tác này.')
  requireValue(source.revision === expectedRevision, 'Dữ liệu vừa thay đổi. Đã tải lại, hãy kiểm tra trước khi lưu.')
  const data = structuredClone(source)
  const at = now.toISOString()
  let entityId = ''
  let text = ''
  const areaExists = (id: string) => data.areas.some(a => a.id === id)
  switch (command.type) {
    case 'reservation.move': {
      const r = data.reservations.find(r => r.id === command.id)
      requireValue(r && ['CONFIRMED', 'ARRIVED'].includes(r.status), 'Chỉ đổi bàn cho đặt bàn đã xác nhận hoặc khách đã đến, trước bàn giao.')
      const t = data.tables.find(t => t.id === command.tableId)
      requireValue(t && t.status === 'AVAILABLE', 'Bàn phải sẵn sàng trước khi điều chỉnh.', 'tableId')
      requireValue(r.tableId !== t.id, 'Hãy chọn bàn khác với bàn hiện tại.', 'tableId')
      requireValue(t.seats >= r.guests, `Bàn ${t.id} chỉ có ${t.seats} ghế, không đủ cho ${r.guests} khách.`, 'tableId')
      requireValue(!r.areaId || r.areaId === t.areaId, `Bàn ${t.id} không thuộc khu vực khách yêu cầu.`, 'tableId')
      const pad = BUFFER_MINUTES * 60_000
      const from = new Date(new Date(r.at).getTime() - pad).toISOString()
      const to = new Date(new Date(r.until).getTime() + pad).toISOString()
      requireValue(!data.reservations.some(other => other.id !== r.id && other.tableId === t.id && ['CONFIRMED', 'ARRIVED', 'SEATED'].includes(other.status) && overlap(from, to, other.at, other.until)), `Bàn đã có lịch giữ trong khung giờ này (gồm ${BUFFER_MINUTES} phút đệm).`, 'tableId')
      requireValue(command.reason.trim().length >= 5, 'Nhập lý do điều chỉnh ít nhất 5 ký tự.', 'reason')
      const reason = command.reason.trim()
      text = `Điều chỉnh ${r.id}: ${r.tableId} → ${t.id}. ${reason}`; entityId = r.id
      for (const [audience, staffId] of [['RECEPTIONIST', r.employeeId], ['WAITER', data.sessions.find(s => s.tableId === r.tableId)?.waiterId]] as const) {
        if (staffId) data.outbox.unshift({ id: `OUT-${crypto.randomUUID()}`, kind: 'TABLE_REASSIGNED', audience, staffId, title: `Đổi bàn ${r.id}: ${r.tableId} → ${t.id}`, body: reason, at })
      }
      r.tableId = t.id
      break
    }
    case 'table.update': {
      const t = data.tables.find(t => t.id === command.id)
      requireValue(t, 'Không tìm thấy bàn.')
      requireValue(!t.sessionId && !['OCCUPIED', 'CLEANING'].includes(t.status), 'Bàn đang có phiên phục vụ hoặc đang dọn; không thể đổi bố trí.')
      requireValue(!data.reservations.some(r => r.tableId === t.id && activeReservation(r.status)), 'Bàn còn lịch giữ, hãy xử lý đặt bàn trước khi đổi bố trí.')
      requireValue(Number.isInteger(command.seats) && command.seats >= 1 && command.seats <= 20, 'Số ghế phải từ 1 đến 20.', 'seats')
      requireValue(areaExists(command.areaId), 'Chọn khu vực hợp lệ.', 'areaId')
      Object.assign(t, { seats: command.seats, areaId: command.areaId, status: command.inactive ? 'OUT_OF_SERVICE' : 'AVAILABLE' })
      entityId = t.id; text = `Cập nhật bố trí bàn ${t.id} · ${command.seats} ghế`
      break
    }
    case 'employee.assign': {
      const e = data.employees.find(e => e.id === command.id)
      requireValue(e?.status === 'ACTIVE', 'Chỉ phân công nhân viên đang làm việc.')
      requireValue(areaExists(command.areaId), 'Chọn khu vực hợp lệ.', 'areaId')
      e.areaId = command.areaId; entityId = e.id; text = `Phân công ${e.name} vào khu ${e.areaId}`
      break
    }
    case 'shift.save': {
      const s = { ...command.shift, name: command.shift.name.trim(), employeeIds: [...new Set(command.shift.employeeIds)] }
      requireValue(s.name, 'Nhập tên ca làm.', 'name')
      requireValue(/^\d{4}-\d{2}-\d{2}$/.test(s.date) && !Number.isNaN(Date.parse(dayAt(s.date, '12:00'))), 'Chọn ngày làm việc hợp lệ.', 'date')
      requireValue(businessDay(dayAt(s.date, '12:00')) === s.date, 'Ngày làm việc không tồn tại trong lịch.', 'date')
      requireValue(/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.end) && s.start < s.end, 'Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.', 'end')
      const hours = (Date.parse(dayAt(s.date, s.end)) - Date.parse(dayAt(s.date, s.start))) / 3600000
      requireValue(hours <= 12, 'Một ca không vượt quá 12 giờ.', 'end')
      requireValue(Number.isInteger(s.minimum) && s.minimum >= 1 && s.minimum <= 30, 'Nhân sự tối thiểu phải từ 1 đến 30.', 'minimum')
      requireValue(s.employeeIds.length, 'Chọn ít nhất một nhân viên.', 'employeeIds')
      for (const id of s.employeeIds) {
        const e = data.employees.find(e => e.id === id)
        requireValue(e?.status === 'ACTIVE', 'Không thể phân ca cho nhân viên nghỉ phép hoặc nghỉ việc.', 'employeeIds')
        const others = data.shifts.filter(o => o.id !== s.id && o.date === s.date && o.employeeIds.includes(id))
        requireValue(!others.some(o => overlap(dayAt(s.date, s.start), dayAt(s.date, s.end), dayAt(o.date, o.start), dayAt(o.date, o.end))), `${e.name} đã được phân ca trùng giờ.`, 'employeeIds')
        const total = hours + others.reduce((n, o) => n + (Date.parse(dayAt(o.date, o.end)) - Date.parse(dayAt(o.date, o.start))) / 3600000, 0)
        requireValue(total <= 12, `${e.name} vượt giới hạn mô phỏng 12 giờ/ngày.`, 'employeeIds')
      }
      const existing = data.shifts.findIndex(o => o.id === s.id)
      if (existing >= 0) data.shifts[existing] = s
      else data.shifts.push(s)
      entityId = s.id; text = `Lưu ${s.name} · ${s.date} · ${s.employeeIds.length} nhân viên`
      break
    }
    case 'menu.save': {
      const item = { ...command.item, name: command.item.name.trim(), id: command.item.id.trim().toUpperCase(), updatedAt: at }
      requireValue(/^[A-Z0-9_-]{2,24}$/.test(item.id), 'Mã món gồm 2–24 chữ, số, gạch ngang hoặc gạch dưới.', 'id')
      requireValue(item.name.length > 0 && item.name.length <= 100, 'Tên món bắt buộc, tối đa 100 ký tự.', 'name')
      requireValue(Number.isSafeInteger(item.price) && item.price >= 0, 'Giá món phải là số đồng nguyên không âm.', 'price')
      requireValue(data.categories.some(c => c.id === item.categoryId && c.visible), 'Chọn một danh mục đang hiển thị.', 'categoryId')
      requireValue(['AVAILABLE', 'SOLD_OUT', 'DISCONTINUED'].includes(item.status), 'Trạng thái món không hợp lệ.', 'status')
      requireValue(!item.image || /^\/(?!\/)[\w/.-]+$/.test(item.image) || /^https:\/\//.test(item.image), 'Ảnh phải là đường dẫn nội bộ hoặc URL HTTPS.', 'image')
      const existing = data.menu.findIndex(m => m.id === item.id)
      requireValue(command.creating ? existing < 0 : existing >= 0, command.creating ? 'Mã món đã tồn tại.' : 'Món không còn tồn tại.', 'id')
      if (existing >= 0) data.menu[existing] = item
      else data.menu.push(item)
      // Order items retain their original name and unitPrice snapshots.
      entityId = item.id; text = `${command.creating ? 'Thêm' : 'Cập nhật'} món ${item.name}`
      break
    }
    case 'menu.delete': {
      const item = data.menu.find(m => m.id === command.id)
      requireValue(item, 'Không tìm thấy món ăn.')
      requireValue(!data.orders.some(o => o.items.some(i => i.menuId === item.id)), 'Món đã được tham chiếu trong đơn hàng. Hãy ẩn món thay vì xóa.')
      data.menu = data.menu.filter(m => m.id !== item.id)
      entityId = item.id; text = `Xóa món ${item.name}`
      break
    }
    case 'category.save': {
      const c = { ...command.category, id: command.category.id.trim().toUpperCase(), name: command.category.name.trim() }
      requireValue(/^[A-Z0-9_-]{2,24}$/.test(c.id), 'Mã danh mục gồm 2–24 chữ, số hoặc gạch dưới.', 'id')
      requireValue(c.name.length > 0 && c.name.length <= 60, 'Nhập tên danh mục, tối đa 60 ký tự.', 'name')
      requireValue(Number.isInteger(c.sort) && c.sort >= 1 && c.sort <= 999, 'Thứ tự phải từ 1 đến 999.', 'sort')
      const index = data.categories.findIndex(o => o.id === c.id)
      requireValue(command.creating ? index < 0 : index >= 0, command.creating ? 'Mã danh mục đã tồn tại.' : 'Danh mục không còn tồn tại.', 'id')
      if (index >= 0) data.categories[index] = c
      else data.categories.push(c)
      entityId = c.id; text = `${command.creating ? 'Thêm' : 'Cập nhật'} danh mục ${c.name}`
      break
    }
    case 'category.delete': {
      requireValue(data.categories.some(c => c.id === command.id), 'Không tìm thấy danh mục.')
      requireValue(!data.menu.some(m => m.categoryId === command.id), 'Danh mục còn món, hãy chuyển món trước khi xóa.')
      data.categories = data.categories.filter(c => c.id !== command.id)
      entityId = command.id; text = `Xóa danh mục ${command.id}`
      break
    }
    case 'approval.decide': {
      const a = data.approvals.find(a => a.id === command.id)
      requireValue(a?.status === 'PENDING', 'Yêu cầu đã được xử lý, không thể phê duyệt lần nữa.')
      requireValue(a.requestedBy !== actor.id, 'Không được tự xử lý yêu cầu do chính mình gửi.')
      requireValue(!command.approve || a.amount <= actor.approvalLimit, 'Giá trị yêu cầu vượt hạn mức phê duyệt được cấp (VNĐ).')
      requireValue(command.reason.trim().length >= 5, 'Nhập lý do xử lý ít nhất 5 ký tự.', 'reason')
      a.status = command.approve ? 'APPROVED' : 'REJECTED'; a.decisionNote = command.reason.trim(); a.decidedBy = actor.id; a.decidedAt = at
      // Approval applies automatically: only the manager-owned records change here; the sender gets the result as REQUEST_DECIDED.
      if (command.approve && a.type === 'MENU_STATUS' && a.menuStatus) {
        const m = data.menu.find(m => m.id === a.targetId)
        if (m) Object.assign(m, { status: a.menuStatus, updatedAt: at })
      }
      if (command.approve && a.type === 'CANCEL_ITEM') {
        const order = data.orders.find(o => o.items.some(i => i.id === a.targetId))
        const item = order?.items.find(i => i.id === a.targetId)
        requireValue(order && item && !order.paid && ['PREPARING', 'READY'].includes(item.status), 'Món đã thay đổi, không thể hủy.')
        item.status = 'CANCELLED'
        data.outbox.unshift({ id: `OUT-${crypto.randomUUID()}`, kind: 'CANCELLED', audience: 'KITCHEN', staffId: item.chefId, title: `Đã hủy ${item.name}`, body: `${order.id} · ${a.reason}`, at })
      }
      data.outbox.unshift({ id: `OUT-${crypto.randomUUID()}`, kind: 'REQUEST_DECIDED', audience: a.type === 'RESERVATION' ? 'RECEPTIONIST' : a.type === 'DISCOUNT' || a.type === 'BILL_ADJUSTMENT' || a.type === 'PAYMENT_VOID' ? 'CASHIER' : a.type === 'MENU_STATUS' ? 'KITCHEN' : 'WAITER', staffId: a.requestedBy, title: `${a.code} ${command.approve ? 'đã được duyệt' : 'bị từ chối'}`, body: a.decisionNote, at })
      entityId = a.id; text = `${command.approve ? 'Phê duyệt' : 'Từ chối'} ${a.code}. ${a.decisionNote}`
      break
    }
    case 'incident.update': {
      const incident = data.incidents.find(i => i.id === command.id)
      requireValue(incident, 'Không tìm thấy sự cố.')
      requireValue(incident.status !== 'RESOLVED', 'Sự cố đã đóng, không thể chỉnh sửa.')
      if (command.assigneeId) {
        requireValue(data.employees.some(e => e.id === command.assigneeId && e.status === 'ACTIVE'), 'Chọn người xử lý đang làm việc.', 'assigneeId')
        incident.assigneeId = command.assigneeId
      }
      requireValue(['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(command.status), 'Chọn trạng thái hợp lệ.', 'status')
      if (command.status === 'RESOLVED') {
        requireValue(data.employees.some(e => e.id === incident.assigneeId && e.status === 'ACTIVE'), 'Chọn người xử lý đang làm việc.', 'assigneeId')
        requireValue((command.reply ?? command.note ?? '').trim().length >= 5, 'Nhập ghi chú xử lý ít nhất 5 ký tự.', 'reply')
      }
      if (command.note !== undefined) {
        requireValue(command.note.trim().length >= 5, 'Nhập ghi chú xử lý ít nhất 5 ký tự.', 'note')
        incident.description = incident.description ? `${incident.description}\n[Ghi chú]: ${command.note.trim()}` : command.note.trim()
      }
      incident.status = command.status
      if (command.reply?.trim()) {
        requireValue(command.reply.trim().length >= 5, 'Nội dung phản hồi cần ít nhất 5 ký tự.', 'reply')
        incident.response = { by: actor.id, at, text: command.reply.trim() }
        data.outbox.unshift({
          id: `OUT-${crypto.randomUUID()}`,
          kind: 'INCIDENT_REPLY',
          audience: 'KITCHEN',
          staffId: incident.reporterId,
          title: `Quản lý phản hồi sự cố ${incident.code}`,
          body: command.reply.trim(),
          at,
        })
      }
      entityId = incident.id; text = `Cập nhật ${incident.code}. ${incident.response?.text ?? incident.status}`
      break
    }
    case 'notification.read': {
      requireValue(!command.id || data.notifications.some(n => n.id === command.id), 'Thông báo không còn tồn tại.')
      data.notifications.filter(n => !command.id || n.id === command.id).forEach(n => { if (!n.readBy.includes(actor.id)) n.readBy.push(actor.id) })
      break
    }
  }
  if (text) data.history.unshift({ id: `LS-${crypto.randomUUID()}`, at, actorId: actor.id, entityId, text })
  data.revision++
  return data
}
