import { WORKSPACES, type StaffRole, type WorkspaceRole } from '../../routes/staffRouter'

export interface StaffAccount {
  /** Employee id shared by every module (NV010 is the same cook in Kitchen, Cashier and Manager data). */
  id: string
  username: string
  email?: string
  name: string
  position: string
  role: StaffRole
}

interface DemoAccount extends StaffAccount {
  password: string
}

// Demo directory for the single staff sign-in. Replace with the auth API together
// with the module data adapters; the backend must enforce roles, not this list.
// Passwords are the ones each module used before the sign-in was unified.
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { id: 'admin-demo-01', username: 'admin', email: 'admin@restosphere.test', password: 'Admin@123', role: 'ADMIN', name: 'Nguyễn Minh Anh', position: 'Quản trị hệ thống' },
  { id: 'NV001', username: 'manager', password: 'Manager@123', role: 'MANAGER', name: 'Nguyễn Minh Anh', position: 'Quản lý nhà hàng' },
  { id: 'NV020', username: 'cashier', password: '123456', role: 'CASHIER', name: 'Ngô Thanh Tâm', position: 'Thu ngân chính' },
  { id: 'NV021', username: 'cashier2', password: '123456', role: 'CASHIER', name: 'Hoàng Gia Bảo', position: 'Thu ngân' },
  { id: 'NV010', username: 'kitchen', password: '123456', role: 'KITCHEN', name: 'Phạm Minh Khoa', position: 'Bếp trưởng' },
  { id: 'NV011', username: 'kitchen2', password: '123456', role: 'KITCHEN', name: 'Đỗ Thị Lan', position: 'Phụ bếp' },
  { id: 'NV002', username: 'waiter', password: '123456', role: 'WAITER', name: 'Trần Hoài Nam', position: 'Phục vụ' },
  { id: 'NV003', username: 'waiter2', password: '123456', role: 'WAITER', name: 'Lê Thu Hà', position: 'Phục vụ' },
]

/** First account of each web workspace, shown on the sign-in page to fill the form. */
export const DEMO_SHORTCUTS = (Object.keys(WORKSPACES) as WorkspaceRole[]).map((role) => {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role)!
  return { role, username: account.username, password: account.password }
})

const publicPart = (account: DemoAccount): StaffAccount => ({
  id: account.id, username: account.username, email: account.email, name: account.name, position: account.position, role: account.role,
})

/** Account for a login (username or email) and password, or null. */
export function findDemoAccount(login: string, password: string): StaffAccount | null {
  const key = login.trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((a) => a.username === key || a.email === key)
  return account && account.password === password ? publicPart(account) : null
}

export function findDemoAccountById(id: string): StaffAccount | null {
  const account = DEMO_ACCOUNTS.find((a) => a.id === id)
  return account ? publicPart(account) : null
}
