import { kitchenSignOut } from '../../api/kitchen/auth'
import { kitchenPaths, navigate } from '../../routes/kitchenRouter'

/** Signs out and lands on the login page (without a "next" redirect). */
export function leaveKitchen() {
  navigate(kitchenPaths.login, { replace: true })
  kitchenSignOut()
}
