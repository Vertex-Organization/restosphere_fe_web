import { useEffect, useState, type FormEvent } from 'react'
import type { Dish } from '../../../../api/menu/types'
import { ApiError } from '../../../../api/client'
import { reservationService, type ReservationSettings } from '../../../../api/reservations/service'
import type { Reservation } from '../../../../api/reservations/types'
import { MenuIcon } from '../menu/MenuIcons'
import DepositPanel from './DepositPanel'
import type { Language } from '../siteData'
import {
  BOOKING_COPY,
  cartGuestCoverage,
  cartTotal,
  formatMoney,
  formatQuantity,
  stepOf,
  type Cart,
} from './bookingCopy'

type BookingFormProps = {
  language: Language
  dishes: Dish[]
  cart: Cart
  guests: number
  onGuestsChange: (guests: number) => void
  onCartChange: (dishId: string, quantity: number) => void
  onCartClear: () => void
}

const TIME_ZONE = 'Asia/Ho_Chi_Minh'

/** 10:00 – 21:30 every half hour. */
const SLOTS = Array.from(
  { length: 24 },
  (_, i) => `${String(10 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
)

function restaurantNow(timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

const DURATION_MINUTES = 120
// Server field names whose errors render beside their input instead of the form footer.
const SHOWN_INLINE = [
  'date',
  'time',
  'durationMinutes',
  'guests',
  'areaId',
  'name',
  'phone',
  'email',
  'note',
  'items',
  'depositPolicy',
]
const minutesOf = (slot: string) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3))

/** Slots inside the restaurant's opening hours (arrival + duration); today's slots need at least an hour's notice. */
function availableSlots(date: string, settings?: ReservationSettings | null) {
  const now = restaurantNow(settings?.timezone)
  const open = settings?.openMinutes,
    close = settings?.closeMinutes
  const [h, m] = now.time.split(':').map(Number)
  const earliest = date === now.date ? h * 60 + m + 60 : 0
  return SLOTS.filter((slot) => {
    let start = minutesOf(slot)
    if (start < earliest) return false
    if (open == null || close == null) return true
    if (start < open && close > 1440) start += 1440
    return start >= open && start + DURATION_MINUTES <= close
  })
}

const AREA_ICON = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="22" height="7" rx="2" />
    <path d="M7 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" />
    <circle cx="8.5" cy="19.5" r="3.5" />
    <circle cx="19.5" cy="19.5" r="3.5" />
    <path d="M8.5 14v1.5M8.5 23.5V25M19.5 14v1.5M19.5 23.5V25" />
  </svg>
)

export function BookingForm({
  language,
  dishes,
  cart,
  guests,
  onGuestsChange,
  onCartChange,
  onCartClear,
}: BookingFormProps) {
  const t = BOOKING_COPY[language]
  const [settings, setSettings] = useState<ReservationSettings | null>(null)
  const today = restaurantNow(settings?.timezone).date
  const initialSlots = availableSlots(today, settings)
  const [date, setDate] = useState(today)
  const [picked, setTime] = useState(() =>
    initialSlots.includes('18:30') ? '18:30' : (initialSlots[0] ?? ''),
  )
  const [area, setArea] = useState('')
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  useEffect(() => {
    let active = true
    reservationService
      .settings()
      .then((value) => {
        if (active) {
          setSettings(value)
        }
      })
      .catch((error: unknown) => {
        if (active)
          setSettingsError(
            error instanceof Error ? error.message : 'Không tải được cấu hình đặt bàn.',
          )
      })
    return () => {
      active = false
    }
  }, [])
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState('')
  const [failedField, setFailedField] = useState('')
  const fieldError = (...fields: string[]) =>
    fields.includes(failedField) ? (
      <p className="bk-error" role="alert">
        {failed}
      </p>
    ) : null
  const clearFailure = () => {
    setFailed('')
    setFailedField('')
  }
  const [done, setDone] = useState<Reservation | null>(null)
  const [copied, setCopied] = useState(false)

  const slots = availableSlots(date, settings)
  // Settings arrive after the first render; a picked time outside opening hours falls back to a valid slot.
  const time = slots.includes(picked)
    ? picked
    : slots.includes('18:30')
      ? '18:30'
      : (slots[0] ?? '')
  const lunchSlots = slots.filter((s) => Number(s.slice(0, 2)) < 15)
  const dinnerSlots = slots.filter((s) => Number(s.slice(0, 2)) >= 15)

  const onlineAllowed = !!settings?.onlineReservations
  const chosen = dishes.filter((d) => cart[d.id])
  const total = cartTotal(cart, dishes)
  const [minCovered, maxCovered] = cartGuestCoverage(cart, dishes)
  const hasFoodInCart = chosen.some((d) => d.serves)
  const setGuestCount = (value: number) => onGuestsChange(Math.round(value) || 0)

  function handleDateChange(nextDate: string) {
    setDate(nextDate)
    const nextSlots = availableSlots(nextDate, settings)
    if (!nextSlots.includes(time)) {
      setTime(nextSlots.includes('18:30') ? '18:30' : (nextSlots[0] ?? ''))
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onlineAllowed || sending) return
    if (chosen.length > 0 && !acceptedPolicy) {
      setFailed(t.depositPolicyNeeded)
      setFailedField('depositPolicy')
      return
    }
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()
    setSending(true)
    clearFailure()
    try {
      const reservation = await reservationService.create({
        date,
        time,
        guests,
        areaId: area,
        durationMinutes: DURATION_MINUTES,
        name: text('name'),
        phone: text('phone'),
        email: text('email') || undefined,
        note: text('note') || undefined,
        items: chosen.map((d) => ({ dishId: d.id, quantity: cart[d.id] })),
      })
      setDone(reservation)
      onCartClear()
    } catch (error) {
      // Server reasons are Vietnamese; the English page keeps its own generic copy.
      const apiError = error instanceof ApiError ? error : undefined
      setFailed(language === 'vi' && apiError?.detail ? apiError.detail : t.failed)
      setFailedField(apiError?.field ?? '')
    } finally {
      setSending(false)
    }
  }

  async function copyBookingCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback ignored if clipboard is blocked
    }
  }

  if (done?.deposit && !done.deposit.paidAt && done.status === 'PENDING') {
    return <DepositPanel reservation={done} language={language} onPaid={setDone} />
  }

  if (done) {
    const doneItems = done.items
      .map((line) => {
        const dish = dishes.find((d) => d.id === line.dishId)
        return dish ? { dish, quantity: line.quantity } : null
      })
      .filter((entry): entry is { dish: Dish; quantity: number } => entry !== null)
    const doneTotal = doneItems.reduce((sum, { dish, quantity }) => sum + dish.price * quantity, 0)

    return (
      <div className="bk-done bk-ticket" role="status">
        <div className="bk-ticket-header">
          <div className="bk-ticket-title-group">
            <span className="bk-ticket-badge">
              <span className="bk-done-icon" aria-hidden="true">
                ✓
              </span>
              {t.doneBadge}
            </span>
            <h3>{t.doneTitle}</h3>
            <p>{t.doneText(done.code)}</p>
          </div>

          <div className="bk-ticket-code-box">
            <span>{t.bookingCodeLabel}</span>
            <strong>{done.code}</strong>
            <button
              type="button"
              className="bk-copy-btn"
              onClick={() => copyBookingCode(done.code)}
            >
              {copied ? `✓ ${t.copiedCode}` : t.copyCode}
            </button>
          </div>
        </div>

        <div className="bk-ticket-divider" aria-hidden="true" />

        <dl className="bk-done-details">
          <div>
            <dt>
              {t.date} & {t.time}
            </dt>
            <dd>
              {new Date(`${done.date}T12:00:00`).toLocaleDateString(
                language === 'vi' ? 'vi-VN' : 'en-GB',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                },
              )}{' '}
              · {done.time}
            </dd>
          </div>
          <div>
            <dt>{t.guests}</dt>
            <dd>
              {done.guests} {t.guestUnit}
            </dd>
          </div>
          <div>
            <dt>{t.area}</dt>
            <dd>{done.areaName}</dd>
          </div>
          <div>
            <dt>{t.doneContact}</dt>
            <dd>
              {done.name} · {done.phone}
            </dd>
          </div>
          {done.note && (
            <div>
              <dt>{t.note}</dt>
              <dd>{done.note}</dd>
            </div>
          )}
        </dl>

        {doneItems.length > 0 && (
          <div className="bk-ticket-menu">
            <h4>
              {t.preorder} ({doneItems.length})
            </h4>
            <ul>
              {doneItems.map(({ dish, quantity }) => (
                <li key={dish.id}>
                  <span className="bk-summary-dish">
                    <span className="bk-summary-thumb" aria-hidden="true">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt="" />
                      ) : (
                        <MenuIcon name="dish" size={16} />
                      )}
                    </span>
                    <span>
                      {dish.name[language]} <em>× {formatQuantity(dish, quantity, language)}</em>
                    </span>
                  </span>
                  <strong>{formatMoney(dish.price * quantity, language)}</strong>
                </li>
              ))}
            </ul>
            <div className="bk-ticket-total">
              <span>{t.estimate}</span>
              <strong>{formatMoney(doneTotal, language)}</strong>
            </div>
          </div>
        )}

        <div className="bk-ticket-footer">
          <a className="bk-link" href={`/${language}/reservation-status`}>
            {t.lookup}
          </a>
          <button type="button" className="sb-catering-submit" onClick={() => setDone(null)}>
            {t.doneAgain}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="bk-form" noValidate onSubmit={submit} onChange={clearFailure}>
      <div className="bk-form-top">
        <a className="bk-link" href={`/${language}/reservation-status`}>
          {t.lookup}
        </a>
        {settingsError && <p role="alert">{settingsError}</p>}
        {!settings && !settingsError && (
          <p role="status">
            {language === 'vi' ? 'Đang tải cấu hình đặt bàn…' : 'Loading booking settings…'}
          </p>
        )}
        {settings && !onlineAllowed && (
          <p className="bk-offline-banner" role="alert">
            {t.onlineClosed}
          </p>
        )}
      </div>
      <fieldset className="bk-form-fields" disabled={!onlineAllowed}>
        <div className="bk-form-col">
          <fieldset className="bk-step">
            <legend>
              <span className="bk-step-no">1</span>
              {t.step1}
            </legend>

            <div className="bk-row">
              <div className="sb-catering-field">
                <label htmlFor="bk-date">
                  {t.date} <span>*</span>
                </label>
                <input
                  id="bk-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
                {fieldError('date')}
              </div>

              <div className="sb-catering-field">
                <label htmlFor="bk-guests">
                  {t.guests} <span>*</span>
                </label>
                <div className="bk-guests">
                  <button
                    type="button"
                    onClick={() => setGuestCount(guests - 1)}
                    disabled={guests <= 1}
                    aria-label={t.fewer}
                  >
                    −
                  </button>
                  <input
                    id="bk-guests"
                    type="number"
                    inputMode="numeric"
                    value={guests}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => setGuestCount(guests + 1)}
                    aria-label={t.more}
                  >
                    +
                  </button>
                </div>
                {fieldError('guests')}
              </div>
            </div>

            <div className="bk-time-picker">
              <div className="bk-time-head">
                <span className="bk-label">
                  {t.time} <span className="bk-required">*</span>
                </span>
                {time && <span className="bk-time-selected">{time}</span>}
              </div>

              {!slots.length ? (
                <p className="bk-error">{t.noSlots}</p>
              ) : (
                <div className="bk-time-sessions">
                  {lunchSlots.length > 0 && (
                    <div className="bk-time-group">
                      <span className="bk-time-group-label">{t.lunchSession}</span>
                      <div className="bk-time-grid" role="group" aria-label={t.lunchSession}>
                        {lunchSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className="bk-time-pill"
                            aria-pressed={time === slot}
                            onClick={() => setTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {dinnerSlots.length > 0 && (
                    <div className="bk-time-group">
                      <span className="bk-time-group-label">{t.dinnerSession}</span>
                      <div className="bk-time-grid" role="group" aria-label={t.dinnerSession}>
                        {dinnerSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className="bk-time-pill"
                            aria-pressed={time === slot}
                            onClick={() => setTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {fieldError('time', 'durationMinutes')}
            </div>

            <div>
              <span className="bk-label">{t.area}</span>
              <div className="bk-area-cards" role="radiogroup" aria-label={t.area}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={area === ''}
                  className={`bk-area-card${area === '' ? ' is-selected' : ''}`}
                  onClick={() => setArea('')}
                >
                  <strong className="bk-area-name">{t.noAreaPreference}</strong>
                </button>
                {settings?.areas.map((a) => {
                  const selected = area === a.id
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`bk-area-card${selected ? ' is-selected' : ''}`}
                      onClick={() => setArea(a.id)}
                    >
                      <div className="bk-area-card-top">
                        <span className="bk-area-icon">{AREA_ICON}</span>
                      </div>
                      <strong className="bk-area-name">{a.name}</strong>
                    </button>
                  )
                })}
              </div>
              {area === '' && <p className="bk-summary-note">{t.noAreaHint}</p>}
              {fieldError('areaId')}
            </div>
          </fieldset>
        </div>

        <div className="bk-form-col">
          <fieldset className="bk-step">
            <legend>
              <span className="bk-step-no">2</span>
              {t.step2}
            </legend>

            <div className="bk-row">
              <div className="sb-catering-field">
                <label htmlFor="bk-name">
                  {t.name} <span>*</span>
                </label>
                <input
                  id="bk-name"
                  name="name"
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                />
                {fieldError('name')}
              </div>
              <div className="sb-catering-field">
                <label htmlFor="bk-phone">
                  {t.phone} <span>*</span>
                </label>
                <input
                  id="bk-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t.phonePlaceholder}
                />
                {fieldError('phone')}
              </div>
            </div>

            <div className="sb-catering-field">
              <label htmlFor="bk-email">{t.email}</label>
              <input
                id="bk-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
              />
              {fieldError('email')}
            </div>

            <div className="sb-catering-field">
              <label htmlFor="bk-note">{t.note}</label>
              <textarea id="bk-note" name="note" rows={3} placeholder={t.notePlaceholder} />
              {fieldError('note')}
            </div>
          </fieldset>

          <section className="bk-summary" aria-labelledby="bk-summary-title">
            <header>
              <h3 id="bk-summary-title">
                {t.preorder} ({chosen.length})
              </h3>
              {chosen.length > 0 && (
                <button type="button" className="bk-link" onClick={onCartClear}>
                  {t.clearCart}
                </button>
              )}
            </header>

            {chosen.length ? (
              <>
                <ul className="bk-summary-list">
                  {chosen.map((dish) => (
                    <li key={dish.id}>
                      <span className="bk-summary-dish">
                        <span className="bk-summary-thumb" aria-hidden="true">
                          {dish.imageUrl ? (
                            <img src={dish.imageUrl} alt="" />
                          ) : (
                            <MenuIcon name="dish" size={16} />
                          )}
                        </span>
                        <span className="bk-summary-dish-meta">
                          <span className="bk-summary-name">{dish.name[language]}</span>
                          <span className="bk-summary-unit-price">
                            {formatMoney(dish.price, language)}
                            {dish.unit === 'kg' ? ' / kg' : ''}
                          </span>
                        </span>
                      </span>

                      <span className="bk-stepper bk-stepper--small">
                        <button
                          type="button"
                          onClick={() => onCartChange(dish.id, cart[dish.id] - stepOf(dish))}
                          aria-label={`${t.remove}: ${dish.name[language]}`}
                        >
                          −
                        </button>
                        <output>{formatQuantity(dish, cart[dish.id], language)}</output>
                        <button
                          type="button"
                          onClick={() => onCartChange(dish.id, cart[dish.id] + stepOf(dish))}
                          aria-label={`${t.add}: ${dish.name[language]}`}
                        >
                          +
                        </button>
                      </span>

                      <span className="bk-summary-price">
                        {formatMoney(cart[dish.id] * dish.price, language)}
                      </span>
                    </li>
                  ))}
                </ul>

                {hasFoodInCart && maxCovered > 0 && (
                  <p className={`bk-coverage-badge${maxCovered < guests * 0.7 ? ' is-low' : ''}`}>
                    <MenuIcon name="people" size={15} />
                    <span>
                      {maxCovered < guests * 0.7
                        ? t.coverageLow(guests)
                        : t.coverageGood(Math.max(1, minCovered), Math.max(minCovered, maxCovered))}
                    </span>
                  </p>
                )}

                <div className="bk-summary-totals">
                  <p className="bk-summary-total">
                    <span>{t.estimate}</span>
                    <strong>{formatMoney(total, language)}</strong>
                  </p>
                  <p className="bk-summary-per-guest">
                    <span>
                      {t.estimatePerGuest} ({guests} {t.guestUnit})
                    </span>
                    <strong>
                      {formatMoney(Math.round(total / Math.max(1, guests)), language)}
                    </strong>
                  </p>
                </div>
                <p className="bk-summary-note">{t.estimateNote}</p>
              </>
            ) : (
              <p className="bk-summary-empty">
                {t.noPreorder} <a href="#catering-preorder">{t.pickDishes}</a>.
              </p>
            )}
            {fieldError('items')}
          </section>

          {chosen.length > 0 && (
            <div className="bk-policy">
              <p className="bk-summary-note">{t.depositNotice}</p>
              <label className="bk-check">
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(event) => setAcceptedPolicy(event.target.checked)}
                />
                <span>{t.depositPolicy}</span>
              </label>
              {fieldError('depositPolicy')}
            </div>
          )}

          {failed && !SHOWN_INLINE.includes(failedField) && (
            <p className="bk-error" role="alert">
              {failed}
            </p>
          )}
          <div className="bk-submit-row">
            <button
              className="sb-catering-submit"
              type="submit"
              disabled={sending || !onlineAllowed || !slots.length}
            >
              {sending ? t.submitting : t.submit}
            </button>
            <p>{t.requiredHint}</p>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
