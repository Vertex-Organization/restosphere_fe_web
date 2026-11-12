import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../../routes/kitchenRouter'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** In-app link: plain clicks navigate without reloading; modified clicks open normally. */
export function KitchenLink({ to, onClick, ...props }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...props} />
}
