import { useEffect } from 'react'
import { leaveStaffArea, type StaffAccount } from '../../api/staff/auth'
import { homePathFor, STAFF_ROLE_LABEL, WORKSPACES, type WorkspaceRole } from '../../routes/staffRouter'
import { BrandLogo } from '../kitchen/BrandLogo'
import { Icon } from '../kitchen/Icon'
import './staff.css'

interface Props {
  session: StaffAccount
  /** The workspace that was opened. */
  workspace: WorkspaceRole
  /** 'role': another role's workspace. 'profile': right role, but no record in this workspace's data. */
  reason: 'role' | 'profile'
}

/** Shown when a signed-in employee opens a workspace that is not theirs. */
export function StaffAccessDenied({ session, workspace, reason }: Props) {
  const label = WORKSPACES[workspace].label
  const home = homePathFor(session.role)
  const here = window.location.pathname + window.location.search

  useEffect(() => { document.title = `Không có quyền · RestoSphere ${label}` }, [label])

  return (
    <div className="st">
      <div className="st-card" role="alert">
        <div className="st-main">
          <BrandLogo width={168} />
          <div className="st-denied">
            <span className="st-denied-icon"><Icon name="alert" size={18} /></span>
            <div>
              <h1 className="st-title">{reason === 'role' ? `Không có quyền vào khu ${label}` : 'Không tìm thấy hồ sơ nhân viên'}</h1>
              <p className="st-sub">
                Bạn đang đăng nhập bằng <b>{session.name}</b> · {STAFF_ROLE_LABEL[session.role]}.{' '}
                {reason === 'role'
                  ? `Khu ${label} chỉ dành cho vai trò ${STAFF_ROLE_LABEL[workspace]}.`
                  : `Dữ liệu khu ${label} chưa có hồ sơ mã ${session.id}.`}
              </p>
            </div>
          </div>
          <div className="st-actions">
            {home && reason === 'role' && (
              <a className="st-btn st-btn--primary" href={home}>
                Về khu {WORKSPACES[session.role as WorkspaceRole].label}<Icon name="arrowRight" size={16} />
              </a>
            )}
            <button type="button" className={`st-btn${home && reason === 'role' ? '' : ' st-btn--primary'}`} onClick={() => leaveStaffArea(here)}>
              <Icon name="logout" size={16} />Đăng nhập tài khoản khác
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Brief state while a signed-out visitor is sent to the sign-in page. */
export function StaffRedirecting() {
  return (
    <div className="st" aria-busy="true">
      <p className="st-wait"><span className="st-spinner" aria-hidden="true" />Đang chuyển tới trang đăng nhập…</p>
    </div>
  )
}
