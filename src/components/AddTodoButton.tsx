import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

interface AddTodoButtonProps {
  onAdd: (title: string) => { success: boolean; error?: string }
  disabled: boolean
}

export function AddTodoButton({ onAdd, disabled }: AddTodoButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = onAdd(title)
    if (result.success) {
      setTitle('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('')
      setIsAdding(false)
    }
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <Input
          autoFocus
          placeholder="New to-do title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!title.trim()) {
              setIsAdding(false)
            }
          }}
          maxLength={100}
        />
      </form>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      disabled={disabled}
      className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="h-4 w-4" />
      Add to-do {disabled && '(max 5)'}
    </button>
  )
}
