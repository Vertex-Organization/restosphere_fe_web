import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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

const { createSeedData } = await import(moduleUrl('scripts/fixtures/kitchen.ts'))
const { applyKitchenCommand } = await import(moduleUrl('src/api/kitchen/rules.ts'))
const { buildActiveDishQueue, buildReadyDishQueue } = await import(
  moduleUrl('src/api/kitchen/selectors.ts')
)

const now = new Date('2026-11-12T12:00:00+07:00')
const seed = () => createSeedData(now)
const chef = 'NV010'
const run = (d, c, actor = chef) => applyKitchenCommand(d, actor, c, now).data

test('kitchen queue is FIFO by dish submission time, not grouped or promoted by table', () => {
  const queue = buildActiveDishQueue(seed(), now.getTime())
  assert.ok(queue.length > 1)
  assert.equal(queue[0].item.name, 'Bò lúc lắc')
  assert.equal(queue[0].order.tableCode, 'A03')
  assert.ok(
    queue.every(
      (dish, index) => index === 0 || queue[index - 1].item.submittedAt <= dish.item.submittedAt,
    ),
  )
  const priorityDish = queue.find((dish) => dish.order.priority)
  assert.ok(priorityDish)
  assert.ok(
    queue.indexOf(priorityDish) > 0,
    'a later priority table must not jump over an earlier dish',
  )
})

test('ready queue is dish-first with the longest-waiting completion first', () => {
  const queue = buildReadyDishQueue(seed(), now.getTime())
  assert.ok(queue.length > 1)
  assert.ok(queue.every((dish) => dish.item.status === 'READY'))
  assert.ok(
    queue.every(
      (dish, index) =>
        index === 0 || (queue[index - 1].item.readyAt ?? '') <= (dish.item.readyAt ?? ''),
    ),
  )
  assert.ok(new Set(queue.map((dish) => dish.order.tableCode)).size > 1)
})

test('kitchen reject changes item status to REJECTED and emits ITEM_REJECTED outbox', () => {
  const d = seed()
  const item = d.items.find((i) => i.status === 'SUBMITTED')
  assert.throws(
    () => run(d, { type: 'reject', itemId: item.id, version: item.version, reason: 'ít' }),
    /5 ký tự/,
  )
  const next = run(d, {
    type: 'reject',
    itemId: item.id,
    version: item.version,
    reason: 'Hết nguyên liệu món này',
  })
  const updated = next.items.find((i) => i.id === item.id)
  assert.equal(updated.status, 'REJECTED')
  assert.equal(updated.rejectionReason, 'Hết nguyên liệu món này')
  assert.equal(updated.rejectedBy, chef)
  assert.ok(next.outbox.some((m) => m.kind === 'ITEM_REJECTED' && m.audience === 'WAITER'))
  assert.throws(
    () =>
      run(next, {
        type: 'reject',
        itemId: item.id,
        version: updated.version,
        reason: 'Từ chối lần 2',
      }),
    /đã bị hủy/,
  )
  assert.throws(
    () => run(next, { type: 'start', items: [{ id: item.id, version: updated.version }] }),
    /đã bị hủy/,
  )
})

test('kitchen cannot reject PREPARING items and requires kitchen.items.update permission', () => {
  const d = seed()
  const prep = d.items.find((i) => i.status === 'PREPARING')
  assert.throws(
    () =>
      run(d, {
        type: 'reject',
        itemId: prep.id,
        version: prep.version,
        reason: 'Bỏ không làm nữa',
      }),
    /vừa được cập nhật/,
  )
  const sub = d.items.find((i) => i.status === 'SUBMITTED')
  assert.throws(
    () =>
      run(
        d,
        { type: 'reject', itemId: sub.id, version: sub.version, reason: 'Hết nguyên liệu món này' },
        'NV012',
      ),
    /không có quyền/,
  )
})

