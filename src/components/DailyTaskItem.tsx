import { Check, Trash2 } from 'lucide-react'
import type { DailyTask } from '@/types'
import { cn } from '@/lib/utils'

interface DailyTaskItemProps {
  task: DailyTask
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function DailyTaskItem({ task, onToggle, onDelete }: DailyTaskItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-dashed bg-card/50 p-3 mb-2',
        task.completed && 'opacity-70'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
          task.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/30 hover:border-primary'
        )}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <span
        className={cn(
          'flex-1 text-sm',
          task.completed && 'line-through'
        )}
      >
        {task.title}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
