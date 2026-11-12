import type { TimeTone } from '../../api/kitchen/selectors'
import { formatDuration } from './format'
import { Icon } from './Icon'

/** Elapsed-time label whose colour escalates with the wait. */
export function KitchenTimer({ label, minutes, tone }: { label: string; minutes: number; tone: TimeTone }) {
  return (
    <span className={`k-timer k-timer--${tone}`}>
      <Icon name="clock" size={14} />
      {label} {formatDuration(minutes)}
    </span>
  )
}
