import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { login } from '../../api/auth'

const assets = '/sites/thepizzacompany-vn'
const providers = [
  { name: 'Google', image: 'google.svg' },
  { name: 'Facebook', image: 'facebook.svg' },
  { name: 'Apple', image: 'apple.avif' },
]

function validateEmail(value: string) {
  if (!value.trim()) return 'Vui lòng nhập email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || value.trim().length > 254) {
    return 'Địa chỉ email không hợp lệ'
  }
  return ''
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const emailError = submitted ? validateEmail(email) : ''
  const passwordError = submitted && !password ? 'Vui lòng nhập mật khẩu' : ''

  function showNotice(message: string) {
    setNotice({ message })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    setSubmitted(true)
    setNotice(null)

    if (validateEmail(email)) {
      emailRef.current?.focus()
    } else if (!password) {
      passwordRef.current?.focus()
    } else {
      submittingRef.current = true
      setSubmitting(true)
      try {
        await login(email, password)
        sessionStorage.setItem('sea-crown.login-success', 'true')
        window.location.assign('/menu/combo')
      } catch (error) {
        setNotice({ message: error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.', error: true })
        submittingRef.current = false
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="pc-form-content" id="login-form">
      <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
        <h2 className="pc-welcome">Chào mừng bạn quay lại 👋</h2>
        <p className="pc-intro">Hãy đăng nhập để tiếp tục thưởng thức món ngon từ The Sea's Crown.</p>

        <div className="pc-fields">
          <div className="pc-field">
            <label htmlFor="pc-email">Email</label>
            <input
              ref={emailRef}
              id="pc-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              placeholder="Nhập email"
              value={email}
              disabled={submitting}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'pc-email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                setNotice(null)
              }}
            />
            {emailError && <p className="pc-error" id="pc-email-error">{emailError}</p>}
          </div>

          <div className="pc-field">
            <label htmlFor="pc-password">Mật khẩu</label>
            <div className="pc-password-field">
              <input
                ref={passwordRef}
                id="pc-password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                maxLength={128}
                disabled={submitting}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'pc-password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setNotice(null)
                }}
              />
              <button
                type="button"
                className="pc-password-toggle"
                aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={passwordVisible}
                disabled={submitting}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <img src={`${assets}/${passwordVisible ? 'eye-on.svg' : 'eye-off.svg'}`} width="20" height="20" alt="" />
              </button>
            </div>
            {passwordError && <p className="pc-error" id="pc-password-error">{passwordError}</p>}
          </div>
        </div>

        <p className="pc-forgot-row">
          <button className="pc-link pc-text-button pc-forgot" type="button" onClick={() => showNotice('Vui lòng liên hệ nhà hàng để được hỗ trợ khôi phục mật khẩu.')}>
            Quên mật khẩu
          </button>
        </p>

        <button type="submit" className="pc-submit" disabled={submitting}>{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        {notice && (
          <p className={`pc-notice${notice.error ? ' pc-notice--error' : ''}`} role={notice.error ? 'alert' : 'status'}>
            {notice.message}
          </p>
        )}
      </form>

      <p className="pc-register">
        Bạn chưa có tài khoản.{' '}
        <button className="pc-link pc-text-button" type="button" onClick={() => showNotice('Chức năng đăng ký tài khoản hiện chưa khả dụng.')}>
          Đăng ký tài khoản
        </button>
      </p>

      <div className="pc-social">
        <div className="pc-social-title"><span />Đăng nhập với<span /></div>
        <div className="pc-social-options">
          {providers.map((provider) => (
            <button
              key={provider.name}
              type="button"
              aria-label={`Đăng nhập với ${provider.name}`}
              title={`Đăng nhập với ${provider.name}`}
              onClick={() => showNotice(`Đăng nhập với ${provider.name} hiện chưa khả dụng.`)}
            >
              <img src={`${assets}/${provider.image}`} width="40" height="40" alt={provider.name} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
