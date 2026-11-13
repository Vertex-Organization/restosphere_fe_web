import { useEffect, useState, type FormEvent } from 'react'
import { ADMIN_DEMO_CREDENTIALS, adminSignIn } from '../../api/admin/auth'
import { BrandLogo } from '../../components/kitchen/BrandLogo'
import { Button, Field, Icon } from '../../components/admin/ui'
import { navigate } from '../../routes/adminRouter'

export default function AdminLoginPage({ next = '/admin' }: { next?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Đăng nhập · RestoSphere Admin' }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Nhập email cá nhân hợp lệ.'); return }
    if (!password) { setError('Nhập mật khẩu của tài khoản.'); return }
    setBusy(true)
    try {
      await adminSignIn(email, password)
      navigate(next, { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="a-login"><section className="a-login-panel"><BrandLogo width={168} /><div className="a-login-copy"><span><Icon name="user" size={15} />Không gian quản trị demo</span><h1>Đăng nhập Admin</h1><p>Dùng tài khoản demo để kiểm tra đầy đủ giao diện và tương tác Frontend.</p></div><form onSubmit={(event) => { void submit(event) }} noValidate><Field label="Email demo"><input className="a-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} /></Field><Field label="Mật khẩu demo"><input className="a-input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} /></Field>{error && <p className="a-form-error" role="alert">{error}</p>}<Button type="submit" tone="primary" disabled={busy}>{busy ? 'Đang kiểm tra…' : 'Đăng nhập demo'}</Button></form><div className="a-login-demo"><strong>Tài khoản demo</strong><p>{ADMIN_DEMO_CREDENTIALS.email}<br />{ADMIN_DEMO_CREDENTIALS.password}</p><Button tone="quiet" onClick={() => { setEmail(ADMIN_DEMO_CREDENTIALS.email); setPassword(ADMIN_DEMO_CREDENTIALS.password); setError('') }}>Điền tài khoản demo</Button></div><p className="a-login-note"><Icon name="info" size={15} />Phiên demo chỉ lưu trong tab trình duyệt và không gọi API.</p></section><aside className="a-login-aside" aria-hidden="true"><div className="a-login-art"><span>06</span><strong>màn hình quản trị</strong><p>Tài khoản, vai trò, thông tin nhà hàng, cài đặt và nhật ký trong một không gian làm việc.</p></div></aside></main>
}
