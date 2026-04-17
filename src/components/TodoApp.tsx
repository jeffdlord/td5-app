import { useState, useMemo, useEffect, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'
import confetti from 'canvas-confetti'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useTodos } from '@/hooks/useTodos'
import { useDailyStatus } from '@/hooks/useDailyStatus'
import { useDailyTasks } from '@/hooks/useDailyTasks'
import { DateNavigator } from './DateNavigator'
import { TodoList } from './TodoList'
import { ArchiveView } from './ArchiveView'
import { AllTodosView } from './AllTodosView'
import { SettingsView } from './SettingsView'
import { AdminDashboard } from './AdminDashboard'
import { OnboardingGuide } from './OnboardingGuide'
import { ViewToggle, type ViewMode } from './ViewToggle'
import { LogOut, Sun, Moon, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ALL_DAYS, type DayOfWeek, type UserSettings } from '@/types'

interface TodoAppProps {
  email: string | null
  onLogout: () => void
  settings: UserSettings
  onToggleTheme: () => void
  onUpdateTheme: (theme: 'light' | 'dark') => void
  onUpdateMaxPerDay: (maxPerDay: number) => void
}

const VICTORY_MESSAGES = [
  "All done. Momentum secured. 🌱",
  "Day cleared. That's how it compounds.",
  "Full sweep — future-you says thanks.",
  "Nailed it. Rest is productive too.",
  "Clean list, clear head.",
  "Done is the engine. Keep going.",
  "That's a wrap. You showed up.",
  "Every box checked. That's the whole game.",
]

/** Get the day-of-week (0=Sun..6=Sat) from a YYYY-MM-DD string */
function getDayOfWeek(dateStr: string): DayOfWeek {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.getDay() as DayOfWeek
}

const ADMIN_EMAIL = 'jeffdlord@gmail.com'

const ONBOARDING_DISMISSED_KEY = 'mo_onboarding_dismissed'

