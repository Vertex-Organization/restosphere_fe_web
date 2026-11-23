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
    .outputText.replace(
      /from ['"](.+?)['"]/g,
      (_, spec) => `from '${moduleUrl(path.resolve(path.dirname(file), `${spec}.ts`))}'`,
    )
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  urls.set(file, url)
  return url
}
const { createSeedData } = await import(moduleUrl('scripts/fixtures/billing.ts'))
const { isBillable, subtotalOf } = await import(moduleUrl('src/api/billing/money.ts'))
const { applyCashierCommand } = await import(moduleUrl('src/api/billing/rules.ts'))
const { applyDevEvent } = await import(moduleUrl('scripts/fixtures/billingEvents.ts'))

const now = new Date('2026-11-12T12:00:00+07:00')
const seed = () => createSeedData(now)
const cashier = 'NV020'
const run = (d, c, actor = cashier) => applyCashierCommand(d, actor, c, now).data

test('rejected, cancelled and voided items never contribute to the bill', () => {
  for (const status of ['REJECTED', 'CANCELLED', 'VOIDED'])
    assert.equal(isBillable({ status }), false)
  const items = ['SERVED', 'REJECTED', 'CANCELLED', 'VOIDED'].map((status) => ({
    status,
    unitPrice: 100000,
    quantity: 2,
  }))
  assert.equal(subtotalOf(items), 200000)
})

test('seeded requests carry targetType, targetId and amount', () => {
  const d = seed()
  assert.ok(d.requests.length > 0)
  for (const r of d.requests) {
    assert.ok(r.targetType)
    assert.ok(r.targetId)
    assert.equal(typeof r.amount, 'number')
  }
  assert.ok(
    d.requests.some((r) => r.type === 'PAYMENT_VOID' && r.targetType === 'PAYMENT' && r.amount > 0),
  )
})

test('a pending request can be withdrawn only by its sender and becomes WITHDRAWN', () => {
  const d = seed()
  const pending = d.requests.find((r) => r.status === 'PENDING')
  assert.throws(() => run(d, { type: 'withdraw-request', requestId: pending.id }, 'NV021'), /./)
  const next = run(d, { type: 'withdraw-request', requestId: pending.id })
  assert.equal(next.requests.find((r) => r.id === pending.id).status, 'WITHDRAWN')
  assert.ok(next.outbox.length > 0)
  assert.throws(
    () => run(next, { type: 'withdraw-request', requestId: pending.id }),
    /đã được xử lý/,
  )
})

test('requesting a discount creates a BILL request with the discount amount', () => {
  const d = seed()
  const bill = d.bills.find(
    (b) =>
      b.status === 'PAYMENT_REQUESTED' &&
      !b.discount &&
      !d.requests.some((r) => r.billId === b.id && r.status === 'PENDING'),
  )
  const next = run(d, {
    type: 'request-discount',
    billId: bill.id,
    billVersion: bill.version,
    discount: { mode: 'PERCENT', value: 5, reason: 'Khách thân thiết' },
  })
  const r = next.requests[0]
  assert.equal(r.type, 'DISCOUNT')
  assert.equal(r.targetType, 'BILL')
  assert.equal(r.targetId, bill.id)
  assert.equal(r.amount, r.discount.amount)
  assert.equal(r.status, 'PENDING')
})

test('approved item adjustment voids the line and refuses duplicate removal', () => {
  const d = seed()
  const bill = d.bills.find(
    (b) =>
      b.status === 'PAYMENT_REQUESTED' &&
      !d.payments.some((p) => p.billId === b.id && ['PENDING', 'SUCCEEDED'].includes(p.status)),
  )
  const orders = d.orders.filter((o) => o.sessionId === bill.sessionId)
  const item = d.items.find((i) => orders.some((o) => o.id === i.orderId) && i.status === 'SERVED')
  d.requests = []
  const requested = run(d, {
    type: 'request-adjustment',
    billId: bill.id,
    billVersion: bill.version,
    itemId: item.id,
    reason: 'Khách trả lại món',
  })
  const next = applyDevEvent(
    requested,
    { type: 'manager-decide', requestId: requested.requests[0].id, approve: true, note: 'Đồng ý' },
    now,
  ).data
  assert.equal(next.items.find((i) => i.id === item.id).status, 'VOIDED')
  assert.ok(next.bills.find((b) => b.id === bill.id).totals.total < bill.totals.total)
  assert.throws(() =>
    run(next, {
      type: 'request-adjustment',
      billId: bill.id,
      billVersion: next.bills.find((b) => b.id === bill.id).version,
      itemId: item.id,
      reason: 'Khách trả lại món',
    }),
  )
})

