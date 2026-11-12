import { useEffect } from 'react'
import { ROLE_LABEL } from '../../../api/kitchen/labels'
import type { StaffMember } from '../../../api/kitchen/types'
import { BrandLogo } from '../../../components/kitchen/BrandLogo'
import { Icon } from '../../../components/kitchen/Icon'
import { leaveKitchen } from '../../../hooks/kitchen/leaveKitchen'

/** Shown to signed-in staff whose role is not KITCHEN. */
export default function KitchenAccessDenied({ user }: { user: StaffMember }) {
  useEffect(() => { document.title = 'Không có quyền · RestoSphere Kitchen' }, [])

  return (
    <div className="kds k-login">
      <div className="k-login-card" role="alert">
        <BrandLogo width={176} />
        <div className="k-denied">
          <span className="k-denied-icon"><Icon name="alert" size={18} /></span>
          <div>
            <h1 className="k-login-title">Không có quyền vào khu vực Bếp</h1>
            <p className="k-muted">
              Tài khoản <b>{user.name}</b> có vai trò {ROLE_LABEL[user.role]}. Khu vực này chỉ dành cho nhân viên Bếp.
            </p>
          </div>
        </div>
        <button type="button" className="k-btn k-btn--primary k-btn--lg k-btn--block" onClick={leaveKitchen}>
          Đăng nhập tài khoản khác
        </button>
      </div>
    </div>
  )
}
