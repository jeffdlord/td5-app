import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { authQuery } from '@/lib/api'
import type { DailyTask } from '@/types'

async function fetchDailyTasks(): Promise<DailyTask[] | null> {
  try {
    const q = authQuery()
    if (!q) return null
    const res = await fetch(`/api/daily-tasks?${q}`)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.tasks) ? data.tasks : null
  } catch {
    return null
  }
}

async function saveDailyTasks(tasks: DailyTask[]): Promise<void> {
  try {
    const q = authQuery()
    if (!q) return
    const res = await fetch(`/api/daily-tasks?${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    })
    if (!res.ok) {
      console.error('Failed to save daily tasks to server:', res.status)
    }
  } catch (err) {
    console.error('Failed to sync daily tasks to server:', err)
  }
}

export function useDailyTasks() {
  const [tasks, setTasks] = useLocalStorage<DailyTask[]>('td5_daily_tasks', [])
  const initialLoadDone = useRef(false)

  // Load from API on mount — prefer whichever source has more data
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    fetchDailyTasks().then(remoteTasks => {
      if (remoteTasks === null) return

      setTasks(prev => {
        if (remoteTasks.length > 0) return remoteTasks
        if (prev.length > 0) {
          saveDailyTasks(prev)
          return prev
        }
        return remoteTasks
      })
    })
  }, [setTasks])

  const syncTasks = useCallback((updater: (prev: DailyTask[]) => DailyTask[]) => {
    setTasks(prev => {
      const next = updater(prev)
      saveDailyTasks(next)
      return next
    })
  }, [setTasks])

  /** Get daily tasks for a specific date */
  const tasksForDate = useCallback((date: string): DailyTask[] => {
    return tasks.filter(t => t.date === date)
  }, [tasks])

  const addDailyTask = useCallback((title: string, date: string): { success: boolean; error?: string } => {
    const trimmed = title.trim()
    if (!trimmed) return { success: false, error: 'Please enter a title.' }

    const newTask: DailyTask = {
      id: crypto.randomUUID(),
      title: trimmed,
      date,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    syncTasks(prev => [...prev, newTask])
    return { success: true }
  }, [syncTasks])

  const toggleDailyTask = useCallback((id: string) => {
    syncTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }, [syncTasks])

  const deleteDailyTask = useCallback((id: string) => {
    syncTasks(prev => prev.filter(t => t.id !== id))
  }, [syncTasks])

  return {
    tasksForDate,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
  }
}
