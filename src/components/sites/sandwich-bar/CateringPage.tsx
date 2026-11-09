import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from 'gsap'
import './CateringPage.css'

type Language = 'nl' | 'en'

const asset = (file: string) => `/sites/sandwich-bar/${file}`
const oddImages = [1, 3, 5, 7]
const evenImages = [2, 4, 6, 8]
const logos = [
  '8f2d539fe79fb48710785569e1981c28416943c0-516x74.png',
  'c0f37bba6d4b62706d95b480aab6c5785cfa3216-360x283.png',
  '53d8e43b85c7219178ed41e21a001ac29e429fb2-516x266.png',
  'c8ce01ecb99ac0e453c4da51a8afc54903dd8b49-516x101.png',
  '1aa10546b4fc68291e3f0247ff3330126382d1d8-516x291.png',
  '1b51fccae3bb986ecd7b2babc30bdb9fa4e0a1eb-250x250.png',
  '6dc5ab73073464029c3dd61ecf6b41aea571142f-334x150.png',
  '3ecdee6b02c2d874a5d914639f564b40e6962f2e-516x218.png',
  '6042d4ef84949f5323fc286f64fbb296eb408ef3-516x79.png',
  '3225f98bb2824873cd8c0745a9bab2aa81adef14-516x294.png',
  '6177c654c669dc560c85b135fe2f57521117b534-413x161.png',
  'f5d1d771b252beead6619b492973a815981f2f78-358x358.png',
]

const copy = {
  nl: {
    title: 'Catering zoals het hoort te zijn, vers, flexibel, en altijd op tijd',
    intro: 'The Sandwich Bar catering levert rijk belegde broodjes aan jouw team – zonder poespas én budgetvriendelijk. Ontdek het zelf met een gratis proeflunch box: 5 vers gemaakte broodjes, direct op kantoor bezorgd. Zin om te proeven?',
    order: 'Bestel direct', questions: 'Vragen? Neem contact op:', trusted: 'Zij gingen je al voor',
    menu: 'Catering menu', menuIntro: 'Bekijk ons complete catering aanbod.',
    formTitle: 'Bestel je gratis proeflunch box',
    formIntro: 'Vul het formulier in en wij bezorgen 5 vers gemaakte broodjes op jouw kantoor.',
    dateNote: 'Het is niet mogelijk om een test box voor vandaag te bestellen — minimaal één dag van te voren bestellen.',
    submit: 'Aanvraag versturen',
    emailNote: 'Je aanvraag wordt klaargezet als e-mail. Controleer en verstuur deze zelf in je e-mailapp.',
    ready: 'Je aanvraag staat klaar. Er is nog niets verstuurd.', openEmail: 'Open je e-mailapp',
    pdf: 'Open het catering menu (PDF)',
    fields: { companyName: 'Bedrijfsnaam', name: 'Jouw naam', email: 'Email', phone: 'Telefoon', deliveryDate: 'Bezorgdatum', deliveryTime: 'Bezorgtijd', address: 'Adres', postalCode: 'Postcode' },
  },
  en: {
    title: 'Catering done right — fresh, flexible, and always on time',
    intro: 'The Sandwich Bar catering delivers richly topped sandwiches to your team — no fuss and budget-friendly. Discover it yourself with a free trial lunch box: 5 freshly made sandwiches, delivered straight to your office. Ready to taste?',
    order: 'Order now', questions: 'Questions? Get in touch:', trusted: 'Trusted by great companies',
    menu: 'Our catering menu', menuIntro: 'Browse our full catering offering.',
    formTitle: 'Order your free trial lunch box',
    formIntro: "Fill in the form below and we'll deliver 5 freshly made sandwiches to your office.",
    dateNote: 'It is not possible to order a trial box for today — minimum one day in advance.',
    submit: 'Submit request',
    emailNote: 'Your request will be prepared as an email. Please review and send it yourself in your email app.',
    ready: 'Your request is ready. Nothing has been sent yet.', openEmail: 'Open your email app',
    pdf: 'Open the catering menu (PDF)',
    fields: { companyName: 'Company name', name: 'Your name', email: 'Email', phone: 'Phone', deliveryDate: 'Delivery date', deliveryTime: 'Delivery time', address: 'Address', postalCode: 'Postal code' },
  },
}

