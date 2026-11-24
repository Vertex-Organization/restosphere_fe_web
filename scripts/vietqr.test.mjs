import assert from 'node:assert/strict'
import test from 'node:test'
import { buildVietQr, crc16, plainNote } from '../src/api/billing/vietqr.ts'

/** Splits an EMV payload into its top-level TLV fields. */
function parse(payload) {
  const fields = []
  for (let i = 0; i < payload.length; ) {
    const id = payload.slice(i, i + 2)
    const length = Number(payload.slice(i + 2, i + 4))
    fields.push({ id, value: payload.slice(i + 4, i + 4 + length) })
    i += 4 + length
  }
  return fields
}
const get = (fields, id) => fields.find((f) => f.id === id)?.value

test('crc16 matches the CRC-16/CCITT-FALSE reference vector', () => {
  assert.equal(crc16('123456789'), '29B1')
  assert.equal(crc16(''), 'FFFF')
})

test('the payload ends with a CRC that verifies over everything before it', () => {
  for (const input of [
    { bin: '970436', accountNumber: '0011004123456' },
    { bin: '970436', accountNumber: '0011004123456', amount: 150000, note: 'Coc RS-241125-001' },
    { bin: '970422', accountNumber: '123456789', amount: 1, note: 'Thanh toan ban A01' },
  ]) {
    const payload = buildVietQr(input)
    assert.ok(payload)
    assert.equal(payload.slice(-8, -4), '6304', 'CRC tag sits right before the checksum')
    assert.equal(payload.slice(-4), crc16(payload.slice(0, -4)))
  }
})

test('fields follow the NAPAS 247 layout', () => {
  const payload = buildVietQr({
    bin: '970436',
    accountNumber: '0011004123456',
    amount: 150000,
    note: 'Coc RS241125001',
  })
  const top = parse(payload)
  assert.equal(get(top, '00'), '01', 'payload format indicator')
  assert.equal(get(top, '01'), '12', 'dynamic QR because an amount is set')
  assert.equal(get(top, '53'), '704', 'currency VND')
  assert.equal(get(top, '54'), '150000')
  assert.equal(get(top, '58'), 'VN')

  const merchant = parse(get(top, '38'))
  assert.equal(get(merchant, '00'), 'A000000727', 'NAPAS application id')
  assert.equal(get(merchant, '02'), 'QRIBFTTA', 'transfer to account')
  const beneficiary = parse(get(merchant, '01'))
  assert.equal(get(beneficiary, '00'), '970436')
  assert.equal(get(beneficiary, '01'), '0011004123456')

  assert.equal(get(parse(get(top, '62')), '08'), 'Coc RS241125001')
})

test('without an amount the QR is static and carries no amount field', () => {
  const top = parse(buildVietQr({ bin: '970436', accountNumber: '0011004123456' }))
  assert.equal(get(top, '01'), '11')
  assert.equal(get(top, '54'), undefined)
  assert.equal(get(top, '62'), undefined)
})

test('spaces in the account are ignored and the note becomes plain ASCII within 25 characters', () => {
  const spaced = buildVietQr({ bin: '970436', accountNumber: '0011 0041 23456' })
  assert.equal(spaced, buildVietQr({ bin: '970436', accountNumber: '0011004123456' }))
  assert.equal(plainNote('Thanh toán bàn Đ01 – cọc!'), 'Thanh toan ban D01 coc')
  assert.equal(plainNote('x'.repeat(40)).length, 25)
})

test('an unusable BIN, account or amount gives no QR instead of a wrong one', () => {
  assert.equal(buildVietQr({ bin: '97043', accountNumber: '0011004123456' }), null)
  assert.equal(buildVietQr({ bin: '9704x6', accountNumber: '0011004123456' }), null)
  assert.equal(buildVietQr({ bin: '970436', accountNumber: '123' }), null)
  assert.equal(buildVietQr({ bin: '970436', accountNumber: '12345678901234567890' }), null)
  assert.equal(buildVietQr({ bin: '970436', accountNumber: '0011004123456', amount: 0 }), null)
  assert.equal(buildVietQr({ bin: '970436', accountNumber: '0011004123456', amount: 1.5 }), null)
})
