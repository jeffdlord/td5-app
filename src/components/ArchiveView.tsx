import { Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

interface ArchiveViewProps {
  todos: Todo[]
  onDelete: (id: string) => void
}

export function ArchiveView({ todos, onDelete }: ArchiveViewProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No archived to-dos yet.</p>
      </div>
    )
  }

  return (
    <div>
      {todos.map(todo => (
        <div
          key={todo.id}
          className="flex items-center justify-between rounded-lg border bg-card p-3 mb-2 opacity-70"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm line-through truncate">{todo.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Archived {new Date(todo.archivedAt!).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-2"
            aria-label="Delete permanently"
            title="Delete permanently"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
