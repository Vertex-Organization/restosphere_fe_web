import { apiRequest } from '../client'
import type { DishAvailability, MenuData, PriceUnit, MenuGroup } from './types'

export interface MenuService {
  load(): Promise<MenuData>
  subscribe(listener: () => void): () => void
}

interface CategoryResponse { id: string; name: string; sortOrder: number; visible: boolean; group: MenuGroup }
interface ItemResponse {
  id: string; name: string; categoryId: string; price: number
  description: string | null; imageUrl: string | null; status: DishAvailability
  unit: PriceUnit
}

export const menuService: MenuService = {
  async load() {
    const [categories, items] = await Promise.all([
      apiRequest<CategoryResponse[]>('/menu/categories'),
      apiRequest<ItemResponse[]>('/menu/items'),
    ])
    return {
      categories: categories.map(category => ({
        id: category.id, name: { vi: category.name, en: category.name },
        group: category.group,
      })),
      dishes: items.map(item => {
        const description = item.description ?? ''
        return {
          id: item.id, categoryId: item.categoryId,
          name: { vi: item.name, en: item.name },
          description: { vi: description, en: description },
          imageUrl: item.imageUrl ?? undefined, price: item.price,
          unit: item.unit, tags: [], allergens: [], status: item.status,
        }
      }),
    }
  },
  subscribe(listener) {
    const timer = window.setInterval(listener, 30_000)
    return () => window.clearInterval(timer)
  },
}
