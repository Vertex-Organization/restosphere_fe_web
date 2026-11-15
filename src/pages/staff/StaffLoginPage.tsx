import { useEffect, useRef, useState, type FormEvent } from 'react'
import { StaffAuthError, staffSignIn } from '../../api/staff/auth'
import { DEMO_SHORTCUTS } from '../../api/staff/mockAccounts'
import { BrandLogo } from '../../components/kitchen/BrandLogo'
import { Icon } from '../../components/kitchen/Icon'
import { landingPath, STAFF_ROLE_LABEL, WORKSPACES, workspaceOf } from '../../routes/staffRouter'
import '../../components/staff/staff.css'

/** The one sign-in page for every staff workspace; the account's role decides where it lands. */
export default function StaffLoginPage({ next }: { next: string | null }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const target = next ? workspaceOf(next) : null

  useEffect(() => { document.title = 'Đăng nhập · RestoSphere' }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!login.trim() || !password) {
      setError('Nhập tên đăng nhập và mật khẩu.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const account = await staffSignIn(login, password)
      // Each workspace is its own app: open it with a full page load.
      window.location.replace(landingPath(account.role, next) ?? '/staff')
    } catch (err) {
      setError(err instanceof StaffAuthError ? err.message : 'Không thể đăng nhập. Vui lòng thử lại.')
      setBusy(false)
    }
  }

  const fill = (username: string, pass: string) => {
    setLogin(username)
    setPassword(pass)
    setError('')
    submitRef.current?.focus()
  }

  return (
    <main className="st">
      <div className="st-card">
        <form className="st-main st-form" onSubmit={(e) => { void submit(e) }} noValidate>
          <BrandLogo width={168} />
          <div>
            <h1 className="st-title">Đăng nhập nhân viên</h1>
            <p className="st-sub">Một tài khoản cho mọi khu làm việc. Hệ thống mở đúng khu theo vai trò của bạn.</p>
          </div>
          {target && (
            <p className="st-target"><Icon name="info" size={14} />Đăng nhập để mở khu <b>{WORKSPACES[target].label}</b></p>
          )}
          <label className="st-field">
            <span className="st-label">Tên đăng nhập hoặc email</span>
            <input className="st-input" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus
              value={login} onChange={(e) => setLogin(e.target.value)} aria-invalid={!!error} disabled={busy} />
          </label>
          <label className="st-field">
            <span className="st-label">Mật khẩu</span>
            <input className="st-input" type="password" name="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} disabled={busy} />
          </label>
          {error && <p className="st-error" role="alert"><Icon name="alert" size={14} />{error}</p>}
          <button ref={submitRef} type="submit" className="st-btn st-btn--primary" disabled={busy} aria-busy={busy}>
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
        <section className="st-demo" aria-labelledby="st-demo-title">
          <p className="st-demo-title" id="st-demo-title"><span>Tài khoản demo</span><span>Bấm để điền</span></p>
          <ul className="st-demo-list">
            {DEMO_SHORTCUTS.map((demo) => (
              <li key={demo.username}>
                <button type="button" className="st-demo-row" disabled={busy} onClick={() => fill(demo.username, demo.password)}
                  aria-label={`Điền tài khoản ${STAFF_ROLE_LABEL[demo.role]}: ${demo.username}`}>
                  <span className="st-demo-role">{WORKSPACES[demo.role].label}</span>
                  <span className="st-demo-user">{demo.username}</span>
                  <span className="st-demo-pass">{demo.password}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="st-demo-note">Thêm <b>cashier2</b>, <b>kitchen2</b> (mật khẩu 123456). Tài khoản Phục vụ dùng app trên điện thoại.</p>
        </section>
      </div>
      <p className="st-foot">RestoSphere · Khu nhân viên</p>
    </main>
  )
}
