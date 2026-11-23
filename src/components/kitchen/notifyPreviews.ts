import type { KitchenSound } from './notifySound'

export interface SoundPreview {
  sound: KitchenSound
  label: string
}

export const KITCHEN_PREVIEWS: SoundPreview[] = [
  { sound: 'new-dish', label: 'Đơn mới' },
  { sound: 'start', label: 'Bắt đầu' },
  { sound: 'complete', label: 'Hoàn thành' },
]

export const CASHIER_PREVIEWS: SoundPreview[] = [{ sound: 'new-dish', label: 'Đơn mới' }]
