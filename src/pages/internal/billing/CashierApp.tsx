import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { CashierDataProvider } from '../../../hooks/billing/CashierDataProvider'
import { useCashierUser } from '../../../hooks/billing/useCashierAuth'
import { CashierLayout } from '../../../layouts/CashierLayout'
import { cashierPaths, matchCashierRoute, navigate, useCashierUrl, type CashierRoute } from '../../../routes/cashierRouter'
import CashierAccessDenied from './CashierAccessDenied'
import CashierBillPage from './CashierBillPage'
import CashierLoginPage from './CashierLoginPage'
import CashierNotificationsPage from './CashierNotificationsPage'
import CashierPaymentPage from './CashierPaymentPage'
import CashierPosPage from './CashierPosPage'
import CashierProfilePage from './CashierProfilePage'
import CashierReceiptPage from './CashierReceiptPage'
import CashierRequestsPage from './CashierRequestsPage'
import CashierShiftPage from './CashierShiftPage'
import CashierTransactionPage from './CashierTransactionPage'
import CashierTransactionsPage from './CashierTransactionsPage'
// Shared staff design tokens and primitives (scoped under .kds / k-*), then cashier-specific styles.
import '../../../components/kitchen/kitchen.css'
import '../kitchen/kitchenPages.css'
import '../../../components/billing/billing.css'

// Development-only simulator of the other roles; removed from production builds.
const CashierDevPage = import.meta.env.DEV ? lazy(() => import('./CashierDevPage')) : null

function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to, { replace: true }) }, [to])
  return null
}

const TITLES: Record<CashierRoute['name'], string> = {
  pos: 'Quầy thu ngân',
  bill: 'Chi tiết hóa đơn',
  payment: 'Thanh toán',
  transactions: 'Lịch sử giao dịch',
  transaction: 'Chi tiết giao dịch',
  receipt: 'Hóa đơn in',
  requests: 'Yêu cầu xử lý',
  shift: 'Ca thu ngân',
  notifications: 'Thông báo',
  profile: 'Cá nhân',
  login: 'Đăng nhập',
  dev: 'Mô phỏng (dev)',
  'not-found': 'Không tìm thấy trang',
}

function page(route: CashierRoute, params: URLSearchParams): ReactNode {
  switch (route.name) {
    case 'pos': return <CashierPosPage selectedId={params.get('bill') ?? ''} />
    case 'bill': return <CashierBillPage key={route.id} id={route.id} />
    case 'payment': return <CashierPaymentPage key={route.billId} billId={route.billId} />
    case 'transactions': return <CashierTransactionsPage />
    case 'transaction': return <CashierTransactionPage key={route.id} id={route.id} />
    case 'receipt': return <CashierReceiptPage key={route.id} billId={route.id} />
    case 'requests': return <CashierRequestsPage selectedId={params.get('id') ?? ''} />
    case 'shift': return <CashierShiftPage />
    case 'notifications': return <CashierNotificationsPage selectedId={params.get('id') ?? ''} />
    case 'profile': return <CashierProfilePage />
    case 'dev': return CashierDevPage ? <Suspense fallback={null}><CashierDevPage /></Suspense> : null
    default: return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy trang</p>
        <p>Đường dẫn này không thuộc khu vực Thu ngân.</p>
        <a className="k-btn k-btn--primary" href={cashierPaths.pos}>Về quầy thu ngân</a>
      </div>
    )
  }
}

/** Entry of the /cashier module: its own shell, never the customer header/footer. */
export default function CashierApp() {
  const { url, pathname, params } = useCashierUrl()
  const route = matchCashierRoute(pathname)
  const user = useCashierUser()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('kds-html')
    root.lang = 'vi'
    return () => root.classList.remove('kds-html')
  }, [])

  if (route.name === 'login') {
    const next = params.get('next')
    const target = next && next.startsWith('/cashier') && !next.startsWith(cashierPaths.login) ? next : cashierPaths.pos
    if (user?.role === 'CASHIER') return <Redirect to={target} />
    return <CashierLoginPage next={target} />
  }
  if (!user) return <Redirect to={`${cashierPaths.login}?next=${encodeURIComponent(url)}`} />
  if (user.role !== 'CASHIER') return <CashierAccessDenied user={user} />

  // Two-pane screens manage their own scroll areas and fill the viewport.
  const fill = route.name === 'pos' || route.name === 'transactions' || route.name === 'requests' || route.name === 'notifications'
  return (
    <CashierDataProvider key={user.id} user={user}>
      <CashierLayout route={route} title={TITLES[route.name]} fill={fill}>
        {page(route, params)}
      </CashierLayout>
    </CashierDataProvider>
  )
}
