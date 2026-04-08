import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { DailyStatus } from '@/types'

function makeKey(date: string, todoId: string): string {
  return `${date}:${todoId}`
}

function getEmail(): string | null {
  return localStorage.getItem('conspiracy_daily_email')
}

async function fetchStatuses(email: string): Promise<Record<string, DailyStatus> | null> {
  try {
    const res = await fetch(`/api/statuses?email=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.statuses && typeof data.statuses === 'object' ? data.statuses : null
  } catch {
    return null
  }
}

async function saveStatuses(email: string, statuses: Record<string, DailyStatus>): Promise<void> {
  try {
    await fetch(`/api/statuses?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuses }),
    })
  } catch {
    console.warn('Failed to sync statuses to server.')
  }
}

export function useDailyStatus() {
  const [statuses, setStatuses] = useLocalStorage<Record<string, DailyStatus>>('td5_daily_statuses', {})
  const initialLoadDone = useRef(false)

  // Load from API on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    const email = getEmail()
    if (!email) return

    fetchStatuses(email).then(remoteStatuses => {
      if (remoteStatuses !== null) {
        setStatuses(remoteStatuses)
      }
    })
  }, [setStatuses])

  // Sync helper
  const syncStatuses = useCallback((updater: (prev: Record<string, DailyStatus>) => Record<string, DailyStatus>) => {
    setStatuses(prev => {
      const next = updater(prev)
      const email = getEmail()
      if (email) saveStatuses(email, next)
      return next
    })
  }, [setStatuses])

  const getStatus = useCallback((todoId: string, date: string): DailyStatus => {
    const key = makeKey(date, todoId)
    return statuses[key] || { todoId, date, completed: null, note: '' }
  }, [statuses])

  const toggleCompleted = useCallback((todoId: string, date: string) => {
    const key = makeKey(date, todoId)
    syncStatuses(prev => {
      const existing = prev[key] || { todoId, date, completed: null, note: '' }
      return {
        ...prev,
        [key]: { ...existing, completed: existing.completed === 1 ? null : 1 },
      }
    })
  }, [syncStatuses])

  const setNote = useCallback((todoId: string, date: string, note: string) => {
    const key = makeKey(date, todoId)
    syncStatuses(prev => {
      const existing = prev[key] || { todoId, date, completed: null, note: '' }
      return {
        ...prev,
        [key]: { ...existing, note },
      }
    })
  }, [syncStatuses])

  return { getStatus, toggleCompleted, setNote }
}
