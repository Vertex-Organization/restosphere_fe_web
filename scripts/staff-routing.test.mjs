import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Compile only the pure modules in memory; no extra test/runtime dependency.
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

const router = await import(moduleUrl('src/routes/staffRouter.ts'))
const accounts = await import(moduleUrl('src/api/staff/mockAccounts.ts'))
const kitchen = await import(moduleUrl('src/api/kitchen/mockData.ts'))
const billing = await import(moduleUrl('src/api/billing/mockData.ts'))
const manager = await import(moduleUrl('src/api/manager/mockData.ts'))

test('every web role has its workspace under /staff; waiters have none', () => {
  assert.equal(router.homePathFor('ADMIN'), '/staff/admin')
  assert.equal(router.homePathFor('MANAGER'), '/staff/manager')
  assert.equal(router.homePathFor('CASHIER'), '/staff/cashier')
  assert.equal(router.homePathFor('KITCHEN'), '/staff/kitchen')
  assert.equal(router.homePathFor('WAITER'), null)
  assert.equal(router.workspaceOf('/staff/kitchen/tickets/o-1?x=1'), 'KITCHEN')
  assert.equal(router.workspaceOf('/staff/kitchenette'), null)
  assert.equal(router.workspaceOf('/staff/login'), null)
})

test('after sign-in the requested page opens only when it is in the role\'s own workspace', () => {
  assert.equal(router.landingPath('KITCHEN', '/staff/kitchen/history'), '/staff/kitchen/history')
  assert.equal(router.landingPath('KITCHEN', '/staff/kitchen/tickets/o-1?from=x'), '/staff/kitchen/tickets/o-1?from=x')
  assert.equal(router.landingPath('KITCHEN', '/staff/cashier'), '/staff/kitchen')
  assert.equal(router.landingPath('MANAGER', null), '/staff/manager')
  for (const unsafe of ['//evil.example/staff/kitchen', 'https://evil.example', '/\\evil.example', 'staff/kitchen']) {
    assert.equal(router.landingPath('KITCHEN', unsafe), '/staff/kitchen', unsafe)
  }
  assert.equal(router.landingPath('WAITER', '/staff/kitchen'), null)
  assert.equal(router.loginPath('/staff/manager/orders?id=1'), '/staff/login?next=%2Fstaff%2Fmanager%2Forders%3Fid%3D1')
})

test('old module URLs move under /staff, keeping query, hash and the next target', () => {
  assert.equal(router.legacyStaffUrl('/kitchen'), '/staff/kitchen')
  assert.equal(router.legacyStaffUrl('/kitchen/tickets/o-K101?x=1#top'), '/staff/kitchen/tickets/o-K101?x=1#top')
  assert.equal(router.legacyStaffUrl('/manager/approvals?id=PD-021'), '/staff/manager/approvals?id=PD-021')
  assert.equal(router.legacyStaffUrl('/admin/users'), '/staff/admin/users')
  assert.equal(router.legacyStaffUrl('/cashier/login'), '/staff/login')
  assert.equal(router.legacyStaffUrl('/manager/login?next=%2Fmanager%2Forders'), '/staff/login?next=%2Fstaff%2Fmanager%2Forders')
  // Static files, current URLs and customer pages are left alone.
  for (const url of ['/kitchen/menu/shrimp.jpg', '/kitchen/restosphere-logo-560.png', '/staff/kitchen', '/', '/vi/menu', '/kitchenware']) {
    assert.equal(router.legacyStaffUrl(url), null, url)
  }
})

test('demo sign-in accepts username or email and never exposes the password', () => {
  const admin = accounts.findDemoAccount('ADMIN@restosphere.test ', 'Admin@123')
  assert.equal(admin?.role, 'ADMIN')
  assert.equal(accounts.findDemoAccount('admin', 'Admin@123')?.id, admin.id)
  assert.equal(accounts.findDemoAccount('Kitchen', '123456')?.id, 'NV010')
  assert.equal(accounts.findDemoAccount('kitchen', 'wrong'), null)
  assert.equal(accounts.findDemoAccount('nobody', '123456'), null)
  assert.ok(!('password' in admin))
  assert.ok(!('password' in accounts.findDemoAccountById('NV020')))
  assert.equal(accounts.DEMO_SHORTCUTS.length, Object.keys(router.WORKSPACES).length)
})

test('every web account has a profile in its workspace data (same employee id)', () => {
  const now = new Date('2026-11-14T12:00:00+07:00')
  const kitchenStaff = kitchen.createSeedData(now).staff
  const cashierStaff = billing.createSeedData(now).staff
  for (const account of accounts.DEMO_ACCOUNTS) {
    if (account.role === 'KITCHEN') assert.ok(kitchenStaff.some((s) => s.id === account.id && s.role === 'KITCHEN'), account.username)
    if (account.role === 'CASHIER') assert.ok(cashierStaff.some((s) => s.id === account.id && s.role === 'CASHIER'), account.username)
    if (account.role === 'MANAGER') assert.ok(manager.MOCK_USERS.some((u) => u.id === account.id && u.role === 'MANAGER'), account.username)
  }
})