export function TodoApp({ email, onLogout, settings, onToggleTheme, onUpdateTheme, onUpdateMaxPerDay }: TodoAppProps) {
  const [view, setView] = useState<ViewMode>('active')
  const isAdmin = email?.toLowerCase().trim() === ADMIN_EMAIL

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) !== 'true'
  })
  const [onboardingIsFirstTime, setOnboardingIsFirstTime] = useState(() => {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) !== 'true'
  })

  const openHelp = () => {
    setOnboardingIsFirstTime(false)
    setShowOnboarding(true)
  }
  const { currentDate, formattedDate, isToday, goToNextDay, goToPrevDay, goToToday } = useCurrentDate()
  const {
    activeTodos,
    archivedTodos,
    activeCount,
    maxTotal,
    maxPerDay,
    todosForDay,
    dayCountMap,
    addTodo,
    editTodo,
    updateTodoDays,
    reorderTodos,
    archiveTodo,
    deleteTodo,
  } = useTodos(settings.maxPerDay)
  const { getStatus, toggleCompleted, setNote } = useDailyStatus()
  const { tasksForDate, addDailyTask, toggleDailyTask, deleteDailyTask } = useDailyTasks()

  const currentDay = getDayOfWeek(currentDate)
  const todosForCurrentDay = todosForDay(currentDay)
  const dailyTasksForCurrentDate = tasksForDate(currentDate)
  const completedRecurring = todosForCurrentDay.filter(t => getStatus(t.id, currentDate).completed === 1).length
  const completedDaily = dailyTasksForCurrentDate.filter(t => t.completed).length
  const completedToday = completedRecurring + completedDaily
  const totalToday = todosForCurrentDay.length + dailyTasksForCurrentDate.length
  const counts = dayCountMap()

  const disabledDays = useMemo(() => {
    return ALL_DAYS.filter(d => counts[d] >= maxPerDay)
  }, [counts, maxPerDay])

  // Celebrate when the day flips from "not all done" to "all done"
  const celebratedKeyRef = useRef<string | null>(null)
  const prevAllDoneRef = useRef<boolean>(false)
  useEffect(() => {
    const allDone = totalToday > 0 && completedToday === totalToday
    const key = `${currentDate}:${totalToday}`
    if (allDone && !prevAllDoneRef.current && celebratedKeyRef.current !== key) {
      celebratedKeyRef.current = key
      const message = VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]
      toast.success(message)
      const colors = ['#849669', '#9aad7e', '#6b7a54', '#c4d4a8', '#ffffff']
      const fire = (originX: number) => {
        confetti({
          particleCount: 60,
          angle: originX < 0.5 ? 60 : 120,
          spread: 70,
          startVelocity: 55,
          origin: { x: originX, y: 0.7 },
          colors,
          scalar: 0.9,
          disableForReducedMotion: true,
        })
      }
      fire(0.2)
      fire(0.8)
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          startVelocity: 45,
          origin: { x: 0.5, y: 0.6 },
          colors,
          scalar: 0.9,
          disableForReducedMotion: true,
        })
      }, 200)
    }
    prevAllDoneRef.current = allDone
  }, [completedToday, totalToday, currentDate])

  const handleAdd = (title: string, days: DayOfWeek[]) => {
    const result = addTodo(title, days)
    if (!result.success) {
      toast.error(result.error)
    }
    return result
  }

  const handleUpdateDays = (id: string, days: DayOfWeek[]) => {
    const result = updateTodoDays(id, days)
    if (!result.success) {
      toast.error(result.error)
    }
    return result
  }

  const handleArchive = (id: string) => {
    archiveTodo(id)
    toast.success('Task archived.')
  }

  const handleDelete = (id: string) => {
    deleteTodo(id)
    toast.success('Task deleted.')
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
                <linearGradient id="mograd-sm" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#849669" />
                  <stop offset="100%" stopColor="#9aad7e" />
                </linearGradient>
              </defs>
              <text
                x="60"
                y="38"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="42"
                fill="url(#mograd-sm)"
              >
                mo
              </text>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            {email && (
              <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
            )}
            <button
              onClick={openHelp}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Help"
              title="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {settings.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4" {...swipeHandlers}>
        {view === 'active' && (
          <DateNavigator
            formattedDate={formattedDate}
            isToday={isToday}
            onPrev={goToPrevDay}
            onNext={goToNextDay}
            onToday={goToToday}
          />
        )}

        <ViewToggle
          view={view}
          onViewChange={setView}
          archiveCount={archivedTodos.length}
          isAdmin={isAdmin}
        />

        {view === 'active' ? (
          <TodoList
            todos={todosForCurrentDay}
            dailyTasks={dailyTasksForCurrentDate}
            currentDate={currentDate}
            currentDay={currentDay}
            dayTodoCount={todosForCurrentDay.length}
            maxPerDay={maxPerDay}
            totalActive={activeCount}
            maxTotal={maxTotal}
            disabledDays={disabledDays}
            getStatus={getStatus}
            onAdd={handleAdd}
            onAddDailyTask={addDailyTask}
            onEdit={editTodo}
            onUpdateDays={handleUpdateDays}
            onReorder={reorderTodos}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onToggleCompleted={toggleCompleted}
            onToggleDailyTask={toggleDailyTask}
            onDeleteDailyTask={deleteDailyTask}
            onSetNote={setNote}
          />
        ) : view === 'all' ? (
          <AllTodosView
            todos={activeTodos}
            disabledDays={disabledDays}
            totalActive={activeCount}
            maxTotal={maxTotal}
            onAdd={handleAdd}
            onEdit={editTodo}
            onUpdateDays={handleUpdateDays}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        ) : view === 'settings' ? (
          <SettingsView
            settings={settings}
            onUpdateTheme={onUpdateTheme}
            onUpdateMaxPerDay={onUpdateMaxPerDay}
          />
        ) : view === 'dashboard' && isAdmin ? (
          <AdminDashboard />
        ) : (
          <ArchiveView
            todos={archivedTodos}
            onDelete={handleDelete}
          />
        )}

        {view !== 'settings' && view !== 'dashboard' && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            {completedToday}/{totalToday} today
          </p>
        )}
      </main>

      {/* day50 logo — bottom right */}
      <div className="fixed bottom-4 right-4 z-10">
        <img
          src={settings.theme === 'dark' ? '/day50-light.png' : '/day50-dark.png'}
          alt="day50"
          className="h-14 w-14 rounded-full"
        />
      </div>

      {showOnboarding && (
        <OnboardingGuide
          isFirstTime={onboardingIsFirstTime}
          onClose={() => setShowOnboarding(false)}
          onDismissForever={() => {
            localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
            setShowOnboarding(false)
          }}
        />
      )}
    </div>
  )
}