test('kitchen incident follows the shared schema and reaches manager and the order waiter', () => {
  const d = seed()
  const order = d.orders.find((o) => o.waiterId)
  const next = run(d, {
    type: 'report-incident',
    input: {
      type: 'OUT_OF_STOCK',
      severity: 'HIGH',
      description: 'Het nguyen lieu',
      orderId: order.id,
    },
  })
  const inc = next.incidents[0]
  assert.equal(inc.reporterId, chef)
  assert.ok(inc.title && inc.at && !('reportedBy' in inc))
  assert.ok(next.outbox.some((m) => m.kind === 'INCIDENT' && m.audience === 'MANAGER'))
  assert.ok(
    next.outbox.some(
      (m) => m.kind === 'INCIDENT' && m.audience === 'WAITER' && m.staffId === order.waiterId,
    ),
  )
})
test('head chef resolving a sous-chef menu request notifies with MENU_REQUEST and alerts waiters', () => {
  const d = seed()
  const menu = d.menuItems.find((m) => m.status === 'AVAILABLE')
  const asked = run(
    d,
    { type: 'request-menu-status', menuItemId: menu.id, status: 'SOLD_OUT' },
    'NV011',
  )
  assert.ok(asked.outbox.some((m) => m.kind === 'MENU_REQUEST'))
  const done = run(asked, { type: 'set-menu-status', menuItemId: menu.id, status: 'SOLD_OUT' })
  assert.equal(done.menuRequests.find((r) => r.menuItemId === menu.id).status, 'APPROVED')
  assert.ok(
    done.notifications.some((n) => n.kind === 'MENU_REQUEST' && /đã được duyệt/.test(n.title)),
  )
  assert.ok(done.outbox.some((m) => m.kind === 'MENU_AVAILABILITY' && m.audience === 'WAITER'))
})

test('single dish start and complete produce a short toast with dish and table', async () => {
  const { itemActionSummary } = await import(moduleUrl('src/api/kitchen/rules.ts'))
  const data = createSeedData(new Date('2026-11-12T12:00:00+07:00'))
  const item = data.items[0]
  const table = data.orders.find((o) => o.id === item.orderId).tableCode
  const ref = { id: item.id, version: item.version }
  assert.equal(
    itemActionSummary({ type: 'start', items: [ref] }, data, 'x'),
    `Đã bắt đầu ${item.name} · Bàn ${table}`,
  )
  assert.equal(
    itemActionSummary({ type: 'complete', items: [ref] }, data, 'x'),
    `Đã hoàn thành ${item.name} · Bàn ${table}`,
  )
  assert.equal(itemActionSummary({ type: 'start', items: [ref, ref] }, data, 'x'), 'x')
})

test('wait label switches to hours then days for long overdue dishes', async () => {
  const { formatWaitLabel } = await import(moduleUrl('src/components/kitchen/format.ts'))
  assert.equal(formatWaitLabel(59), '59 phút')
  assert.equal(formatWaitLabel(60), '1 giờ')
  assert.equal(formatWaitLabel(75), '1 giờ 15 phút')
  assert.equal(formatWaitLabel(24 * 60 - 1), '23 giờ 59 phút')
  assert.equal(formatWaitLabel(24 * 60), '1 ngày')
  assert.equal(formatWaitLabel(3 * 24 * 60 + 500), '3 ngày')
})

test('new dish detection ignores first load, removals and unchanged queues', async () => {
  const { submittedDishIds, hasNewDishes, parseNotifyMode } = await import(
    moduleUrl('src/api/kitchen/alerts.ts')
  )
  const data = seed()
  const ids = submittedDishIds(data)
  assert.ok(ids.size > 0)
  assert.equal(hasNewDishes(null, ids), false)
  assert.equal(hasNewDishes(ids, new Set(ids)), false)
  const fewer = new Set([...ids].slice(1))
  assert.equal(hasNewDishes(ids, fewer), false)
  assert.equal(hasNewDishes(fewer, ids), true)
  assert.equal(hasNewDishes(ids, new Set([...fewer, 'brand-new'])), true)
  assert.equal(parseNotifyMode(null), 'silent')
  assert.equal(parseNotifyMode('bogus'), 'silent')
  assert.equal(parseNotifyMode('sound'), 'sound')
  assert.equal(parseNotifyMode('vibrate'), 'vibrate')
})

test('notify volume parses to a clamped 0..1 value with 0.8 default', async () => {
  const { parseNotifyVolume } = await import(moduleUrl('src/api/kitchen/alerts.ts'))
  assert.equal(parseNotifyVolume(null), 0.8)
  assert.equal(parseNotifyVolume(''), 0.8)
  assert.equal(parseNotifyVolume('abc'), 0.8)
  assert.equal(parseNotifyVolume('0.35'), 0.35)
  assert.equal(parseNotifyVolume('0'), 0)
  assert.equal(parseNotifyVolume('7'), 1)
  assert.equal(parseNotifyVolume('-2'), 0)
})

