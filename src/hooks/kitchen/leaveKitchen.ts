import { kitchenSignOut } from '../../api/kitchen/auth'

/** Signs out and opens the shared staff sign-in page (without a "next" redirect). */
export function leaveKitchen() {
  kitchenSignOut()
}
