import { useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  MessageSquare,
  Calendar,
  Archive as ArchiveIcon,
  Trash2,
  ListTodo,
  LayoutList,
  Archive,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingGuideProps {
  isFirstTime: boolean
  onClose: () => void
  onDismissForever: () => void
}

/* ── Mini UI mockups ─────────────────────────────────────── */

function MockLogo() {
  return (
    <svg viewBox="0 0 120 50" className="h-7 w-auto">
      <text x="60" y="38" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="42" fill="#849669">
        mo
      </text>
    </svg>
  )
}

function MockCheckbox({ checked }: { checked: boolean }) {
  return (
    <div className={cn(
      'shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center',
      checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
    )}>
      {checked && <Check className="h-2.5 w-2.5" />}
    </div>
  )
}

function MockTodoRow({ title, checked, highlight }: { title: string; checked: boolean; highlight?: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-md border bg-card px-2.5 py-2 text-[11px]',
      highlight && 'ring-2 ring-primary/40',
      checked && 'opacity-60',
    )}>
      <GripVertical className="h-3 w-3 text-muted-foreground/40" />
      <MockCheckbox checked={checked} />
      <span className={cn('flex-1', checked && 'line-through')}>{title}</span>
      <MessageSquare className="h-3 w-3 text-muted-foreground/30" />
      <Calendar className="h-3 w-3 text-muted-foreground/30" />
      <ArchiveIcon className="h-3 w-3 text-muted-foreground/30" />
      <Trash2 className="h-3 w-3 text-muted-foreground/30" />
    </div>
  )
}

function IllustrationWelcome() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <MockLogo />
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded bg-muted" />
          <div className="h-3 w-3 rounded bg-muted" />
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <MockTodoRow title="Morning workout" checked={true} />
        <MockTodoRow title="Read 20 pages" checked={true} />
        <MockTodoRow title="Review goals" checked={false} />
      </div>
      <div className="text-center text-[10px] text-muted-foreground pb-2">2/3 today</div>
    </div>
  )
}

function IllustrationDailyList() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="p-3 space-y-1.5">
        <MockTodoRow title="Morning workout" checked={true} />
        <MockTodoRow title="Read 20 pages" checked={false} highlight />
        <MockTodoRow title="Review goals" checked={false} />
      </div>
      <div className="flex items-center justify-center gap-1 pb-2">
        <div className="h-3 px-1.5 rounded bg-primary/20 text-[9px] text-primary font-medium flex items-center">1/3 today</div>
      </div>
    </div>
  )
}

function IllustrationDayScheduling() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const active = [false, true, false, true, false, true, false]
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-[11px]">
          <MockCheckbox checked={false} />
          <span className="flex-1">Read 20 pages</span>
          <Calendar className="h-3 w-3 text-primary" />
        </div>
        <div className="flex justify-center gap-1 px-4">
          {days.map((d, i) => (
            <button
              key={i}
              className={cn(
                'h-6 w-6 rounded-full text-[10px] font-medium flex items-center justify-center',
                active[i] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function IllustrationNavigate() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <ChevronLeft className="h-5 w-5 text-primary" />
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground">Wednesday, Apr 16</p>
          <p className="text-[10px] text-primary font-medium">Today</p>
        </div>
        <ChevronRight className="h-5 w-5 text-primary" />
      </div>
      <div className="flex justify-center pb-3">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <ChevronLeft className="h-3 w-3" />
          <span>swipe to navigate</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}

function IllustrationReorder() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden p-3 space-y-1.5">
      <MockTodoRow title="Morning workout" checked={false} />
      <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 px-2.5 py-2 text-[11px]">
        <GripVertical className="h-3 w-3 text-primary" />
        <MockCheckbox checked={false} />
        <span className="flex-1">Read 20 pages</span>
      </div>
      <div className="h-0.5 rounded bg-primary/40 mx-4" />
      <MockTodoRow title="Review goals" checked={false} />
    </div>
  )
}

function IllustrationAddTasks() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden p-3 space-y-2">
      <MockTodoRow title="Morning workout" checked={false} />
      <button className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 py-2 text-[11px] text-primary font-medium">
        <Plus className="h-3 w-3" /> Add to-do
      </button>
      <div className="border-t pt-2">
        <div className="flex items-center gap-2 rounded-md border border-dashed bg-card/50 px-2.5 py-2 text-[11px]">
          <MockCheckbox checked={false} />
          <span className="flex-1 text-muted-foreground italic">Pick up groceries</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
          <Plus className="h-2.5 w-2.5" /> just for today
        </div>
      </div>
    </div>
  )
}

