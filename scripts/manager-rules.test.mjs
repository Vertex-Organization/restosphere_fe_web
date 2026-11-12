import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Compile only the pure domain modules in memory; no extra test/runtime dependency.
const urls = new Map()
function moduleUrl(file) {
  file = path.resolve(file)
  if (urls.has(file)) return urls.get(file)
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/from ['"](.+?)['"]/g, (_, spec) => `from '${moduleUrl(path.resolve(path.dirname(file), `${spec}.ts`))}'`)
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  urls.set(file, url)
  return url
}
const { createManagerData, MOCK_USERS } = await import(moduleUrl('src/api/manager/mockData.ts'))
const { applyManagerCommand } = await import(moduleUrl('src/api/manager/rules.ts'))
const { dashboard } = await import(moduleUrl('src/api/manager/selectors.ts'))
const { businessDay } = await import(moduleUrl('src/api/manager/dates.ts'))
const now = new Date('2026-11-12T12:00:00+07:00')
const manager = MOCK_USERS[0]
const seed = () => createManagerData(now)
const execute = (d, c, actor = manager, revision = d.revision) => applyManagerCommand(d, actor, c, revision, now)
const decision = (id = 'PD-021') => ({ type: 'approval.decide', id, approve: true, reason: 'Đã kiểm tra thông tin' })

test('dashboard counts derive from the same records as detail pages', () => {
  const d = seed(); const s = dashboard(d, now.getTime())
  assert.equal(s.pending.length, d.approvals.filter(a => a.status === 'PENDING').length)
  assert.equal(s.occupied, d.sessions.length)
  assert.equal(s.activeOrders, d.orders.filter(o => o.items.some(i => ['NEW', 'PREPARING', 'READY'].includes(i.status))).length)
  assert.equal(s.revenue, d.payments.filter(p => p.status === 'COMPLETED' && businessDay(p.at) === businessDay(now)).reduce((n, p) => n + p.amount, 0))
})
test('business dates use Vietnam timezone at UTC day boundaries', () => { assert.equal(businessDay('2026-11-11T18:30:00Z'), '2026-11-12') })
test('unauthenticated and non-manager actors cannot mutate data', () => {
  const d = seed(); assert.throws(() => execute(d, decision(), null), /không có quyền/); assert.throws(() => execute(d, decision(), MOCK_USERS[1]), /không có quyền/)
})
test('permissions are checked by the command handler', () => { const d = seed(); assert.throws(() => execute(d, decision(), { ...manager, permissions: [] }), /không có quyền/) })
test('approve once, audit the decision, and reject duplicate or stale decisions', () => {
  const d = seed(); const next = execute(d, decision())
  assert.equal(next.approvals[0].status, 'APPROVED'); assert.equal(next.history[0].entityId, 'PD-021'); assert.equal(d.approvals[0].status, 'PENDING')
  assert.throws(() => execute(next, decision()), /đã được xử lý/)
  assert.throws(() => execute(next, decision('PD-022'), manager, d.revision), /vừa thay đổi/)
})
test('reject a request with a recorded reason', () => { const d = seed(); const next = execute(d, { ...decision(), approve: false }); assert.equal(next.approvals[0].status, 'REJECTED'); assert.equal(next.approvals[0].decidedBy, manager.id) })
test('refuse self-approval and over-limit approval', () => {
  const d = seed(); d.approvals[0].senderId = manager.id; assert.throws(() => execute(d, decision()), /chính mình/)
  assert.throws(() => execute(seed(), decision('PD-024')), /vượt hạn mức/)
})
test('decision and incident resolution never alter order or bill statuses', () => {
  const d = seed(); const next = execute(execute(d, decision()), { type: 'incident.update', id: 'SC-008', assigneeId: 'NV010', status: 'RESOLVED', note: 'Đã xử lý xong nguyên liệu' })
  assert.deepEqual(next.orders, d.orders); assert.deepEqual(next.bills, d.bills); assert.deepEqual(next.payments, d.payments)
})
test('reservation move checks capacity and leaves input unchanged after failure', () => {
  const d = seed(); const copy = structuredClone(d)
  assert.throws(() => execute(d, { type: 'reservation.move', id: 'DB-042', tableId: 'A11', reason: 'Điều chỉnh theo yêu cầu' }), /không đủ/)
  assert.deepEqual(d, copy)
})
test('reservation move refuses occupied tables and time conflicts', () => {
  const d = seed()
  assert.throws(() => execute(d, { type: 'reservation.move', id: 'DB-041', tableId: 'A01', reason: 'Khách cần đổi khu vực' }), /sẵn sàng/)
  assert.throws(() => execute(d, { type: 'reservation.move', id: 'DB-041', tableId: 'A11', reason: 'Khách cần đổi khu vực' }), /lịch giữ/)
})
test('valid reservation move records the old and new table', () => { const d = seed(); const next = execute(d, { type: 'reservation.move', id: 'DB-041', tableId: 'B10', reason: 'Khách muốn khu vực yên tĩnh' }); assert.equal(next.reservations[0].tableId, 'B10'); assert.match(next.history[0].text, /A10 → B10/) })
test('table layout cannot modify active sessions or held reservations', () => {
  const d = seed(); const command = { type: 'table.update', id: 'A01', seats: 8, areaId: 'A', inactive: false }
  assert.throws(() => execute(d, command), /phiên phục vụ/); assert.throws(() => execute(d, { ...command, id: 'A10' }), /lịch giữ/)
})
test('employee area assignment only accepts active employees and existing areas', () => {
  const d = seed(); assert.throws(() => execute(d, { type: 'employee.assign', id: 'NV021', areaId: 'A' }), /đang làm việc/)
  assert.throws(() => execute(d, { type: 'employee.assign', id: 'NV002', areaId: 'Z' }), /khu vực/)
  assert.equal(execute(d, { type: 'employee.assign', id: 'NV002', areaId: 'B' }).employees.find(e => e.id === 'NV002').areaId, 'B')
})
test('shift validation rejects overlapping hours, leave, and daily limits', () => {
  const d = seed(); const shift = { id: 'NEW', date: d.seedDay, name: 'Ca bổ sung', start: '10:00', end: '14:00', employeeIds: ['NV002'], minimum: 1 }
  assert.throws(() => execute(d, { type: 'shift.save', shift }), /trùng giờ/)
  assert.throws(() => execute(d, { type: 'shift.save', shift: { ...shift, employeeIds: ['NV005'] } }), /nghỉ phép/)
  assert.throws(() => execute(d, { type: 'shift.save', shift: { ...shift, start: '15:00', end: '16:00' } }), /12 giờ/)
})
test('valid shift can be created, edited, and warn via minimum without rejecting understaffing', () => {
  const d = seed(); const shift = { id: 'NEW', date: '2026-11-20', name: 'Ca mới', start: '09:00', end: '15:00', employeeIds: ['NV002'], minimum: 2 }
  const next = execute(d, { type: 'shift.save', shift }); assert.equal(next.shifts.at(-1).employeeIds.length, 1)
  const edited = execute(next, { type: 'shift.save', shift: { ...shift, end: '14:00' } }); assert.equal(edited.shifts.at(-1).end, '14:00')
})
test('menu rejects negative prices, duplicate codes, blank names and invalid categories', () => {
  const d = seed(); const item = d.menu[0]
  assert.throws(() => execute(d, { type: 'menu.save', item: { ...item, price: -1 }, creating: false }), /không âm/)
  assert.throws(() => execute(d, { type: 'menu.save', item, creating: true }), /đã tồn tại/)
  assert.throws(() => execute(d, { type: 'menu.save', item: { ...item, name: ' ' }, creating: false }), /Tên món/)
  assert.throws(() => execute(d, { type: 'menu.save', item: { ...item, categoryId: 'MISSING' }, creating: false }), /danh mục/)
})
test('menu changes preserve historic order prices and bill totals', () => {
  const d = seed(); const next = execute(d, { type: 'menu.save', item: { ...d.menu[0], price: 999000 }, creating: false })
  assert.equal(next.menu[0].price, 999000); assert.deepEqual(next.orders, d.orders); assert.deepEqual(next.bills, d.bills)
})
test('menu deletion protects order references and allows unused dishes', () => {
  let d = seed(); assert.throws(() => execute(d, { type: 'menu.delete', id: 'M001' }), /tham chiếu/)
  d = execute(d, { type: 'menu.save', item: { ...d.menu[0], id: 'UNUSED', name: 'Món chưa bán' }, creating: true })
  d = execute(d, { type: 'menu.delete', id: 'UNUSED' }); assert.equal(d.menu.some(m => m.id === 'UNUSED'), false)
})
test('shift date validation rejects a normalized but nonexistent calendar date', () => {
  const d = seed(); const shift = { ...d.shifts[0], id: 'NEW', date: '2026-02-31' }
  assert.throws(() => execute(d, { type: 'shift.save', shift }), /không tồn tại/)
})
test('category CRUD protects references and preserves visibility/order', () => {
  let d = seed(); assert.throws(() => execute(d, { type: 'category.delete', id: 'HAI_SAN' }), /còn món/)
  d = execute(d, { type: 'category.save', creating: true, category: { id: 'NEW', name: 'Món mới', visible: true, sort: 5 } })
  d = execute(d, { type: 'category.save', creating: false, category: { id: 'NEW', name: 'Món theo mùa', visible: false, sort: 2 } })
  assert.equal(d.categories.at(-1).visible, false); assert.equal(d.categories.at(-1).sort, 2)
  d = execute(d, { type: 'category.delete', id: 'NEW' }); assert.equal(d.categories.some(c => c.id === 'NEW'), false)
})
test('notifications track read status per user without duplicating it', () => { let d = seed(); d = execute(d, { type: 'notification.read', id: 'TB-01' }); d = execute(d, { type: 'notification.read', id: 'TB-01' }); assert.deepEqual(d.notifications[0].readBy, ['NV001']); d = execute(d, { type: 'notification.read' }); assert.ok(d.notifications.every(n => n.readBy.includes('NV001'))) })
test('incident resolution requires a note and an active assignee', () => { const d = seed(); const c = { type: 'incident.update', id: 'SC-008', assigneeId: 'NV021', status: 'RESOLVED', note: 'Đã xử lý hoàn tất' }; assert.throws(() => execute(d, c), /đang làm việc/); assert.throws(() => execute(d, { ...c, assigneeId: 'NV010', note: '' }), /ghi chú/) })
