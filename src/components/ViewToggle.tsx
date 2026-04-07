import { cn } from '@/lib/utils'
import { ListTodo, Archive } from 'lucide-react'

interface ViewToggleProps {
  view: 'active' | 'archive'
  onViewChange: (view: 'active' | 'archive') => void
  archiveCount: number
}

export function ViewToggle({ view, onViewChange, archiveCount }: ViewToggleProps) {
  return (
    <div className="flex gap-1 mb-4 p-1 rounded-lg bg-muted">
      <button
        onClick={() => onViewChange('active')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          view === 'active'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <ListTodo className="h-4 w-4" />
        Active
      </button>
      <button
        onClick={() => onViewChange('archive')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          view === 'archive'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Archive className="h-4 w-4" />
        Archive {archiveCount > 0 && `(${archiveCount})`}
      </button>
    </div>
  )
}
