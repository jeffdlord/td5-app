import { useState, useEffect, useCallback } from 'react'
import { getTodayCode } from './useCurrentDate'
import { clearCryptoCache } from '@/lib/clientCrypto'

const EMAIL_KEY = 'conspiracy_daily_email'
const REMEMBER_KEY = 'conspiracy_remember_me'
const REMEMBER_EXPIRY_KEY = 'td5_remember_expiry'
const SESSION_KEY = 'td5_session_id'

const REMEMBER_DAYS = 30
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

function isRememberValid(): boolean {
  const remembered = localStorage.getItem(REMEMBER_KEY)
  if (remembered !== 'true') return false

  const expiry = localStorage.getItem(REMEMBER_EXPIRY_KEY)
  if (!expiry) return false

  return Date.now() < Number(expiry)
}

function setRememberExpiry() {
  const expiry = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000
  localStorage.setItem(REMEMBER_EXPIRY_KEY, String(expiry))
}

function clearRemember() {
  localStorage.removeItem(REMEMBER_KEY)
  localStorage.removeItem(REMEMBER_EXPIRY_KEY)
}

async function registerSession(email: string, sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sessionId }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to register session.' }
    }
    return { success: true }
  } catch {
    console.warn('Session API unreachable, allowing login.')
    return { success: true }
  }
}

async function removeSession(sessionId: string): Promise<void> {
  try {
    await fetch(`/api/sessions?sessionId=${sessionId}`, { method: 'DELETE' })
  } catch {
    console.warn('Session API unreachable on logout.')
  }
}

async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
    const data = await res.json()
    return data.valid === true
  } catch {
    return true
  }
}

export function useAuth() {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      const storedEmail = localStorage.getItem(EMAIL_KEY)
      const sessionId = localStorage.getItem(SESSION_KEY)

      if (storedEmail && isRememberValid() && sessionId) {
        // Remember-me is valid (within 30 days) — auto-login, skip code
        const valid = await validateSession(sessionId)
        if (valid) {
          await registerSession(storedEmail, sessionId)
          setEmail(storedEmail)
          setIsLoggedIn(true)
        } else {
          // Session was removed server-side, re-register
          const result = await registerSession(storedEmail, sessionId)
          if (result.success) {
            setEmail(storedEmail)
            setIsLoggedIn(true)
          } else {
            // At user limit — can't auto-login
            localStorage.removeItem(EMAIL_KEY)
            localStorage.removeItem(SESSION_KEY)
            clearRemember()
          }
        }
      } else {
        // Not remembered or expired — show login screen
        // Keep email in storage for pre-fill but don't auto-login
      }
      setIsLoading(false)
    }
    restore()
  }, [])

  const login = useCallback(async (inputEmail: string, code: string, rememberMe: boolean): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = inputEmail.trim().toLowerCase()
    const trimmedCode = code.trim()

    if (!trimmedEmail || !trimmedCode) {
      return { success: false, error: 'Please fill in all fields.' }
    }

    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    const expectedCode = trimmedEmail === 'jeffdlord@gmail.com'
      ? `x${getTodayCode()}`
      : getTodayCode()

    if (trimmedCode !== expectedCode) {
      return { success: false, error: 'Invalid access code.' }
    }

    const sessionId = getOrCreateSessionId()
    const sessionResult = await registerSession(trimmedEmail, sessionId)
    if (!sessionResult.success) {
      return sessionResult
    }

    localStorage.setItem(EMAIL_KEY, trimmedEmail)
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true')
      setRememberExpiry()
    } else {
      clearRemember()
    }

    setEmail(trimmedEmail)
    setIsLoggedIn(true)
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    const sessionId = localStorage.getItem(SESSION_KEY)
    if (sessionId) {
      await removeSession(sessionId)
    }
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(SESSION_KEY)
    clearRemember()
    clearCryptoCache()
    setEmail(null)
    setIsLoggedIn(false)
  }, [])

  return { email, isLoggedIn, isLoading, login, logout }
}
