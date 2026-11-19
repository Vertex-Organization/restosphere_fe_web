import { authenticatedRequest } from '../auth'
import type { ManagerCommand, ManagerData, MenuCategory, MenuItem } from './types'

interface CategoryDto { id: string; name: string; sortOrder: number; visible: boolean; group: 'food' | 'drink' }
interface ItemDto {
  id: string; name: string; categoryId: string; categoryName: string; price: number; description: string | null
  imageUrl: string | null; status: MenuItem['status']; unit: 'portion' | 'kg'; updatedAt: string
}

const toCategory = ({ id, name, visible, sortOrder, group }: CategoryDto): MenuCategory => ({ id, name, visible, sort: sortOrder, group })
const toItem = ({ id, name, categoryId, price, imageUrl, description, status, unit, updatedAt }: ItemDto): MenuItem => ({
  id, name, categoryId, price: Number(price), image: imageUrl ?? '', description: description ?? '', status, unit, updatedAt,
})

export const managerService = {
  mode: 'api' as const,
  async load() {
    const [snapshot, categories, menu] = await Promise.all([
      authenticatedRequest<ManagerData>('workspaces/manager'),
      authenticatedRequest<CategoryDto[]>('menu/categories?all=true'),
      authenticatedRequest<ItemDto[]>('menu/items?all=true'),
    ])
    return { ...snapshot, categories: categories.map(toCategory), menu: menu.map(toItem) }
  },
  async execute(command: ManagerCommand): Promise<ManagerData> {
    if (command.type === 'category.save') {
      const { id, name, sort, visible, group } = command.category
      await authenticatedRequest<CategoryDto>(command.creating ? 'menu/categories' : `menu/categories/${encodeURIComponent(id)}`, {
        method: command.creating ? 'POST' : 'PUT', body: JSON.stringify({ name, sortOrder: sort, visible, group: group ?? 'food' }),
      })
      return managerService.load()
    }
    if (command.type === 'category.delete') {
      await authenticatedRequest<void>(`menu/categories/${encodeURIComponent(command.id)}`, { method: 'DELETE' })
      return managerService.load()
    }
    if (command.type === 'menu.save') {
      const { id, name, categoryId, price, description, image, status, unit } = command.item
      await authenticatedRequest<ItemDto>(command.creating ? 'menu/items' : `menu/items/${encodeURIComponent(id)}`, {
        method: command.creating ? 'POST' : 'PUT', body: JSON.stringify({ name, categoryId, price, description, imageUrl: image, status, unit: unit ?? 'portion' }),
      })
      return managerService.load()
    }
    if (command.type === 'menu.delete') {
      await authenticatedRequest<void>(`menu/items/${encodeURIComponent(command.id)}`, { method: 'DELETE' })
      return managerService.load()
    }
    return authenticatedRequest<ManagerData>('workspaces/manager/commands', {
      method: 'POST', body: JSON.stringify(command),
    })
  },
  subscribe(listener: () => void) {
    const timer = window.setInterval(() => { if (!document.hidden) listener() }, 5000)
    return () => window.clearInterval(timer)
  },
}