function IllustrationAllArchive() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex gap-0.5 p-1 mx-3 mt-3 rounded-md bg-muted">
        {[
          { icon: <ListTodo className="h-3 w-3" />, label: 'Today' },
          { icon: <LayoutList className="h-3 w-3" />, label: 'All', active: true },
          { icon: <Archive className="h-3 w-3" />, label: 'Archive' },
          { icon: <Settings className="h-3 w-3" />, label: 'Settings' },
        ].map((tab) => (
          <div
            key={tab.label}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-1 rounded text-[9px] font-medium',
              tab.active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </div>
        ))}
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px]">
          <span className="flex-1">Morning workout</span>
          <span className="flex gap-0.5">{['M','W','F'].map(d => <span key={d} className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[8px] flex items-center justify-center font-medium">{d}</span>)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px]">
          <span className="flex-1">Read 20 pages</span>
          <span className="flex gap-0.5">{['M','T','W','T','F','S','S'].map((d,i) => <span key={i} className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[8px] flex items-center justify-center font-medium">{d}</span>)}</span>
        </div>
      </div>
    </div>
  )
}

function IllustrationSettings() {
  return (
    <div className="w-56 rounded-xl border bg-card shadow-sm overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">Theme</span>
        <div className="flex gap-1">
          <div className="h-6 px-2 rounded-md bg-background border text-[10px] flex items-center gap-1 font-medium text-foreground">
            <div className="h-3 w-3 rounded-full bg-yellow-400" /> Light
          </div>
          <div className="h-6 px-2 rounded-md bg-muted text-[10px] flex items-center gap-1 text-muted-foreground">
            <div className="h-3 w-3 rounded-full bg-indigo-400" /> Dark
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">Daily limit</span>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground">-</div>
          <span className="text-sm font-bold text-primary w-4 text-center">5</span>
          <div className="h-6 w-6 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground">+</div>
        </div>
      </div>
      <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1.5">
        <p className="text-[9px] text-amber-600">More than 5 daily tasks reduces the likelihood of completion.</p>
      </div>
    </div>
  )
}

/* ── Steps data ──────────────────────────────────────────── */

const steps = [
  {
    illustration: <IllustrationWelcome />,
    title: 'Welcome to mo',
    description: "mo helps you build momentum by focusing on a small number of daily tasks — less is more. Keep it to 3-5 per day. Too many tasks defeats the purpose and makes completion less likely. All your data is encrypted end-to-end.",
  },
  {
    illustration: <IllustrationDailyList />,
    title: 'Your daily list',
    description: 'The Today tab shows your tasks for the current day. Tap the checkbox to mark items done.',
  },
  {
    illustration: <IllustrationAddTasks />,
    title: 'Add tasks',
    description: 'Tap the + button to add a recurring task (up to 20 total). Use "+ just for today" to add a one-off task that won\'t carry forward.',
  },
  {
    illustration: <IllustrationDayScheduling />,
    title: 'Day scheduling',
    description: 'Each task is assigned to specific days of the week. Tap the calendar icon on any task to change which days it appears.',
  },
  {
    illustration: <IllustrationNavigate />,
    title: 'Navigate days',
    description: 'Use the arrows or swipe left/right to jump between days. Tap "Today" to snap back to the current date.',
  },
  {
    illustration: <IllustrationReorder />,
    title: 'Reorder tasks',
    description: 'Press and hold the grip handle on the left of any task, then drag to rearrange your list.',
  },
  {
    illustration: <IllustrationAllArchive />,
    title: 'All & Archive',
    description: 'The All tab shows every task across all days. Archive tasks you no longer need — find them later in the Archive tab.',
  },
  {
    illustration: <IllustrationSettings />,
    title: 'Settings',
    description: 'Switch between light and dark mode, and set your daily task limit (2-10). Find these in the Settings tab.',
  },
]

/* ── Component ───────────────────────────────────────���───── */

export function OnboardingGuide({ isFirstTime, onClose, onDismissForever }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0
  const step = steps[currentStep]

  const handleClose = () => {
    if (isFirstTime && dontShowAgain) {
      onDismissForever()
    }
    onClose()
  }

  const handleNext = () => {
    if (isLast) {
      handleClose()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-6 pb-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            }`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
        <div className="mb-5 scale-100">{step.illustration}</div>
        <h2 className="text-xl font-bold text-foreground mb-2">{step.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {step.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 space-y-4">
        {isFirstTime && (
          <label className="flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded border-muted-foreground/30 h-3.5 w-3.5 accent-primary"
            />
            Don&apos;t show me this again
          </label>
        )}

        <div className="flex items-center gap-3 max-w-xs mx-auto w-full">
          {!isFirst && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 h-10 rounded-full border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleClose}
            className="flex-1 h-10 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Close
          </button>
          {!isLast && (
            <button
              onClick={handleNext}
              className="flex-1 h-10 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#6b7a54' }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