test('cashier can return payment request with reason and emit PAYMENT_RETURNED outbox', () => {
  const d = seed()
  const bill = d.bills.find((b) => b.status === 'PAYMENT_REQUESTED')
  assert.throws(
    () =>
      run(d, {
        type: 'return-payment-request',
        billId: bill.id,
        billVersion: bill.version,
        reason: 'ít',
      }),
    /5 ký tự/,
  )
  const next = run(d, {
    type: 'return-payment-request',
    billId: bill.id,
    billVersion: bill.version,
    reason: 'Khách yêu cầu gọi thêm món',
  })
  const updatedBill = next.bills.find((b) => b.id === bill.id)
  assert.equal(updatedBill.status, 'UNPAID')
  assert.ok(next.outbox.some((m) => m.kind === 'PAYMENT_RETURNED' && m.audience === 'WAITER'))
})

test('manager decision applies the request and keeps the vocabulary', () => {
  const d = seed()
  const pending = d.requests.find((r) => r.status === 'PENDING' && r.type === 'DISCOUNT')
  const next = applyDevEvent(
    d,
    { type: 'manager-decide', requestId: pending.id, approve: true, note: 'Đồng ý' },
    now,
  ).data
  assert.equal(next.requests.find((r) => r.id === pending.id).status, 'APPROVED')
  assert.ok(
    next.notifications.some((n) => n.kind === 'REQUEST_DECIDED' && n.requestId === pending.id),
  )
  assert.throws(
    () =>
      applyDevEvent(
        next,
        { type: 'manager-decide', requestId: pending.id, approve: false, note: '' },
        now,
      ),
    /đã được xử lý/,
  )
})

test('waiter withdrawal reopens the bill and notifies cashiers; manager outbox kinds are explicit', () => {
  const d = seed()
  const bill = d.bills.find(
    (b) =>
      b.status === 'PAYMENT_REQUESTED' &&
      !d.payments.some((p) => p.billId === b.id && ['PENDING', 'SUCCEEDED'].includes(p.status)),
  )
  const next = applyDevEvent(
    d,
    { type: 'waiter-withdraw-payment', sessionId: bill.sessionId },
    now,
  ).data
  assert.equal(next.bills.find((b) => b.id === bill.id).status, 'UNPAID')
  assert.ok(
    next.notifications.some((n) => n.kind === 'PAYMENT_REQUEST_WITHDRAWN' && n.billId === bill.id),
  )
  assert.throws(() =>
    applyDevEvent(next, { type: 'waiter-withdraw-payment', sessionId: bill.sessionId }, now),
  )
  const shiftClosed = run(d, {
    type: 'withdraw-request',
    requestId: d.requests.find((r) => r.status === 'PENDING').id,
  })
  assert.ok(shiftClosed.outbox.every((m) => m.kind))
})
test('cashier opens a shift picked from the manager schedule and cannot use another cashier shift', () => {
  const d = seed()
  d.shifts = d.shifts.filter((s) => s.status === 'CLOSED')
  const mine = d.scheduledShifts.find((s) => s.cashierId === cashier)
  const next = run(d, { type: 'open-shift', openingFloat: 1000000, scheduledShiftId: mine.id })
  assert.equal(next.shifts[0].scheduledShiftId, mine.id)
  d.scheduledShifts.push({
    id: 'SH-X',
    name: 'Ca khác',
    start: '00:00',
    end: '06:00',
    cashierId: 'NV021',
  })
  assert.throws(
    () => run(d, { type: 'open-shift', openingFloat: 0, scheduledShiftId: 'SH-X' }),
    /không thuộc lịch/,
  )
  assert.throws(
    () => run(d, { type: 'open-shift', openingFloat: 0, scheduledShiftId: 'missing' }),
    /không thuộc lịch/,
  )
})

