import { formatCount } from './format'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  count?: number
}

export function SegmentedFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="k-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="k-segmented-btn"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="k-count">{formatCount(option.count)}</span>
          )}
        </button>
      ))}
    </div>
  )
}
