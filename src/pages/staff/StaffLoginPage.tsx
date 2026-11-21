import { useEffect, useRef, useState, type FormEvent } from 'react'
import { StaffAuthError, staffSignIn } from '../../api/staff/auth'
import { BrandLogo } from '../../components/kitchen/BrandLogo'
import { Icon } from '../../components/kitchen/Icon'
import { navigate } from '../../routes/kitchenRouter'
import { landingPath, WORKSPACES, workspaceOf } from '../../routes/staffRouter'
import '../../components/staff/staff.css'

const DEMO_PASSWORD = '123456'

const DEMO_ACCOUNTS = [
  { role: 'Quản trị', email: 'admin@restosphere.test', note: 'Web' },
  { role: 'Quản lý', email: 'manager@restosphere.test', note: 'Web' },
  { role: 'Thu ngân', email: 'cashier@restosphere.test', note: 'Web' },
  { role: 'Bếp', email: 'kitchen@restosphere.test', note: 'Web' },
  { role: 'Lễ tân', email: 'receptionist@restosphere.test', note: 'Mobile' },
  { role: 'Phục vụ', email: 'waiter@restosphere.test', note: 'Mobile' },
  { role: 'Phục vụ 2', email: 'waiter2@restosphere.test', note: 'Mobile' },
] as const
/** The one sign-in page for every staff workspace; the account's role decides where it lands. */
export default function StaffLoginPage({ next }: { next: string | null }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const target = next ? workspaceOf(next) : null

  useEffect(() => {
    document.title = 'Đăng nhập · RestoSphere'
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!login.trim() || !password) {
      setError('Nhập email và mật khẩu.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const account = await staffSignIn(login, password)
      navigate(landingPath(account.role, next) ?? '/staff', { replace: true })
    } catch (err) {
      setError(
        err instanceof StaffAuthError ? err.message : 'Không thể đăng nhập. Vui lòng thử lại.',
      )
      setBusy(false)
    }
  }

  return (
    <main className="st">
      <div className="st-card">
        <form
          className="st-main st-form"
          onSubmit={(e) => {
            void submit(e)
          }}
        >
          <BrandLogo width={168} />
          <div>
            <h1 className="st-title">Đăng nhập nhân viên</h1>
            <p className="st-sub">
              Một tài khoản cho mọi khu làm việc. Hệ thống mở đúng khu theo vai trò của bạn.
            </p>
          </div>
          {target && (
            <p className="st-target">
              <Icon name="info" size={14} />
              Đăng nhập để mở khu <b>{WORKSPACES[target].label}</b>
            </p>
          )}
          <label className="st-field">
            <span className="st-label">Email</span>
            <input
              className="st-input"
              type="email"
              required
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              aria-invalid={!!error}
              disabled={busy}
            />
          </label>
          <label className="st-field">
            <span className="st-label">Mật khẩu</span>
            <input
              className="st-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              disabled={busy}
            />
          </label>
          {error && (
            <p className="st-error" role="alert">
              <Icon name="alert" size={14} />
              {error}
            </p>
          )}
          <button
            ref={submitRef}
            type="submit"
            className="st-btn st-btn--primary"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
        {import.meta.env.DEV && (
          <div className="st-demo">
            <p className="st-demo-title">Tài khoản demo · Mật khẩu: {DEMO_PASSWORD}</p>
            <div className="st-demo-list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="st-demo-row"
                  disabled={busy}
                  onClick={() => {
                    setLogin(account.email)
                    setPassword(DEMO_PASSWORD)
                    setError('')
                    submitRef.current?.focus()
                  }}
                >
                  <span className="st-demo-role">{account.role}</span>
                  <span className="st-demo-user">{account.email}</span>
                  <span className="st-demo-pass">{account.note}</span>
                </button>
              ))}
            </div>
            <p className="st-demo-note">
              Bấm tài khoản để điền email và mật khẩu. Lễ tân và phục vụ dùng ứng dụng di động.
            </p>
          </div>
        )}{' '}
      </div>
      <p className="st-foot">RestoSphere · Khu nhân viên</p>
    </main>
  )
}
