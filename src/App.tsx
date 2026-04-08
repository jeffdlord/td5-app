import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { LoginScreen } from '@/components/LoginScreen'
import { TodoApp } from '@/components/TodoApp'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'sonner'

function App() {
  const { email, isLoggedIn, isLoading, login, logout } = useAuth()
  const { settings, toggleTheme, updateTheme, updateMaxPerDay } = useSettings()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {isLoggedIn ? (
        <TodoApp
          email={email}
          onLogout={logout}
          settings={settings}
          onToggleTheme={toggleTheme}
          onUpdateTheme={updateTheme}
          onUpdateMaxPerDay={updateMaxPerDay}
        />
      ) : (
        <LoginScreen onLogin={login} theme={settings.theme} onToggleTheme={toggleTheme} />
      )}
      <Toaster position="top-center" richColors theme={settings.theme} />
    </ErrorBoundary>
  )
}

export default App
