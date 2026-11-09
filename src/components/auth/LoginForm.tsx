import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

const assets = '/sites/thepizzacompany-vn'
const providers = [
  { name: 'Google', image: 'google.svg' },
  { name: 'Facebook', image: 'facebook.svg' },
  { name: 'Apple', image: 'apple.avif' },
]

function validatePhone(value: string) {
  if (!value.trim()) return 'Vui lòng nhập số điện thoại'
  if (!/^(?:0|\+84|84)[35789]\d{8}$/.test(value.trim())) {
    return 'Số điện thoại di động không hợp lệ'
  }
  return ''
}

export default function LoginForm() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const phoneError = submitted ? validatePhone(phone) : ''
  const passwordError = submitted && !password ? 'Vui lòng nhập mật khẩu' : ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setNotice('')

    if (validatePhone(phone)) {
      phoneRef.current?.focus()
    } else if (!password) {
      passwordRef.current?.focus()
    } else {
      setNotice('Bản giao diện này chưa hỗ trợ đăng nhập tài khoản.')
    }
  }

  return (
    <div className="pc-form-content" id="login-form">
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="pc-welcome">Chào mừng bạn quay lại 👋</h2>
        <p className="pc-intro">Hãy đăng nhập để tiếp tục thưởng thức món ngon từ The Sea's Crown.</p>

        <div className="pc-fields">
          <div className="pc-field">
            <label htmlFor="pc-phone">Điện thoại</label>
            <input
              ref={phoneRef}
              id="pc-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="username"
              placeholder="Nhập số điện thoại"
              value={phone}
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'pc-phone-error' : undefined}
              onChange={(event) => {
                setPhone(event.target.value)
                setNotice('')
              }}
            />
            {phoneError && <p className="pc-error" id="pc-phone-error">{phoneError}</p>}
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
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'pc-password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setNotice('')
                }}
              />
              <button
                type="button"
                className="pc-password-toggle"
                aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <img src={`${assets}/${passwordVisible ? 'eye-on.svg' : 'eye-off.svg'}`} width="20" height="20" alt="" />
              </button>
            </div>
            {passwordError && <p className="pc-error" id="pc-password-error">{passwordError}</p>}
          </div>
        </div>

        <p className="pc-forgot-row">
          <button className="pc-link pc-text-button pc-forgot" type="button" onClick={() => setNotice('Vui lòng liên hệ nhà hàng để được hỗ trợ khôi phục mật khẩu.')}>
            Quên mật khẩu
          </button>
        </p>

        <button type="submit" className="pc-submit">Đăng nhập</button>
        {notice && (
          <p className="pc-notice" role="status">
            {notice}
          </p>
        )}
      </form>

      <p className="pc-register">
        Bạn chưa có tài khoản.{' '}
        <button className="pc-link pc-text-button" type="button" onClick={() => setNotice('Chức năng đăng ký tài khoản hiện chưa khả dụng.')}>
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
              onClick={() => setNotice(`Đăng nhập với ${provider.name} hiện chưa khả dụng.`)}
            >
              <img src={`${assets}/${provider.image}`} width="40" height="40" alt={provider.name} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
