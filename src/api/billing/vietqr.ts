// VietQR payload in the EMVCo merchant-presented format used by NAPAS 247 "chuyển nhanh đến tài khoản".
// Built locally so no account detail is sent to a third-party image service.

export interface VietQrInput {
  /** 6-digit napas BIN of the receiving bank. */
  bin: string
  accountNumber: string
  /** Whole VND; omitted for a QR where the payer types the amount. */
  amount?: number
  /** Transfer note shown to the payer, up to 25 characters of plain ASCII. */
  note?: string
}

const BIN = /^\d{6}$/
const ACCOUNT = /^\d{6,19}$/
const NAPAS_GUID = 'A000000727'
const TO_ACCOUNT_SERVICE = 'QRIBFTTA'
const MAX_NOTE = 25

/** One EMV TLV field: 2-digit id, 2-digit length, value. */
function field(id: string, value: string) {
  if (value.length > 99) throw new Error(`VietQR field ${id} is longer than 99 characters`)
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) over the whole payload including the "6304" tag. */
export function crc16(text: string) {
  let crc = 0xffff
  for (let i = 0; i < text.length; i += 1) {
    crc ^= text.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Plain ASCII note (accents removed) so every banking app shows it the same way. */
export function plainNote(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOTE)
}

/** Returns null when the BIN or account is not usable, so callers show nothing instead of a bad QR. */
export function buildVietQr({ bin, accountNumber, amount, note }: VietQrInput): string | null {
  const account = accountNumber.replace(/\s/g, '')
  if (!BIN.test(bin) || !ACCOUNT.test(account)) return null
  if (amount !== undefined && (!Number.isSafeInteger(amount) || amount <= 0)) return null

  const beneficiary = field('00', bin) + field('01', account)
  const merchant =
    field('00', NAPAS_GUID) + field('01', beneficiary) + field('02', TO_ACCOUNT_SERVICE)
  const cleanNote = note ? plainNote(note) : ''

  const body =
    field('00', '01') +
    field('01', amount === undefined ? '11' : '12') +
    field('38', merchant) +
    field('53', '704') +
    (amount === undefined ? '' : field('54', String(amount))) +
    field('58', 'VN') +
    (cleanNote ? field('62', field('08', cleanNote)) : '') +
    '6304'
  return body + crc16(body)
}
