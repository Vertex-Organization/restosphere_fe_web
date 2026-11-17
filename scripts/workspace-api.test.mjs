import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

test('production sources do not import fixture datasets or persist business state locally', () => {
  for (const file of fs.readdirSync('src', { recursive: true }).filter(file => /\.(ts|tsx)$/.test(file))) {
    const source = fs.readFileSync(`src/${file}`, 'utf8')
    assert.doesNotMatch(source, /\blocalStorage\b|from\s+['"][^'"]*(?:mockData|mockAccounts|mockService|devEvents|scripts\/fixtures)/, file)
  }
  const shifts = fs.readFileSync('src/pages/manager/ShiftsPage.tsx', 'utf8')
  assert.match(shifts, /const create = .*id: ''/, 'new shifts leave ID allocation to the server')
})

test('workspace adapters send direct commands with the shared authenticated session', async () => {
  const storage = new Map()
  globalThis.sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
  const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  const client = encode(compile('src/api/client.ts').replace('import.meta.env.VITE_API_BASE_URL', 'undefined'))
  const authUrl = encode(compile('src/api/auth.ts').replace("'./client'", `'${client}'`))
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options })
    if (url.endsWith('/login')) return Response.json({ accessToken: 'token', refreshToken: 'refresh', expiresIn: 900 })
    if (url.endsWith('/me')) return Response.json({ id: 'uuid', role: 'ADMIN' })
    if (url.endsWith('/cashier') && options.method !== 'POST') return Response.json({ revision: 1, config: { bank: { bankName: 'Server bank', accountName: 'Restaurant' } } })
    if (options.method === 'POST' && /\/(kitchen|cashier)\/commands$/.test(url)) {
      return Response.json({ data: { revision: 2 }, summary: 'Saved', ref: 'server-id' })
    }
    return Response.json({ revision: options.method === 'POST' ? 2 : 1 })
  }
  try {
    const auth = await import(authUrl)
    await auth.login('admin@example.com', 'password')
    for (const [folder, workspace, name] of [['admin', 'admin', 'adminService'], ['manager', 'manager', 'managerService'], ['kitchen', 'kitchen', 'kitchenService'], ['billing', 'cashier', 'cashierService']]) {
      const module = await import(encode(compile(`src/api/${folder}/service.ts`).replace("'../auth'", `'${authUrl}'`)))
      const service = module[name]
      assert.equal((await service.load()).revision, 1)
      assert.equal(calls.at(-1).url, `/api/v1/workspaces/${workspace}`)
      const command = folder === 'admin' ? { type: 'user.status', id: 'server-user-id', status: 'LOCKED' }
        : folder === 'manager' ? { type: 'notification.read', id: 'server-notification-id' } : { type: 'read-notifications' }
      const wrapped = folder === 'kitchen' || folder === 'billing'
      const result = await (wrapped ? service.execute({ id: 'ignored' }, command) : service.execute(command))
      assert.deepEqual(result, wrapped ? { data: { revision: 2 }, summary: 'Saved', ref: 'server-id' } : { revision: 2 })
      assert.equal(calls.at(-1).url, `/api/v1/workspaces/${workspace}/commands`)
      assert.deepEqual(JSON.parse(calls.at(-1).body), command)
      assert.equal(calls.at(-1).headers.get('Authorization'), 'Bearer token')
      if (folder === 'admin') {
        await service.execute({ type: 'settings.update', settings: { billing: { bankAccount: '123' } } })
        assert.deepEqual(JSON.parse(calls.at(-1).body).settings.billing, {
          bankAccount: '123', bankName: 'Server bank', bankAccountName: 'Restaurant',
        })
      }
    }
  } finally { globalThis.fetch = original }
})
