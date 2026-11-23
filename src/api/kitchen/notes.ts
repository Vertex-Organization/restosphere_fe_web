const ALERT_PATTERN =
  /(^|[^\p{L}])(chay|không|khong|kiêng|kieng|dị ứng|di ung|dị ung|di ứng)(?![\p{L}])/u

export function isAlertNote(note: string | undefined | null) {
  return !!note && ALERT_PATTERN.test(note.normalize('NFC').toLowerCase())
}
