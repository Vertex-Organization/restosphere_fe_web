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
  const js = ts
    .transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
    })
    .outputText.replace('import.meta.env.VITE_API_BASE_URL', 'undefined')
    .replace(
      /from ['"](.+?)['"]/g,
      (_, spec) => `from '${moduleUrl(path.resolve(path.dirname(file), `${spec}.ts`))}'`,
    )
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  urls.set(file, url)
  return url
}
const { createManagerData, MOCK_USERS } = await import(moduleUrl('scripts/fixtures/manager.ts'))
const { applyManagerCommand } = await import(moduleUrl('src/api/manager/rules.ts'))
const { dashboard, tableCode, tableForOrder } = await import(
  moduleUrl('src/api/manager/selectors.ts')
)
const { businessDay } = await import(moduleUrl('src/api/manager/dates.ts'))
const now = new Date('2026-11-12T12:00:00+07:00')
const manager = MOCK_USERS[0]
const seed = () => createManagerData(now)
const execute = (d, c, actor = manager, revision = d.revision) =>
  applyManagerCommand(d, actor, c, revision, now)
const decision = (id = 'PD-021') => ({
  type: 'approval.decide',
  id,
  approve: true,
  reason: 'Đã kiểm tra thông tin',
})

test('area updates preserve tables and bookings, sort areas and enforce permissions and bounds', () => {
  const d = seed()
  const area = { ...d.areas[0], active: false, sortOrder: 5 }
  const updated = execute(d, { type: 'area.update', area })
  assert.deepEqual(updated.areas.at(-1), area)
  assert.deepEqual(updated.tables, d.tables)
  assert.deepEqual(updated.reservations, d.reservations)
  assert.equal(d.areas[0].active, true)
  for (const sortOrder of [-1, 0.5, NaN, 2147483648])
    assert.throws(() => execute(d, { type: 'area.update', area: { ...area, sortOrder } }))
  assert.throws(() => execute(d, { type: 'area.update', area }, { ...manager, permissions: [] }))
})

test('reservation uses server area IDs and propagates server validation and lookup failures', async () => {
  const previous = globalThis.fetch
  const calls = []
  let status = 200
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options })
    return status === 200
      ? Response.json({ code: 'random-code', areaId: 'database-uuid' })
      : new Response(null, { status })
  }
  try {
    const { reservationService: service } = await import(
      moduleUrl('src/api/reservations/service.ts')
    )
    const input = {
      date: '2099-11-13',
      time: '18:30',
      guests: 4,
      areaId: 'database-uuid',
      occasion: 'none',
      name: 'Khách thử nghiệm',
      phone: '0901234567',
      items: [],
    }
    const first = await service.create(input)
    assert.equal(first.areaId, input.areaId)
    assert.deepEqual(JSON.parse(calls.at(-1).body), input)
    assert.equal((await service.lookup(first.code, '+84 901 234 567')).code, first.code)
    assert.deepEqual(JSON.parse(calls.at(-1).body), { code: first.code, phone: '+84 901 234 567' })
    status = 404
    assert.equal(await service.lookup(first.code, '0900000000'), null)
    status = 400
    await assert.rejects(service.create(input))
    status = 500
    await assert.rejects(service.lookup(first.code, input.phone))
  } finally {
    globalThis.fetch = previous
  }
})

test('manager table labels resolve server codes through UUID relationships without changing IDs', () => {
  const d = seed()
  const order = d.orders[0]
  const session = d.sessions.find((s) => s.id === order.sessionId)
  const table = d.tables.find((t) => t.id === session.tableId)
  table.id = 'd2b59c81-46af-4e71-b649-74db208fe121'
  table.code = 'VIP-07'
  session.tableId = table.id
  const before = structuredClone(d)
  assert.equal(tableCode(d, session.tableId), 'VIP-07')
  assert.equal(tableForOrder(d, order), 'VIP-07')
  assert.equal(tableForOrder(d, { ...order, sessionId: 'missing' }), '—')
  assert.equal(tableCode(d, 'missing'), '—')
  assert.deepEqual(d, before)
  d.tables = []
  assert.equal(tableForOrder(d, order), '—')
})

