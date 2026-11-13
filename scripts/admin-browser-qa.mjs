// Authenticated browser QA for the Admin demo. It uses one dedicated headless
// Chrome profile, drives the real forms, captures responsive shots and closes
// only the Chrome process it starts.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawn } from 'node:child_process'

const base = process.env.ADMIN_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve('.taste-skill/admin-shots')
const profile = path.resolve(`.taste-skill/admin-browser-${process.pid}`)
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(profile, { recursive: true })
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((file) => fs.existsSync(file))
if (!chrome) throw new Error('Chrome/Edge not available')
const portFile = path.join(profile, 'DevToolsActivePort')
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const kill = () => { if (child.exitCode !== null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { child.kill() } }
const guard = setTimeout(() => { kill(); process.exit(2) }, 540000)
const report = { screens: [], routes: [], flows: [], exceptions: [] }
let ws

try {
  let port
  for (let count = 0; count < 150 && !port; count += 1) { await pause(100); try { port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) } catch { /* Chrome is starting. */ } }
  if (!port) throw new Error('Chrome did not start')
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }) })
  let counter = 0
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id) }
    if (message.method === 'Runtime.exceptionThrown') report.exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++counter
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout ${method}`)) }, 30000)
    pending.set(id, (message) => { clearTimeout(timer); if (message.error) reject(new Error(message.error.message)); else resolve(message.result) })
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const S = (method, params) => send(method, params, sessionId)
  const evaluate = async (expression) => {
    const result = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result?.value
  }
  await S('Page.enable'); await S('Runtime.enable')
  const until = async (expression, message) => { for (let count = 0; count < 100; count += 1) { if (await evaluate(expression)) return; await pause(100) } throw new Error(`Wait failed: ${message}`) }
  const goto = async (route) => { await S('Page.navigate', { url: `${base}${route}` }); await until('!!document.querySelector("h1")', route); await pause(350) }
  const size = async (width, height) => { await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }); await pause(220) }
  const shot = async (name) => { const { data } = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data, 'base64')) }
  const setInput = async (selector, value) => evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing input '+${JSON.stringify(selector)}); const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true })()`)
  const click = async (label) => { await evaluate(`(() => { const el=[...document.querySelectorAll('button,a.a-button')].find(e=>e.textContent.trim()===${JSON.stringify(label)}); if(!el) throw Error('Missing control '+${JSON.stringify(label)}); if(el.disabled) throw Error('Disabled control '+${JSON.stringify(label)}); el.click(); return true })()`); await pause(200) }

  await size(1366, 768)
  await goto('/admin/users')
  assert.equal(await evaluate('location.pathname'), '/admin/login')
  await click('Điền tài khoản demo')
  await click('Đăng nhập demo')
  await until('!!document.querySelector(".a-app")', 'admin login')
  assert.equal(await evaluate('location.pathname'), '/admin/users')
  report.flows.push('Demo login preserves the protected destination')

  await goto('/admin')
  for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [820, 1180], [768, 1024], [390, 844], [320, 844]]) {
    await size(width, height); await evaluate('document.fonts.ready'); await shot(`dashboard-${width}`)
    const probe = await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,title:document.querySelector('.a-content h1')?.textContent,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),titleSize:getComputedStyle(document.querySelector('.a-content h1')).fontSize,header:document.querySelector('.a-topbar').getBoundingClientRect().height})`)
    assert.equal(probe.overflow, false, `Overflow ${width}`); assert.deepEqual(probe.broken, [], `Broken images ${width}`); assert.ok(parseFloat(probe.titleSize) <= 22)
    report.screens.push({ width, height, ...probe })
  }

  await size(1366, 768)
  const routes = ['users', 'roles', 'restaurant', 'settings', 'audit-logs']
  for (const route of routes) {
    await goto(`/admin/${route}`)
    const title = await evaluate('document.querySelector(".a-content h1").textContent')
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'), false, route)
    await shot(route); report.routes.push({ route, title })
  }

  await goto('/admin/users')
  await setInput('.a-search input', 'Ngọc Lan'); await pause(120)
  assert.equal(await evaluate('document.querySelectorAll("tbody tr").length'), 1)
  await setInput('.a-search input', 'không có tài khoản'); await pause(120)
  assert.ok(await evaluate('document.body.textContent.includes("Chưa có kết quả")'))
  report.flows.push('Account search and empty state')
  await setInput('.a-search input', ''); await pause(100)
  await click('Xem chi tiết'); await until('!!document.querySelector("[role=dialog]")', 'user detail'); await shot('user-detail')
  await click('Khóa tài khoản'); await click('Xác nhận thay đổi')
  assert.ok(await evaluate('document.body.textContent.includes("Backend chưa có API cập nhật trạng thái")'))
  report.flows.push('Account detail and guarded lock confirmation')
  await click('Đóng chi tiết'); await click('Tạo tài khoản'); await click('Kiểm tra thông tin')
  assert.ok(await evaluate('document.querySelector("[role=dialog]").textContent.includes("ít nhất 2 ký tự")'))
  report.flows.push('Create-account validation')
  await click('Hủy')

  await goto('/admin/roles'); await click('Gán vai trò'); await click('Kiểm tra thay đổi')
  assert.ok(await evaluate('document.querySelector("[role=dialog]").textContent.includes("Chọn một tài khoản")'))
  report.flows.push('Role assignment validation')
  await click('Hủy')

  await goto('/admin/restaurant')
  await setInput('[type=url]', 'facebook.com/restosphere'); await click('Lưu thay đổi')
  assert.ok(await evaluate('document.body.textContent.includes("bắt đầu bằng https://")'))
  report.flows.push('Restaurant social URL validation')

  await goto('/admin/settings')
  const before = await evaluate('document.querySelector(".a-switch input").checked')
  await evaluate('document.querySelector(".a-switch input").click()')
  assert.notEqual(await evaluate('document.querySelector(".a-switch input").checked'), before)
  await click('Lưu cài đặt')
  assert.ok(await evaluate('document.body.textContent.includes("chưa lưu")'))
  report.flows.push('Settings draft toggle and demo-only save message')

  await size(390, 844)
  for (const route of ['', ...routes.map((route) => `/${route}`)]) {
    await goto(`/admin${route}`)
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'), false, `Mobile overflow ${route || 'dashboard'}`)
    await shot(`mobile-${route.slice(1) || 'dashboard'}`)
  }
  await goto('/admin'); await evaluate('document.querySelector(".a-menu-button").click()'); await pause(100)
  assert.ok(await evaluate('document.querySelector(".a-sidebar").classList.contains("is-open")')); await shot('mobile-navigation')
  report.flows.push('Mobile navigation opens without overflow')

  await size(1366, 768); await goto('/admin'); await evaluate('document.querySelector(".a-account").click()'); await click('Đăng xuất')
  await until('location.pathname==="/admin/login"', 'logout')
  await goto('/admin/settings'); assert.equal(await evaluate('location.pathname'), '/admin/login')
  report.flows.push('Logout clears the demo session')
  assert.deepEqual(report.exceptions, [], 'Runtime exceptions')
  fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify({ ...report, error: String(error) }, null, 2))
  console.error(error); process.exitCode = 1
} finally {
  clearTimeout(guard); ws?.close(); kill()
}
