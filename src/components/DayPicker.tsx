import { cn } from '@/lib/utils'
import { ALL_DAYS, DAY_LABELS, type DayOfWeek } from '@/types'

interface DayPickerProps {
  selected: DayOfWeek[]
  onChange: (days: DayOfWeek[]) => void
  disabledDays?: DayOfWeek[]
  compact?: boolean
}

export function DayPicker({ selected, onChange, disabledDays = [], compact = false }: DayPickerProps) {
  const toggle = (day: DayOfWeek) => {
    if (selected.includes(day)) {
      // Don't allow unchecking the last day
      if (selected.length <= 1) return
      onChange(selected.filter(d => d !== day))
    } else {
      if (disabledDays.includes(day)) return
      onChange([...selected, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex gap-1">
      {ALL_DAYS.map(day => {
        const isSelected = selected.includes(day)
        const isDisabled = !isSelected && disabledDays.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            disabled={isDisabled}
            title={isDisabled ? `${DAY_LABELS[day]} is full` : DAY_LABELS[day]}
            className={cn(
              'rounded-md font-medium transition-colors select-none',
              compact ? 'text-[10px] h-5 w-7' : 'text-xs h-7 w-9',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent',
              isDisabled && 'opacity-30 cursor-not-allowed'
            )}
          >
            {DAY_LABELS[day]}
          </button>
        )
      })}
    </div>
  )
}
