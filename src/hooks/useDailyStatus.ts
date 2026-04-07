import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { DailyStatus } from '@/types'

function makeKey(date: string, todoId: string): string {
  return `${date}:${todoId}`
}

export function useDailyStatus() {
  const [statuses, setStatuses] = useLocalStorage<Record<string, DailyStatus>>('td5_daily_statuses', {})

  const getStatus = useCallback((todoId: string, date: string): DailyStatus => {
    const key = makeKey(date, todoId)
    return statuses[key] || { todoId, date, completed: null, note: '' }
  }, [statuses])

  const toggleCompleted = useCallback((todoId: string, date: string) => {
    const key = makeKey(date, todoId)
    setStatuses(prev => {
      const existing = prev[key] || { todoId, date, completed: null, note: '' }
      return {
        ...prev,
        [key]: { ...existing, completed: existing.completed === 1 ? null : 1 },
      }
    })
  }, [setStatuses])

  const setNote = useCallback((todoId: string, date: string, note: string) => {
    const key = makeKey(date, todoId)
    setStatuses(prev => {
      const existing = prev[key] || { todoId, date, completed: null, note: '' }
      return {
        ...prev,
        [key]: { ...existing, note },
      }
    })
  }, [setStatuses])

  return { getStatus, toggleCompleted, setNote }
}
