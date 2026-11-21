export type AppProgressSnapshot = Readonly<{
  value: number
  label: string
}>

const listeners = new Set<() => void>()
let current: AppProgressSnapshot = {
  value: 32,
  label: 'Đã nạp mã nền · đang chọn giao diện',
}
let activeRun = 0
let notificationQueued = false

function publish(value: number, label: string) {
  current = { value: Math.max(0, Math.min(100, value)), label }
  if (notificationQueued) return
  notificationQueued = true
  queueMicrotask(() => {
    notificationQueued = false
    listeners.forEach((listener) => listener())
  })
}

export function markAppRuntimeReady() {
  publish(32, 'Đã nạp mã nền · đang chọn giao diện')
}

export function beginAppProgress(label: string) {
  activeRun += 1
  publish(52, `Đang tải ${label}`)
  return activeRun
}

export function advanceAppProgress(run: number, label: string) {
  if (run !== activeRun) return
  publish(86, `Đã tải ${label} · đang dựng màn hình`)
}

export function completeAppProgress() {
  publish(100, 'Giao diện đã sẵn sàng')
}

export function subscribeAppProgress(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAppProgress() {
  return current
}
