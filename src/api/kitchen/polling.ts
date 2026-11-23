export const POLL_VISIBLE_MS = 5000
export const POLL_HIDDEN_MS = 15000
const TICK_SLACK_MS = 500

/** A hidden tab polls less often so alerts still arrive without wasting requests. */
export function pollInterval(hidden: boolean) {
  return hidden ? POLL_HIDDEN_MS : POLL_VISIBLE_MS
}

/** True when enough time passed since the last load; the slack absorbs timer jitter. */
export function isPollDue(hidden: boolean, elapsedMs: number) {
  return elapsedMs >= pollInterval(hidden) - TICK_SLACK_MS
}
