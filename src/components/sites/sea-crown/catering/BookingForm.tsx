import { useState, type FormEvent, type ReactNode } from 'react'
import type { Dish } from '../../../../api/menu/types'
import { reservationService } from '../../../../api/reservations/service'
import type { Occasion, Reservation, SeatingArea } from '../../../../api/reservations/types'
import { MenuIcon } from '../menu/MenuIcons'
import type { Language } from '../siteData'
import {
  AREAS, BOOKING_COPY, cartGuestCoverage, cartTotal, formatMoney, formatQuantity,
  GUEST_PRESETS, OCCASIONS, stepOf, type Cart,
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

const TIME_ZONE = 'Europe/Amsterdam'
const MAX_GUESTS = 60
const PRIVATE_MIN_GUESTS = 8

/** 10:00 – 21:30 every half hour. */
const SLOTS = Array.from({ length: 24 }, (_, i) => `${String(10 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

function restaurantNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

/** Today's slots need at least an hour's notice. */
function availableSlots(date: string) {
  const now = restaurantNow()
  if (date !== now.date) return SLOTS
  const [h, m] = now.time.split(':').map(Number)
  const earliest = h * 60 + m + 60
  return SLOTS.filter((slot) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3)) >= earliest)
}

const AREA_ICONS: Record<SeatingArea, ReactNode> = {
  main: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="22" height="7" rx="2" />
      <path d="M7 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" />
      <circle cx="8.5" cy="19.5" r="3.5" />
      <circle cx="19.5" cy="19.5" r="3.5" />
      <path d="M8.5 14v1.5M8.5 23.5V25M19.5 14v1.5M19.5 23.5V25" />
    </svg>
  ),
  outdoor: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4c-5.5 0-10 4-10 9h20c0-5-4.5-9-10-9Z" />
      <path d="M14 13v11M9 24h10" />
      <circle cx="22" cy="6" r="2" />
    </svg>
  ),
  private: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="22" height="22" rx="4" />
      <rect x="8" y="10" width="12" height="8" rx="2" />
      <path d="M10 7.5h2M16 7.5h2M10 20.5h2M16 20.5h2M5.5 13v2M22.5 13v2" />
    </svg>
  ),
}

export function BookingForm({
  language, dishes, cart, guests, onGuestsChange, onCartChange, onCartClear,
}: BookingFormProps) {
  const t = BOOKING_COPY[language]
  const today = restaurantNow().date
  const initialSlots = availableSlots(today)
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(() => (initialSlots.includes('18:30') ? '18:30' : initialSlots[0] ?? ''))
  const [area, setArea] = useState<SeatingArea>('main')
  const [occasion, setOccasion] = useState<Occasion>('none')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState<Reservation | null>(null)
  const [copied, setCopied] = useState(false)

  const slots = availableSlots(date)
  const lunchSlots = slots.filter((s) => Number(s.slice(0, 2)) < 15)
  const dinnerSlots = slots.filter((s) => Number(s.slice(0, 2)) >= 15)

  const chosen = dishes.filter((d) => cart[d.id])
  const total = cartTotal(cart, dishes)
  const [minCovered, maxCovered] = cartGuestCoverage(cart, dishes)
  const hasFoodInCart = chosen.some((d) => d.serves)
  const privateTooSmall = area === 'private' && guests < PRIVATE_MIN_GUESTS
  const setGuestCount = (value: number) => onGuestsChange(Math.max(1, Math.min(MAX_GUESTS, Math.round(value) || 1)))

  function handleDateChange(nextDate: string) {
    setDate(nextDate)
    const nextSlots = availableSlots(nextDate)
    if (!nextSlots.includes(time)) {
      setTime(nextSlots.includes('18:30') ? '18:30' : nextSlots[0] ?? '')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (privateTooSmall || sending || !time) {
      if (!time) setFailed(true)
      return
    }
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()
    setSending(true)
    setFailed(false)
    try {
      const reservation = await reservationService.create({
        date, time, guests, area, occasion,
        name: text('name'), phone: text('phone'), email: text('email') || undefined, note: text('note') || undefined,
        items: chosen.map((d) => ({ dishId: d.id, quantity: cart[d.id] })),
      })
      setDone(reservation)
      onCartClear()
    } catch {
      setFailed(true)
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
              <span className="bk-done-icon" aria-hidden="true">✓</span>
              {t.doneBadge}
            </span>
            <h3>{t.doneTitle}</h3>
            <p>{t.doneText(done.code)}</p>
          </div>

          <div className="bk-ticket-code-box">
            <span>{t.bookingCodeLabel}</span>
            <strong>{done.code}</strong>
            <button type="button" className="bk-copy-btn" onClick={() => copyBookingCode(done.code)}>
              {copied ? `✓ ${t.copiedCode}` : t.copyCode}
            </button>
          </div>
        </div>

        <div className="bk-ticket-divider" aria-hidden="true" />

        <dl className="bk-done-details">
          <div>
            <dt>{t.date} & {t.time}</dt>
            <dd>
              {new Date(`${done.date}T12:00:00`).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })} · {done.time}
            </dd>
          </div>
          <div>
            <dt>{t.guests}</dt>
            <dd>{done.guests} {t.guestUnit}</dd>
          </div>
          <div>
            <dt>{t.area}</dt>
            <dd>{t.areaLabel[done.area]}</dd>
          </div>
          <div>
            <dt>{t.occasion}</dt>
            <dd>{t.occasionLabel[done.occasion]}</dd>
          </div>
          <div>
            <dt>{t.doneContact}</dt>
            <dd>{done.name} · {done.phone}</dd>
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
            <h4>{t.preorder} ({doneItems.length})</h4>
            <ul>
              {doneItems.map(({ dish, quantity }) => (
                <li key={dish.id}>
                  <span>{dish.name[language]} <em>× {formatQuantity(dish, quantity, language)}</em></span>
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
          <p className="bk-demo-note">{t.demoNote}</p>
          <button type="button" className="sb-catering-submit" onClick={() => setDone(null)}>{t.doneAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <form className="bk-form" onSubmit={submit} onChange={() => setFailed(false)}>
      <div className="bk-form-col">
        <fieldset className="bk-step">
          <legend><span className="bk-step-no">1</span>{t.step1}</legend>

          <div className="bk-row">
            <div className="sb-catering-field">
              <label htmlFor="bk-date">{t.date} <span>*</span></label>
              <input id="bk-date" type="date" required min={today} value={date} onChange={(e) => handleDateChange(e.target.value)} />
            </div>

            <div className="sb-catering-field">
              <label htmlFor="bk-guests">{t.guests} <span>*</span></label>
              <div className="bk-guests">
                <button type="button" onClick={() => setGuestCount(guests - 1)} disabled={guests <= 1} aria-label={t.fewer}>−</button>
                <input id="bk-guests" type="number" inputMode="numeric" min={1} max={MAX_GUESTS} value={guests} onChange={(e) => setGuestCount(Number(e.target.value))} />
                <button type="button" onClick={() => setGuestCount(guests + 1)} disabled={guests >= MAX_GUESTS} aria-label={t.more}>+</button>
              </div>
            </div>
          </div>

          <div className="bk-guest-presets" role="group" aria-label={t.guestPresetsLabel}>
            <span className="bk-preset-label">{t.guestPresetsLabel}</span>
            {GUEST_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="bk-preset-chip"
                aria-pressed={guests === preset}
                onClick={() => setGuestCount(preset)}
              >
                {preset} {t.guestUnit}
              </button>
            ))}
          </div>

          {guests >= PRIVATE_MIN_GUESTS && area !== 'private' && (
            <div className="bk-smart-banner" role="status">
              <span>{t.recommendPrivate}</span>
              <button type="button" onClick={() => setArea('private')}>{t.switchPrivate}</button>
            </div>
          )}

          <div className="bk-time-picker">
            <div className="bk-time-head">
              <span className="bk-label">{t.time} <span className="bk-required">*</span></span>
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
          </div>

          <div>
            <span className="bk-label">{t.area} <span className="bk-required">*</span></span>
            <div className="bk-area-cards" role="radiogroup" aria-label={t.area}>
              {AREAS.map((a) => {
                const selected = area === a
                return (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`bk-area-card${selected ? ' is-selected' : ''}`}
                    onClick={() => setArea(a)}
                  >
                    <div className="bk-area-card-top">
                      <span className="bk-area-icon">{AREA_ICONS[a]}</span>
                      <span className="bk-area-cap">
                        <MenuIcon name="people" size={13} />
                        {t.areaCapacity[a]}
                      </span>
                    </div>
                    <strong className="bk-area-name">{t.areaLabel[a]}</strong>
                    <span className="bk-area-desc">{t.areaHint[a]}</span>
                    <span className="bk-area-features">
                      {t.areaFeatures[a].map((feat) => (
                        <span key={feat} className="bk-area-tag">{feat}</span>
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
            {privateTooSmall && <p className="bk-error" role="alert">{t.privateTooSmall}</p>}
          </div>

          <div>
            <span className="bk-label">{t.occasion}</span>
            <div className="bk-chips">
              {OCCASIONS.map((o) => (
                <button key={o} type="button" className="bk-chip" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>
                  {t.occasionLabel[o]}
                </button>
              ))}
            </div>
          </div>
        </fieldset>
      </div>

      <div className="bk-form-col">
        <fieldset className="bk-step">
          <legend><span className="bk-step-no">2</span>{t.step2}</legend>

          <div className="bk-row">
            <div className="sb-catering-field">
              <label htmlFor="bk-name">{t.name} <span>*</span></label>
              <input id="bk-name" name="name" required autoComplete="name" placeholder={t.namePlaceholder} />
            </div>
            <div className="sb-catering-field">
              <label htmlFor="bk-phone">{t.phone} <span>*</span></label>
              <input id="bk-phone" name="phone" type="tel" required autoComplete="tel" pattern="[0-9+ ().-]{8,}" placeholder={t.phonePlaceholder} />
            </div>
          </div>

          <div className="sb-catering-field">
            <label htmlFor="bk-email">{t.email}</label>
            <input id="bk-email" name="email" type="email" autoComplete="email" placeholder={t.emailPlaceholder} />
          </div>

          <div className="sb-catering-field">
            <label htmlFor="bk-note">{t.note}</label>
            <textarea id="bk-note" name="note" rows={3} placeholder={t.notePlaceholder} />
          </div>
        </fieldset>

        <section className="bk-summary" aria-labelledby="bk-summary-title">
          <header>
            <h3 id="bk-summary-title">{t.preorder} ({chosen.length})</h3>
            {chosen.length > 0 && <button type="button" className="bk-link" onClick={onCartClear}>{t.clearCart}</button>}
          </header>

          {chosen.length ? (
            <>
              <ul className="bk-summary-list">
                {chosen.map((dish) => (
                  <li key={dish.id}>
                    <span className="bk-summary-dish">
                      <span className="bk-summary-thumb" aria-hidden="true">
                        {dish.imageUrl ? <img src={dish.imageUrl} alt="" /> : <MenuIcon name="dish" size={16} />}
                      </span>
                      <span className="bk-summary-dish-meta">
                        <span className="bk-summary-name">{dish.name[language]}</span>
                        <span className="bk-summary-unit-price">{formatMoney(dish.price, language)}{dish.unit === 'kg' ? ' / kg' : ''}</span>
                      </span>
                    </span>

                    <span className="bk-stepper bk-stepper--small">
                      <button type="button" onClick={() => onCartChange(dish.id, cart[dish.id] - stepOf(dish))} aria-label={`${t.remove}: ${dish.name[language]}`}>−</button>
                      <output>{formatQuantity(dish, cart[dish.id], language)}</output>
                      <button type="button" onClick={() => onCartChange(dish.id, cart[dish.id] + stepOf(dish))} aria-label={`${t.add}: ${dish.name[language]}`}>+</button>
                    </span>

                    <span className="bk-summary-price">{formatMoney(cart[dish.id] * dish.price, language)}</span>
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
                  <span>{t.estimatePerGuest} ({guests} {t.guestUnit})</span>
                  <strong>{formatMoney(Math.round(total / Math.max(1, guests)), language)}</strong>
                </p>
              </div>
              <p className="bk-summary-note">{t.estimateNote}</p>
            </>
          ) : (
            <p className="bk-summary-empty">
              {t.noPreorder} <a href="#catering-preorder">{t.pickDishes}</a>.
            </p>
          )}
        </section>

        {failed && <p className="bk-error" role="alert">{t.failed}</p>}
        <div className="bk-submit-row">
          <button className="sb-catering-submit" type="submit" disabled={sending || privateTooSmall || !slots.length}>
            {sending ? t.submitting : t.submit}
          </button>
          <p>{t.requiredHint}</p>
        </div>
      </div>
    </form>
  )
}
