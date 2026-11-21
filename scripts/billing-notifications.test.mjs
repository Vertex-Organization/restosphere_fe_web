import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync('src/components/billing/notificationPresentation.ts', 'utf8')
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
}).outputText
const { cashierNotificationPresentation } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
)

test('cashier notifications use the expected presentation for supported kinds', () => {
  assert.deepEqual(cashierNotificationPresentation('PAYMENT_REQUEST'), {
    icon: 'receipt',
    tone: 'primary',
    label: 'Yêu cầu thanh toán',
  })
  assert.deepEqual(cashierNotificationPresentation('TRANSFER_FAILED'), {
    icon: 'xCircle',
    tone: 'danger',
    label: 'Chuyển khoản lỗi',
  })
})

test('an unknown backend notification kind falls back instead of crashing the page', () => {
  assert.deepEqual(cashierNotificationPresentation('CASHIER_NOTICE_V2'), {
    icon: 'bell',
    tone: 'neutral',
    label: 'Thông báo',
  })
})
