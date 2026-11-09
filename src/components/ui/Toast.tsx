import { useEffect } from 'react'
import './Toast.css'

interface ToastProps {
  message: string
  onClose: () => void
  tone?: 'success' | 'info' | 'error'
}

export default function Toast({ message, onClose, tone = 'info' }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className={`sc-toast sc-toast--${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".1" />
        {tone === 'success' ? <path d="m7.5 12 3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 11v6m0-10v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
      </svg>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Đóng thông báo">×</button>
    </div>
  )
}
