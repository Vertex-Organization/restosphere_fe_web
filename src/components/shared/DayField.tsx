import { dayKeyBefore, formatDayKey } from '../kitchen/format'
import './shared.css'

export function DayField({
  value,
  now,
  onChange,
  label = 'Ngày',
}: {
  value: string
  now?: number
  onChange: (day: string) => void
  label?: string
}) {
  const today = now === undefined ? undefined : dayKeyBefore(now, 0)
  const yesterday = now === undefined ? undefined : dayKeyBefore(now, 1)
  return (
    <div className="k-inline-field">
      <label className="k-inline-field">
        <span className="k-label">{label}</span>
        <span className="k-datefield">
          <span className="k-datefield-text">{formatDayKey(value)}</span>
          <input
            className="k-datefield-input"
            type="date"
            lang="vi-VN"
            value={value}
            max={today}
            onChange={(event) => onChange(event.target.value)}
            onClick={(event) => {
              try {
                event.currentTarget.showPicker()
              } catch {
                return
              }
            }}
          />
        </span>
      </label>
      {today && yesterday && (
        <>
          <button type="button" className="k-chip k-chip--small" onClick={() => onChange(today)}>
            Hôm nay
          </button>
          <button
            type="button"
            className="k-chip k-chip--small"
            onClick={() => onChange(yesterday)}
          >
            Hôm qua
          </button>
        </>
      )}
    </div>
  )
}
