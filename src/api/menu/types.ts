/** Customer-facing menu. Text is stored in both site languages. */
export interface Localized {
  vi: string
  en: string
}

export type DishAvailability = 'AVAILABLE' | 'SOLD_OUT' | 'DISCONTINUED'

export type DishTag = 'signature' | 'spicy' | 'sharing' | 'new'

export type Allergen = 'shellfish' | 'fish' | 'gluten' | 'dairy' | 'egg' | 'soy'

/** How the price is quoted: per portion, per kilogram (live seafood) or per drink. */
export type PriceUnit = 'portion' | 'kg' | 'glass' | 'bottle'

/** Which list on the menu page a category belongs to. */
export type MenuGroup = 'food' | 'drink'

export interface MenuCategory {
  id: string
  group: MenuGroup
  name: Localized
  description?: Localized
}

export interface Dish {
  /** Shared with the kitchen menu where the dish exists there. */
  id: string
  categoryId: string
  name: Localized
  description: Localized
  imageUrl?: string
  /** VND. For `kg` dishes this is the price per kilogram before weighing. */
  price: number
  unit: PriceUnit
  /** Guests one order is meant for, when relevant. */
  serves?: [min: number, max: number]
  /** Cooking styles guests can ask for. */
  preparations?: Localized[]
  /** 0 – 3 */
  spiceLevel?: number
  tags: DishTag[]
  allergens: Allergen[]
  /** Dishes suggested alongside this one. */
  pairsWith?: string[]
  status: DishAvailability
}

export interface MenuData {
  categories: MenuCategory[]
  dishes: Dish[]
}
