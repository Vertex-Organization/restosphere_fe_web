const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require(process.argv[2] || 'playwright')

const origin = process.env.AUTH_TEST_ORIGIN || 'http://localhost:5173'
const email = process.env.AUTH_TEST_EMAIL
const password = process.env.AUTH_TEST_PASSWORD
const sessionKey = 'sea-crown.auth'
const checks = []
const errors = []
const responses = []

function check(name) {
  checks.push(name)
  console.log(`PASS ${name}`)
}

async function fillLogin(page, address = email, secret = password) {
  await page.getByLabel('Email', { exact: true }).fill(address)
  await page.getByLabel('Mật khẩu', { exact: true }).fill(secret)
}

async function account(page) {
  await page.getByRole('button', { name: /^Tài khoản / }).waitFor()
}

async function viewportFits(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow')
}

async function verifyToast(page) {
  const toast = page.locator('.sc-toast--success')
  await toast.waitFor()
  assert.match(await toast.innerText(), /Đăng nhập thành công/)
  const box = await toast.boundingBox()
  const width = page.viewportSize().width
  assert(box && Math.abs(box.x + box.width / 2 - width / 2) < 2 && box.y >= 10 && box.y <= 24)
  await viewportFits(page)
}

async function signedOut(page) {
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).waitFor()
  assert(await page.evaluate((key) => sessionStorage.getItem(key) === null, sessionKey))
}

async function mockSession(context, expired = false) {
  await context.addInitScript(({ key, expired }) => {
    if (location.origin === 'null') return
    sessionStorage.setItem(key, JSON.stringify({
      accessToken: 'browser-test-access', refreshToken: 'browser-test-refresh',
      expiresAt: expired ? 0 : Date.now() + 3600000,
    }))
  }, { key: sessionKey, expired })
}

