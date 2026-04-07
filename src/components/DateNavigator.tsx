import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateNavigatorProps {
  formattedDate: string
  isToday: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function DateNavigator({ formattedDate, isToday, onPrev, onNext, onToday }: DateNavigatorProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="text-center">
        <h2 className="text-lg font-semibold">{formattedDate}</h2>
        {isToday ? (
          <span className="text-xs font-medium text-primary">Today</span>
        ) : (
          <button
            onClick={onToday}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Go to today
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