test('stationOf maps by dish name first, then category, then falls back to wok', async () => {
  const { stationOf, inStation } = await import(moduleUrl('src/api/kitchen/stations.ts'))
  const data = {
    menuCategories: [
      { id: 'c1', name: 'Cua & tôm' },
      { id: 'c2', name: 'Cà phê & trà' },
      { id: 'c3', name: 'Mực & cá' },
      { id: 'c4', name: 'Lẩu' },
      { id: 'c5', name: 'Danh mục lạ' },
      { id: 'c6', name: 'Đồ uống' },
      { id: 'c7', name: 'Hải sản' },
    ],
    menuItems: [
      { id: 'a', name: '  tôm   NƯỚNG ', categoryId: 'c1' },
      { id: 'b', name: 'Mâm hải sản', categoryId: 'c5' },
      { id: 'c', name: 'Món chưa xếp', categoryId: 'c1' },
      { id: 'd', name: 'Trà đào', categoryId: 'c2' },
      { id: 'e', name: 'Cá lạ', categoryId: 'c3' },
      { id: 'f', name: 'Lẩu mới', categoryId: 'c4' },
      { id: 'g', name: 'Món bí ẩn', categoryId: 'c5' },
      { id: 'h', name: 'Món mồ côi', categoryId: 'missing' },
      { id: 'i', name: 'Nước suối', categoryId: 'c6' },
      { id: 'j', name: 'Món biển lạ', categoryId: 'c7' },
    ],
  }
  assert.equal(stationOf(data, 'a'), 'grill')
  assert.equal(stationOf(data, 'b'), 'steam')
  assert.equal(stationOf(data, 'c'), 'steam')
  assert.equal(stationOf(data, 'd'), 'bar')
  assert.equal(stationOf(data, 'e'), 'grill')
  assert.equal(stationOf(data, 'f'), 'steam')
  assert.equal(stationOf(data, 'g'), 'wok')
  assert.equal(stationOf(data, 'h'), 'wok')
  assert.equal(stationOf(data, 'unknown-id'), 'wok')
  assert.equal(stationOf(data, 'i'), 'bar')
  assert.equal(stationOf(data, 'j'), 'steam')
  assert.equal(inStation(data, 'a', 'all'), true)
  assert.equal(inStation(data, 'a', 'grill'), true)
  assert.equal(inStation(data, 'a', 'wok'), false)
})

test('new dish alert only counts dishes of the selected station', async () => {
  const { hasNewDishesInStation } = await import(moduleUrl('src/api/kitchen/alerts.ts'))
  const data = {
    menuCategories: [],
    menuItems: [
      { id: 'grill-dish', name: 'Cá nướng', categoryId: 'x' },
      { id: 'wok-dish', name: 'Bò lúc lắc', categoryId: 'x' },
    ],
    items: [
      { id: 'i1', menuItemId: 'grill-dish', status: 'SUBMITTED' },
      { id: 'i2', menuItemId: 'wok-dish', status: 'SUBMITTED' },
    ],
  }
  const seen = new Set(['i1'])
  assert.equal(hasNewDishesInStation(null, data, 'all'), false)
  assert.equal(hasNewDishesInStation(seen, data, 'all'), true)
  assert.equal(hasNewDishesInStation(seen, data, 'wok'), true)
  assert.equal(hasNewDishesInStation(seen, data, 'grill'), false)
})

test('priority dishes lead the board while the rest keep FIFO order', async () => {
  const { prioritizeActiveDishes } = await import(moduleUrl('src/api/kitchen/selectors.ts'))
  const queue = buildActiveDishQueue(seed(), now.getTime())
  const sorted = prioritizeActiveDishes(queue)
  assert.equal(sorted.length, queue.length)
  const firstPlain = sorted.findIndex((dish) => !dish.order.priority)
  assert.ok(sorted.slice(0, firstPlain).every((dish) => dish.order.priority))
  assert.ok(sorted.slice(firstPlain).every((dish) => !dish.order.priority))
  assert.ok(sorted.some((dish) => dish.order.priority))
  const plain = queue.filter((dish) => !dish.order.priority)
  assert.deepEqual(
    sorted.slice(firstPlain).map((dish) => dish.item.id),
    plain.map((dish) => dish.item.id),
  )
})

