export const REASON_MIN_LENGTH = 5

export function ReasonHint({ id, value, max = 200 }: { id: string; value: string; max?: number }) {
  const length = value.trim().length
  const short = length < REASON_MIN_LENGTH
  return (
    <p id={id} className="k-hint" aria-live="polite">
      Ít nhất {REASON_MIN_LENGTH} ký tự ·{' '}
      {short ? `${length}/${REASON_MIN_LENGTH}` : `${value.length}/${max}`}
    </p>
  )
}