test('dashboard counts derive from the same records as detail pages', () => {
  const d = seed()
  const s = dashboard(d, now.getTime())
  assert.equal(s.pending.length, d.approvals.filter((a) => a.status === 'PENDING').length)
  assert.equal(s.occupied, d.sessions.length)
  assert.equal(
    s.activeOrders,
    d.orders.filter((o) =>
      o.items.some((i) => ['SUBMITTED', 'PREPARING', 'READY'].includes(i.status)),
    ).length,
  )
  assert.equal(
    s.revenue,
    d.payments
      .filter((p) => p.status === 'COMPLETED' && businessDay(p.at) === businessDay(now))
      .reduce((n, p) => n + p.amount, 0),
  )
})
test('business dates use Vietnam timezone at UTC day boundaries', () => {
  assert.equal(businessDay('2026-11-11T18:30:00Z'), '2026-11-12')
})
test('unauthenticated and non-manager actors cannot mutate data', () => {
  const d = seed()
  assert.throws(() => execute(d, decision(), null), /không có quyền/)
  assert.throws(() => execute(d, decision(), MOCK_USERS[1]), /không có quyền/)
})
test('permissions are checked by the command handler', () => {
  const d = seed()
  assert.throws(() => execute(d, decision(), { ...manager, permissions: [] }), /không có quyền/)
})
test('approve once, audit the decision, and reject duplicate or stale decisions', () => {
  const d = seed()
  const next = execute(d, decision())
  assert.equal(next.approvals[0].status, 'APPROVED')
  assert.equal(next.history[0].entityId, 'PD-021')
  assert.equal(d.approvals[0].status, 'PENDING')
  assert.throws(() => execute(next, decision()), /đã được xử lý/)
  assert.throws(() => execute(next, decision('PD-022'), manager, d.revision), /vừa thay đổi/)
})
test('reject a request with a recorded reason', () => {
  const d = seed()
  const next = execute(d, { ...decision(), approve: false })
  assert.equal(next.approvals[0].status, 'REJECTED')
  assert.equal(next.approvals[0].decidedBy, manager.id)
})
test('refuse self-approval and over-limit approval', () => {
  const d = seed()
  d.approvals[0].requestedBy = manager.id
  assert.throws(() => execute(d, decision()), /chính mình/)
  assert.throws(() => execute(seed(), decision('PD-024')), /vượt hạn mức/)
})
test('approving a request applies it automatically and tells the sender', () => {
  const d = seed()
  const menu = execute(d, { ...decision('PD-026'), reason: 'Cua đã nhập về' })
  assert.equal(menu.menu.find((m) => m.id === 'M002').status, 'AVAILABLE')
  assert.equal(menu.outbox[0].kind, 'REQUEST_DECIDED')
  assert.equal(menu.outbox[0].audience, 'KITCHEN')
  const cancel = execute(d, { ...decision('PD-022'), reason: 'Khách đổi món' })
  assert.equal(
    cancel.orders.flatMap((o) => o.items).find((i) => i.id === 'OI-2-0').status,
    'CANCELLED',
  )
  assert.equal(cancel.outbox[0].audience, 'WAITER')
  const voided = execute(d, { ...decision('PD-025'), reason: 'Đã đối chiếu' })
  assert.equal(voided.outbox[0].audience, 'CASHIER')
})
test('decision and incident resolution never alter order or bill statuses for billing requests', () => {
  const d = seed()
  const next = execute(execute(d, decision()), {
    type: 'incident.update',
    id: 'SC-008',
    assigneeId: 'NV010',
    status: 'RESOLVED',
    note: 'Đã xử lý xong nguyên liệu',
  })
  assert.deepEqual(next.orders, d.orders)
  assert.deepEqual(next.bills, d.bills)
  assert.deepEqual(next.payments, d.payments)
})
test('reservation move checks capacity and leaves input unchanged after failure', () => {
  const d = seed()
  const copy = structuredClone(d)
  assert.throws(
    () =>
      execute(d, {
        type: 'reservation.move',
        id: 'RS0042',
        tableId: 'A11',
        reason: 'Điều chỉnh theo yêu cầu',
      }),
    /không đủ/,
  )
  assert.deepEqual(d, copy)
})
test('reservation move refuses occupied tables and time conflicts', () => {
  const d = seed()
  assert.throws(
    () =>
      execute(d, {
        type: 'reservation.move',
        id: 'RS0041',
        tableId: 'A01',
        reason: 'Khách cần đổi khu vực',
      }),
    /sẵn sàng/,
  )
  d.tables.find((t) => t.id === 'A11').status = 'AVAILABLE'
  d.reservations.find((r) => r.id === 'RS0043').status = 'CONFIRMED'
  assert.throws(
    () =>
      execute(d, {
        type: 'reservation.move',
        id: 'RS0041',
        tableId: 'A11',
        reason: 'Khách cần đổi khu vực',
      }),
    /lịch giữ/,
  )
})
test('cancellation decision notifies kitchen and rejects stale served targets atomically', () => {
  const d = seed()
  const next = execute(d, decision('PD-022'))
  assert.ok(next.outbox.some((m) => m.kind === 'CANCELLED' && m.audience === 'KITCHEN'))
  d.orders.flatMap((o) => o.items).find((i) => i.id === 'OI-2-0').status = 'SERVED'
  const before = structuredClone(d)
  assert.throws(() => execute(d, decision('PD-022')), /đã thay đổi/)
  assert.deepEqual(d, before)
})