test('isAlertNote flags allergy and dietary notes with or without diacritics', async () => {
  const { isAlertNote } = await import(moduleUrl('src/api/kitchen/notes.ts'))
  for (const note of [
    'Khách dị ứng tôm',
    'di ung hai san',
    'Không cay',
    'KHONG hanh',
    'Kiêng đồ sống',
    'kieng mon man',
    'Món chay',
    'an CHAY',
  ])
    assert.equal(isAlertNote(note), true, note)
  for (const note of ['Ít cay', 'Lên món trước', 'Thêm đá', 'Chạy nhanh', '', undefined, null])
    assert.equal(isAlertNote(note), false, String(note))
})

test('notification row parts: table, detail, short kind, progress and relative time', async () => {
  const {
    notificationLine,
    notificationParts,
    notificationKindShort,
    ticketProgress,
    relativeAgo,
  } = await import(moduleUrl('src/api/kitchen/notifications.ts'))
  assert.equal(notificationLine('Đơn mới', 'Bàn A02 · 1 món'), 'Đơn mới · Bàn A02 · 1 món')
  assert.equal(notificationLine('Đơn mới', '  '), 'Đơn mới')
  assert.equal(notificationKindShort('PRIORITY'), 'Ưu tiên')
  assert.equal(notificationKindShort('SOMETHING_NEW'), 'Thông báo')
  const item = (id, orderId, status) => ({ id, orderId, status })
  const data = {
    orders: [
      { id: 'o1', tableCode: 'G04' },
      { id: 'o2', tableCode: 'A01' },
      { id: 'o3', tableCode: 'B07' },
      { id: 'o4', tableCode: 'C02' },
      { id: 'o5', tableCode: 'D09' },
    ],
    items: [
      item('a', 'o1', 'SUBMITTED'),
      item('b', 'o1', 'READY'),
      item('c', 'o1', 'REJECTED'),
      item('d', 'o2', 'READY'),
      item('e', 'o2', 'SERVED'),
      item('f', 'o3', 'PREPARING'),
      item('g', 'o3', 'SUBMITTED'),
      item('h', 'o4', 'CANCELLED'),
      item('i', 'o5', 'SUBMITTED'),
    ],
  }
  const base = { kind: 'NEW_ORDER', title: 'Đơn mới · Bàn G04', body: 'original', orderId: 'o1' }
  assert.deepEqual(notificationParts(base, data), { table: 'Bàn G04', detail: '3 món' })
  assert.deepEqual(notificationParts({ ...base, kind: 'ADD_ON' }, data), {
    table: 'Bàn G04',
    detail: 'original',
  })
  assert.deepEqual(notificationParts({ ...base, orderId: 'missing' }, data), {
    table: '',
    detail: 'Đơn mới · original',
  })
  assert.equal(ticketProgress(data, 'o1'), 'Đang làm 1/2')
  assert.equal(ticketProgress(data, 'o2'), 'Xong 2/2')
  assert.equal(ticketProgress(data, 'o3'), 'Đang làm 0/2')
  assert.equal(ticketProgress(data, 'o5'), 'Chờ 0/1')
  assert.equal(ticketProgress(data, 'o4'), '')
  assert.equal(ticketProgress(data, undefined), '')
  assert.equal(ticketProgress(data, 'missing'), '')
  assert.equal(relativeAgo(0), 'vừa xong')
  assert.equal(relativeAgo(7), '7 phút trước')
  assert.equal(relativeAgo(60), '1 giờ trước')
  assert.equal(relativeAgo(23 * 60 + 59), '23 giờ trước')
  assert.equal(relativeAgo(2 * 24 * 60), '2 ngày trước')
})

