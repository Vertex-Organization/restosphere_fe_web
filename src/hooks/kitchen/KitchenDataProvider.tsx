import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { kitchenService } from '../../api/kitchen/service'
import { ApiError } from '../../api/client'
import {
  KitchenError,
  type KitchenCommand,
  type KitchenData,
  type StaffMember,
} from '../../api/kitchen/types'
import { useKitchenAlerts } from './useKitchenAlerts'
import { useKitchenStation } from './useKitchenStation'
import { KitchenDataContext, type Feedback, type KitchenDataValue } from './kitchenDataContext'

/** Polling interval. The backend has no push channel yet; when it gets
 * WebSocket/SSE, `kitchenService.subscribe` can drive refreshes instead. */
const POLL_MS = 5000
const SUCCESS_VISIBLE_MS = 6000

function messageOf(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Không thể hoàn tất thao tác. Vui lòng thử lại.'
}

export function KitchenDataProvider({
  user,
  children,
}: {
  user: StaffMember
  children: ReactNode
}) {
  const [data, setData] = useState<KitchenData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const pendingRef = useRef(new Set<string>())
  const loading = useRef(false)
  const feedbackId = useRef(0)
  const { station, setStation } = useKitchenStation()
  const {
    notifyMode,
    setNotifyMode,
    notifyVolume,
    setNotifyVolume,
    previewSound,
    flashNew,
    playFeedback,
  } = useKitchenAlerts(data, station)

  // Only accept data at least as new as what is shown, so a slow poll cannot
  // undo a change that was just made.
  const accept = useCallback((next: KitchenData) => {
    setData((current) => (!current || next.revision >= current.revision ? next : current))
  }, [])

  // State is only set in the promise callbacks, once the response arrives.
  const refresh = useCallback((): Promise<void> => {
    if (loading.current) return Promise.resolve()
    loading.current = true
    return kitchenService
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
    const unsubscribe = kitchenService.subscribe(() => {
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
    async (command: KitchenCommand, keys: string[]) => {
      // A second click on the same item while the first request runs is ignored.
      if (keys.some((key) => pendingRef.current.has(key))) return null
      keys.forEach((key) => pendingRef.current.add(key))
      setPending(new Set(pendingRef.current))
      try {
        const result = await kitchenService.execute(user, command)
        accept(result.data)
        if (command.type === 'start') playFeedback('start')
        if (command.type === 'complete') playFeedback('complete')
        if (result.summary)
          setFeedback({ id: ++feedbackId.current, tone: 'success', text: result.summary })
        return result.summary
      } catch (error) {
        const network =
          error instanceof ApiError
            ? error.status === 0 || error.status >= 500
            : error instanceof KitchenError && error.code === 'NETWORK'
        setFeedback({ id: ++feedbackId.current, tone: 'error', text: messageOf(error), network })
        if (
          (error instanceof ApiError && [404, 409].includes(error.status)) ||
          (error instanceof KitchenError &&
            (error.code === 'CONFLICT' || error.code === 'NOT_FOUND'))
        )
          void refresh()
        return null
      } finally {
        keys.forEach((key) => pendingRef.current.delete(key))
        setPending(new Set(pendingRef.current))
      }
    },
    [accept, playFeedback, refresh, user],
  )

  const value = useMemo<KitchenDataValue>(
    () => ({
      user: data?.staff.find((member) => member.id === user.id) ?? user,
      data,
      loadError,
      refresh,
      run,
      isPending: (key) => pending.has(key),
      feedback,
      dismissFeedback: () => setFeedback(null),
      announce: (text) => setFeedback({ id: ++feedbackId.current, tone: 'success', text }),
      notifyMode,
      setNotifyMode,
      notifyVolume,
      setNotifyVolume,
      previewSound,
      flashNew,
      station,
      setStation,
    }),
    [
      user,
      data,
      loadError,
      refresh,
      run,
      pending,
      feedback,
      notifyMode,
      setNotifyMode,
      notifyVolume,
      setNotifyVolume,
      previewSound,
      flashNew,
      station,
      setStation,
    ],
  )

  return <KitchenDataContext.Provider value={value}>{children}</KitchenDataContext.Provider>
}
