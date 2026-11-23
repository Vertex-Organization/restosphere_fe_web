export const HISTORY_PAGE_SIZE = 20

export function takePage<T>(items: readonly T[], limit: number) {
  const shown = Math.min(Math.max(0, limit), items.length)
  return {
    items: items.slice(0, shown),
    shown,
    total: items.length,
    hasMore: shown < items.length,
  }
}
