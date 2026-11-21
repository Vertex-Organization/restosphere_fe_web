import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

test('login, restore, failed credentials and logout use backend session', async () => {
  const storage = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  const encode = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  const compile = (file) =>
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText
  const client = encode(
    compile('src/api/client.ts').replace('import.meta.env.VITE_API_BASE_URL', 'undefined'),
  )
  const authCode = compile('src/api/auth.ts').replace("'./client'", `'${client}'`)
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options })
    if (url.endsWith('/login'))
      return Response.json({ accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 })
    if (url.endsWith('/me'))
      return Response.json({
        id: 'real-id',
        email: 'user@example.com',
        fullName: 'User',
        role: 'CASHIER',
      })
    return new Response(null, { status: 204 })
  }
  try {
    const auth = await import(encode(authCode))
    await auth.login(' user@example.com ', 'secret')
    assert.equal(auth.getAuthState().user.id, 'real-id')
    assert.deepEqual(JSON.parse(calls[0].body), { email: 'user@example.com', password: 'secret' })
    const restored = await import(encode(authCode + '\n// reload'))
    assert.equal(restored.getAuthState().loading, true)
    await restored.restoreAuth()
    assert.equal(restored.getAuthState().user.role, 'CASHIER')
    let refreshes = 0
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/refresh')) {
        refreshes += 1
        await new Promise((resolve) => setTimeout(resolve, 10))
        return Response.json({ accessToken: 'renewed', refreshToken: 'rotated', expiresIn: 900 })
      }
      if (options.headers.get('Authorization') === 'Bearer access')
        return new Response(null, { status: 401 })
      assert.equal(options.headers.get('Authorization'), 'Bearer renewed')
      return Response.json({ revision: 2 })
    }
    const results = await Promise.all(
      ['admin', 'manager', 'cashier'].map((workspace) =>
        restored.authenticatedRequest(`workspaces/${workspace}`),
      ),
    )
    assert.equal(refreshes, 1, 'concurrent rejected requests share one refresh')
    assert.ok(results.every((result) => result.revision === 2))
    let networkAttempts = 0
    globalThis.fetch = async () => {
      networkAttempts += 1
      if (networkAttempts === 1) throw new TypeError('Failed to fetch')
      return Response.json({ revision: 3 })
    }
    assert.equal((await restored.authenticatedRequest('manager/me')).revision, 3)
    assert.equal(networkAttempts, 2, 'GET retries one transient network failure')
    globalThis.fetch = async () => new Response(null, { status: 204 })
    await restored.logout()
    assert.equal(restored.getAuthState().user, null)
    let writeAttempts = 0
    globalThis.fetch = async () => {
      writeAttempts += 1
      throw new TypeError('Failed to fetch')
    }
    await assert.rejects(restored.login('user@example.com', 'secret'), /Không thể kết nối máy chủ/)
    assert.equal(writeAttempts, 1, 'POST is never retried automatically')
    for (const status of [500, 502, 503, 504]) {
      globalThis.fetch = async () => new Response(null, { status })
      await assert.rejects(
        restored.login('user@example.com', 'secret'),
        /không thể kết nối backend/,
      )
    }
    globalThis.fetch = async () => new Response('<html>Frontend fallback</html>')
    await assert.rejects(restored.login('user@example.com', 'secret'), /dữ liệu không hợp lệ/)
    assert.equal(storage.size, 0)
    globalThis.fetch = async () => new Response(null, { status: 401 })
    await assert.rejects(restored.login('user@example.com', 'wrong'), /Email hoặc mật khẩu/)
    assert.equal(restored.getAuthState().user, null)
  } finally {
    globalThis.fetch = original
  }
})
