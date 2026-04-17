import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Archive, Trash2, Plus } from 'lucide-react'
import { ALL_DAYS, DAY_LABELS, type Todo, type DayOfWeek } from '@/types'
import { cn } from '@/lib/utils'

interface AllTodosViewProps {
  todos: Todo[]
  disabledDays: DayOfWeek[]
  totalActive: number
  maxTotal: number
  onAdd: (title: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  onEdit: (id: string, title: string) => void
  onUpdateDays: (id: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

function AllTodoRow({
  todo,
  disabledDays,
  onEdit,
  onUpdateDays,
  onArchive,
  onDelete,
}: {
  todo: Todo
  disabledDays: DayOfWeek[]
  onEdit: (id: string, title: string) => void
  onUpdateDays: (id: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

  const days = Array.isArray(todo.days) ? todo.days : ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[])

  const handleEditSubmit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed)
    } else {
      setEditTitle(todo.title)
    }
    setIsEditing(false)
  }

  const toggleDay = (day: DayOfWeek) => {
    if (days.includes(day)) {
      if (days.length <= 1) return
      onUpdateDays(todo.id, days.filter(d => d !== day))
    } else {
      if (disabledDays.includes(day)) return
      onUpdateDays(todo.id, [...days, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3 mb-2">
      <div className="flex items-center gap-2 mb-2">
        {isEditing ? (
          <Input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSubmit()
              if (e.key === 'Escape') {
                setEditTitle(todo.title)
                setIsEditing(false)
              }
            }}
            className="h-7 text-sm flex-1"
            maxLength={100}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="flex-1 text-sm cursor-pointer hover:text-primary transition-colors"
          >
            {todo.title}
          </span>
        )}

        <button
          onClick={() => onArchive(todo.id)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Archive"
          title="Archive this task"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          aria-label="Delete"
          title="Delete this task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex gap-1">
        {ALL_DAYS.map(day => {
          const isSelected = days.includes(day)
          const isDisabled = !isSelected && disabledDays.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              disabled={isDisabled}
              title={
                isDisabled
                  ? `${DAY_LABELS[day]} is full`
                  : isSelected
                    ? `Remove from ${DAY_LABELS[day]}`
                    : `Add to ${DAY_LABELS[day]}`
              }
              className={cn(
                'flex-1 py-1 rounded-md text-xs font-medium transition-colors select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
                isDisabled && 'opacity-30 cursor-not-allowed'
              )}
            >
              {DAY_LABELS[day]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AddTodoInline({
  disabledDays,
  onAdd,
}: {
  disabledDays: DayOfWeek[]
  onAdd: (title: string, days: DayOfWeek[]) => { success: boolean; error?: string }
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [days, setDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[])

  const toggleDay = (day: DayOfWeek) => {
    if (days.includes(day)) {
      if (days.length <= 1) return
      setDays(days.filter(d => d !== day))
    } else {
      if (disabledDays.includes(day)) return
      setDays([...days, day].sort((a, b) => a - b))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = onAdd(title, days)
    if (result.success) {
      setTitle('')
      setDays([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[])
      setIsAdding(false)
    }
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Input
            autoFocus
            placeholder="New task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setTitle('')
                setIsAdding(false)
              }
            }}
            maxLength={100}
            className="h-7 text-sm flex-1"
          />
          <button
            type="submit"
            title="Add new task"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 shrink-0"
          >
            Add
          </button>
        </div>

        <div className="flex gap-1">
          {ALL_DAYS.map(day => {
            const isSelected = days.includes(day)
            const isDisabled = !isSelected && disabledDays.includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={isDisabled}
                title={
                  isDisabled
                    ? `${DAY_LABELS[day]} is full`
                    : isSelected
                      ? `Remove from ${DAY_LABELS[day]}`
                      : `Add to ${DAY_LABELS[day]}`
                }
                className={cn(
                  'flex-1 py-1 rounded-md text-xs font-medium transition-colors select-none',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent',
                  isDisabled && 'opacity-30 cursor-not-allowed'
                )}
              >
                {DAY_LABELS[day]}
              </button>
            )
          })}
        </div>
      </form>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      title="Add a new recurring task"
    >
      <Plus className="h-4 w-4" />
      Add task
    </button>
  )
}

export function AllTodosView({
  todos,
  disabledDays,
  totalActive,
  maxTotal,
  onAdd,
  onEdit,
  onUpdateDays,
  onArchive,
  onDelete,
}: AllTodosViewProps) {
  const addDisabled = totalActive >= maxTotal

  if (todos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="rounded-lg border bg-card p-8 mb-4">
          <p className="text-lg font-medium text-foreground mb-1">No active tasks</p>
          <p className="text-sm text-muted-foreground">Add one to get started!</p>
        </div>
        {!addDisabled && <AddTodoInline disabledDays={disabledDays} onAdd={onAdd} />}
      </div>
    )
  }

  return (
    <div>
      {todos.map(todo => (
        <AllTodoRow
          key={todo.id}
          todo={todo}
          disabledDays={disabledDays}
          onEdit={onEdit}
          onUpdateDays={onUpdateDays}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
      {!addDisabled && <AddTodoInline disabledDays={disabledDays} onAdd={onAdd} />}
    </div>
  )
}
