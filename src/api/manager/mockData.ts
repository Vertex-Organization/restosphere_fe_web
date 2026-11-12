import { addDays, businessDay, dayAt } from './dates'
import type { ManagerData, ManagerUser } from './types'

// Every person, transaction and operational record here is a mock fixture.
export const MOCK_USERS: ManagerUser[] = [
  { id: 'NV001', name: 'Nguyễn Minh Anh', role: 'MANAGER', position: 'Quản lý nhà hàng', permissions: ['tables.edit', 'reservations.edit', 'employees.assign', 'shifts.manage', 'menu.manage', 'approvals.decide', 'incidents.manage', 'reports.export'], approvalLimit: 500000 },
  { id: 'NV020', name: 'Ngô Thanh Tâm', role: 'CASHIER', position: 'Thu ngân', permissions: [], approvalLimit: 0 },
]
export function createManagerData(now = new Date()): ManagerData {
  const today = businessDay(now)
  const ago = (n: number) => new Date(now.getTime() - n * 60000).toISOString()
  const later = (n: number) => new Date(now.getTime() + n * 60000).toISOString()
  const employees: ManagerData['employees'] = [
    { id: 'NV001', name: 'Nguyễn Minh Anh', department: 'MANAGEMENT', position: 'Quản lý nhà hàng', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV002', name: 'Trần Hoài Nam', department: 'SERVICE', position: 'Trưởng ca phục vụ', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV003', name: 'Lê Thu Hà', department: 'SERVICE', position: 'Nhân viên phục vụ', status: 'ACTIVE', areaId: 'B' },
    { id: 'NV004', name: 'Phạm Quốc Huy', department: 'SERVICE', position: 'Nhân viên phục vụ', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV005', name: 'Võ Ngọc Mai', department: 'SERVICE', position: 'Nhân viên phục vụ', status: 'LEAVE', areaId: 'B' },
    { id: 'NV010', name: 'Đặng Minh Khoa', department: 'KITCHEN', position: 'Bếp trưởng', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV011', name: 'Bùi Thanh Sơn', department: 'KITCHEN', position: 'Đầu bếp', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV015', name: 'Đỗ Khánh Linh', department: 'RECEPTION', position: 'Lễ tân', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV020', name: 'Ngô Thanh Tâm', department: 'CASHIER', position: 'Thu ngân', status: 'ACTIVE', areaId: 'A' },
    { id: 'NV021', name: 'Hoàng Gia Bảo', department: 'CASHIER', position: 'Thu ngân', status: 'INACTIVE', areaId: 'B' },
  ]
  const categories = [{ id: 'HAI_SAN', name: 'Hải sản', visible: true, sort: 1 }, { id: 'MON_CHINH', name: 'Món chính', visible: true, sort: 2 }, { id: 'LAU', name: 'Lẩu', visible: true, sort: 3 }, { id: 'DO_UONG', name: 'Đồ uống', visible: true, sort: 4 }]
  const menu: ManagerData['menu'] = [
    ['M001', 'Tôm sú nướng muối ớt', 'HAI_SAN', 289000, 'shrimp'], ['M002', 'Cua hấp sả', 'HAI_SAN', 459000, 'crab'],
    ['M003', 'Mực nướng sa tế', 'HAI_SAN', 219000, 'squid'], ['M004', 'Cơm chiên hải sản', 'MON_CHINH', 129000, 'seafood-rice'],
    ['M005', 'Bò lúc lắc', 'MON_CHINH', 189000, 'beef'], ['M006', 'Lẩu hải sản', 'LAU', 399000, 'hotpot'],
    ['M007', 'Lẩu nấm', 'LAU', 259000, 'mushroom-hotpot'], ['M008', 'Trà đào cam sả', 'DO_UONG', 49000, 'peach-tea'],
  ].map(([id, name, categoryId, price, image], i) => ({ id: String(id), name: String(name), categoryId: String(categoryId), price: Number(price), image: `/kitchen/menu/${image}.jpg`, description: '', status: i === 1 ? 'SOLD_OUT' : 'AVAILABLE', updatedAt: ago(90) }))
  const tables: ManagerData['tables'] = Array.from({ length: 24 }, (_, i) => {
    const areaId = i < 12 ? 'A' : 'B'
    const id = `${areaId}${String(i % 12 + 1).padStart(2, '0')}`
    const status = i < 8 || (i >= 12 && i < 16) ? 'OCCUPIED' : i === 8 || i === 16 ? 'CLEANING' : i === 23 ? 'INACTIVE' : 'AVAILABLE'
    return { id, areaId, seats: i % 3 === 0 ? 6 : 4, status, ...(status === 'OCCUPIED' ? { sessionId: `SS-${id}` } : {}) }
  })
  const sessions = tables.filter(t => t.sessionId).map((t, i) => ({ id: t.sessionId!, tableId: t.id, guests: i % 3 + 2, startedAt: ago(70 - i * 3), waiterId: i % 2 ? 'NV003' : 'NV002', paymentRequested: i === 4 || i === 9 }))
  const orders: ManagerData['orders'] = sessions.map((s, i) => ({ id: `ORD-${String(85 + i).padStart(3, '0')}`, sessionId: s.id, employeeId: s.waiterId, at: ago(i === 2 ? 32 : 8 + i), round: 1, paid: false, items: [0, 1, 2].map((n) => { const m = menu[(i + n) % menu.length]; return { id: `OI-${i}-${n}`, menuId: m.id, name: m.name, quantity: n === 0 ? 2 : 1, unitPrice: m.price, status: i === 2 ? 'PREPARING' : i % 4 === 0 ? 'READY' : i % 4 === 1 ? 'SERVED' : n === 0 ? 'NEW' : 'PREPARING', note: i === 2 && n === 0 ? 'Khách không ăn cay' : '', chefId: n % 2 ? 'NV011' : 'NV010', ...(i % 4 === 0 ? { readyAt: ago(4) } : {}) } }) }))
  orders.push({ id: 'ORD-097', sessionId: sessions[0].id, employeeId: 'NV002', at: ago(3), round: 2, paid: false, items: [{ id: 'OI-ADD', menuId: 'M008', name: menu[7].name, quantity: 2, unitPrice: menu[7].price, status: 'NEW', note: 'Ít đá', chefId: 'NV011' }] })
  const reservations: ManagerData['reservations'] = [
    ['DB-041', 'Trần Thảo Vy', 4, 20, 'A10', 'CONFIRMED'], ['DB-042', 'Nguyễn Đức Long', 6, 35, 'B07', 'CONFIRMED'],
    ['DB-043', 'Lê Phương Linh', 2, 50, 'A11', 'PENDING'], ['DB-044', 'Phạm Minh Tuấn', 4, 65, 'B06', 'CONFIRMED'],
    ['DB-045', 'Vũ Hoàng Yến', 4, -20, 'A12', 'LATE'], ['DB-046', 'Đỗ Anh Dũng', 3, -45, 'A01', 'ARRIVED'],
    ['DB-047', 'Bùi Lan Anh', 2, 90, 'B08', 'PENDING'],
  ].map(([id, customer, guests, offset, tableId, status]) => ({ id: String(id), customer: String(customer), guests: Number(guests), at: later(Number(offset)), until: later(Number(offset) + 120), tableId: String(tableId), status: status as ManagerData['reservations'][number]['status'], employeeId: 'NV015', note: id === 'DB-042' ? 'Khách cần ghế trẻ em' : '' }))
  const approvals: ManagerData['approvals'] = [
    { id: 'PD-021', type: 'DISCOUNT', senderId: 'NV020', at: ago(5), relatedId: 'ORD-089', reason: 'Khách chờ món lâu, đề nghị giảm 10% phần hải sản.', amount: 145000, status: 'PENDING' },
    { id: 'PD-022', type: 'CANCEL_ITEM', senderId: 'NV002', at: ago(8), relatedId: 'ORD-087', reason: 'Khách đổi món trước khi bếp bắt đầu chế biến.', amount: 219000, status: 'PENDING' },
    { id: 'PD-023', type: 'RESERVATION', senderId: 'NV015', at: ago(12), relatedId: 'DB-042', reason: 'Đoàn khách yêu cầu ghép bàn và thêm ghế trẻ em.', amount: 0, status: 'PENDING' },
    { id: 'PD-024', type: 'BILL_ADJUSTMENT', senderId: 'NV020', at: ago(16), relatedId: 'ORD-094', reason: 'Đề nghị kiểm tra giá trị điều chỉnh ngoài hạn mức.', amount: 750000, status: 'PENDING' },
  ]
  const incidents: ManagerData['incidents'] = [
    { id: 'SC-008', type: 'Nguyên liệu', title: 'Cua biển tạm hết nguyên liệu', severity: 'HIGH', reporterId: 'NV010', at: ago(10), relatedId: 'M002', assigneeId: 'NV010', status: 'OPEN', note: 'Bếp đề nghị tạm ngưng nhận món cua.' },
    { id: 'SC-009', type: 'Thiết bị', title: 'Máy in khu B không nhận phiếu', severity: 'MEDIUM', reporterId: 'NV003', at: ago(25), relatedId: 'B', assigneeId: 'NV002', status: 'IN_PROGRESS', note: 'Đã kiểm tra nguồn, đang kiểm tra kết nối.' },
  ]
  const shifts: ManagerData['shifts'] = Array.from({ length: 7 }, (_, i) => [
    { id: `CA-${i}-1`, name: 'Ca trưa', date: addDays(today, i), start: '09:00', end: '15:00', employeeIds: ['NV001', 'NV002', 'NV004', 'NV010', 'NV015', 'NV020'], minimum: 6 },
    { id: `CA-${i}-2`, name: 'Ca tối', date: addDays(today, i), start: '16:00', end: '22:00', employeeIds: ['NV001', 'NV002', 'NV003', 'NV010', 'NV011', 'NV015', 'NV020'], minimum: 8 },
  ]).flat()
  const bills: ManagerData['bills'] = Array.from({ length: 28 }, (_, i) => ({ id: `HD-${101 + i}`, at: dayAt(addDays(today, -Math.floor(i / 4)), i % 2 ? '18:30' : '12:30'), shift: i % 2 ? 'DINNER' : 'LUNCH', guests: i % 4 + 2, discount: i % 5 === 0 ? 30000 : 0, items: [menu[i % 8], menu[(i + 3) % 8]].map(m => ({ name: m.name, categoryId: m.categoryId, quantity: i % 3 + 1, unitPrice: m.price })) }))
  const payments: ManagerData['payments'] = bills.map((b, i) => ({ id: `TT-${101 + i}`, billId: b.id, at: b.at, method: i % 3 ? 'TRANSFER' : 'CASH', amount: b.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) - b.discount, status: 'COMPLETED' }))
  payments.push({ id: 'TT-FAILED', billId: bills[0].id, at: bills[0].at, amount: payments[0].amount, method: 'TRANSFER', status: 'FAILED' })
  return { schema: 1, revision: 1, seedDay: today, areas: [{ id: 'A', name: 'Khu A · Tầng trệt' }, { id: 'B', name: 'Khu B · Tầng 1' }], tables, sessions, orders, reservations, employees, categories, menu, approvals, incidents, shifts, bills, payments,
    notifications: [
      { id: 'TB-01', title: 'Yêu cầu giảm giá cần phê duyệt', body: 'PD-021 · Thu ngân Ngô Thanh Tâm', at: ago(5), path: '/manager/approvals?id=PD-021', kind: 'APPROVAL', readBy: [] },
      { id: 'TB-02', title: 'Bếp báo hết nguyên liệu', body: 'SC-008 · Cua biển', at: ago(10), path: '/manager/incidents?id=SC-008', kind: 'INCIDENT', readBy: [] },
      { id: 'TB-03', title: 'Bàn A03 chờ món quá 25 phút', body: 'ORD-087 · Cần kiểm tra với bếp', at: ago(7), path: '/manager/orders?id=ORD-087', kind: 'ORDER', readBy: [] },
    ], history: [{ id: 'LS-01', at: ago(10), actorId: 'NV010', entityId: 'SC-008', text: 'Báo sự cố hết nguyên liệu cua biển' }, { id: 'LS-02', at: ago(16), actorId: 'NV015', entityId: 'DB-041', text: 'Xác nhận đặt bàn DB-041 · Bàn A10' }, { id: 'LS-03', at: ago(22), actorId: 'NV002', entityId: 'SC-009', text: 'Tiếp nhận xử lý máy in khu B' }] }
}
