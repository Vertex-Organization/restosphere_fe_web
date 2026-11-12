import { useEffect, useState, type FormEvent } from 'react'
import { cashierSignIn } from '../../../api/billing/auth'
import { CashierError } from '../../../api/billing/types'
import { Icon } from '../../../components/billing/Icon'
import { BrandLogo } from '../../../components/kitchen/BrandLogo'
import { navigate } from '../../../routes/cashierRouter'

export default function CashierLoginPage({ next }: { next: string }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { document.title = 'Đăng nhập · RestoSphere Thu ngân' }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!username.trim() || !password) {
      setError('Nhập tên đăng nhập và mật khẩu.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await cashierSignIn(username, password)
      // The guard decides what this account may see (other roles are refused).
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof CashierError ? err.message : 'Không thể đăng nhập. Vui lòng thử lại.')
      setBusy(false)
    }
  }

  return (
    <div className="kds k-login">
      <form className="k-login-card" onSubmit={submit} noValidate>
        <BrandLogo width={176} />
        <div>
          <h1 className="k-login-title">Đăng nhập quầy thu ngân</h1>
          <p className="k-muted">Dành cho nhân viên thu ngân của nhà hàng.</p>
        </div>
        <label className="k-field">
          <span className="k-label">Tên đăng nhập</span>
          <input className="k-input" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus
            value={username} onChange={(e) => setUsername(e.target.value)} aria-invalid={!!error} />
        </label>
        <label className="k-field">
          <span className="k-label">Mật khẩu</span>
          <input className="k-input" type="password" name="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} />
        </label>
        {error && <p className="k-form-error" role="alert"><Icon name="alert" size={14} />{error}</p>}
        <button type="submit" className="k-btn k-btn--primary k-btn--lg k-btn--block" disabled={busy} aria-busy={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <div className="k-callout">
          <Icon name="info" size={14} />
          <span>
            Dữ liệu mô phỏng, mật khẩu <b>123456</b>: <b>cashier</b> (Thu ngân chính), <b>cashier2</b> (Thu ngân, chưa mở ca,
            không tự giảm giá), <b>waiter</b> (Phục vụ — không có quyền vào quầy).
          </span>
        </div>
      </form>
    </div>
  )
}
