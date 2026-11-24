import { QRCodeSVG } from 'qrcode.react'

/** Draws a QR locally, so payment content never leaves the browser. */
export function QrCode({ value, label, size = 160 }: { value: string; label: string; size?: number }) {
  return (
    <QRCodeSVG
      className="c-qr"
      value={value}
      size={size}
      level="M"
      marginSize={2}
      role="img"
      aria-label={label}
    />
  )
}
