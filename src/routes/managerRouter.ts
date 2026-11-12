export { navigate, useKitchenUrl as useManagerUrl } from './kitchenRouter'
export const isManagerPath = (path: string) => path === '/manager' || path.startsWith('/manager/')
export const managerPages = ['dashboard', 'operations', 'reservations', 'tables', 'orders', 'kitchen', 'employees', 'shifts', 'menu', 'categories', 'approvals', 'reports', 'incidents', 'notifications', 'profile'] as const
export type ManagerPage = typeof managerPages[number]
export const managerPath = (page: ManagerPage, id?: string) => `/manager${page === 'dashboard' ? '' : page === 'categories' ? '/menu/categories' : `/${page}`}${id ? `?id=${encodeURIComponent(id)}` : ''}`
export function matchManagerRoute(path: string): ManagerPage | 'login' | 'not-found' {
  if (path === '/manager') return 'dashboard'
  if (path === '/manager/login') return 'login'
  if (path === '/manager/menu/categories') return 'categories'
  const rest = path.slice('/manager/'.length)
  return managerPages.includes(rest as ManagerPage) && rest !== 'dashboard' && rest !== 'categories' ? rest as ManagerPage : 'not-found'
}
