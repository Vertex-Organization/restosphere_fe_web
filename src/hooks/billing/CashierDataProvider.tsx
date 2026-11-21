import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cashierService } from '../../api/billing/service'
import { ApiError } from '../../api/client'
import {
  CashierError,
  type CashierCommand,
  type CashierData,
  type CashierStaff,
} from '../../api/billing/types'
import {
  CashierDataContext,
  type CashierDataValue,
  type Feedback,
  type RunResult,
} from './cashierDataContext'

/** Polling interval. The backend has no push channel yet; when it gets
 * WebSocket/SSE, `cashierService.subscribe` can drive refreshes instead. */
const POLL_MS = 5000
const SUCCESS_VISIBLE_MS = 6000

function messageOf(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Không thể hoàn tất thao tác. Vui lòng thử lại.'
}

export function CashierDataProvider({
  user,
  children,
}: {
  user: CashierStaff
  children: ReactNode
}) {
  const [data, setData] = useState<CashierData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const pendingRef = useRef(new Set<string>())
  const loading = useRef(false)
  const feedbackId = useRef(0)

  // Only accept data at least as new as what is shown, so a slow poll cannot
  // undo a payment that was just recorded.
  const accept = useCallback((next: CashierData) => {
    setData((current) => (!current || next.revision >= current.revision ? next : current))
  }, [])

  const refresh = useCallback((): Promise<void> => {
    if (loading.current) return Promise.resolve()
    loading.current = true
    return cashierService
      .load()
      .then(
        (next) => {
          accept(next)
          setLoadError(null)
          setFeedback((f) => (f?.network ? null : f))
        },
        (error: unknown) => setLoadError(messageOf(error)),
      )
      .finally(() => {
        loading.current = false
      })
  }, [accept])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh()
    }, POLL_MS)
    const unsubscribe = cashierService.subscribe(() => {
      void refresh()
    })
    const onVisible = () => {
      if (!document.hidden) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  useEffect(() => {
    if (feedback?.tone !== 'success') return
    const timer = window.setTimeout(
      () => setFeedback((f) => (f?.id === feedback.id ? null : f)),
      SUCCESS_VISIBLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [feedback])

  const run = useCallback(
    async (
      command: CashierCommand,
      keys: string[],
      options: { quiet?: boolean } = {},
    ): Promise<RunResult | null> => {
      // A second click while the first request runs is ignored, so one tap can never send two payments.
      if (keys.some((key) => pendingRef.current.has(key))) return null
      keys.forEach((key) => pendingRef.current.add(key))
      setPending(new Set(pendingRef.current))
      try {
        const result = await cashierService.execute(user, command)
        accept(result.data)
        if (result.summary && !options.quiet)
          setFeedback({ id: ++feedbackId.current, tone: 'success', text: result.summary })
        return { ok: true, result }
      } catch (error) {
        const network =
          error instanceof ApiError
            ? error.status === 0 || error.status >= 500
            : error instanceof CashierError && error.code === 'NETWORK'
        const text = messageOf(error)
        setFeedback({ id: ++feedbackId.current, tone: 'error', text, network })
        if (
          (error instanceof ApiError && [404, 409].includes(error.status)) ||
          (error instanceof CashierError &&
            (error.code === 'CONFLICT' || error.code === 'NOT_FOUND'))
        )
          void refresh()
        return { ok: false, error: text }
      } finally {
        keys.forEach((key) => pendingRef.current.delete(key))
        setPending(new Set(pendingRef.current))
      }
    },
    [accept, refresh, user],
  )

  const value = useMemo<CashierDataValue>(
    () => ({
      user: data?.staff.find((member) => member.id === user.id) ?? user,
      data,
      loadError,
      refresh,
      run,
      isPending: (key) => pending.has(key),
      feedback,
      dismissFeedback: () => setFeedback(null),
    }),
    [user, data, loadError, refresh, run, pending, feedback],
  )

  return <CashierDataContext.Provider value={value}>{children}</CashierDataContext.Provider>
}
