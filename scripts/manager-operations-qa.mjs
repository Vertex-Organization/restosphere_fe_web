// Focused authenticated visual check for /manager/operations.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawn } from 'node:child_process'
import assert from 'node:assert/strict'

const base = process.env.MANAGER_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve('.taste-skill/manager-shots')
const profile = path.resolve(`.taste-skill/manager-operations-${process.pid}`)
fs.mkdirSync(out, { recursive: true })
fs.mkdirSync(profile, { recursive: true })
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(file => fs.existsSync(file))
if (!chrome) throw new Error('Chrome/Edge not available')
const portFile = path.join(profile, 'DevToolsActivePort')
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const kill = () => { if (child.exitCode !== null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { child.kill() } }
const guard = setTimeout(() => { kill(); process.exit(2) }, 180000)
let ws

try {
  let port
  for (let index = 0; index < 150 && !port; index++) { await pause(100); try { port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) } catch { /* Chrome is starting. */ } }
  if (!port) throw new Error('Chrome did not start')
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }) })
  let counter = 0
  const pending = new Map()
  const exceptions = []
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id) }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++counter
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout ${method}`)) }, 30000)
    pending.set(id, message => { clearTimeout(timer); message.error ? reject(new Error(message.error.message)) : resolve(message.result) })
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const run = (method, params) => send(method, params, sessionId)
  const evaluate = async expression => {
    const result = await run('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result?.value
  }
  const until = async (expression, label) => { for (let index = 0; index < 100; index++) { if (await evaluate(expression)) return; await pause(100) } throw new Error(`Wait failed: ${label}`) }
  const setInput = (selector, value) => evaluate(`(() => { const input=document.querySelector(${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,${JSON.stringify(value)}); input.dispatchEvent(new Event('input',{bubbles:true})); return true })()`)
  const size = async (width, height) => { await run('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }); await pause(250) }
  const shot = async name => { const { data } = await run('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data, 'base64')) }
  await run('Page.enable')
  await run('Runtime.enable')
  await size(1440, 900)
  await run('Page.navigate', { url: `${base}/manager/operations` })
  await until('!!document.querySelector("[name=username]")', 'login')
  await setInput('[name=username]', 'manager')
  await setInput('[name=password]', 'Manager@123')
  await evaluate('document.querySelector("form").requestSubmit()')
  await until('!!document.querySelector(".m-ops-workflow")', 'operations page')
  await evaluate('document.fonts.ready')

  const screens = []
  for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 844]]) {
    await size(width, height)
    const probe = await evaluate(`({ width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth, workflow:document.querySelectorAll('.m-ops-workflow-stage').length, duplicateMetrics:!!document.querySelector('.m-operations .m-metrics,.m-operations .m-monitor-rows'), title:document.querySelector('.m-content h1')?.textContent })`)
    assert.equal(probe.overflow, false, `Horizontal overflow at ${width}px`)
    assert.equal(probe.workflow, 5, `Workflow stages at ${width}px`)
    assert.equal(probe.duplicateMetrics, false, `Legacy overview blocks at ${width}px`)
    assert.equal(probe.title, 'Giám sát vận hành')
    await shot(`operations-${width}`)
    screens.push(probe)
  }
  await size(1440, 900)
  await run('Page.navigate', { url: `${base}/manager/orders` })
  await until('!!document.querySelector(".m-orders-list")', 'orders page')
  await evaluate('document.fonts.ready')
  const orderScreens = []
  for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 844]]) {
    await size(width, height)
    const probe = await evaluate(`({ width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth, filters:document.querySelectorAll('.m-orders-filter').length, rows:document.querySelectorAll('.m-order-pulse').length, progress:document.querySelectorAll('.m-order-progress').length, legacyTable:!!document.querySelector('.m-orders-panel .m-table-scroll'), title:document.querySelector('.m-content h1')?.textContent })`)
    assert.equal(probe.overflow, false, `Orders horizontal overflow at ${width}px`)
    assert.equal(probe.filters, 5, `Order filters at ${width}px`)
    assert.ok(probe.rows > 0, `Order rows at ${width}px`)
    assert.equal(probe.progress, probe.rows, `Order progress bars at ${width}px`)
    assert.equal(probe.legacyTable, false, `Legacy order table at ${width}px`)
    assert.equal(probe.title, 'Giám sát đơn hàng')
    await shot(`orders-${width}`)
    orderScreens.push(probe)
  }
  await size(1440, 900)
  await evaluate('document.querySelector(".m-order-pulse").click()')
  await until('!!document.querySelector("dialog[open]")', 'order detail dialog')
  assert.deepEqual(exceptions, [])
  const report = { operations: { route: '/manager/operations', screens }, orders: { route: '/manager/orders', screens: orderScreens, detailDialog: true }, exceptions }
  fs.writeFileSync(path.join(out, 'operations-qa.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  clearTimeout(guard)
  ws?.close()
  kill()
}
