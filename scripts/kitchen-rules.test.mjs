import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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

const { createSeedData } = await import(moduleUrl('src/api/kitchen/mockData.ts'))
const { applyKitchenCommand } = await import(moduleUrl('src/api/kitchen/rules.ts'))
const { buildActiveDishQueue } = await import(moduleUrl('src/api/kitchen/selectors.ts'))

const now = new Date('2026-11-12T12:00:00+07:00')
const seed = () => createSeedData(now)
const chef = 'NV010'
const run = (d, c, actor = chef) => applyKitchenCommand(d, actor, c, now).data

test('kitchen queue is FIFO by dish submission time, not grouped or promoted by table', () => {
  const queue = buildActiveDishQueue(seed(), now.getTime())
  assert.ok(queue.length > 1)
  assert.equal(queue[0].item.name, 'Bò lúc lắc')
  assert.equal(queue[0].order.tableCode, 'A03')
  assert.ok(queue.every((dish, index) => index === 0 || queue[index - 1].item.submittedAt <= dish.item.submittedAt))
  const priorityDish = queue.find((dish) => dish.order.priority)
  assert.ok(priorityDish)
  assert.ok(queue.indexOf(priorityDish) > 0, 'a later priority table must not jump over an earlier dish')
})

test('kitchen reject changes item status to REJECTED and emits ITEM_REJECTED outbox', () => {
  const d = seed()
  const item = d.items.find((i) => i.status === 'SUBMITTED')
  assert.throws(() => run(d, { type: 'reject', itemId: item.id, version: item.version, reason: 'ít' }), /5 ký tự/)
  const next = run(d, { type: 'reject', itemId: item.id, version: item.version, reason: 'Hết nguyên liệu món này' })
  const updated = next.items.find((i) => i.id === item.id)
  assert.equal(updated.status, 'REJECTED')
  assert.equal(updated.rejectionReason, 'Hết nguyên liệu món này')
  assert.equal(updated.rejectedBy, chef)
  assert.ok(next.outbox.some((m) => m.kind === 'ITEM_REJECTED' && m.audience === 'WAITER'))
  assert.throws(() => run(next, { type: 'reject', itemId: item.id, version: updated.version, reason: 'Từ chối lần 2' }), /đã bị hủy/)
  assert.throws(() => run(next, { type: 'start', items: [{ id: item.id, version: updated.version }] }), /đã bị hủy/)
})

test('kitchen cannot reject PREPARING items and requires kitchen.items.update permission', () => {
  const d = seed()
  const prep = d.items.find((i) => i.status === 'PREPARING')
  assert.throws(() => run(d, { type: 'reject', itemId: prep.id, version: prep.version, reason: 'Bỏ không làm nữa' }), /vừa được cập nhật/)
  const sub = d.items.find((i) => i.status === 'SUBMITTED')
  assert.throws(() => run(d, { type: 'reject', itemId: sub.id, version: sub.version, reason: 'Hết nguyên liệu món này' }, 'NV012'), /không có quyền/)
})

test('kitchen incident follows the shared schema and reaches manager and the order waiter', () => {
  const d = seed()
  const order = d.orders.find((o) => o.waiterId)
  const next = run(d, { type: 'report-incident', input: { type: 'OUT_OF_STOCK', severity: 'HIGH', description: 'Het nguyen lieu', orderId: order.id } })
  const inc = next.incidents[0]
  assert.equal(inc.reporterId, chef)
  assert.ok(inc.title && inc.at && !('reportedBy' in inc))
  assert.ok(next.outbox.some((m) => m.kind === 'INCIDENT' && m.audience === 'MANAGER'))
  assert.ok(next.outbox.some((m) => m.kind === 'INCIDENT' && m.audience === 'WAITER' && m.staffId === order.waiterId))
})
test('head chef resolving a sous-chef menu request notifies with MENU_REQUEST and alerts waiters', () => {
  const d = seed()
  const menu = d.menuItems.find((m) => m.status === 'AVAILABLE')
  const asked = run(d, { type: 'request-menu-status', menuItemId: menu.id, status: 'SOLD_OUT' }, 'NV011')
  assert.ok(asked.outbox.some((m) => m.kind === 'MENU_REQUEST'))
  const done = run(asked, { type: 'set-menu-status', menuItemId: menu.id, status: 'SOLD_OUT' })
  assert.equal(done.menuRequests.find((r) => r.menuItemId === menu.id).status, 'APPROVED')
  assert.ok(done.notifications.some((n) => n.kind === 'MENU_REQUEST' && /đã được duyệt/.test(n.title)))
  assert.ok(done.outbox.some((m) => m.kind === 'MENU_AVAILABILITY' && m.audience === 'WAITER'))
})
