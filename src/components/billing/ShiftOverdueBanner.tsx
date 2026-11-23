import { isShiftOverdue, openShiftOf } from '../../api/billing/selectors'
import { cashierPaths } from '../../routes/cashierRouter'
import { useCashierSnapshot } from '../../hooks/billing/cashierDataContext'
import { useNow } from '../../hooks/kitchen/useNow'
import { KitchenLink as Link } from '../kitchen/KitchenLink'
import { formatShiftOpened } from './format'
import { Alert } from './ui'

export function ShiftOverdueBanner({ onReconcile }: { onReconcile?: () => void }) {
  const { data, user } = useCashierSnapshot()
  const now = useNow()
  const shift = openShiftOf(data, user.id)
  if (!shift || !isShiftOverdue(data, shift, new Date(now))) return null
  return (
    <Alert
      tone="warning"
      icon="alert"
      action={
        onReconcile ? (
          <button type="button" className="k-btn k-btn--primary" onClick={onReconcile}>
            Đối soát &amp; đóng ca
          </button>
        ) : (
          <Link to={cashierPaths.shift} className="k-btn k-btn--primary">
            Đối soát &amp; đóng ca
          </Link>
        )
      }
    >
      Ca này mở từ {formatShiftOpened(shift.openedAt)}, đã quá giờ kết thúc ca. Hãy đối soát và đóng
      ca trước khi thu tiền ca mới.
    </Alert>
  )
}
