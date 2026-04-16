import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { authQuery } from '@/lib/api'
import type { UserSettings } from '@/types'

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  maxPerDay: 5,
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

async function fetchSettings(): Promise<UserSettings | null> {
  try {
    const q = authQuery()
    if (!q) return null
    const res = await fetch(`/api/settings?${q}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.settings && typeof data.settings === 'object' ? data.settings : null
  } catch {
    return null
  }
}

async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    const q = authQuery()
    if (!q) return
    await fetch(`/api/settings?${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    })
  } catch {
    console.warn('Failed to sync settings to server.')
  }
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('td5_settings', {
    ...DEFAULT_SETTINGS,
    theme: getSystemTheme(),
  })
  const initialLoadDone = useRef(false)

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

  // Load from API on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    fetchSettings().then(remote => {
      if (remote !== null) {
        // Merge with defaults for any missing fields
        setSettings({
          theme: remote.theme || getSystemTheme(),
          maxPerDay: remote.maxPerDay >= 2 && remote.maxPerDay <= 10 ? remote.maxPerDay : 5,
        })
      }
    })
  }, [setSettings])

  const syncSettings = useCallback((updater: (prev: UserSettings) => UserSettings) => {
    setSettings(prev => {
      const next = updater(prev)
      saveSettings(next)
      return next
    })
  }, [setSettings])

  const updateTheme = useCallback((theme: 'light' | 'dark') => {
    syncSettings(prev => ({ ...prev, theme }))
  }, [syncSettings])

  const toggleTheme = useCallback(() => {
    syncSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [syncSettings])

  const updateMaxPerDay = useCallback((maxPerDay: number) => {
    const clamped = Math.max(2, Math.min(10, maxPerDay))
    syncSettings(prev => ({ ...prev, maxPerDay: clamped }))
  }, [syncSettings])

  return {
    settings,
    updateTheme,
    toggleTheme,
    updateMaxPerDay,
  }
}
