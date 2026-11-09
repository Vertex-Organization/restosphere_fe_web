import LoginPage from './pages/auth/LoginPage'
import ComboMenuPage from './pages/public/ComboMenuPage'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/' || pathname === '/auth/login') {
    return <LoginPage />
  }

  if (pathname === '/menu' || /^\/menu\/(combo|pizza|pizza-caro|my-y|ga-ngon-vibe|khai-vi|salad|nui-bo-lo|thuc-uong)$/.test(pathname)) {
    return <ComboMenuPage />
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Không tìm thấy trang</h1>
      <a href="/auth/login">Về trang đăng nhập</a>
    </main>
  )
}

export default App
