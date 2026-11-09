import { ApiError, apiRequest } from './client'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
}

const sessionKey = 'sea-crown.auth'
const listeners = new Set<() => void>()

function readSession(): Session | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(sessionKey) || 'null')
    if (value && typeof value === 'object' && 'accessToken' in value && typeof value.accessToken === 'string'
      && 'refreshToken' in value && typeof value.refreshToken === 'string'
      && 'expiresAt' in value && typeof value.expiresAt === 'number') return value as Session
  } catch {
    // An unavailable or invalid stored session is treated as signed out.
  }
  return null
}

let session = readSession()
let state: AuthState = { user: null, loading: !!session }
let restoring: Promise<void> | null = null
let refreshing: Promise<Session> | null = null
let sessionVersion = 0

function publish(next: AuthState) {
  state = next
  listeners.forEach((listener) => listener())
}

function saveSession(tokens: TokenResponse): Session {
  if (typeof tokens.accessToken !== 'string' || !tokens.accessToken
    || typeof tokens.refreshToken !== 'string' || !tokens.refreshToken
    || !Number.isFinite(tokens.expiresIn) || tokens.expiresIn <= 0) {
    throw new ApiError(502, 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.')
  }
  const next = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  }
  sessionStorage.setItem(sessionKey, JSON.stringify(next))
  session = next
  return next
}

function clearSession() {
  sessionVersion += 1
  session = null
  sessionStorage.removeItem(sessionKey)
  publish({ user: null, loading: false })
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getAuthState() {
  return state
}

async function refreshSession(): Promise<Session> {
  if (refreshing) return refreshing
  const current = session
  if (!current) throw new ApiError(401, 'Vui lòng đăng nhập lại.')

  refreshing = (async () => {
    try {
      const tokens = await apiRequest<TokenResponse>('auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      })
      // A response from an older session must not overwrite a newer login/logout.
      if (session !== current) throw new ApiError(401, 'Vui lòng đăng nhập lại.')
      return saveSession(tokens)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && session === current) clearSession()
      throw error
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

async function currentUser(): Promise<AuthUser> {
  if (!session) throw new ApiError(401, 'Vui lòng đăng nhập lại.')
  const needsRefresh = session.expiresAt <= Date.now() + 30000
  const current = needsRefresh ? await refreshSession() : session
  try {
    return await apiRequest<AuthUser>('auth/me', { headers: { Authorization: `Bearer ${current.accessToken}` } })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    if (needsRefresh) {
      if (session === current) clearSession()
      throw error
    }
    // Only refresh once after a rejected access token; never retry indefinitely.
    const renewed = session === current ? await refreshSession() : session
    if (!renewed) throw error
    try {
      return await apiRequest<AuthUser>('auth/me', { headers: { Authorization: `Bearer ${renewed.accessToken}` } })
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401 && session === renewed) clearSession()
      throw retryError
    }
  }
}

export async function restoreAuth() {
  if (restoring) return restoring
  if (!session || state.user) return
  restoring = (async () => {
    const version = sessionVersion
    try {
      const user = await currentUser()
      if (session && version === sessionVersion) publish({ user, loading: false })
    } catch {
      if (version === sessionVersion) publish({ user: null, loading: false })
    } finally {
      restoring = null
    }
  })()
  return restoring
}

export async function login(email: string, password: string) {
  const version = ++sessionVersion
  let tokens: TokenResponse
  try {
    tokens = await apiRequest<TokenResponse>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError(401, 'Email hoặc mật khẩu không đúng.')
    }
    throw error
  }
  if (version !== sessionVersion) throw new ApiError(401, 'Vui lòng đăng nhập lại.')
  saveSession(tokens)
  const user = await currentUser()
  if (session && version === sessionVersion) publish({ user, loading: false })
  else throw new ApiError(401, 'Vui lòng đăng nhập lại.')
}

export async function logout() {
  if (refreshing) await refreshing
  const current = session
  if (current) {
    await apiRequest<void>('auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
  }
  if (session === current) clearSession()
}
