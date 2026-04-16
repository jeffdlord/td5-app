import { useState } from 'react'
import {
  CheckSquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Archive,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'

interface OnboardingGuideProps {
  /** true = first time after login (show "don't show again"); false = opened via ? icon (show "close") */
  isFirstTime: boolean
  onClose: () => void
  onDismissForever: () => void
}

const steps = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Welcome to mo',
    description:
      "mo helps you build momentum by focusing on a small set of daily tasks. Here's a quick tour.",
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-primary" />,
    title: 'Your daily list',
    description:
      'The Today tab shows your tasks for the current day. Tap the checkbox to mark items done. Complete them all for a surprise!',
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    title: 'Day scheduling',
    description:
      'Each task is assigned to specific days of the week. Tap the calendar icon on any task to change which days it appears.',
  },
  {
    icon: (
      <div className="flex items-center gap-1">
        <ChevronLeft className="h-8 w-8 text-primary" />
        <ChevronRight className="h-8 w-8 text-primary" />
      </div>
    ),
    title: 'Navigate days',
    description:
      'Use the arrows or swipe left/right to jump between days. Tap "Today" to snap back to the current date.',
  },
  {
    icon: <GripVertical className="h-8 w-8 text-primary" />,
    title: 'Reorder tasks',
    description:
      'Press and hold the grip handle on the left of any task, then drag to rearrange your list.',
  },
  {
    icon: <Plus className="h-8 w-8 text-primary" />,
    title: 'Add tasks',
    description:
      'Tap the + button to add a recurring task (up to 20 total). Use "+ just for today" to add a one-off task that won\'t carry forward.',
  },
  {
    icon: <Archive className="h-8 w-8 text-primary" />,
    title: 'All & Archive',
    description:
      'The All tab shows every task across all days. Archive tasks you no longer need — find them later in the Archive tab.',
  },
  {
    icon: (
      <div className="flex items-center gap-1">
        <Sun className="h-8 w-8 text-primary" />
        <Moon className="h-8 w-8 text-primary" />
      </div>
    ),
    title: 'Settings',
    description:
      'Switch between light and dark mode, and set your daily task limit (2-10). Find these in the Settings tab.',
  },
]

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
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-6">{step.icon}</div>
        <h2 className="text-xl font-bold text-foreground mb-3">{step.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {step.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 space-y-4">
        {/* Don't show again (only on first-time view) */}
        {isFirstTime && isLast && (
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

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 max-w-xs mx-auto w-full">
          {!isFirst ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 h-10 rounded-full border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex-1 h-10 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 h-10 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#6b7a54' }}
          >
            {isLast ? (isFirstTime ? 'Get started' : 'Close') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