test('openable scheduled shifts follow the [start - 30 min, end] window', async () => {
  const { openableScheduledShifts, scheduledShiftWindow } = await import(
    moduleUrl('src/api/billing/selectors.ts')
  )
  const at = new Date('2026-11-21T10:28:00+07:00')
  const mk = (id, start, end, cashierId = cashier) => ({ id, name: id, start, end, cashierId })
  const data = {
    scheduledShifts: [
      mk('in', '2026-11-21T10:00:00+07:00', '2026-11-21T21:28:00+07:00'),
      mk('early', '2026-11-21T10:50:00+07:00', '2026-11-21T22:00:00+07:00'),
      mk('too-early', '2026-11-21T11:00:00+07:00', '2026-11-21T22:00:00+07:00'),
      mk('ended', '2026-11-21T06:00:00+07:00', '2026-11-21T10:27:00+07:00'),
      mk('other', '2026-11-21T10:00:00+07:00', '2026-11-21T21:00:00+07:00', 'NV021'),
      mk('bad', 'oops', 'oops'),
    ],
  }
  const ids = openableScheduledShifts(data, cashier, at).map((o) => o.shift.id)
  assert.deepEqual(ids, ['in', 'early'])
  const overnight = scheduledShiftWindow(mk('n', '22:00', '06:00'), at)
  assert.ok(overnight.end > overnight.start)
})

test('open shift is overdue after its scheduled end or after 12 hours', async () => {
  const { isShiftOverdue } = await import(moduleUrl('src/api/billing/selectors.ts'))
  const data = {
    scheduledShifts: [
      { id: 's1', name: 'Ca sáng', start: '06:00', end: '14:00', cashierId: cashier },
      {
        id: 's2',
        name: 'Ca tối',
        start: '2026-11-21T18:00:00+07:00',
        end: '2026-11-22T02:00:00+07:00',
        cashierId: cashier,
      },
    ],
  }
  const mk = (openedAt, scheduledShiftId, status = 'OPEN') => ({
    id: 'x',
    openedAt,
    scheduledShiftId,
    status,
  })
  const at = (iso) => new Date(iso)
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T06:05:00+07:00', 's1'), at('2026-11-21T13:59:00+07:00')),
    false,
  )
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T06:05:00+07:00', 's1'), at('2026-11-21T14:01:00+07:00')),
    true,
  )
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T06:05:00+07:00', 's1'), at('2026-11-22T07:00:00+07:00')),
    true,
  )
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T18:05:00+07:00', 's2'), at('2026-11-22T01:00:00+07:00')),
    false,
  )
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T08:00:00+07:00'), at('2026-11-21T19:59:00+07:00')),
    false,
  )
  assert.equal(
    isShiftOverdue(data, mk('2026-11-21T08:00:00+07:00'), at('2026-11-21T20:01:00+07:00')),
    true,
  )
  assert.equal(
    isShiftOverdue(
      data,
      mk('2026-11-21T06:05:00+07:00', 's1', 'CLOSED'),
      at('2026-11-22T07:00:00+07:00'),
    ),
    false,
  )
})

test('shortDuration matches the kitchen wait label', async () => {
  const { shortDuration } = await import(moduleUrl('src/components/billing/format.ts'))
  assert.equal(shortDuration(8), '8 phút')
  assert.equal(shortDuration(75), '1 giờ 15 phút')
  assert.equal(shortDuration(120), '2 giờ')
  assert.equal(shortDuration(24 * 60 * 2 + 5), '2 ngày')
})

test('cashier notification rows show table, amount and a short kind label', async () => {
  const { cashierKindShort, cashierNotificationParts } = await import(
    moduleUrl('src/api/billing/notifications.ts')
  )
  const d = seed()
  assert.equal(cashierKindShort('TRANSFER_FAILED'), 'CK lỗi')
  assert.equal(cashierKindShort('SOMETHING_NEW'), 'Thông báo')
  const withBill = cashierNotificationParts(
    { kind: 'PAYMENT_REQUEST', title: 't', body: 'b', billId: d.bills[0].id },
    d,
  )
  assert.match(withBill.table, /^Bàn /)
  assert.ok(withBill.detail.length > 0 && withBill.detail !== 'b')
  const orphan = cashierNotificationParts({ kind: 'REQUEST_DECIDED', title: 't', body: 'b' }, d)
  assert.equal(orphan.table, '')
  assert.match(orphan.detail, /b$/)
})

