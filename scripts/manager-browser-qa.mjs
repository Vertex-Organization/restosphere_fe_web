// Authenticated QA for the operational workspace. Uses a single headless Chrome,
// real login/forms, a dedicated project profile, and closes only its own process.
import fs from 'node:fs'
import path from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

const base = process.env.MANAGER_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve('.taste-skill/manager-shots')
const profile = path.resolve(`.taste-skill/manager-browser-${process.pid}`)
fs.mkdirSync(out, { recursive: true })
fs.mkdirSync(profile, { recursive: true })
const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))
if (!chrome) throw new Error('Chrome/Edge not available')
const portFile = path.join(profile, 'DevToolsActivePort')
if (fs.existsSync(portFile)) fs.unlinkSync(portFile)
const child = spawn(
  chrome,
  [
    '--headless=new',
    `--user-data-dir=${profile}`,
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
)
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const kill = () => {
  if (child.exitCode !== null) return
  try {
    execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } catch {
    child.kill()
  }
}
const guard = setTimeout(() => {
  kill()
  process.exit(2)
}, 540000)
const report = { screens: [], routes: [], flows: [], exceptions: [] }
let ws
try {
  let port
  for (let n = 0; n < 150 && !port; n++) {
    await pause(100)
    try {
      port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0])
    } catch {
      /* starting */
    }
  }
  if (!port) throw new Error('Chrome did not start')
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((r, j) => {
    ws.addEventListener('open', r, { once: true })
    ws.addEventListener('error', j, { once: true })
  })
  let counter = 0
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id) {
      pending.get(m.id)?.(m)
      pending.delete(m.id)
    }
    if (m.method === 'Runtime.exceptionThrown')
      report.exceptions.push(
        m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text,
      )
  })
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++counter
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`Timeout ${method}`))
      }, 30000)
      pending.set(id, (m) => {
        clearTimeout(timer)
        if (m.error) reject(new Error(m.error.message))
        else resolve(m.result)
      })
      ws.send(JSON.stringify({ id, method, params, sessionId }))
    })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const S = (m, p) => send(m, p, sessionId)
  const ev = async (expression) => {
    const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails)
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result?.value
  }
  await S('Page.enable')
  await S('Runtime.enable')
  const until = async (expression, message) => {
    for (let n = 0; n < 100; n++) {
      if (await ev(expression)) return
      await pause(100)
    }
    throw new Error(`Wait failed: ${message}`)
  }
  const goto = async (route) => {
    await S('Page.navigate', { url: `${base}${route}` })
    await until('!!document.querySelector("h1")', route)
    await pause(400)
  }
  const size = async (width, height) => {
    await S('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    })
    await pause(250)
  }
  const shot = async (name) => {
    const { data } = await S('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data, 'base64'))
  }
  const setInput = async (selector, value) =>
    ev(
      `(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing input '+${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set; setter.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true })()`,
    )
  const click = async (label) => {
    await ev(
      `(() => { const el=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}); if(!el) throw Error('Missing button '+${JSON.stringify(label)}); if(el.disabled) throw Error('Disabled button '+${JSON.stringify(label)}); el.click(); return true })()`,
    )
    await pause(150)
  }
  const field = async (label, value) => {
    const selector = await ev(
      `(() => { const l=[...document.querySelectorAll('dialog label')].find(l=>l.textContent.trim()===${JSON.stringify(label)}); if(!l) throw Error('Missing field label'); return '#'+CSS.escape(l.htmlFor) })()`,
    )
    await setInput(selector, value)
  }
  const state = () => ev(`JSON.parse(localStorage.getItem('restosphere.manager.data.v1'))`)
  const login = async (username = 'manager', password = 'Manager@123') => {
    await setInput('[name=username]', username)
    await setInput('[name=password]', password)
    await ev('document.querySelector("form").requestSubmit()')
    await pause(400)
  }
  await size(1366, 768)
  // One sign-in at /staff/login for every role; each role lands in its own workspace.
  await goto('/staff/manager/orders')
  await until(
    'location.pathname==="/staff/login" && !!document.querySelector("[name=username]")',
    'staff login',
  )
  await login('cashier', '123456')
  await until('location.pathname==="/staff/cashier"', 'cashier lands in the cashier workspace')
  await goto('/staff/manager/orders')
  await until('document.body.textContent.includes("Không có quyền vào khu Quản lý")', 'role guard')
  report.flows.push('Non-manager route access denied')
  await click('Đăng nhập tài khoản khác')
  await until(
    'location.pathname==="/staff/login" && !!document.querySelector("[name=username]")',
    'login',
  )
  await login()
  await until('!!document.querySelector(".m-app")', 'manager login')
  assert.equal(await ev('location.pathname'), '/staff/manager/orders')
  report.flows.push('Login with protected next URL')
  await goto('/staff/manager')
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [1024, 768],
    [820, 1180],
    [768, 1024],
    [390, 844],
    [320, 844],
  ]) {
    await size(width, height)
    await ev('document.fonts.ready')
    await shot(`dashboard-${width}`)
    const probe = await ev(
      `({ overflow:document.documentElement.scrollWidth>innerWidth, title:document.querySelector('h1').textContent, broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src), titleSize:getComputedStyle(document.querySelector('h1')).fontSize, sidebar:document.querySelector('.m-sidebar').getBoundingClientRect().width, header:document.querySelector('.m-header').getBoundingClientRect().height })`,
    )
    assert.equal(probe.overflow, false, `Overflow ${width}`)
    assert.deepEqual(probe.broken, [], `Images ${width}`)
    assert.ok(parseFloat(probe.titleSize) <= 22)
    report.screens.push({ width, height, ...probe })
  }
  await size(1366, 768)
  const routes = [
    'operations',
    'reservations',
    'tables',
    'orders',
    'kitchen',
    'employees',
    'shifts',
    'menu',
    'menu/categories',
    'approvals',
    'reports',
    'incidents',
    'notifications',
    'profile',
  ]
  for (const route of routes) {
    await goto(`/staff/manager/${route}`)
    await until('!!document.querySelector(".m-content h1")', route)
    const title = await ev('document.querySelector(".m-content h1").textContent')
    assert.equal(await ev('document.documentElement.scrollWidth>innerWidth'), false, route)
    await shot(route.replaceAll('/', '-'))
    report.routes.push({ route, title })
  }
  await goto('/staff/manager/reservations')
  await setInput('.m-search input', 'Thảo Vy')
  await pause(100)
  assert.equal(await ev('document.querySelectorAll("tbody tr").length'), 1)
  await setInput('.m-search input', 'không có khách này')
  await pause(100)
  assert.ok(await ev('document.body.textContent.includes("Không có dữ liệu phù hợp")'))
  report.flows.push('Reservation search and empty state')
  await goto('/staff/manager/reservations?id=DB-041')
  await until('!!document.querySelector("dialog[open]")', 'reservation detail')
  await click('Điều chỉnh bàn')
  await field('Bàn thay thế', 'B10')
  await field('Lý do điều chỉnh', 'Khách muốn đổi sang khu vực tầng một')
  await shot('reservation-move-dialog')
  await click('Lưu điều chỉnh')
  await until(
    `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).reservations.find(r=>r.id==='DB-041').tableId==='B10'`,
    'reservation moved',
  )
  report.flows.push('Reservation reassignment and audit through real form')
  await goto('/staff/manager/approvals?id=PD-021')
  await until('!!document.querySelector("dialog[open]")', 'approval detail')
  const current = await state()
  // A dedicated profile keeps test writes separate from the user's browser.
  if (current.approvals.find((a) => a.id === 'PD-021').status === 'PENDING') {
    await click('Xử lý yêu cầu')
    await field('Lý do xử lý', 'Đã kiểm tra với bộ phận thu ngân')
    await click('Lưu quyết định')
    await until(
      `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).approvals.find(a=>a.id==='PD-021').status==='APPROVED'`,
      'approval persisted',
    )
    report.flows.push('Approve a request through the form; audit saved')
  }
  await goto('/staff/manager/approvals?id=PD-022')
  await until('!!document.querySelector("dialog[open]")', 'reject detail')
  if ((await state()).approvals.find((a) => a.id === 'PD-022').status === 'PENDING') {
    await click('Xử lý yêu cầu')
    await field('Quyết định', 'REJECTED')
    await field('Lý do xử lý', 'Món đã vào chế biến, không đủ điều kiện hủy')
    await click('Lưu quyết định')
    await until(
      `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).approvals.find(a=>a.id==='PD-022').status==='REJECTED'`,
      'rejection persisted',
    )
    report.flows.push('Reject a request with a reason')
  }
  await goto('/staff/manager/menu')
  await click('Thêm món ăn')
  await field('Mã món', 'QA-MON')
  await field('Tên món', 'Món kiểm tra')
  await field('Giá bán (đồng)', '-1')
  await click('Lưu món ăn')
  await shot('menu-validation-dialog')
  assert.ok(await ev('document.querySelector("dialog").textContent.includes("không âm")'))
  await field('Giá bán (đồng)', '59000')
  await click('Lưu món ăn')
  await until(
    `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).menu.some(m=>m.id==='QA-MON')`,
    'menu saved',
  )
  report.flows.push('Menu negative-price validation and successful create')
  await setInput('.m-search input', 'QA-MON')
  await pause(100)
  await click('Chỉnh sửa')
  await field('Giá bán (đồng)', '69000')
  await field('Tình trạng kinh doanh', 'HIDDEN')
  await click('Lưu món ăn')
  await until(
    `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).menu.find(m=>m.id==='QA-MON').price===69000`,
    'menu edit',
  )
  await click('Xóa')
  await click('Xóa món ăn')
  await until(
    `!JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).menu.some(m=>m.id==='QA-MON')`,
    'menu delete',
  )
  report.flows.push('Edit price, hide, and delete an unused dish')
  await goto('/staff/manager/menu/categories')
  await click('Thêm danh mục')
  await field('Mã danh mục', 'QA-CAT')
  await field('Tên danh mục', 'Danh mục kiểm tra')
  await click('Lưu thay đổi')
  await until(
    `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).categories.some(c=>c.id==='QA-CAT')`,
    'category create',
  )
  await ev(
    `(() => { const row=[...document.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('QA-CAT')); [...row.querySelectorAll('button')].find(b=>b.textContent.trim()==='Xóa').click(); return true })()`,
  )
  await click('Xóa danh mục')
  await until(
    `!JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).categories.some(c=>c.id==='QA-CAT')`,
    'category delete',
  )
  report.flows.push('Category create and unreferenced delete')
  await goto('/staff/manager/shifts')
  await click('Tạo ca làm')
  await field('Tên ca', 'Ca kiểm tra trùng')
  await ev(
    `(() => { const input=[...document.querySelectorAll('dialog .m-check-list label')].find(l=>l.textContent.includes('Trần Hoài Nam')).querySelector('input'); input.click(); return true })()`,
  )
  await click('Lưu ca làm')
  assert.ok(await ev('document.querySelector("dialog").textContent.includes("trùng giờ")'))
  report.flows.push('Shift overlap rejected in the form')
  await shot('shift-validation-dialog')
  await field('Ngày làm việc', '2027-01-20')
  await click('Lưu ca làm')
  await until(
    `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).shifts.some(s=>s.name==='Ca kiểm tra trùng' && s.date==='2027-01-20')`,
    'valid shift create',
  )
  report.flows.push('Create a valid non-overlapping shift')
  await goto('/staff/manager/incidents?id=SC-008')
  await until('!!document.querySelector("dialog[open]")', 'incident')
  if ((await state()).incidents.find((i) => i.id === 'SC-008').status !== 'RESOLVED') {
    const before = (await state()).orders
    await click('Cập nhật xử lý')
    await field('Tiến độ xử lý', 'RESOLVED')
    await field('Ghi chú xử lý', 'Đã bổ sung nguyên liệu và kiểm tra với bếp')
    await click('Lưu thay đổi')
    await until(
      `JSON.parse(localStorage.getItem('restosphere.manager.data.v1')).incidents.find(i=>i.id==='SC-008').status==='RESOLVED'`,
      'incident resolved',
    )
    assert.deepEqual((await state()).orders, before)
    report.flows.push('Resolve incident without changing orders')
  }
  await goto('/staff/manager/notifications')
  if ((await state()).notifications.some((n) => !n.readBy.includes('NV001')))
    await click('Đánh dấu tất cả đã đọc')
  assert.ok((await state()).notifications.every((n) => n.readBy.includes('NV001')))
  report.flows.push('Notifications mark all read')
  await goto('/staff/manager/reports')
  await setInput('[aria-label="Từ ngày"]', '2027-12-31')
  await pause(100)
  assert.ok(await ev('document.body.textContent.includes("Chọn khoảng ngày hợp lệ")'))
  report.flows.push('Report invalid date range')
  await click('Xem hôm nay')
  await S('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: out })
  await click('Xuất báo cáo CSV')
  await pause(500)
  assert.ok(
    fs.readdirSync(out).some((f) => f.endsWith('.csv')),
    'CSV download',
  )
  report.flows.push('CSV export downloads filtered report')
  // Check narrow operational pages and the real menu drawer, not just the dashboard.
  await size(390, 844)
  for (const route of routes) {
    await goto(`/staff/manager/${route}`)
    assert.equal(
      await ev('document.documentElement.scrollWidth>innerWidth'),
      false,
      `Mobile overflow ${route}`,
    )
    await shot(`mobile-${route.replaceAll('/', '-')}`)
  }
  await goto('/staff/manager')
  await ev('document.querySelector(".m-menu-button").click()')
  await pause(100)
  assert.ok(await ev('document.querySelector(".m-sidebar").classList.contains("is-open")'))
  await shot('mobile-navigation')
  report.flows.push('Mobile navigation opens')
  await S('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' })
  await size(1366, 768)
  await goto('/staff/manager/profile')
  await click('Đăng xuất tài khoản')
  await until('location.pathname==="/staff/login"', 'logout')
  await goto('/staff/manager/reports')
  assert.equal(await ev('location.pathname'), '/staff/manager/login')
  report.flows.push('Logout revokes workspace access')
  for (const route of ['/', '/kitchen', '/cashier']) {
    await goto(route)
    assert.ok(await ev('document.body.textContent.length>50'), route)
    report.routes.push({ route, title: await ev('document.title') })
  }
  assert.deepEqual(report.exceptions, [], 'Runtime exceptions')
  fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  fs.writeFileSync(
    path.join(out, 'qa-results.json'),
    JSON.stringify({ ...report, error: String(error) }, null, 2),
  )
  console.error(error)
  process.exitCode = 1
} finally {
  clearTimeout(guard)
  ws?.close()
  kill()
}
