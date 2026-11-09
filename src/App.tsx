import LoginPage from './pages/auth/LoginPage'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/' || pathname === '/auth/login') {
    return <LoginPage />
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Không tìm thấy trang</h1>
      <a href="/auth/login">Về trang đăng nhập</a>
    </main>
  )
}

export default App
