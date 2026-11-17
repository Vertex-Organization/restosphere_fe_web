import type { StaffRole } from '../../routes/staffRouter'

export interface StaffAccount {
  id: string
  username: string
  email?: string
  name: string
  position: string
  role: StaffRole
}