function ImageStream({ images, offset = false }: { images: number[]; offset?: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = track.current
    const wrapper = container.current
    if (!element || !wrapper) return
    const motion = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    let animation: gsap.core.Tween | undefined
    let resizeFrame = 0
    let previousWidth = -1

    const animate = () => {
      const progress = animation?.progress() ?? 0
      animation?.kill()
      gsap.set(element, { clearProps: 'transform' })
      if (!motion.matches) return
      const firstGroup = Array.from(element.children).slice(0, images.length) as HTMLElement[]
      // Include the final gap between the original group and its identical copy.
      const distance = firstGroup.reduce((height, image) => height + image.offsetHeight + 12, 0)
      if (!distance) return
      animation = gsap.to(element, { y: -distance, duration: offset ? 22 : 28, ease: 'none', repeat: -1 })
      animation.progress(progress)
    }

    const resize = () => {
      const currentWidth = wrapper.getBoundingClientRect().width
      if (currentWidth === previousWidth) return
      previousWidth = currentWidth
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(animate)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrapper)
    motion.addEventListener('change', animate)
    animate()
    return () => {
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      motion.removeEventListener('change', animate)
      animation?.kill()
      gsap.set(element, { clearProps: 'transform' })
    }
  }, [images, offset])

  return <div ref={container} className={`sb-catering-stream${offset ? ' is-offset' : ''}`} aria-hidden="true">
    <div ref={track} className="sb-catering-stream-track">
      {[...images, ...images].map((number, index) => <img key={`${number}-${index}`} src={asset(`The Sandwichbar 0${number}.webp`)} alt="" loading={index < 4 ? 'eager' : 'lazy'} />)}
    </div>
  </div>
}

function LogoWall() {
  const wall = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wall.current
    if (!element) return
    const allSlots = Array.from(element.querySelectorAll<HTMLDivElement>('.sb-catering-logo'))
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const breakpoint = window.matchMedia('(max-width: 991px)')
    let visibleSlots: HTMLDivElement[] = []
    let order: number[] = []
    let queue: string[] = []
    let turn = 0
    let cadence: gsap.core.Timeline | undefined
    const transitions = new Set<gsap.core.Tween>()
    let visible = element.getBoundingClientRect().top < window.innerHeight && element.getBoundingClientRect().bottom > 0

    function shuffle<T,>(values: T[]): T[] {
      const result = [...values]
      for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
      }
      return result
    }

    function createTarget(file: string) {
      const target = document.createElement('div')
      target.className = 'sb-catering-logo-target'
      const image = document.createElement('img')
      image.src = asset(`logos/${file}`)
      image.alt = ''
      image.loading = 'lazy'
      target.appendChild(image)
      return target
    }

    const stopTransitions = () => {
      cadence?.kill()
      for (const tween of transitions) tween.kill()
      transitions.clear()
    }

    const swap = () => {
      if (!visibleSlots.length) return
      if (!queue.length) queue = shuffle(logos)
      const parent = visibleSlots[order[turn % visibleSlots.length]]
      turn += 1
      // Leave an unfinished replacement alone; this also guards fast breakpoint changes.
      if (parent.children.length > 1) return
      const outgoing = parent.firstElementChild
      const incoming = createTarget(queue.shift()!)
      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 })
      parent.appendChild(incoming)
      if (outgoing) {
        const exit = gsap.to(outgoing, {
          yPercent: -50, autoAlpha: 0, duration: 0.9, ease: 'expo.inOut',
          onComplete: () => { outgoing.remove(); transitions.delete(exit) },
        })
        transitions.add(exit)
      }
      const enter = gsap.to(incoming, {
        yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.inOut',
        onComplete: () => {
          gsap.set(incoming, { clearProps: 'transform,opacity,visibility' })
          transitions.delete(enter)
        },
      })
      transitions.add(enter)
    }

    const initialize = () => {
      stopTransitions()
      for (const slot of allSlots) slot.replaceChildren()
      visibleSlots = allSlots.filter(slot => getComputedStyle(slot).display !== 'none')
      order = shuffle(visibleSlots.map((_, index) => index))
      turn = 0
      const initial = motion.matches ? [...logos] : shuffle(logos)
      visibleSlots.forEach((slot, index) => slot.appendChild(createTarget(initial[index % initial.length])))
      queue = shuffle([...initial.slice(visibleSlots.length), ...logos])
      if (motion.matches) return
      cadence = gsap.timeline({ repeat: -1, repeatDelay: 1.5, paused: !visible || document.hidden }).call(swap)
    }

    const updatePlayback = () => {
      if (visible && !document.hidden) cadence?.play()
      else cadence?.pause()
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      updatePlayback()
    })
    initialize()
    observer.observe(element)
    breakpoint.addEventListener('change', initialize)
    motion.addEventListener('change', initialize)
    document.addEventListener('visibilitychange', updatePlayback)
    return () => {
      stopTransitions()
      observer.disconnect()
      breakpoint.removeEventListener('change', initialize)
      motion.removeEventListener('change', initialize)
      document.removeEventListener('visibilitychange', updatePlayback)
      for (const slot of allSlots) slot.replaceChildren()
    }
  }, [])
  return <div ref={wall} className="sb-catering-logos" aria-label="The Sandwich Bar catering clients">
    {Array.from({ length: 16 }, (_, index) => <div className="sb-catering-logo" key={index} />)}
  </div>
}

