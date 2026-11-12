import { useState } from 'react'
import type { MenuItem } from '../../api/kitchen/types'
import { Icon } from './Icon'

/** Square dish photo. Drinks without a photo, or a photo that fails to load,
 * fall back to a neutral icon so the row keeps its shape. */
export function DishPhoto({ menu, size = 'md' }: { menu?: MenuItem; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const px = size === 'sm' ? 28 : 36
  if (!menu?.imageUrl || failed) {
    return (
      <span className={`k-dish k-dish--${size} k-dish--empty`} aria-hidden="true">
        <Icon name={menu?.categoryId === 'drink' ? 'cup' : 'utensils'} size={size === 'sm' ? 14 : 17} />
      </span>
    )
  }
  return (
    <img className={`k-dish k-dish--${size}`} src={menu.imageUrl} width={px} height={px} alt="" loading="lazy" decoding="async"
      onError={() => setFailed(true)} />
  )
}
