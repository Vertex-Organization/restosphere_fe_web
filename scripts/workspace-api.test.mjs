import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

test('production sources do not import fixture datasets or persist business state locally', () => {
  for (const file of fs
    .readdirSync('src', { recursive: true })
    .filter((file) => /\.(ts|tsx)$/.test(file))) {
    const source = fs.readFileSync(`src/${file}`, 'utf8')
    assert.doesNotMatch(
      source,
      /\blocalStorage\b|from\s+['"][^'"]*(?:mockData|mockAccounts|mockService|devEvents|scripts\/fixtures)/,
      file,
    )
  }
  const shifts = fs.readFileSync('src/pages/manager/ShiftsPage.tsx', 'utf8')
  assert.match(
    shifts,
    /const create = [\s\S]*?id: ''/,
    'new shifts leave ID allocation to the server',
  )
})

test('role services call their REST endpoints through the shared authenticated client', () => {
  const expected = {
    'src/api/admin/service.ts': [
      'admin/employees',
      'admin/restaurant',
      'admin/settings',
      'admin/audit-logs',
    ],
    'src/api/kitchen/service.ts': [
      'kitchen/orders',
      'kitchen/items/start',
      'kitchen/items/complete',
      'kitchen/menu-items',
      'kitchen/incidents',
      'kitchen/notifications',
    ],
    'src/api/billing/service.ts': [
      'cashier/bills',
      'cashier/payments',
      'cashier/shifts',
      'cashier/requests',
      'cashier/notifications',
    ],
    'src/api/manager/service.ts': [
      'manager/approvals',
      'manager/shifts',
      'manager/employees',
      'manager/reservations',
      'manager/incidents',
      'manager/notifications',
    ],
  }
  for (const [file, paths] of Object.entries(expected)) {
    const source = fs.readFileSync(file, 'utf8')
    assert.match(source, /authenticatedRequest/, `${file} must use the authenticated client`)
    for (const path of paths) assert.ok(source.includes(path), `${file} must call ${path}`)
  }
})
