import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { DailyTask } from '@/types'

function getEmail(): string | null {
  return localStorage.getItem('conspiracy_daily_email')
}

async function fetchDailyTasks(email: string): Promise<DailyTask[] | null> {
  try {
    const res = await fetch(`/api/daily-tasks?email=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.tasks) ? data.tasks : null
  } catch {
    return null
  }
}

async function saveDailyTasks(email: string, tasks: DailyTask[]): Promise<void> {
  try {
    await fetch(`/api/daily-tasks?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    })
  } catch {
    console.warn('Failed to sync daily tasks to server.')
  }
}

export function useDailyTasks() {
  const [tasks, setTasks] = useLocalStorage<DailyTask[]>('td5_daily_tasks', [])
  const initialLoadDone = useRef(false)

  // Load from API on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    const email = getEmail()
    if (!email) return

    fetchDailyTasks(email).then(remoteTasks => {
      if (remoteTasks !== null) {
        setTasks(remoteTasks)
      }
    })
  }, [setTasks])

  const syncTasks = useCallback((updater: (prev: DailyTask[]) => DailyTask[]) => {
    setTasks(prev => {
      const next = updater(prev)
      const email = getEmail()
      if (email) saveDailyTasks(email, next)
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
