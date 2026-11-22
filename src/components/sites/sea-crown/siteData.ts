export type Language = 'vi' | 'en'

export type CateringSection = 'booking' | 'preorder'

export const asset = (name: string) => `/sites/sea-crown/${name}`

export const external = {
  instagram: 'https://instagram.com/thesandwichbarams',
  tiktok: 'https://www.tiktok.com/@thesandwichbaramsterdam',
  order: 'https://catering.thesandwichbar.nl',
}

export const cateringHref = (language: Language, section: CateringSection) =>
  `/${language}/catering#catering-${section}`

const sitePages = new Set(['/', '/menu', '/catering', '/privacy', '/terms', '/reservation-status'])

export const isSiteRoute = (pathname: string) => {
  const page = pathname.replace(/^\/(vi|nl|en)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  return sitePages.has(page)
}
