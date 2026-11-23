import { dayKeyBefore } from './format'

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
        <input
          className="k-input k-input--date"
          type="date"
          value={value}
          max={today}
          onChange={(event) => onChange(event.target.value)}
        />
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
