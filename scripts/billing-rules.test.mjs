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
const { createSeedData } = await import(moduleUrl('src/api/billing/mockData.ts'))
const { isBillable, subtotalOf } = await import(moduleUrl('src/api/billing/money.ts'))
const { applyCashierCommand } = await import(moduleUrl('src/api/billing/rules.ts'))
const { applyDevEvent } = await import(moduleUrl('src/api/billing/devEvents.ts'))

const now = new Date('2026-11-12T12:00:00+07:00')
const seed = () => createSeedData(now)
const cashier = 'NV020'
const run = (d, c, actor = cashier) => applyCashierCommand(d, actor, c, now).data

test('rejected, cancelled and voided items never contribute to the bill', () => {
  for (const status of ['REJECTED', 'CANCELLED', 'VOIDED']) assert.equal(isBillable({ status }), false)
  const items = ['SERVED', 'REJECTED', 'CANCELLED', 'VOIDED'].map(status => ({ status, unitPrice: 100000, quantity: 2 }))
  assert.equal(subtotalOf(items), 200000)
})

test('seeded requests carry targetType, targetId and amount', () => {
  const d = seed()
  assert.ok(d.requests.length > 0)
  for (const r of d.requests) { assert.ok(r.targetType); assert.ok(r.targetId); assert.equal(typeof r.amount, 'number') }
  assert.ok(d.requests.some(r => r.type === 'PAYMENT_VOID' && r.targetType === 'PAYMENT' && r.amount > 0))
})

test('a pending request can be withdrawn only by its sender and becomes WITHDRAWN', () => {
  const d = seed(); const pending = d.requests.find(r => r.status === 'PENDING')
  assert.throws(() => run(d, { type: 'withdraw-request', requestId: pending.id }, 'NV021'), /./)
  const next = run(d, { type: 'withdraw-request', requestId: pending.id })
  assert.equal(next.requests.find(r => r.id === pending.id).status, 'WITHDRAWN')
  assert.ok(next.outbox.length > 0)
  assert.throws(() => run(next, { type: 'withdraw-request', requestId: pending.id }), /đã được xử lý/)
})

test('requesting a discount creates a BILL request with the discount amount', () => {
  const d = seed()
  const bill = d.bills.find(b => b.status === 'PAYMENT_REQUESTED' && !b.discount && !d.requests.some(r => r.billId === b.id && r.status === 'PENDING'))
  const next = run(d, { type: 'request-discount', billId: bill.id, billVersion: bill.version, discount: { mode: 'PERCENT', value: 5, reason: 'Khách thân thiết' } })
  const r = next.requests[0]
  assert.equal(r.type, 'DISCOUNT'); assert.equal(r.targetType, 'BILL'); assert.equal(r.targetId, bill.id); assert.equal(r.amount, r.discount.amount); assert.equal(r.status, 'PENDING')
})

test('approved item adjustment voids the line and refuses duplicate removal', () => {
  const d = seed()
  const bill = d.bills.find(b => b.status === 'PAYMENT_REQUESTED' && !d.payments.some(p => p.billId === b.id && ['PENDING', 'SUCCEEDED'].includes(p.status)))
  const orders = d.orders.filter(o => o.sessionId === bill.sessionId)
  const item = d.items.find(i => orders.some(o => o.id === i.orderId) && i.status === 'SERVED')
  d.requests = []
  const requested = run(d, { type: 'request-adjustment', billId: bill.id, billVersion: bill.version, itemId: item.id, reason: 'Khách trả lại món' })
  const next = applyDevEvent(requested, { type: 'manager-decide', requestId: requested.requests[0].id, approve: true, note: 'Đồng ý' }, now).data
  assert.equal(next.items.find(i => i.id === item.id).status, 'VOIDED')
  assert.ok(next.bills.find(b => b.id === bill.id).totals.total < bill.totals.total)
  assert.throws(() => run(next, { type: 'request-adjustment', billId: bill.id, billVersion: next.bills.find(b => b.id === bill.id).version, itemId: item.id, reason: 'Khách trả lại món' }))
})

test('cashier can return payment request with reason and emit PAYMENT_RETURNED outbox', () => {
  const d = seed()
  const bill = d.bills.find(b => b.status === 'PAYMENT_REQUESTED')
  assert.throws(() => run(d, { type: 'return-payment-request', billId: bill.id, billVersion: bill.version, reason: 'ít' }), /5 ký tự/)
  const next = run(d, { type: 'return-payment-request', billId: bill.id, billVersion: bill.version, reason: 'Khách yêu cầu gọi thêm món' })
  const updatedBill = next.bills.find(b => b.id === bill.id)
  assert.equal(updatedBill.status, 'UNPAID')
  assert.ok(next.outbox.some(m => m.kind === 'PAYMENT_RETURNED' && m.audience === 'WAITER'))
})

test('manager decision applies the request and keeps the vocabulary', () => {
  const d = seed(); const pending = d.requests.find(r => r.status === 'PENDING' && r.type === 'DISCOUNT')
  const next = applyDevEvent(d, { type: 'manager-decide', requestId: pending.id, approve: true, note: 'Đồng ý' }, now).data
  assert.equal(next.requests.find(r => r.id === pending.id).status, 'APPROVED')
  assert.ok(next.notifications.some(n => n.kind === 'REQUEST_DECIDED' && n.requestId === pending.id))
  assert.throws(() => applyDevEvent(next, { type: 'manager-decide', requestId: pending.id, approve: false, note: '' }, now), /đã được xử lý/)
})

test('waiter withdrawal reopens the bill and notifies cashiers; manager outbox kinds are explicit', () => {
  const d = seed()
  const bill = d.bills.find(b => b.status === 'PAYMENT_REQUESTED' && !d.payments.some(p => p.billId === b.id && ['PENDING', 'SUCCEEDED'].includes(p.status)))
  const next = applyDevEvent(d, { type: 'waiter-withdraw-payment', sessionId: bill.sessionId }, now).data
  assert.equal(next.bills.find(b => b.id === bill.id).status, 'UNPAID')
  assert.ok(next.notifications.some(n => n.kind === 'PAYMENT_REQUEST_WITHDRAWN' && n.billId === bill.id))
  assert.throws(() => applyDevEvent(next, { type: 'waiter-withdraw-payment', sessionId: bill.sessionId }, now))
  const shiftClosed = run(d, { type: 'withdraw-request', requestId: d.requests.find(r => r.status === 'PENDING').id })
  assert.ok(shiftClosed.outbox.every(m => m.kind))
})
test('cashier opens a shift picked from the manager schedule and cannot use another cashier shift', () => {
  const d = seed()
  d.shifts = d.shifts.filter((s) => s.status === 'CLOSED')
  const mine = d.scheduledShifts.find((s) => s.cashierId === cashier)
  const next = run(d, { type: 'open-shift', openingFloat: 1000000, scheduledShiftId: mine.id })
  assert.equal(next.shifts[0].scheduledShiftId, mine.id)
  d.scheduledShifts.push({ id: 'SH-X', name: 'Ca khác', start: '00:00', end: '06:00', cashierId: 'NV021' })
  assert.throws(() => run(d, { type: 'open-shift', openingFloat: 0, scheduledShiftId: 'SH-X' }), /không thuộc lịch/)
  assert.throws(() => run(d, { type: 'open-shift', openingFloat: 0, scheduledShiftId: 'missing' }), /không thuộc lịch/)
})