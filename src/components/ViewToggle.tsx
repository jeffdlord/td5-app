import { cn } from '@/lib/utils'
import { ListTodo, Archive, LayoutList, Settings, BarChart3 } from 'lucide-react'

export type ViewMode = 'active' | 'all' | 'archive' | 'settings' | 'dashboard'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  archiveCount: number
  isAdmin?: boolean
}

export function ViewToggle({ view, onViewChange, archiveCount, isAdmin }: ViewToggleProps) {
  const btn = (mode: ViewMode, icon: React.ReactNode, label: string, title: string) => (
    <button
      onClick={() => onViewChange(mode)}
      title={title}
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
      {btn('active', <ListTodo className="h-3.5 w-3.5" />, 'Today', "Today's tasks")}
      {btn('all', <LayoutList className="h-3.5 w-3.5" />, 'All', 'All recurring to-dos')}
      {btn('archive', <Archive className="h-3.5 w-3.5" />, `Archive${archiveCount > 0 ? ` (${archiveCount})` : ''}`, 'Archived to-dos')}
      {btn('settings', <Settings className="h-3.5 w-3.5" />, 'Settings', 'App settings')}
      {isAdmin && btn('dashboard', <BarChart3 className="h-3.5 w-3.5" />, 'Stats', 'Admin dashboard')}
    </div>
  )
}
