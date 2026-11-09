import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

export default function MenuOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog className="sc-menu-overlay" ref={dialogRef} aria-labelledby={headingId} onKeyDownCapture={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() } }} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose() } }}>
      <header><h2 id={headingId}>{title}</h2><button type="button" aria-label={`Đóng ${title.toLocaleLowerCase('vi-VN')}`} onClick={onClose}>×</button></header>
      <div className="sc-overlay-content">{children}</div>
    </dialog>
  )
}
