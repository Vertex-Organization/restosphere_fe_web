import { Icon as KitchenIcon, type IconName as KitchenIconName } from '../kitchen/Icon'

// Cashier icons, drawn like the kitchen set (24px grid, 1.75 stroke) and
// falling back to it for shared glyphs, so the staff modules look alike.

const extra = {
  cookingPot: <><path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7Z" /><path d="M3 10h18M2 13h3M19 13h3M8 3v3M12 2v4M16 3v3" /></>,
  drawer: <><rect x="3" y="12" width="18" height="8" rx="1.5" /><path d="M6 12V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><path d="M9 8.5h6" /><path d="M10 16h4" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h6M9 18h3" /></>,
  cash: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v5M18 9.5v5" /></>,
  bank: <><path d="M3 9.5 12 4l9 5.5" /><path d="M4 20h16" /><path d="M6 10.5V17M10 10.5V17M14 10.5V17M18 10.5V17" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /><path d="M6 15h4" /></>,
  qr: <><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1" /><path d="M14 14h3v3M20.5 14v.01M14 20.5h.01M17 20.5h3.5V17" /></>,
  printer: <><path d="M7 9V3.5h10V9" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v6.5H7Z" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18.5 14a5 5 0 0 1 3 4.6V20" /></>,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></>,
  arrowLeft: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  hourglass: <><path d="M6 3h12M6 21h12" /><path d="M7 3v3a5 5 0 0 0 10 0V3" /><path d="M7 21v-3a5 5 0 0 1 10 0v3" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  edit: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
} as const

export type IconName = KitchenIconName | keyof typeof extra

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  if (!(name in extra)) return <KitchenIcon name={name as KitchenIconName} size={size} className={className} />
  return (
    <svg className={className ? `k-icon ${className}` : 'k-icon'} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {extra[name as keyof typeof extra]}
    </svg>
  )
}
