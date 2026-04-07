import { useState, useEffect, useCallback } from 'react'
import { getTodayCode } from './useCurrentDate'

const EMAIL_KEY = 'conspiracy_daily_email'
const REMEMBER_KEY = 'conspiracy_remember_me'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useAuth() {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedEmail = localStorage.getItem(EMAIL_KEY)
    const remembered = localStorage.getItem(REMEMBER_KEY)

    if (storedEmail && remembered === 'true') {
      setEmail(storedEmail)
      setIsLoggedIn(true)
    } else {
      localStorage.removeItem(EMAIL_KEY)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((inputEmail: string, code: string, rememberMe: boolean): { success: boolean; error?: string } => {
    const trimmedEmail = inputEmail.trim().toLowerCase()
    const trimmedCode = code.trim()

    if (!trimmedEmail || !trimmedCode) {
      return { success: false, error: 'Please fill in all fields.' }
    }

    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    if (trimmedCode !== getTodayCode()) {
      return { success: false, error: 'Invalid daily access code.' }
    }

    localStorage.setItem(EMAIL_KEY, trimmedEmail)
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true')
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }

    setEmail(trimmedEmail)
    setIsLoggedIn(true)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    setEmail(null)
    setIsLoggedIn(false)
  }, [])

  return { email, isLoggedIn, isLoading, login, logout }
}
