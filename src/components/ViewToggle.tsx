import { cn } from '@/lib/utils'
import { ListTodo, Archive, LayoutList, Settings } from 'lucide-react'

export type ViewMode = 'active' | 'all' | 'archive' | 'settings'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  archiveCount: number
}

export function ViewToggle({ view, onViewChange, archiveCount }: ViewToggleProps) {
  const btn = (mode: ViewMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => onViewChange(mode)}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-1.5 py-1.5 rounded-md text-xs font-medium transition-colors',
        view === mode
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="flex gap-1 mb-4 p-1 rounded-lg bg-muted">
      {btn('active', <ListTodo className="h-3.5 w-3.5" />, 'Today')}
      {btn('all', <LayoutList className="h-3.5 w-3.5" />, 'All')}
      {btn('archive', <Archive className="h-3.5 w-3.5" />, `Archive${archiveCount > 0 ? ` (${archiveCount})` : ''}`)}
      {btn('settings', <Settings className="h-3.5 w-3.5" />, 'Settings')}
    </div>
  )
}
