export interface MenuChoice {
  id: string
  name: string
  image?: string
  priceDelta: number
}

export interface MenuOptionGroup {
  id: string
  name: string
  required: boolean
  minSelections?: number
  maxSelections: number
  allowDuplicates?: boolean
  choices: MenuChoice[]
}

export interface MenuItem {
  id: string
  name: string
  description: string
  image: string
  price: number
  kind: 'combo' | 'product'
  tags: { name: string; image: string; slug?: string }[]
  variants: { id: string; name: string; price: number }[]
  options: MenuOptionGroup[]
}

export interface MenuGroup {
  id: string
  name: string
  banner?: string
  description?: string
  items: MenuItem[]
}

export interface MenuSection {
  id: string
  name: string
  icon: string
  banner?: string
  groups: MenuGroup[]
}
