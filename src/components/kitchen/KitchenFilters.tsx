export interface FilterOption<T extends string> {
  value: T
  label: string
  count?: number
}

/** Compact single-choice chip row (filled = selected, as in the staff app). */
export function KitchenFilters<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="k-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="k-chip"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span className="k-chip-count">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}
