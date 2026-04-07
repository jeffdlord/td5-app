import { useAuth } from '@/hooks/useAuth'
import { LoginScreen } from '@/components/LoginScreen'
import { TodoApp } from '@/components/TodoApp'
import { Toaster } from 'sonner'

function App() {
  const { email, isLoggedIn, isLoading, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {isLoggedIn ? (
        <TodoApp email={email} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={login} />
      )}
      <Toaster position="top-center" richColors />
    </>
  )
}

export default App
