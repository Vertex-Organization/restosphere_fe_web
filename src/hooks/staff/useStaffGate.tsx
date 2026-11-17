import { useEffect, type ReactNode } from 'react'
import { useStaffLoading, useStaffSession } from '../../api/staff/auth'
import { StaffAccessDenied, StaffRedirecting } from '../../components/staff/StaffAccessDenied'
import { loginPath, type WorkspaceRole } from '../../routes/staffRouter'

/** Guard for a workspace. Returns what to show instead of the workspace, or null to let it render:
 * signed-out visitors go to /staff/login (and come back here after signing in),
 * other roles and missing employee records see the no-access screen. */
export function useStaffGate(role: WorkspaceRole, hasProfile: boolean): ReactNode | null {
  const session = useStaffSession()
  const loading = useStaffLoading()
  const signedOut = !session && !loading

  useEffect(() => {
    // The sign-in page is a separate app, so this is a full page load.
    if (signedOut) window.location.replace(loginPath(window.location.pathname + window.location.search))
  }, [signedOut])

  if (!session) return <StaffRedirecting />
  if (session.role !== role) return <StaffAccessDenied session={session} workspace={role} reason="role" />
  if (!hasProfile) return <StaffAccessDenied session={session} workspace={role} reason="profile" />
  return null
}
