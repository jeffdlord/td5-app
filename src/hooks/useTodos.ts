import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Todo } from '@/types'

const MAX_ACTIVE = 5

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('td5_todos', [])

  const activeTodos = todos
    .filter(t => t.archivedAt === null)
    .sort((a, b) => a.order - b.order)

  const archivedTodos = todos
    .filter(t => t.archivedAt !== null)
    .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime())

  const addTodo = useCallback((title: string): { success: boolean; error?: string } => {
    const trimmed = title.trim()
    if (!trimmed) return { success: false, error: 'Please enter a title.' }

    const active = todos.filter(t => t.archivedAt === null)
    if (active.length >= MAX_ACTIVE) {
      return { success: false, error: `Maximum ${MAX_ACTIVE} active to-dos reached.` }
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: trimmed,
      order: active.length,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    }

    setTodos(prev => [...prev, newTodo])
    return { success: true }
  }, [todos, setTodos])

  const editTodo = useCallback((id: string, title: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, title: title.trim() } : t))
  }, [setTodos])

  const reorderTodos = useCallback((reorderedIds: string[]) => {
    setTodos(prev => prev.map(t => {
      const newIndex = reorderedIds.indexOf(t.id)
      if (newIndex !== -1) {
        return { ...t, order: newIndex }
      }
      return t
    }))
  }, [setTodos])

  const archiveTodo = useCallback((id: string) => {
    setTodos(prev => {
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
  }, [setTodos])

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => {
      const filtered = prev.filter(t => t.id !== id)
      const active = filtered.filter(t => t.archivedAt === null).sort((a, b) => a.order - b.order)
      return filtered.map(t => {
        if (t.archivedAt === null) {
          return { ...t, order: active.findIndex(a => a.id === t.id) }
        }
        return t
      })
    })
  }, [setTodos])

  return {
    activeTodos,
    archivedTodos,
    activeCount: activeTodos.length,
    maxActive: MAX_ACTIVE,
    addTodo,
    editTodo,
    reorderTodos,
    archiveTodo,
    deleteTodo,
  }
}
