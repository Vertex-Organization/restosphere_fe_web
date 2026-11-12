import { useEffect, useState, type FormEvent } from 'react'
import { managerSignIn } from '../../api/manager/auth'
import { BrandLogo } from '../../components/kitchen/BrandLogo'
import { Button, Icon } from '../../components/manager/ui'
import { navigate } from '../../routes/managerRouter'

export default function ManagerLoginPage({ next }: { next: string }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { document.title = 'Đăng nhập · RestoSphere Manager' }, [])
  const submit = async (e: FormEvent) => { e.preventDefault(); setError(''); if (!username.trim() || !password) { setError('Nhập tên đăng nhập và mật khẩu.'); return }; setBusy(true); try { await managerSignIn(username, password); navigate(next, { replace: true }) } catch (e) { setError(e instanceof Error ? e.message : 'Không thể đăng nhập.') } finally { setBusy(false) } }
  return <div className="kds m-login"><form onSubmit={e => { void submit(e) }} className="m-login-card"><BrandLogo width={184} /><div><span className="m-login-label"><Icon name="user" />Không gian quản lý</span><h1>Đăng nhập quản lý</h1><p>Theo dõi và điều phối hoạt động nhà hàng.</p></div><label className="k-field"><span className="k-label">Tên đăng nhập</span><input className="k-input" autoComplete="username" name="username" value={username} onChange={e => setUsername(e.target.value)} disabled={busy} required /></label><label className="k-field"><span className="k-label">Mật khẩu</span><input className="k-input" type="password" autoComplete="current-password" name="password" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} required /></label>{error && <p className="m-form-error" role="alert">{error}</p>}<Button primary type="submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập quản lý'}</Button><div className="m-login-demo"><strong>Dữ liệu mô phỏng</strong><p>Tên đăng nhập: <code>manager</code><br />Mật khẩu: <code>Manager@123</code></p><small>Thao tác được lưu trong trình duyệt, chưa kết nối API nghiệp vụ.</small></div></form><span className="m-login-footer">RestoSphere · Restaurant Management System</span></div>
}