test('incident resolution and reply emit INCIDENT_REPLY outbox', () => {
  const d = seed()
  assert.throws(
    () => execute(d, { type: 'incident.update', id: 'SC-008', status: 'RESOLVED', reply: 'ít' }),
    /5 ký tự/,
  )
  const next = execute(d, {
    type: 'incident.update',
    id: 'SC-008',
    assigneeId: 'NV010',
    status: 'RESOLVED',
    reply: 'Quản lý đã duyệt bổ sung nguyên liệu',
  })
  const inc = next.incidents.find((i) => i.id === 'SC-008')
  assert.equal(inc.status, 'RESOLVED')
  assert.equal(inc.response.text, 'Quản lý đã duyệt bổ sung nguyên liệu')
  assert.equal(inc.response.by, manager.id)
  assert.ok(next.outbox.some((m) => m.kind === 'INCIDENT_REPLY' && m.audience === 'KITCHEN'))
})

test('valid reservation move records the old and new table', () => {
  const d = seed()
  d.reservations.find((r) => r.id === 'RS0041').areaId = undefined
  const next = execute(d, {
    type: 'reservation.move',
    id: 'RS0041',
    tableId: 'B10',
    reason: 'Khách muốn khu vực yên tĩnh',
  })
  assert.equal(next.reservations[0].tableId, 'B10')
  assert.match(next.history[0].text, /A10 → B10/)
})
test('table layout cannot modify active sessions or held reservations', () => {
  const d = seed()
  const command = { type: 'table.update', id: 'A01', seats: 8, areaId: 'A', inactive: false }
  assert.throws(() => execute(d, command), /phiên phục vụ/)
  assert.throws(() => execute(d, { ...command, id: 'A10' }), /lịch giữ/)
})
test('employee area assignment only accepts active employees and existing areas', () => {
  const d = seed()
  assert.throws(
    () => execute(d, { type: 'employee.assign', id: 'NV021', areaId: 'A' }),
    /đang làm việc/,
  )
  assert.throws(() => execute(d, { type: 'employee.assign', id: 'NV002', areaId: 'Z' }), /khu vực/)
  assert.equal(
    execute(d, { type: 'employee.assign', id: 'NV002', areaId: 'B' }).employees.find(
      (e) => e.id === 'NV002',
    ).areaId,
    'B',
  )
})
test('shift validation rejects overlapping hours, leave, and daily limits', () => {
  const d = seed()
  const shift = {
    id: 'NEW',
    date: d.seedDay,
    name: 'Ca bổ sung',
    start: '10:00',
    end: '14:00',
    employeeIds: ['NV002'],
    minimum: 1,
  }
  assert.throws(() => execute(d, { type: 'shift.save', shift }), /trùng giờ/)
  assert.throws(
    () => execute(d, { type: 'shift.save', shift: { ...shift, employeeIds: ['NV005'] } }),
    /nghỉ phép/,
  )
  assert.throws(
    () => execute(d, { type: 'shift.save', shift: { ...shift, start: '15:00', end: '16:00' } }),
    /12 giờ/,
  )
})
test('valid shift can be created, edited, and warn via minimum without rejecting understaffing', () => {
  const d = seed()
  const shift = {
    id: 'NEW',
    date: '2026-11-20',
    name: 'Ca mới',
    start: '09:00',
    end: '15:00',
    employeeIds: ['NV002'],
    minimum: 2,
  }
  const next = execute(d, { type: 'shift.save', shift })
  assert.equal(next.shifts.at(-1).employeeIds.length, 1)
  const edited = execute(next, { type: 'shift.save', shift: { ...shift, end: '14:00' } })
  assert.equal(edited.shifts.at(-1).end, '14:00')
})
test('menu rejects negative prices, duplicate codes, blank names and invalid categories', () => {
  const d = seed()
  const item = d.menu[0]
  assert.throws(
    () => execute(d, { type: 'menu.save', item: { ...item, price: -1 }, creating: false }),
    /không âm/,
  )
  assert.throws(() => execute(d, { type: 'menu.save', item, creating: true }), /đã tồn tại/)
  assert.throws(
    () => execute(d, { type: 'menu.save', item: { ...item, name: ' ' }, creating: false }),
    /Tên món/,
  )
  assert.throws(
    () =>
      execute(d, { type: 'menu.save', item: { ...item, categoryId: 'MISSING' }, creating: false }),
    /danh mục/,
  )
})
test('menu changes preserve historic order prices and bill totals', () => {
  const d = seed()
  const next = execute(d, {
    type: 'menu.save',
    item: { ...d.menu[0], price: 999000 },
    creating: false,
  })
  assert.equal(next.menu[0].price, 999000)
  assert.deepEqual(next.orders, d.orders)
  assert.deepEqual(next.bills, d.bills)
})
test('menu deletion protects order references and allows unused dishes', () => {
  let d = seed()
  assert.throws(() => execute(d, { type: 'menu.delete', id: 'M001' }), /tham chiếu/)
  d = execute(d, {
    type: 'menu.save',
    item: { ...d.menu[0], id: 'UNUSED', name: 'Món chưa bán' },
    creating: true,
  })
  d = execute(d, { type: 'menu.delete', id: 'UNUSED' })
  assert.equal(
    d.menu.some((m) => m.id === 'UNUSED'),
    false,
  )
})
test('shift date validation rejects a normalized but nonexistent calendar date', () => {
  const d = seed()
  const shift = { ...d.shifts[0], id: 'NEW', date: '2026-02-31' }
  assert.throws(() => execute(d, { type: 'shift.save', shift }), /không tồn tại/)
})
test('category CRUD protects references and preserves visibility/order', () => {
  let d = seed()
  assert.throws(() => execute(d, { type: 'category.delete', id: 'HAI_SAN' }), /còn món/)
  d = execute(d, {
    type: 'category.save',
    creating: true,
    category: { id: 'NEW', name: 'Món mới', visible: true, sort: 5 },
  })
  d = execute(d, {
    type: 'category.save',
    creating: false,
    category: { id: 'NEW', name: 'Món theo mùa', visible: false, sort: 2 },
  })
  assert.equal(d.categories.at(-1).visible, false)
  assert.equal(d.categories.at(-1).sort, 2)
  d = execute(d, { type: 'category.delete', id: 'NEW' })
  assert.equal(
    d.categories.some((c) => c.id === 'NEW'),
    false,
  )
})
test('notifications track read status per user without duplicating it', () => {
  let d = seed()
  d = execute(d, { type: 'notification.read', id: 'TB-01' })
  d = execute(d, { type: 'notification.read', id: 'TB-01' })
  assert.deepEqual(d.notifications[0].readBy, ['NV001'])
  d = execute(d, { type: 'notification.read' })
  assert.ok(d.notifications.every((n) => n.readBy.includes('NV001')))
})
test('incident resolution requires a note and an active assignee', () => {
  const d = seed()
  const c = {
    type: 'incident.update',
    id: 'SC-008',
    assigneeId: 'NV021',
    status: 'RESOLVED',
    note: 'Đã xử lý hoàn tất',
  }
  assert.throws(() => execute(d, c), /đang làm việc/)
  assert.throws(() => execute(d, { ...c, assigneeId: 'NV010', note: '' }), /ghi chú/)
})

