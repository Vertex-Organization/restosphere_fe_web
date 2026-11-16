// Authenticated responsive QA for the kitchen board. Uses one dedicated
// headless browser profile, captures both tabs, and closes only its own process.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawn } from 'node:child_process'

const base = process.env.KITCHEN_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve('.taste-skill/kitchen-shots')
const profile = path.resolve(`.taste-skill/kitchen-browser-${process.pid}`)
fs.mkdirSync(out, { recursive: true })
fs.mkdirSync(profile, { recursive: true })

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((file) => fs.existsSync(file))
if (!chrome) throw new Error('Chrome/Edge not available')

const portFile = path.join(profile, 'DevToolsActivePort')
const child = spawn(chrome, [
  '--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore', windowsHide: true })
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const kill = () => {
  if (child.exitCode !== null) return
  try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }) }
  catch { child.kill() }
}
const guard = setTimeout(() => { kill(); process.exit(2) }, 300000)
const report = { screens: [], flows: [], exceptions: [] }
let ws

try {
  let port
  for (let count = 0; count < 150 && !port; count += 1) {
    await pause(100)
    try { port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) } catch { /* Chrome is starting. */ }
  }
  if (!port) throw new Error('Chrome did not start')

  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let counter = 0
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id) }
    if (message.method === 'Runtime.exceptionThrown') {
      report.exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
    }
  })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++counter
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout ${method}`)) }, 30000)
    pending.set(id, (message) => {
      clearTimeout(timer)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    })
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
  await S('Page.enable')
  await S('Runtime.enable')

  const until = async (expression, message) => {
    for (let count = 0; count < 100; count += 1) {
      if (await evaluate(expression)) return
      await pause(100)
    }
    throw new Error(`Wait failed: ${message}`)
  }
  const size = async (width, height) => {
    await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
    await pause(180)
  }
  const shot = async (name) => {
    const { data } = await S('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data, 'base64'))
  }
  const setInput = async (selector, value) => evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)

  await size(1440, 900)
  await S('Page.navigate', { url: `${base}/staff/kitchen` })
  await until('location.pathname === "/staff/login" && !!document.querySelector("[name=username]")', 'staff login')
  await setInput('[name=username]', 'kitchen')
  await setInput('[name=password]', '123456')
  await evaluate('document.querySelector("form").requestSubmit()')
  await until('!!document.querySelector(".k-board")', 'kitchen board')
  report.flows.push('Kitchen demo login opens the protected board')

  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [320, 844]]) {
    await size(width, height)
    await evaluate('document.fonts.ready')
    await until(`[...document.images].filter((image) => {
      const rect = image.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
    }).every((image) => image.complete && image.naturalWidth)`, `visible dish images at ${width}`)
    const probe = await evaluate(`(() => {
      const active = document.querySelector('#kitchen-active')
      const ready = document.querySelector('#kitchen-ready')
      const workbench = document.querySelector('#kitchen-active .k-workbench')
      const list = document.querySelector('#kitchen-active .k-order-list')
      const detail = document.querySelector('#kitchen-active .k-dish-detail')
      const firstOrder = document.querySelector('#kitchen-active .k-order-list-item')
      const boardBar = document.querySelector('.k-board-bar')
      const firstFilter = document.querySelector('.k-board-bar .k-chip')
      const tabs = [...document.querySelectorAll('.k-board-tab')]
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        activeVisible: !active.hidden,
        readyHidden: ready.hidden,
        selected: document.querySelector('.k-board-tab[aria-selected=true]')?.textContent.trim(),
        tabHeight: Math.min(...tabs.map((tab) => tab.getBoundingClientRect().height)),
        boardBarHeight: boardBar?.getBoundingClientRect().height,
        commandBarOneRow: Math.abs(tabs[0]?.getBoundingClientRect().top - firstFilter?.getBoundingClientRect().top) < 8,
        columnHeaderCount: document.querySelectorAll('.k-board .k-col-head').length,
        selectedDish: detail?.querySelector('h3')?.textContent.trim(),
        selectedCount: document.querySelectorAll('#kitchen-active .k-order-list-item[aria-pressed=true]').length,
        listStatusCount: document.querySelectorAll('#kitchen-active .k-order-list-item .k-badge').length,
        listItemCount: document.querySelectorAll('#kitchen-active .k-order-list-item').length,
        listItemHeight: firstOrder?.getBoundingClientRect().height,
        listLeft: list?.getBoundingClientRect().left,
        listTop: list?.getBoundingClientRect().top,
        detailLeft: detail?.getBoundingClientRect().left,
        detailTop: detail?.getBoundingClientRect().top,
        workbenchWidth: workbench?.getBoundingClientRect().width,
        listHasSecondaryActions: !!list?.querySelector('.k-btn--danger, a[href*="incidents"]'),
        detailHasSecondaryActions: !!detail?.querySelector('.k-btn--danger, a[href*="incidents"]'),
        broken: [...document.images].filter((image) => {
          const rect = image.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
            && (!image.complete || !image.naturalWidth)
        }).map((image) => image.src),
      }
    })()`)
    assert.equal(probe.overflow, false, `Horizontal overflow at ${width}`)
    assert.equal(probe.activeVisible, true, `Unfinished tab visible at ${width}`)
    assert.equal(probe.readyHidden, true, `Finished tab hidden at ${width}`)
    assert.match(probe.selected, /^Chưa xong/)
    assert.ok(probe.tabHeight >= (width < 760 ? 38 : 34), `Tab target is too short at ${width}`)
    assert.ok(probe.boardBarHeight <= 46, `Board command bar is too tall at ${width}`)
    assert.equal(probe.commandBarOneRow, true, `Tabs and filters are not on one row at ${width}`)
    assert.equal(probe.columnHeaderCount, 0, `Duplicate board column header remains at ${width}`)
    assert.equal(probe.selectedDish, '1 × Bò lúc lắc')
    assert.equal(probe.selectedCount, 1, `Exactly one dish should be selected at ${width}`)
    assert.equal(probe.listStatusCount, probe.listItemCount, `Every list item needs a status at ${width}`)
    assert.ok(probe.listItemHeight >= 88, `Order rows are too small at ${width}`)
    assert.equal(probe.listHasSecondaryActions, false, `Secondary actions leaked into the list at ${width}`)
    assert.equal(probe.detailHasSecondaryActions, true, `Secondary actions missing from detail at ${width}`)
    if (width >= 760) assert.ok(probe.listLeft < probe.detailLeft, `List is not left of detail at ${width}`)
    else assert.ok(probe.listTop < probe.detailTop, `Mobile list is not above detail at ${width}`)
    assert.deepEqual(probe.broken, [], `Broken images at ${width}`)
    await shot(`active-${width}`)

    await evaluate('document.querySelector("#kitchen-tab-ready").click()')
    await pause(100)
    assert.equal(await evaluate('document.querySelector("#kitchen-active").hidden'), true)
    assert.equal(await evaluate('document.querySelector("#kitchen-ready").hidden'), false)
    await until(`[...document.querySelectorAll('#kitchen-ready img')].filter((image) => {
      const rect = image.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
    }).every((image) => image.complete && image.naturalWidth)`, `finished-tab dish images at ${width}`)
    await shot(`ready-${width}`)
    await evaluate('document.querySelector("#kitchen-tab-active").click()')
    report.screens.push({ width, height, ...probe })
  }

  await evaluate(`(() => {
    const tab = document.querySelector('#kitchen-tab-active')
    tab.focus()
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  })()`)
  await pause(50)
  assert.equal(await evaluate('document.activeElement.id'), 'kitchen-tab-ready')
  assert.equal(await evaluate('document.querySelector("#kitchen-ready").hidden'), false)
  report.flows.push('Tabs switch by pointer and arrow key with one panel visible')

  await size(1440, 900)
  await evaluate('document.querySelector("#kitchen-tab-active").click()')
  await evaluate('document.querySelectorAll("#kitchen-active .k-order-list-item")[1].click()')
  assert.equal(await evaluate('document.querySelector("#kitchen-active .k-dish-detail h3").textContent.trim()'), '1 × Lẩu Thái')
  assert.equal(await evaluate('document.querySelectorAll("#kitchen-active .k-order-list-item[aria-pressed=true]").length'), 1)
  await shot('selected-second-dish')
  report.flows.push('Selecting an order updates the right-hand detail while keeping one selected row')

  await evaluate('document.querySelector("#kitchen-active .k-dish-detail .k-btn--primary").click()')
  await until('!!document.querySelector("dialog.k-confirm-dialog[open]")', 'start confirmation dialog')
  const startConfirm = await evaluate(`(() => {
    const dialog = document.querySelector('dialog.k-confirm-dialog[open]')
    return {
      title: dialog.querySelector('h2')?.textContent.trim(),
      content: dialog.textContent.replace(/\\s+/g, ' ').trim(),
      status: document.querySelector('#kitchen-active .k-order-list-item[aria-pressed=true] .k-badge')?.textContent.trim(),
      confirm: dialog.querySelector('button[type=submit]')?.textContent.trim(),
    }
  })()`)
  assert.equal(startConfirm.title, 'Xác nhận bắt đầu món?')
  assert.match(startConfirm.content, /Bàn A03/)
  assert.match(startConfirm.content, /1 × Lẩu Thái/)
  assert.equal(startConfirm.status, 'Mới nhận')
  assert.equal(startConfirm.confirm, 'Xác nhận bắt đầu')
  await shot('confirm-start')
  await evaluate('document.querySelector("dialog.k-confirm-dialog .k-confirm-actions button[type=button]").click()')
  await until('!document.querySelector("dialog.k-confirm-dialog[open]")', 'close start confirmation dialog')
  report.flows.push('Starting a dish requires confirmation and opening the dialog does not change its status')

  await evaluate('document.querySelectorAll("#kitchen-active .k-order-list-item")[0].click()')
  assert.equal(await evaluate('document.querySelector("#kitchen-active .k-dish-detail h3").textContent.trim()'), '1 × Bò lúc lắc')
  await evaluate('document.querySelector("#kitchen-active .k-dish-detail .k-btn--primary").click()')
  await until('!!document.querySelector("dialog.k-confirm-dialog[open]")', 'complete confirmation dialog')
  const completeConfirm = await evaluate(`(() => {
    const dialog = document.querySelector('dialog.k-confirm-dialog[open]')
    return {
      title: dialog.querySelector('h2')?.textContent.trim(),
      content: dialog.textContent.replace(/\\s+/g, ' ').trim(),
      status: document.querySelector('#kitchen-active .k-order-list-item[aria-pressed=true] .k-badge')?.textContent.trim(),
      confirm: dialog.querySelector('button[type=submit]')?.textContent.trim(),
    }
  })()`)
  assert.equal(completeConfirm.title, 'Xác nhận hoàn thành món?')
  assert.match(completeConfirm.content, /Bàn A03/)
  assert.match(completeConfirm.content, /1 × Bò lúc lắc/)
  assert.equal(completeConfirm.status, 'Đang chế biến')
  assert.equal(completeConfirm.confirm, 'Xác nhận đã xong')
  await shot('confirm-complete')
  await evaluate('document.querySelector("dialog.k-confirm-dialog .k-confirm-actions button[type=button]").click()')
  await until('!document.querySelector("dialog.k-confirm-dialog[open]")', 'close complete confirmation dialog')
  report.flows.push('Completing a dish requires confirmation and opening the dialog does not change its status')

  assert.equal(await evaluate('!!document.querySelector("#kitchen-active a[href*=\\"/tickets/\\"]")'), false)
  await evaluate('document.querySelector("a[href=\\"/staff/kitchen/history\\"]").click()')
  await until('!!document.querySelector(".k-history")', 'kitchen history page')
  await evaluate(`(() => {
    const link = [...document.querySelectorAll('.k-history a[href*="/tickets/"]')].find((node) => node.textContent.includes('#K101'))
    if (!link) throw new Error('K101 history link not found')
    link.click()
  })()`)
  await until('!!document.querySelector(".k-ticket-page")', 'ticket detail page')
  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [320, 844]]) {
    await size(width, height)
    const ticketProbe = await evaluate(`(() => {
      const rows = [...document.querySelectorAll('.k-ticket-item')]
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        title: document.querySelector('.k-ticket-title-row h2')?.textContent.trim(),
        rowCount: rows.length,
        statuses: rows.map((row) => row.querySelector('.k-badge')?.textContent.trim()),
        minRowHeight: Math.min(...rows.map((row) => row.getBoundingClientRect().height)),
        statusDetailCount: document.querySelectorAll('.k-ticket-item-state-detail').length,
        actionRowCount: rows.filter((row) => row.querySelector('.k-ticket-item-actions')).length,
        primaryActions: document.querySelectorAll('.k-ticket-item-actions .k-btn--primary').length,
        historyCollapsed: !document.querySelector('.k-ticket-history').open,
        historySummaryHeight: document.querySelector('.k-ticket-history summary')?.getBoundingClientRect().height,
      }
    })()`)
    assert.equal(ticketProbe.overflow, false, `Ticket detail overflows at ${width}`)
    assert.equal(ticketProbe.title, 'Bàn A03')
    assert.equal(ticketProbe.rowCount, 3)
    assert.deepEqual(ticketProbe.statuses, ['Đang chế biến', 'Mới nhận', 'Đã xong'])
    assert.equal(ticketProbe.statusDetailCount, ticketProbe.rowCount)
    assert.equal(ticketProbe.actionRowCount, ticketProbe.rowCount)
    assert.equal(ticketProbe.primaryActions, 2)
    assert.ok(ticketProbe.minRowHeight >= (width < 760 ? 140 : 100), `Ticket rows are too small at ${width}`)
    assert.equal(ticketProbe.historyCollapsed, true)
    assert.ok(ticketProbe.historySummaryHeight >= 44, `History target is too short at ${width}`)
    await shot(`ticket-${width}`)
    report.screens.push({ page: 'ticket', width, height, ...ticketProbe })
  }
  report.flows.push('Live board has no ticket-detail detour; ticket audit remains reachable from kitchen history')
  report.flows.push('Ticket detail prioritizes unfinished dishes, keeps actions on each row, and collapses history')
  assert.deepEqual(report.exceptions, [], 'Runtime exceptions')

  fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  fs.writeFileSync(path.join(out, 'qa-results.json'), JSON.stringify({ ...report, error: String(error) }, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  clearTimeout(guard)
  ws?.close()
  kill()
}
