import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/client'
import { customerService } from '../../../api/customers/service'
import type { Language } from './siteData'

const COPY = {
  vi: {
    name: 'Họ và tên',
    phone: 'Số điện thoại',
    email: 'Email (không bắt buộc)',
    birthday: 'Ngày sinh (không bắt buộc)',
    consent: 'Tôi muốn nhận thông tin món mới và ưu đãi dành cho thành viên.',
    submit: 'Đăng ký thành viên',
    sending: 'Đang gửi…',
    done: (name: string) => `Cảm ơn ${name}! Bạn đã trở thành thành viên của nhà hàng.`,
    mailed: (email: string) => `Thư chào mừng đã được gửi tới ${email}.`,
    noEmail:
      'Bạn chưa để lại email nên sẽ không nhận thư chào mừng. Nhà hàng sẽ nhận ra bạn qua số điện thoại khi đặt bàn.',
    again: 'Đăng ký thêm người khác',
    failed: 'Không thể đăng ký lúc này. Vui lòng thử lại.',
  },
  en: {
    name: 'Full name',
    phone: 'Phone number',
    email: 'Email (optional)',
    birthday: 'Birthday (optional)',
    consent: 'I would like to hear about new dishes and member offers.',
    submit: 'Become a member',
    sending: 'Sending…',
    done: (name: string) => `Thank you, ${name}! You are now a member of the restaurant.`,
    mailed: (email: string) => `A welcome email is on its way to ${email}.`,
    noEmail:
      'You did not leave an email, so no welcome email will be sent. We will recognise you by your phone number when you book.',
    again: 'Register someone else',
    failed: 'We could not register you right now. Please try again.',
  },
} satisfies Record<Language, unknown>

export function MemberSignup({ language }: { language: Language }) {
  const t = COPY[language]
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<{ text: string; field?: string }>()
  const [member, setMember] = useState<{ name: string; email?: string }>()
  const today = new Date().toISOString().slice(0, 10)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()
    setSending(true)
    setError(undefined)
    try {
      const saved = await customerService.register({
        fullName: text('fullName'),
        phone: text('phone'),
        email: text('email') || undefined,
        birthday: text('birthday') || undefined,
        marketingConsent: form.get('marketingConsent') === 'on',
      })
      setMember({ name: saved.fullName, email: saved.email || undefined })
    } catch (err) {
      setError({
        text: err instanceof Error ? err.message : t.failed,
        field: err instanceof ApiError ? err.field : undefined,
      })
    } finally {
      setSending(false)
    }
  }

  if (member)
    return (
      <div className="sb-member-done" role="status">
        <p>{t.done(member.name)}</p>
        <span>{member.email ? t.mailed(member.email) : t.noEmail}</span>
        <button type="button" onClick={() => setMember(undefined)}>
          {t.again}
        </button>
      </div>
    )

  const fieldError = (field: string) =>
    error?.field === field && (
      <span role="alert" className="sb-member-error">
        {error.text}
      </span>
    )

  return (
    <form className="sb-member-form" onSubmit={submit}>
      <label>
        {t.name} *
        <input name="fullName" required maxLength={150} autoComplete="name" />
      </label>
      <label>
        {t.phone} *
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="0901 234 567"
          maxLength={20}
          aria-invalid={error?.field === 'phone'}
        />
        {fieldError('phone')}
      </label>
      <label>
        {t.email}
        <input name="email" type="email" maxLength={254} autoComplete="email" />
      </label>
      <label>
        {t.birthday}
        <input name="birthday" type="date" max={today} autoComplete="bday" />
      </label>
      <label className="sb-member-consent">
        <input name="marketingConsent" type="checkbox" />
        {t.consent}
      </label>
      {error && !error.field && (
        <p role="alert" className="sb-member-error">
          {error.text}
        </p>
      )}
      <button type="submit" disabled={sending}>
        {sending ? t.sending : t.submit}
      </button>
    </form>
  )
}