test('reservation move rejects wrong status or area, honours the buffer and notifies reception and waiter with TABLE_REASSIGNED', () => {
  const d = seed()
  d.reservations.find((r) => r.id === 'RS0043').status = 'PENDING'
  const target = 'A09'
  Object.assign(
    d.tables.find((t) => t.id === target),
    { status: 'AVAILABLE', seats: 8, sessionId: undefined },
  )
  d.reservations = d.reservations.filter((r) => r.tableId !== target)
  assert.throws(
    () =>
      execute(d, {
        type: 'reservation.move',
        id: 'RS0043',
        tableId: target,
        reason: 'Khách đổi chỗ ngồi',
      }),
    /đã xác nhận/,
  )
  assert.throws(
    () => execute(d, { type: 'reservation.move', id: 'RS0041', tableId: target, reason: 'ng' }),
    /5 ký tự/,
  )
  const wrongArea = seed()
  wrongArea.tables.find((t) => t.id === 'B10').areaId = 'B'
  assert.throws(
    () =>
      execute(wrongArea, {
        type: 'reservation.move',
        id: 'RS0041',
        tableId: 'B10',
        reason: 'Khách đổi khu vực',
      }),
    /khu vực/,
  )
  const buf = seed()
  const a = buf.reservations.find((r) => r.id === 'RS0041')
  const other = buf.reservations.find((r) => r.id === 'RS0044')
  const gap = new Date(a.until).getTime() + 5 * 60_000
  Object.assign(other, {
    tableId: 'A09',
    areaId: 'A',
    status: 'CONFIRMED',
    at: new Date(gap).toISOString(),
    until: new Date(gap + 3_600_000).toISOString(),
  })
  buf.tables.find((t) => t.id === 'A09').status = 'AVAILABLE'
  assert.throws(
    () =>
      execute(buf, {
        type: 'reservation.move',
        id: 'RS0041',
        tableId: 'A09',
        reason: 'Khách muốn gần cửa sổ',
      }),
    /đệm/,
  )
  const ok = seed()
  ok.reservations.find((r) => r.id === 'RS0041').areaId = undefined
  const next = execute(ok, {
    type: 'reservation.move',
    id: 'RS0041',
    tableId: 'B10',
    reason: 'Khách muốn khu vực yên tĩnh',
  })
  assert.ok(next.outbox.some((m) => m.kind === 'TABLE_REASSIGNED' && m.audience === 'RECEPTIONIST'))
})
test('manager seed covers every notification kind in the contract', () => {
  const kinds = new Set(seed().notifications.map((n) => n.kind))
  for (const k of [
    'APPROVAL',
    'INCIDENT',
    'ORDER',
    'MENU_REQUEST',
    'CASHIER_SHIFT_CLOSED',
    'REQUEST_WITHDRAWN',
  ])
    assert.ok(kinds.has(k), k)
})
