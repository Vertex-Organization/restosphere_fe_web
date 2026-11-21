const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '')
const networkRetryDelays = [100, 300] as const

export class ApiError extends Error {
  readonly status: number
  /** Server-provided reason (ProblemDetail.detail), when available. */
  readonly detail?: string
  /** Request field the server blamed for a validation error, when it named one. */
  readonly field?: string

  constructor(status: number, message: string, detail?: string, field?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.field = field
  }
}

function errorMessage(status: number) {
  if (status >= 500)
    return 'Máy chủ đang gặp sự cố hoặc không thể kết nối backend. Vui lòng thử lại sau.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (status === 400) return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.'
  if (status === 429) return 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.'
  return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại sau.'
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')

  const url = `${baseUrl}/${path.replace(/^\/+/, '')}`
  const method = (options.method || 'GET').toUpperCase()
  const mayRetry = method === 'GET' || method === 'HEAD'
  let response: Response | undefined
  for (let attempt = 0; attempt <= networkRetryDelays.length; attempt += 1) {
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || AbortSignal.timeout(15000),
        cache: 'no-store',
      })
      break
    } catch (error) {
      const retryable = mayRetry && error instanceof TypeError && !options.signal?.aborted
      if (!retryable || attempt === networkRetryDelays.length)
        throw new ApiError(0, 'Không thể kết nối máy chủ. Vui lòng thử lại.')
      await new Promise((resolve) => setTimeout(resolve, networkRetryDelays[attempt]))
    }
  }

  if (!response) throw new ApiError(0, 'Không thể kết nối máy chủ. Vui lòng thử lại.')
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: unknown
      field?: unknown
    } | null
    throw new ApiError(
      response.status,
      errorMessage(response.status),
      typeof body?.detail === 'string' ? body.detail : undefined,
      typeof body?.field === 'string' ? body.field : undefined,
    )
  }
  if (response.status === 204) return undefined as T

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(
      502,
      'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng kiểm tra kết nối backend.',
    )
  }
}
