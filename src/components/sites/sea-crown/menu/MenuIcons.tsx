import type { ReactNode } from 'react'

export type IconName = 'search' | 'close' | 'chili' | 'people' | 'dish' | 'cup' | 'filter'

const PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  chili: <path d="M14 6c2-2 4-2 5-1M13 7c-1 6-5 10-10 11 1-5 4-11 10-11Zm0 0c2 0 3 1 3 3" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c1.7.8 2.7 2.6 3 5.5" />
    </>
  ),
  dish: (
    <>
      <path d="M3 16h18M5 16a7 7 0 0 1 14 0M12 9V7M4 19h16" />
    </>
  ),
  cup: (
    <>
      <path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8ZM17 10h1.5a2.5 2.5 0 0 1 0 5H17M9 3v2M12 3v2" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
}

export function MenuIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
