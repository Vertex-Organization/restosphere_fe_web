import { WORKSPACES } from '../../routes/staffRouter'
import { addDays, businessDay, dayAt } from './dates'
import type { ManagerData, ManagerUser } from './types'

/** Manager workspace base, for notification links. */
const M = WORKSPACES.MANAGER.base

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
    const status = i < 8 || (i >= 12 && i < 16) ? 'OCCUPIED' : i === 8 || i === 16 ? 'CLEANING' : i === 23 ? 'OUT_OF_SERVICE' : 'AVAILABLE'
    return { id, areaId, seats: i % 3 === 0 ? 6 : 4, status, ...(status === 'OCCUPIED' ? { sessionId: `SS-${id}` } : {}) }
  })
  const sessions = tables.filter(t => t.sessionId).map((t, i) => ({ id: t.sessionId!, tableId: t.id, guests: i % 3 + 2, startedAt: ago(70 - i * 3), waiterId: i % 2 ? 'NV003' : 'NV002', paymentRequested: i === 4 || i === 9 }))
  const orders: ManagerData['orders'] = sessions.map((s, i) => ({ id: `ORD-${String(85 + i).padStart(3, '0')}`, sessionId: s.id, employeeId: s.waiterId, at: ago(i === 2 ? 32 : 8 + i), round: 1, paid: false, items: [0, 1, 2].map((n) => { const m = menu[(i + n) % menu.length]; return { id: `OI-${i}-${n}`, menuId: m.id, name: m.name, quantity: n === 0 ? 2 : 1, unitPrice: m.price, status: i === 2 ? 'PREPARING' : i % 4 === 0 ? 'READY' : i % 4 === 1 ? 'SERVED' : n === 0 ? 'SUBMITTED' : 'PREPARING', note: i === 2 && n === 0 ? 'Khách không ăn cay' : '', chefId: n % 2 ? 'NV011' : 'NV010', ...(i % 4 === 0 ? { readyAt: ago(4) } : {}) } }) }))
  orders.push({ id: 'ORD-097', sessionId: sessions[0].id, employeeId: 'NV002', at: ago(3), round: 2, paid: false, items: [{ id: 'OI-ADD', menuId: 'M008', name: menu[7].name, quantity: 2, unitPrice: menu[7].price, status: 'SUBMITTED', note: 'Ít đá', chefId: 'NV011' }] })
  const reservations: ManagerData['reservations'] = [
    { id: 'RS0041', customer: 'Trần Thảo Vy', phone: '0901234567', areaId: 'A', occasion: 'Sinh nhật', source: 'WEB', guests: 4, at: later(20), until: later(140), tableId: 'A10', status: 'CONFIRMED', employeeId: 'NV015', note: '', preorder: [{ menuItemId: 'M001', quantity: 2, note: 'Ít cay' }] },
    { id: 'RS0042', customer: 'Nguyễn Đức Long', phone: '0912345678', areaId: 'B', occasion: 'Gia đình', source: 'PHONE', guests: 6, at: later(35), until: later(155), tableId: 'B07', status: 'CONFIRMED', employeeId: 'NV015', note: 'Khách cần ghế trẻ em' },
    { id: 'RS0043', customer: 'Lê Phương Linh', phone: '0987654321', areaId: 'A', source: 'WEB', guests: 2, at: later(50), until: later(170), tableId: 'A11', status: 'PENDING', employeeId: 'NV015', note: '' },
    { id: 'RS0044', customer: 'Phạm Minh Tuấn', phone: '0933445566', areaId: 'B', source: 'PHONE', guests: 4, at: later(65), until: later(185), tableId: 'B06', status: 'CONFIRMED', employeeId: 'NV015', note: '' },
    { id: 'RS0045', customer: 'Vũ Hoàng Yến', phone: '0944556677', areaId: 'A', source: 'WEB', guests: 4, at: later(-20), until: later(100), tableId: 'A12', status: 'CONFIRMED', employeeId: 'NV015', note: '' },
    { id: 'RS0046', customer: 'Đỗ Anh Dũng', phone: '0955667788', areaId: 'A', source: 'WALK_IN', guests: 3, at: later(-45), until: later(75), tableId: 'A01', status: 'ARRIVED', employeeId: 'NV015', note: '' },
    { id: 'RS0047', customer: 'Bùi Lan Anh', phone: '0966778899', areaId: 'B', source: 'WEB', guests: 2, at: later(90), until: later(210), tableId: 'B08', status: 'PENDING', employeeId: 'NV015', note: '' },
  ]
  const approvals: ManagerData['approvals'] = [
    { id: 'PD-021', code: 'PD-021', type: 'DISCOUNT', status: 'PENDING', targetType: 'BILL', targetId: 'HD-101', billId: 'HD-101', requestedBy: 'NV020', requestedAt: ago(5), reason: 'Khách chờ món lâu, đề nghị giảm 10% phần hải sản.', amount: 145000 },
    { id: 'PD-022', code: 'PD-022', type: 'CANCEL_ITEM', status: 'PENDING', targetType: 'ORDER_ITEM', targetId: 'OI-2-0', itemId: 'OI-2-0', requestedBy: 'NV002', requestedAt: ago(8), reason: 'Khách đổi món khi bếp đang chế biến.', amount: 219000 },
    { id: 'PD-023', code: 'PD-023', type: 'RESERVATION', status: 'PENDING', targetType: 'RESERVATION', targetId: 'RS0042', requestedBy: 'NV015', requestedAt: ago(12), reason: 'Đoàn khách yêu cầu ghép bàn và thêm ghế trẻ em.', amount: 0 },
    { id: 'PD-024', code: 'PD-024', type: 'BILL_ADJUSTMENT', status: 'PENDING', targetType: 'BILL', targetId: 'HD-102', billId: 'HD-102', requestedBy: 'NV020', requestedAt: ago(16), reason: 'Đề nghị kiểm tra giá trị điều chỉnh ngoài hạn mức.', amount: 750000 },
    { id: 'PD-025', code: 'PD-025', type: 'PAYMENT_VOID', status: 'PENDING', targetType: 'PAYMENT', targetId: 'TT-103', billId: 'HD-103', paymentId: 'TT-103', requestedBy: 'NV020', requestedAt: ago(20), reason: 'Khách chuyển khoản, thu ngân ghi nhầm là tiền mặt.', amount: 320000 },
    { id: 'PD-026', code: 'PD-026', type: 'MENU_STATUS', status: 'PENDING', targetType: 'MENU_ITEM', targetId: 'M002', menuStatus: 'AVAILABLE', requestedBy: 'NV011', requestedAt: ago(24), reason: 'Cua đã nhập về, đề nghị mở bán lại.', amount: 0 },
  ]
  const incidents: ManagerData['incidents'] = [
    { id: 'SC-008', code: 'SC-008', type: 'OUT_OF_STOCK', title: 'Cua biển tạm hết nguyên liệu', description: 'Bếp đề nghị tạm ngưng nhận món cua do nhà cung cấp giao trễ.', severity: 'HIGH', reporterId: 'NV010', at: ago(10), assigneeId: 'NV010', status: 'OPEN' },
    { id: 'SC-009', code: 'SC-009', type: 'EQUIPMENT', title: 'Máy in khu B không nhận phiếu', description: 'Máy in khu B không kết nối được mạng LAN.', severity: 'MEDIUM', reporterId: 'NV003', at: ago(25), assigneeId: 'NV002', status: 'ACKNOWLEDGED' },
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
      { id: 'TB-01', title: 'Yêu cầu giảm giá cần phê duyệt', body: 'PD-021 · Thu ngân Ngô Thanh Tâm', at: ago(5), path: `${M}/approvals?id=PD-021`, kind: 'APPROVAL', readBy: [] },
      { id: 'TB-02', title: 'Bếp báo hết nguyên liệu', body: 'SC-008 · Cua biển', at: ago(10), path: `${M}/incidents?id=SC-008`, kind: 'INCIDENT', readBy: [] },
      { id: 'TB-03', title: 'Bàn A03 chờ món quá 25 phút', body: 'ORD-087 · Cần kiểm tra với bếp', at: ago(7), path: `${M}/orders?id=ORD-087`, kind: 'ORDER', readBy: [] },
      { id: 'TB-04', title: 'Bếp xin báo tạm hết món', body: 'Phụ bếp Đỗ Thị Lan · Cua biển', at: ago(14), path: `${M}/approvals`, kind: 'MENU_REQUEST', readBy: [] },
      { id: 'TB-05', title: 'Thu ngân đã đóng ca', body: 'CA-011 · Ngô Thanh Tâm · Khớp tiền mặt', at: ago(40), path: `${M}/shifts`, kind: 'CASHIER_SHIFT_CLOSED', readBy: [] },
      { id: 'TB-06', title: 'Yêu cầu đã được rút', body: 'PD-020 · Thu ngân Ngô Thanh Tâm', at: ago(55), path: `${M}/approvals`, kind: 'REQUEST_WITHDRAWN', readBy: [] },
    ], outbox: [], history: [{ id: 'LS-01', at: ago(10), actorId: 'NV010', entityId: 'SC-008', text: 'Báo sự cố hết nguyên liệu cua biển' }, { id: 'LS-02', at: ago(16), actorId: 'NV015', entityId: 'DB-041', text: 'Xác nhận đặt bàn RS0041 · Bàn A10' }, { id: 'LS-03', at: ago(22), actorId: 'NV002', entityId: 'SC-009', text: 'Tiếp nhận xử lý máy in khu B' }] }
}
