import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { DayPicker } from './DayPicker'
import type { DayOfWeek } from '@/types'

interface AddTodoButtonProps {
  onAdd: (title: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  disabled: boolean
  disabledDays: DayOfWeek[]
  currentDay: DayOfWeek
}

export function AddTodoButton({ onAdd, disabled, disabledDays, currentDay }: AddTodoButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [days, setDays] = useState<DayOfWeek[]>([currentDay])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = onAdd(title, days)
    if (result.success) {
      setTitle('')
      setDays([currentDay])
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('')
      setDays([currentDay])
      setIsAdding(false)
    }
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg border bg-card p-3">
        <Input
          autoFocus
          placeholder="New to-do title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={100}
        />
        <div className="flex items-center justify-between gap-2">
          <DayPicker selected={days} onChange={setDays} disabledDays={disabledDays} />
          <button
            type="submit"
            title="Add new to-do"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1"
          >
            Add
          </button>
        </div>
      </form>
    )
  }

  return (
    <button
      onClick={() => {
        setDays([currentDay])
        setIsAdding(true)
      }}
      disabled={disabled}
      title={disabled ? 'Maximum to-dos reached' : 'Add a new recurring to-do'}
      className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="h-4 w-4" />
      Add to-do {disabled && '(max reached)'}
    </button>
  )
}