test('notification day view filters by range, groups by day and paginates', async () => {
  const { buildDayView, filterByRange, daysAgo } = await import(
    moduleUrl('src/api/kitchen/dayGroups.ts')
  )
  const base = new Date(2026, 10, 23, 9, 0).getTime()
  const at = (days, hour = 12) => new Date(2026, 10, 23 - days, hour, 0).toISOString()
  const items = [
    { id: 'future', at: new Date(2026, 10, 23, 23, 59).toISOString() },
    { id: 'today-early', at: at(0, 0) },
    { id: 'yesterday-late', at: at(1, 23) },
    { id: 'two', at: at(2) },
    { id: 'three', at: at(3) },
    { id: 'ten', at: at(10) },
  ]
  assert.equal(daysAgo(at(1, 23), base), 1)
  assert.equal(daysAgo(at(0, 0), base), 0)
  assert.deepEqual(
    filterByRange(items, base, 'today').map((i) => i.id),
    ['future', 'today-early'],
  )
  assert.deepEqual(
    filterByRange(items, base, '3days').map((i) => i.id),
    ['future', 'today-early', 'yesterday-late', 'two'],
  )
  const today = buildDayView(items, base, 'today', 20)
  assert.deepEqual(
    today.groups.map((g) => g.label),
    ['Hôm nay'],
  )
  assert.equal(today.total, 2)
  const three = buildDayView(items, base, '3days', 20)
  assert.deepEqual(
    three.groups.map((g) => [g.label, g.items.map((i) => i.id)]),
    [
      ['Hôm nay', ['future', 'today-early']],
      ['Hôm qua', ['yesterday-late']],
      ['Trước đó', ['two']],
    ],
  )
  assert.equal(three.total, 4)
  assert.equal(three.shown, 4)
  const paged = buildDayView(items, base, '3days', 3)
  assert.equal(paged.shown, 3)
  assert.equal(paged.total, 4)
  assert.deepEqual(
    paged.groups.map((g) => g.label),
    ['Hôm nay', 'Hôm qua'],
  )
  assert.deepEqual(buildDayView([], base, 'today', 20), { groups: [], total: 0, shown: 0 })
})

test('quick report builds a medium-severity incident tied to the order and dish', async () => {
  const { buildQuickReport, quickReportMessage, QUICK_REPORTS } = await import(
    moduleUrl('src/api/kitchen/quickReport.ts')
  )
  assert.deepEqual(
    QUICK_REPORTS.map((r) => r.type),
    ['OUT_OF_STOCK', 'EQUIPMENT', 'NOTE_CLARIFICATION'],
  )
  const d = seed()
  const item = d.items.find((i) => i.status === 'SUBMITTED')
  const input = buildQuickReport('OUT_OF_STOCK', item, '  còn 1 phần  ')
  assert.equal(input.severity, 'MEDIUM')
  assert.equal(input.orderId, item.orderId)
  assert.equal(input.itemId, item.id)
  assert.equal(input.description, `Sắp hết nguyên liệu · ${item.name}: còn 1 phần`)
  assert.equal(
    buildQuickReport('EQUIPMENT', item, '').description,
    `Thiết bị gặp sự cố · ${item.name}`,
  )
  assert.equal(buildQuickReport('EQUIPMENT', item, 'x'.repeat(900)).description.length, 500)
  assert.equal(
    quickReportMessage('NOTE_CLARIFICATION', 'Cua hấp'),
    'Đã báo quản lý: Cần hỏi lại ghi chú · Cua hấp',
  )
  for (const type of QUICK_REPORTS.map((r) => r.type)) {
    const next = run(d, { type: 'report-incident', input: buildQuickReport(type, item, '') })
    assert.equal(next.incidents[0].type, type)
    assert.equal(next.incidents[0].itemId, item.id)
    assert.ok(next.outbox.some((m) => m.kind === 'INCIDENT' && m.audience === 'MANAGER'))
  }
})

test('kitchen route no longer has an incidents page and old links land on the board', async () => {
  const src = fs.readFileSync('src/routes/kitchenRouter.ts', 'utf8')
  assert.ok(!/name: 'incidents'/.test(src))
  assert.ok(!/reportIncident/.test(src))
  const app = fs.readFileSync('src/pages/internal/kitchen/KitchenApp.tsx', 'utf8')
  assert.ok(/KITCHEN_BASE\}\/incidents/.test(app))
})

test('formatCount caps large counters at 99+', async () => {
  const { formatCount } = await import(moduleUrl('src/components/kitchen/format.ts'))
  assert.equal(formatCount(0), '0')
  assert.equal(formatCount(99), '99')
  assert.equal(formatCount(100), '99+')
  assert.equal(formatCount(1234), '99+')
})