test('shortCode keeps the prefix and shows the last 8 characters without dashes', async () => {
  const { shortCode } = await import(moduleUrl('src/components/kitchen/format.ts'))
  const uuid = '3f2a9c1e-7b4d-4e8a-9d11-0a1b2c3d4e5f'
  assert.equal(shortCode(uuid), '2C3D4E5F')
  assert.equal(shortCode(`O-${uuid}`), 'O-2C3D4E5F')
  assert.equal(shortCode('#O-3f2a9c1e-7b4d'), '#O-9C1E7B4D')
  assert.equal(shortCode('PAY-001'), 'PAY-001')
})

test('rejection details and notification titles are shown in Vietnamese', async () => {
  const { describeRejection, notificationTitle } = await import(
    moduleUrl('src/api/kitchen/labels.ts')
  )
  assert.equal(
    describeRejection('Outside scheduled shift window', 'x'),
    'Ca đã chọn chưa tới giờ hoặc đã hết giờ',
  )
  assert.equal(describeRejection('A shift is already open', 'x'), 'Bạn đang có ca mở')
  assert.equal(
    describeRejection('Resolve pending transfers first', 'x'),
    'Còn chuyển khoản chờ xác nhận, xử lý trước khi đóng ca',
  )
  assert.equal(describeRejection('Item changed; refresh', 'x'), 'Món vừa thay đổi, tải lại trang')
  assert.equal(describeRejection('Something else', 'x'), 'Something else')
  assert.equal(describeRejection(undefined, 'fallback'), 'fallback')
  assert.equal(notificationTitle('PAYMENT_REQUEST', 'Payment requested'), 'Yêu cầu thanh toán')
  assert.equal(notificationTitle('READY', 'Dish ready'), 'Món đã xong')
  assert.equal(notificationTitle('NEW_ORDER', 'New order'), 'Đơn mới')
  assert.equal(notificationTitle('UNKNOWN_KIND', 'Original'), 'Original')
})

test('weighed dishes count as one line and show their quantity with a unit', async () => {
  const { quantityLabel } = await import(moduleUrl('src/components/kitchen/format.ts'))
  const { billView } = await import(moduleUrl('src/api/billing/selectors.ts'))
  assert.equal(quantityLabel(3), '3')
  assert.equal(quantityLabel(0.375), '0,375 kg')
  assert.equal(quantityLabel(1.5, 'kg'), '1,5 kg')
  const d = seed()
  const bill = d.bills.find((b) => billView(d, b.id).items.some((i) => isBillable(i)))
  const view = billView(d, bill.id)
  const target = view.items.find((i) => isBillable(i))
  target.quantity = 0.375
  assert.equal(billView(d, bill.id).dishCount, view.items.filter((i) => isBillable(i)).length)
})

test('paid tab only lists bills paid since the open shift, or since midnight without a shift', async () => {
  const { matchesFilter, paidSinceOf } = await import(moduleUrl('src/api/billing/selectors.ts'))
  const at = new Date('2026-11-21T10:28:00+07:00').getTime()
  const open = {
    shifts: [{ cashierId: cashier, status: 'OPEN', openedAt: '2026-11-21T08:00:00+07:00' }],
  }
  const since = paidSinceOf(open, cashier, at)
  assert.equal(since, Date.parse('2026-11-21T08:00:00+07:00'))
  const row = (paidAt) => ({ status: 'PAID', paidAt })
  assert.equal(matchesFilter(row('2026-11-21T09:00:00+07:00'), 'paid', since), true)
  assert.equal(matchesFilter(row('2026-11-21T07:59:00+07:00'), 'paid', since), false)
  const none = paidSinceOf({ shifts: [] }, cashier, at)
  const midnight = new Date(at)
  midnight.setHours(0, 0, 0, 0)
  assert.equal(none, midnight.getTime())
})
