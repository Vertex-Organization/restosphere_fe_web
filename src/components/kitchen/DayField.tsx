import { dayKeyBefore, formatDayKey } from './format'

export function DayField({
  value,
  now,
  onChange,
}: {
  value: string
  now: number
  onChange: (day: string) => void
}) {
  const today = dayKeyBefore(now, 0)
  const yesterday = dayKeyBefore(now, 1)
  return (
    <div className="k-inline-field">
      <label className="k-inline-field">
        <span className="k-label">Ngày</span>
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
      <button type="button" className="k-chip k-chip--small" onClick={() => onChange(today)}>
        Hôm nay
      </button>
      <button type="button" className="k-chip k-chip--small" onClick={() => onChange(yesterday)}>
        Hôm qua
      </button>
    </div>
  )
}
