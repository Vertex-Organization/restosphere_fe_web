import { useEffect } from 'react'
import { ROLE_LABEL } from '../../../api/kitchen/labels'
import type { CashierStaff } from '../../../api/billing/types'
import { Icon } from '../../../components/billing/Icon'
import { BrandLogo } from '../../../components/kitchen/BrandLogo'
import { leaveCashier } from '../../../hooks/billing/useCashierAuth'

/** Shown to signed-in staff whose role is not CASHIER (a manager approves requests elsewhere). */
export default function CashierAccessDenied({ user }: { user: CashierStaff }) {
  useEffect(() => { document.title = 'Không có quyền · RestoSphere Thu ngân' }, [])

  return (
    <div className="kds k-login">
      <div className="k-login-card" role="alert">
        <BrandLogo width={176} />
        <div className="k-denied">
          <span className="k-denied-icon"><Icon name="alert" size={18} /></span>
          <div>
            <h1 className="k-login-title">Không có quyền vào quầy thu ngân</h1>
            <p className="k-muted">
              Tài khoản <b>{user.name}</b> có vai trò {ROLE_LABEL[user.role]}. Khu vực này chỉ dành cho nhân viên Thu ngân.
            </p>
          </div>
        </div>
        <button type="button" className="k-btn k-btn--primary k-btn--lg k-btn--block" onClick={leaveCashier}>
          Đăng nhập tài khoản khác
        </button>
      </div>
    </div>
  )
}