test('dayKeyBefore steps back whole local days', async () => {
  const { dayKeyBefore } = await import(moduleUrl('src/components/kitchen/format.ts'))
  const now = new Date(2026, 2, 1, 0, 30).getTime()
  assert.equal(dayKeyBefore(now, 0), '2026-03-01')
  assert.equal(dayKeyBefore(now, 1), '2026-02-28')
  assert.equal(dayKeyBefore(new Date(2026, 0, 1, 23, 59).getTime(), 1), '2025-12-31')
})

test('takePage shows the first N items and reports whether more remain', async () => {
  const { takePage, HISTORY_PAGE_SIZE } = await import(moduleUrl('src/api/kitchen/paging.ts'))
  assert.equal(HISTORY_PAGE_SIZE, 20)
  const items = Array.from({ length: 45 }, (_, i) => i)
  const first = takePage(items, 20)
  assert.equal(first.items.length, 20)
  assert.deepEqual([first.shown, first.total, first.hasMore], [20, 45, true])
  assert.equal(first.items[0], 0)
  const more = takePage(items, 40)
  assert.deepEqual([more.shown, more.hasMore], [40, true])
  const all = takePage(items, 60)
  assert.deepEqual([all.shown, all.total, all.hasMore], [45, 45, false])
  assert.deepEqual(takePage([], 20), { items: [], shown: 0, total: 0, hasMore: false })
})

test('menu status filter counts, filters and pushes discontinued dishes last', async () => {
  const { menuFilterCounts, applyMenuStatusFilter, discontinuedLast } = await import(
    moduleUrl('src/api/kitchen/menuStatus.ts')
  )
  const items = [
    { id: 'a', status: 'DISCONTINUED' },
    { id: 'b', status: 'AVAILABLE' },
    { id: 'c', status: 'SOLD_OUT' },
    { id: 'd', status: 'AVAILABLE' },
  ]
  assert.deepEqual(menuFilterCounts(items), { all: 4, available: 2, soldout: 1 })
  assert.deepEqual(
    applyMenuStatusFilter(items, 'available').map((i) => i.id),
    ['b', 'd'],
  )
  assert.deepEqual(
    applyMenuStatusFilter(items, 'soldout').map((i) => i.id),
    ['c'],
  )
  assert.equal(applyMenuStatusFilter(items, 'all').length, 4)
  assert.deepEqual(
    discontinuedLast(items).map((i) => i.id),
    ['b', 'c', 'd', 'a'],
  )
})

test('late counter only counts unfinished (new + preparing) overdue dishes', async () => {
  const { countLateActive, filterActiveDishes } = await import(
    moduleUrl('src/api/kitchen/selectors.ts')
  )
  assert.equal(countLateActive([]), 0)
  assert.equal(
    countLateActive([{ tone: 'late' }, { tone: 'warn' }, { tone: 'late' }, { tone: 'normal' }]),
    2,
  )
  const later = new Date(now.getTime() + 60 * 60000).getTime()
  const queue = buildActiveDishQueue(seed(), later)
  assert.ok(
    queue.every((dish) => dish.item.status === 'SUBMITTED' || dish.item.status === 'PREPARING'),
  )
  assert.ok(countLateActive(queue) > 0)
  assert.equal(countLateActive(queue), filterActiveDishes(queue, 'late').length)
  const ready = buildReadyDishQueue(seed(), later)
  assert.ok(ready.some((dish) => dish.tone === 'late'))
  assert.equal(
    countLateActive(queue),
    queue.filter((dish) => dish.tone === 'late').length,
    'finished dishes never raise the counter',
  )
})

test('first station option reads "Tất cả trạm"', async () => {
  const { STATIONS } = await import(moduleUrl('src/api/kitchen/stations.ts'))
  assert.equal(STATIONS[0].id, 'all')
  assert.equal(STATIONS[0].label, 'Tất cả trạm')
})

test('dish wait line says "Vừa gọi" under a minute and keeps overdue wording', async () => {
  const { formatDishWait } = await import(moduleUrl('src/components/kitchen/format.ts'))
  assert.equal(formatDishWait('normal', 0), 'Vừa gọi')
  assert.equal(formatDishWait('normal', 1), 'Chờ 1 phút')
  assert.equal(formatDishWait('warn', 12), 'Chờ 12 phút')
  assert.equal(formatDishWait('late', 20), 'Quá giờ 20 phút')
  assert.equal(formatDishWait('late', 75), 'Quá giờ 1 giờ 15 phút')
  assert.equal(formatDishWait('late', 3000), 'Quá giờ 2 ngày')
})
