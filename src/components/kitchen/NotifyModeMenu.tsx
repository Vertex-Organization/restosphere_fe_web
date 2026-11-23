import { useEffect, useRef, useState } from 'react'
import { NOTIFY_MODES, type NotifyMode } from '../../api/kitchen/alerts'
import { Icon, type IconName } from './Icon'
import type { KitchenSound } from './notifySound'
import type { SoundPreview } from './notifyPreviews'

const NOTIFY_OPTIONS: Record<NotifyMode, { label: string; icon: IconName }> = {
  silent: { label: 'Im lặng', icon: 'volumeOff' },
  vibrate: { label: 'Rung', icon: 'vibrate' },
  sound: { label: 'Âm thanh', icon: 'volume' },
}

interface Props {
  notifyMode: NotifyMode
  setNotifyMode: (mode: NotifyMode) => void
  notifyVolume: number
  setNotifyVolume: (volume: number) => void
  previewSound: (sound: KitchenSound) => void
  previews: SoundPreview[]
}

export function NotifyModeMenu({
  notifyMode,
  setNotifyMode,
  notifyVolume,
  setNotifyVolume,
  previewSound,
  previews,
}: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = NOTIFY_OPTIONS[notifyMode]
  return (
    <div className="k-account k-notify" ref={root}>
      <button
        type="button"
        className="k-bell"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Chế độ thông báo: ${current.label}`}
        title={`Chế độ thông báo: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={current.icon} size={18} />
      </button>
      {open && (
        <div className="k-menu k-notify-menu">
          <div role="menu" aria-label="Chế độ thông báo">
            {NOTIFY_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                role="menuitemradio"
                aria-checked={mode === notifyMode}
                className="k-menu-item"
                onClick={() => {
                  setNotifyMode(mode)
                  setOpen(false)
                }}
              >
                <Icon name={NOTIFY_OPTIONS[mode].icon} />
                {NOTIFY_OPTIONS[mode].label}
                {mode === notifyMode && <Icon name="check" size={14} className="k-notify-check" />}
              </button>
            ))}
          </div>
          <div className="k-notify-volume">
            <label htmlFor="k-notify-volume">
              Âm lượng <span>{Math.round(notifyVolume * 100)}%</span>
            </label>
            <input
              id="k-notify-volume"
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(notifyVolume * 100)}
              onChange={(event) => setNotifyVolume(Number(event.target.value) / 100)}
            />
          </div>
          <div className="k-notify-preview" role="group" aria-label="Nghe thử">
            {previews.map((preview) => (
              <button
                key={preview.sound}
                type="button"
                className="k-btn k-notify-test"
                aria-label={`Nghe thử: ${preview.label}`}
                onClick={() => previewSound(preview.sound)}
              >
                {preview.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
