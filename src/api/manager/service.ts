import { authenticatedRequest } from '../auth'
import type { ManagerCommand, ManagerData, MenuCategory } from './types'

interface CategoryDto { id: string; name: string; sortOrder: number; visible: boolean; group: 'food' | 'drink' }

const toCategory = ({ id, name, visible, sortOrder, group }: CategoryDto): MenuCategory => ({ id, name, visible, sort: sortOrder, group })

export const managerService = {
  mode: 'api' as const,
  async load() {
    const [snapshot, categories] = await Promise.all([
      authenticatedRequest<ManagerData>('workspaces/manager'),
      authenticatedRequest<CategoryDto[]>('menu/categories?all=true'),
    ])
    return { ...snapshot, categories: categories.map(toCategory) }
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
    return authenticatedRequest<ManagerData>('workspaces/manager/commands', {
      method: 'POST', body: JSON.stringify(command),
    })
  },
  subscribe(listener: () => void) {
    const timer = window.setInterval(() => { if (!document.hidden) listener() }, 5000)
    return () => window.clearInterval(timer)
  },
}