;(async () => {
  assert(email && password, 'Set AUTH_TEST_EMAIL and AUTH_TEST_PASSWORD for a local test account.')
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  })
  const contexts = []
  async function context(options = {}) {
    const result = await browser.newContext({ reducedMotion: 'reduce', locale: 'vi-VN', ...options })
    result.on('page', (page) => {
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        const url = new URL(response.url())
        if (url.pathname.startsWith('/api/v1/auth/')) responses.push({ path: url.pathname, status: response.status() })
      })
    })
    contexts.push(result)
    return result
  }

  try {
    const live = await context({ viewport: { width: 1440, height: 1000 } })
    const page = await live.newPage()
    let loginRequests = 0
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/v1/auth/login') loginRequests += 1
    })
    await page.goto(`${origin}/auth/login`)
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    assert.equal(await page.getByText('Vui lòng nhập email', { exact: true }).count(), 1)
    assert.equal(loginRequests, 0)
    await fillLogin(page, 'invalid-email', 'not-a-real-password')
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    assert.equal(await page.getByText('Địa chỉ email không hợp lệ', { exact: true }).count(), 1)
    assert.equal(loginRequests, 0)
    check('empty/invalid email validation does not call API')

    await fillLogin(page, 'browser-test-missing@restosphere.invalid', 'not-a-real-password')
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: 'Email hoặc mật khẩu không đúng.' }).waitFor()
    assert(new URL(page.url()).pathname === '/auth/login')
    assert(await page.getByRole('button', { name: 'Đăng nhập', exact: true }).isEnabled())
    check('real backend rejects incorrect credentials with useful feedback')

    await fillLogin(page)
    await page.locator('form').evaluate((form) => { form.requestSubmit(); form.requestSubmit() })
    await page.waitForURL('**/menu/combo')
    await account(page)
    assert.equal(loginRequests, 2, 'Only one request per submission, including the failed login above')
    await verifyToast(page)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(__dirname, 'login-success-desktop.png') })
    assert(await page.evaluate((secret) => !sessionStorage.getItem('sea-crown.auth').includes(secret), password))
    assert(await page.evaluate(() => sessionStorage.getItem('sea-crown.login-success') === null))
    check('real login + /me, duplicate submit prevention, redirect and centered success toast')

    await page.reload()
    await account(page)
    assert.equal(await page.locator('.sc-toast').count(), 0, 'Success notice must not replay on reload')
    check('reload restores authenticated user without replaying the toast')

    const beforeRefresh = await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)).refreshToken, sessionKey)
    await page.evaluate((key) => {
      const session = JSON.parse(sessionStorage.getItem(key))
      session.expiresAt = 0
      sessionStorage.setItem(key, JSON.stringify(session))
    }, sessionKey)
    let refreshed = responses.filter((item) => item.path.endsWith('/refresh')).length
    await page.reload()
    await account(page)
    assert.equal(responses.filter((item) => item.path.endsWith('/refresh')).length, refreshed + 1)
    assert(await page.evaluate(({ key, previous }) => JSON.parse(sessionStorage.getItem(key)).refreshToken !== previous, { key: sessionKey, previous: beforeRefresh }))
    check('real expired session refreshes once and stores the rotated refresh token')

    await page.evaluate((key) => {
      const session = JSON.parse(sessionStorage.getItem(key))
      session.accessToken = 'invalid-browser-test-access'
      session.expiresAt = Date.now() + 3600000
      sessionStorage.setItem(key, JSON.stringify(session))
    }, sessionKey)
    refreshed = responses.filter((item) => item.path.endsWith('/refresh')).length
    await page.reload()
    await account(page)
    assert.equal(responses.filter((item) => item.path.endsWith('/refresh')).length, refreshed + 1)
    check('real /me 401 refreshes and retries successfully once')

    for (const [width, height] of [[360, 800], [390, 844], [768, 1024], [1024, 900], [1440, 1000], [1920, 1080]]) {
      await page.setViewportSize({ width, height })
      await viewportFits(page)
      await page.getByRole('button', { name: /^Tài khoản / }).click()
      const panel = await page.locator('#sc-account-panel').boundingBox()
      assert(panel && panel.x >= 0 && panel.x + panel.width <= width)
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('#sc-account-panel').count(), 0)
    }
    check('authenticated header and account dropdown fit six viewport sizes; Escape closes it')

    await page.route('**/api/v1/auth/logout', (route) => route.fulfill({ status: 503, body: '{}' }))
    await page.getByRole('button', { name: /^Tài khoản / }).click()
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
    await page.locator('.sc-toast--error').waitFor()
    await account(page)
    assert(await page.evaluate((key) => !!sessionStorage.getItem(key), sessionKey))
    check('failed logout reports an error and preserves the session (simulated)')
    await page.unroute('**/api/v1/auth/logout')
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
    await signedOut(page)
    assert(responses.some((item) => item.path.endsWith('/logout') && item.status === 204))
    check('real logout revokes refresh token and clears the browser session')

    const mobile = await context({ viewport: { width: 390, height: 844 } })
    const mobilePage = await mobile.newPage()
    await mobilePage.goto(`${origin}/auth/login`)
    await fillLogin(mobilePage)
    await mobilePage.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    await mobilePage.waitForURL('**/menu/combo')
    await account(mobilePage)
    await verifyToast(mobilePage)
    await mobilePage.evaluate(() => document.fonts.ready)
    await mobilePage.screenshot({ path: path.join(__dirname, 'login-success-mobile.png') })
    await mobilePage.locator('.sc-toast').waitFor({ state: 'hidden', timeout: 7000 })
    await mobilePage.getByRole('button', { name: /^Tài khoản / }).click()
    await mobilePage.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
    await mobilePage.getByRole('button', { name: /^Tài khoản / }).waitFor({ state: 'hidden' })
    assert(await mobilePage.evaluate((key) => sessionStorage.getItem(key) === null, sessionKey))
    check('real mobile login, top toast auto-dismiss after five seconds, and logout')

    const offline = await context()
    const offlinePage = await offline.newPage()
    await offlinePage.route('**/api/v1/auth/login', (route) => route.abort('connectionrefused'))
    await offlinePage.goto(`${origin}/auth/login`)
    await fillLogin(offlinePage, 'browser-test@restosphere.invalid', 'not-a-real-password')
    await offlinePage.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    await offlinePage.getByRole('alert').filter({ hasText: 'Không thể kết nối máy chủ.' }).waitFor()
    assert(await offlinePage.getByRole('button', { name: 'Đăng nhập', exact: true }).isEnabled())
    check('network failure displays an error and releases the loading state (simulated)')

    const expired = await context()
    await mockSession(expired, true)
    let refreshAttempts = 0
    await expired.route('**/api/v1/auth/refresh', (route) => {
      refreshAttempts += 1
      return route.fulfill({ status: 401, body: '{}' })
    })
    const expiredPage = await expired.newPage()
    await expiredPage.goto(`${origin}/menu/combo`, { waitUntil: 'networkidle' })
    await signedOut(expiredPage)
    assert.equal(refreshAttempts, 1)
    check('invalid refresh token clears session without a retry loop (simulated)')

    const rejected = await context()
    await mockSession(rejected)
    let meAttempts = 0
    refreshAttempts = 0
    await rejected.route('**/api/v1/auth/me', (route) => { meAttempts += 1; return route.fulfill({ status: 401, body: '{}' }) })
    await rejected.route('**/api/v1/auth/refresh', (route) => {
      refreshAttempts += 1
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'new-browser-test-access', refreshToken: 'new-browser-test-refresh', tokenType: 'Bearer', expiresIn: 900 }) })
    })
    const rejectedPage = await rejected.newPage()
    await rejectedPage.goto(`${origin}/menu/combo`, { waitUntil: 'networkidle' })
    await signedOut(rejectedPage)
    assert.equal(refreshAttempts, 1)
    assert.equal(meAttempts, 2)
    check('repeated /me 401 stops after one refresh and one retry (simulated)')

    const unavailable = await context()
    await mockSession(unavailable, true)
    await unavailable.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 503, body: '{}' }))
    const unavailablePage = await unavailable.newPage()
    await unavailablePage.goto(`${origin}/menu/combo`, { waitUntil: 'networkidle' })
    await unavailablePage.getByRole('link', { name: 'Đăng nhập', exact: true }).waitFor()
    assert(await unavailablePage.evaluate((key) => !!sessionStorage.getItem(key), sessionKey))
    check('temporary refresh failure preserves session and releases loading state (simulated)')

    assert.deepEqual(errors, [], 'No browser runtime errors')
    await fs.writeFile(path.join(__dirname, 'verification.json'), JSON.stringify({
      checkedAt: new Date().toISOString(), origin, checks, responses, errors,
      note: 'Live backend for login/me/refresh/logout; failure injection is labeled simulated. Credentials and tokens are never written to this report.',
    }, null, 2) + '\n')
    console.log(`Verified ${checks.length} auth workflows.`)
  } finally {
    await Promise.all(contexts.map((item) => item.close()))
    await browser.close()
  }
})().catch((error) => { console.error(error); process.exitCode = 1 })
