// Authenticated QA for the operational workspace. Uses a single headless Chrome,
// real login/forms, a dedicated project profile, and closes only its own process.
import fs from 'node:fs'
import path from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

const base = process.env.MANAGER_QA_URL || 'http://localhost:5173'
const out = path.resolve('.taste-skill/manager-workspace-shots')
const profile = path.resolve(`.taste-skill/manager-browser-${process.pid}`)
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(profile, { recursive: true })
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p))
if (!chrome) throw new Error('Chrome/Edge not available')
const portFile = path.join(profile, 'DevToolsActivePort')
if (fs.existsSync(portFile)) fs.unlinkSync(portFile)
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const pause = ms => new Promise(r => setTimeout(r, ms))
const kill = () => { if (child.exitCode !== null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { child.kill() } }
const guard = setTimeout(() => { kill(); process.exit(2) }, 240000)
const report = { screens: [], routes: [], flows: [], exceptions: [] }
let ws
try {
  let port
  for (let n = 0; n < 150 && !port; n++) { await pause(100); try { port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) } catch { /* starting */ } }
  if (!port) throw new Error('Chrome did not start')
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }) })
  let counter = 0; const pending = new Map()
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id) }; if (m.method === 'Runtime.exceptionThrown') report.exceptions.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text) })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++counter; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout ${method}`)) }, 30000); pending.set(id, m => { clearTimeout(timer); if (m.error) reject(new Error(m.error.message)); else resolve(m.result) }); ws.send(JSON.stringify({ id, method, params, sessionId })) })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const S = (m, p) => send(m, p, sessionId)
  const ev = async expression => { const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value }
  await S('Page.enable'); await S('Runtime.enable')
  const until = async (expression, message) => { for (let n = 0; n < 100; n++) { if (await ev(expression)) return; await pause(100) }; throw new Error(`Wait failed: ${message}`) }
  const goto = async route => { await S('Page.navigate', { url: `${base}${route}` }); await until('!!document.querySelector("h1")', route); await pause(400) }
  const size = async (width, height) => { await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }); await pause(250) }
  const shot = async name => { const { data } = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data, 'base64')) }
  const setInput = async (selector, value) => ev(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing input '+${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set; setter.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return true })()`)
  const click = async label => { await ev(`(() => { const el=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}); if(!el) throw Error('Missing button '+${JSON.stringify(label)}); if(el.disabled) throw Error('Disabled button '+${JSON.stringify(label)}); el.click(); return true })()`); await pause(150) }
  const field = async (label, value) => { const selector = await ev(`(() => { const l=[...document.querySelectorAll('dialog label')].find(l=>l.textContent.trim()===${JSON.stringify(label)}); if(!l) throw Error('Missing field label'); return '#'+CSS.escape(l.htmlFor) })()`); await setInput(selector, value) }
  const state = () => ev(`JSON.parse(localStorage.getItem('restosphere.manager.data.v1'))`)
  const login = async (username = 'manager', password = 'Manager@123') => { await setInput('[name=username]', username); await setInput('[name=password]', password); await ev('document.querySelector("form").requestSubmit()'); await pause(400) }
  await size(1366, 900)
  await goto('/staff/login')
  await until('!!document.querySelector("[name=username]")', 'login form')
  await login()
  await until('!!document.querySelector(".m-app")', 'manager workspace')
  const routes = ['operations','reservations','tables','orders','kitchen','employees','shifts','menu','menu/categories','approvals','reports','incidents','notifications','profile']
  for (const width of (process.env.MANAGER_QA_WIDTHS || '1366,768,390,320').split(',').map(Number)) {
    await size(width, width < 600 ? 844 : 900)
    for (const route of routes) {
      await goto(`/staff/manager/${route}`)
      await until('!!document.querySelector(".m-workspace .m-content h1")', route)
      await ev('document.fonts.ready')
      const probe = await ev(`({title:document.querySelector('h1').textContent, overflow:document.documentElement.scrollWidth>innerWidth, contentOverflow:document.querySelector('.m-content').scrollWidth>document.querySelector('.m-content').clientWidth+1, headings:[...document.querySelectorAll('.m-panel-head h2')].map(e=>parseFloat(getComputedStyle(e).fontSize))})`)
      if (probe.overflow || probe.contentOverflow) { await shot('overflow-' + route.replaceAll('/','-') + '-' + width); console.log(await ev(`[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0 && r.right>innerWidth+1}).slice(0,20).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))`)) }
      assert.equal(probe.overflow, false, `${route}: viewport overflow at ${width}`)
      assert.equal(probe.contentOverflow, false, `${route}: content overflow at ${width}`)
      assert.ok(probe.headings.every(value => value >= 15), `${route}: readable panel headings`)
      report.screens.push({route,width,...probe})
      if ([1366,390].includes(width)) await shot(`${route.replaceAll('/','-')}-${width}`)
    }
  }
  await size(1366,900)
  for (const [route, selector] of [['reservations','.m-row-action'],['tables','.m-table-tile'],['orders','.m-order-pulse'],['employees','.m-row-action'],['shifts','.m-shift-cell'],['menu','.m-row-action'],['menu/categories','.m-row-action'],['approvals','.m-row-action'],['incidents','.m-row-action']]) {
    await goto(`/staff/manager/${route}`)
    await ev(`document.querySelector(${JSON.stringify(selector)}).click()`)
    await until('!!document.querySelector("dialog[open]")', `detail/form ${route}`)
    await shot(`dialog-${route.replaceAll('/','-')}`)
    await size(390,844)
    assert.equal(await ev('document.documentElement.scrollWidth>innerWidth'),false, `dialog overflow ${route}`)
    await shot(`dialog-mobile-${route.replaceAll('/','-')}`)
    await size(1366,900)
    report.flows.push(`Detail/form opens: ${route}`)
  }
  await goto('/staff/manager/employees')
  await setInput('.m-search input','NO-MATCH-WORKSPACE-QA')
  assert.ok(await ev('document.body.textContent.includes("Không có dữ liệu phù hợp")'), 'employee search empty state')
  await goto('/staff/manager/orders')
  await ev('document.querySelectorAll(".m-orders-filter")[2].click()')
  assert.equal(await ev('document.querySelectorAll(".m-orders-filter")[2].getAttribute("aria-pressed")'),'true')
  await goto('/staff/manager/reports')
  for(const id of ['dishes','operations','revenue']) {
    await ev(`document.getElementById('tab-${id}').click()`)
    await pause(100)
    assert.equal(await ev(`document.getElementById('report-panel').getAttribute('aria-labelledby')`),`tab-${id}`)
  }
  await setInput('[aria-label="Từ ngày"]','2099-12-31')
  assert.ok(await ev('document.body.textContent.includes("Chọn khoảng ngày hợp lệ")'))
  await goto('/staff/manager/notifications')
  await setInput('[aria-label="Lọc thông báo"]','unread')
  assert.equal(await ev('[...document.querySelectorAll(".m-notification")].every(e=>e.classList.contains("is-unread"))'),true)
  await size(390,844)
  await ev('document.querySelector(".m-menu-button").click()')
  await until('document.querySelector(".m-sidebar").classList.contains("is-open")','mobile navigation')
  report.flows.push('Search empty state; order filter; report tabs and date validation; notification filter; mobile navigation')
  assert.deepEqual(report.exceptions, [], 'Runtime exceptions')
  fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(report,null,2))
  console.log(JSON.stringify({screens:report.screens.length,flows:report.flows,exceptions:report.exceptions},null,2))
} catch(error) {
  fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify({...report,error:String(error)},null,2)); console.error(error); process.exitCode=1
} finally { clearTimeout(guard); ws?.close(); kill() }
