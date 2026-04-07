import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useTodos } from '@/hooks/useTodos'
import { useDailyStatus } from '@/hooks/useDailyStatus'
import { DateNavigator } from './DateNavigator'
import { TodoList } from './TodoList'
import { ArchiveView } from './ArchiveView'
import { ViewToggle } from './ViewToggle'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface TodoAppProps {
  email: string | null
  onLogout: () => void
}

export function TodoApp({ email, onLogout }: TodoAppProps) {
  const [view, setView] = useState<'active' | 'archive'>('active')
  const { currentDate, formattedDate, isToday, goToNextDay, goToPrevDay, goToToday } = useCurrentDate()
  const {
    activeTodos,
    archivedTodos,
    activeCount,
    maxActive,
    addTodo,
    editTodo,
    reorderTodos,
    archiveTodo,
    deleteTodo,
  } = useTodos()
  const { getStatus, toggleCompleted, setNote } = useDailyStatus()

  const handleAdd = (title: string) => {
    const result = addTodo(title)
    if (!result.success) {
      toast.error(result.error)
    }
    return result
  }

  const handleArchive = (id: string) => {
    archiveTodo(id)
    toast.success('To-do archived.')
  }

  const handleDelete = (id: string) => {
    deleteTodo(id)
    toast.success('To-do deleted.')
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextDay,
    onSwipedRight: goToPrevDay,
    delta: 50,
    trackMouse: false,
    preventScrollOnSwipe: false,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 120 50" className="h-8 w-auto">
              <defs>
                <linearGradient id="td5grad-sm" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <text
                x="60"
                y="38"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="42"
                fill="url(#td5grad-sm)"
              >
                TD5
              </text>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
            )}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4" {...swipeHandlers}>
        <DateNavigator
          formattedDate={formattedDate}
          isToday={isToday}
          onPrev={goToPrevDay}
          onNext={goToNextDay}
          onToday={goToToday}
        />

        <ViewToggle
          view={view}
          onViewChange={setView}
          archiveCount={archivedTodos.length}
        />

        {view === 'active' ? (
          <TodoList
            todos={activeTodos}
            currentDate={currentDate}
            activeCount={activeCount}
            maxActive={maxActive}
            getStatus={getStatus}
            onAdd={handleAdd}
            onEdit={editTodo}
            onReorder={reorderTodos}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onToggleCompleted={toggleCompleted}
            onSetNote={setNote}
          />
        ) : (
          <ArchiveView
            todos={archivedTodos}
            onDelete={handleDelete}
          />
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          {activeCount}/{maxActive} active to-dos
        </p>
      </main>
    </div>
  )
}