function nextDeliveryDate() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const next = new Date(`${today}T12:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

export default function CateringPage({ language }: { language: Language }) {
  const t = copy[language]
  const [emailDraft, setEmailDraft] = useState('')
  const fields = Object.entries(t.fields) as [keyof typeof t.fields, string][]

  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const body = fields.map(([name, label]) => `${label}: ${String(values.get(name) || '')}`).join('\n')
    setEmailDraft(`mailto:orders@thesandwichbar.nl?subject=${encodeURIComponent(language === 'nl' ? 'Aanvraag gratis proeflunch box' : 'Free trial lunch box request')}&body=${encodeURIComponent(body)}`)
  }

  return <main id="main-content" className="sb-catering-page">
    <section className="sb-catering-hero">
      <img className="sb-catering-mobile-image" src={asset('The Sandwichbar 01.webp')} alt="The Sandwich Bar catering" />
      <div className="sb-catering-hero-inner">
        <div className="sb-catering-hero-copy">
          <span className="sb-catering-eyebrow">Catering</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <a className="sb-catering-button" href="https://catering.thesandwichbar.nl" target="_blank" rel="noopener noreferrer">{t.order}</a>
          <div className="sb-catering-contact">
            <p>{t.questions}</p>
            <div><a href="mailto:orders@thesandwichbar.nl">orders@thesandwichbar.nl</a><a href="tel:0615657447">06-15657447</a><a href="tel:0615004988">06-15004988</a></div>
          </div>
        </div>
        <div className="sb-catering-streams"><ImageStream images={oddImages} /><ImageStream images={evenImages} offset /></div>
      </div>
    </section>
    <section className="sb-catering-trusted">
      <div className="sb-catering-container"><p>{t.trusted}</p><LogoWall /></div>
    </section>
    <section id="catering-menu" className="sb-catering-menu">
      <div className="sb-catering-container">
        <header><h2>{t.menu}</h2><p>{t.menuIntro}</p></header>
        <div className="sb-catering-pdf">
          <a href={asset('menu-catering.pdf')} target="_blank" rel="noopener noreferrer" aria-label={t.pdf}>
            <img src={asset('menu-catering-page-1.webp')} alt={t.menu} loading="lazy" />
          </a>
        </div>
      </div>
    </section>
    <section id="trial-lunch" className="sb-catering-trial">
      <div className="sb-catering-container sb-catering-trial-grid">
        <div className="sb-catering-trial-intro"><span className="sb-catering-eyebrow">Catering</span><h2>{t.formTitle}</h2><p>{t.formIntro}</p></div>
        <form className="sb-catering-form" onSubmit={prepareRequest} onChange={() => setEmailDraft('')}>
          <div className="sb-catering-fields">
            {fields.map(([name, label]) => <div className="sb-catering-field" key={name}>
              <label htmlFor={`catering-${name}`}>{label} <span>*</span></label>
              <input id={`catering-${name}`} name={name} required type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : name === 'deliveryDate' ? 'date' : name === 'deliveryTime' ? 'time' : 'text'} min={name === 'deliveryDate' ? nextDeliveryDate() : undefined} autoComplete={name === 'companyName' ? 'organization' : name === 'name' ? 'name' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : name === 'address' ? 'street-address' : name === 'postalCode' ? 'postal-code' : undefined} />
              {name === 'deliveryDate' && <p>{t.dateNote}</p>}
            </div>)}
          </div>
          <div><button className="sb-catering-submit" type="submit">{t.submit}</button></div>
          <p className="sb-catering-email-note">{t.emailNote}</p>
          {emailDraft && <div className="sb-catering-draft" role="status"><p>{t.ready}</p><a href={emailDraft}>{t.openEmail} ↗</a></div>}
        </form>
      </div>
    </section>
  </main>
}
