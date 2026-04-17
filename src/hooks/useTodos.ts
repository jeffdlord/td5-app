import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { authQuery } from '@/lib/api'
import type { Todo, DayOfWeek } from '@/types'

const MAX_TOTAL = 20

async function fetchTodos(): Promise<Todo[] | null> {
  try {
    const q = authQuery()
    if (!q) return null
    const res = await fetch(`/api/todos?${q}`)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.todos) ? data.todos : null
  } catch {
    return null
  }
}

async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    const q = authQuery()
    if (!q) return
    await fetch(`/api/todos?${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos }),
    })
  } catch {
    console.warn('Failed to sync todos to server.')
  }
}

/** Count how many active (non-archived) todos are assigned to a given day */
function countForDay(todos: Todo[], day: DayOfWeek): number {
  return todos.filter(t => {
    if (t.archivedAt !== null) return false
    const days = Array.isArray(t.days) ? t.days : [0, 1, 2, 3, 4, 5, 6]
    return days.includes(day)
  }).length
}

export function useTodos(maxPerDay: number = 5) {
  const [todos, setTodos] = useLocalStorage<Todo[]>('td5_todos', [])
  const initialLoadDone = useRef(false)

  // Migrate old todos that don't have `days` field (default to all 7 days)
  useEffect(() => {
    const needsMigration = todos.some(t => !Array.isArray(t.days))
    if (needsMigration) {
      setTodos(prev => prev.map(t =>
        Array.isArray(t.days) ? t : { ...t, days: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[] }
      ))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load from API on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    fetchTodos().then(remoteTodos => {
      if (remoteTodos !== null) {
        // Migrate remote todos too
        const migrated = remoteTodos.map(t =>
          Array.isArray(t.days) ? t : { ...t, days: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[] }
        )
        setTodos(migrated)
      }
    })
  }, [setTodos])

  const syncTodos = useCallback((updater: (prev: Todo[]) => Todo[]) => {
    setTodos(prev => {
      const next = updater(prev)
      saveTodos(next)
      return next
    })
  }, [setTodos])

  const activeTodos = todos
    .filter(t => t.archivedAt === null)
    .sort((a, b) => a.order - b.order)

  const archivedTodos = todos
    .filter(t => t.archivedAt !== null)
    .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime())

  /** Get active todos filtered to a specific day of the week */
  const todosForDay = useCallback((day: DayOfWeek): Todo[] => {
    return activeTodos.filter(t => {
      const days = Array.isArray(t.days) ? t.days : [0, 1, 2, 3, 4, 5, 6]
      return days.includes(day)
    })
  }, [activeTodos])

  /** Check if a day can accept another todo (< 5 assigned) */
  const canAddToDay = useCallback((day: DayOfWeek, excludeTodoId?: string): boolean => {
    const active = todos.filter(t => t.archivedAt === null && t.id !== excludeTodoId)
    return countForDay(active, day) < maxPerDay
  }, [todos])

  /** Get count of todos assigned to each day */
  const dayCountMap = useCallback((): Record<DayOfWeek, number> => {
    const active = todos.filter(t => t.archivedAt === null)
    return {
      0: countForDay(active, 0),
      1: countForDay(active, 1),
      2: countForDay(active, 2),
      3: countForDay(active, 3),
      4: countForDay(active, 4),
      5: countForDay(active, 5),
      6: countForDay(active, 6),
    }
  }, [todos])

  const addTodo = useCallback((title: string, days: DayOfWeek[]): { success: boolean; error?: string } => {
    const trimmed = title.trim()
    if (!trimmed) return { success: false, error: 'Please enter a title.' }
    if (days.length === 0) return { success: false, error: 'Select at least one day.' }

    const active = todos.filter(t => t.archivedAt === null)
    if (active.length >= MAX_TOTAL) {
      return { success: false, error: `Maximum ${MAX_TOTAL} total active tasks reached.` }
    }

    // Check per-day limits
    for (const day of days) {
      if (countForDay(active, day) >= maxPerDay) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
        return { success: false, error: `${dayName} already has ${maxPerDay} tasks.` }
      }
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: trimmed,
      order: active.length,
      days,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    }

    syncTodos(prev => [...prev, newTodo])
    return { success: true }
  }, [todos, syncTodos])

  const editTodo = useCallback((id: string, title: string) => {
    syncTodos(prev => prev.map(t => t.id === id ? { ...t, title: title.trim() } : t))
  }, [syncTodos])

  /** Update the days assigned to a todo, enforcing 5-per-day limit */
  const updateTodoDays = useCallback((id: string, days: DayOfWeek[]): { success: boolean; error?: string } => {
    if (days.length === 0) return { success: false, error: 'Select at least one day.' }

    const active = todos.filter(t => t.archivedAt === null && t.id !== id)
    for (const day of days) {
      if (countForDay(active, day) >= maxPerDay) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
        return { success: false, error: `${dayName} already has ${maxPerDay} tasks.` }
      }
    }

    syncTodos(prev => prev.map(t => t.id === id ? { ...t, days } : t))
    return { success: true }
  }, [todos, syncTodos])

  const reorderTodos = useCallback((reorderedIds: string[]) => {
    syncTodos(prev => prev.map(t => {
      const newIndex = reorderedIds.indexOf(t.id)
      if (newIndex !== -1) {
        return { ...t, order: newIndex }
      }
      return t
    }))
  }, [syncTodos])

  const archiveTodo = useCallback((id: string) => {
    syncTodos(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, archivedAt: new Date().toISOString() } : t
      )
      const active = updated.filter(t => t.archivedAt === null).sort((a, b) => a.order - b.order)
      return updated.map(t => {
        if (t.archivedAt === null) {
          return { ...t, order: active.findIndex(a => a.id === t.id) }
        }
        return t
      })
    })
  }, [syncTodos])

  const deleteTodo = useCallback((id: string) => {
    syncTodos(prev => {
      const filtered = prev.filter(t => t.id !== id)
      const active = filtered.filter(t => t.archivedAt === null).sort((a, b) => a.order - b.order)
      return filtered.map(t => {
        if (t.archivedAt === null) {
          return { ...t, order: active.findIndex(a => a.id === t.id) }
        }
        return t
      })
    })
  }, [syncTodos])

  return {
    activeTodos,
    archivedTodos,
    activeCount: activeTodos.length,
    maxTotal: MAX_TOTAL,
    maxPerDay: maxPerDay,
    todosForDay,
    canAddToDay,
    dayCountMap,
    addTodo,
    editTodo,
    updateTodoDays,
    reorderTodos,
    archiveTodo,
    deleteTodo,
  }
}
