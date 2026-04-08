import { Sun, Moon, Minus, Plus, AlertTriangle } from 'lucide-react'
import type { UserSettings } from '@/types'
import { cn } from '@/lib/utils'

interface SettingsViewProps {
  settings: UserSettings
  onUpdateTheme: (theme: 'light' | 'dark') => void
  onUpdateMaxPerDay: (maxPerDay: number) => void
}

export function SettingsView({ settings, onUpdateTheme, onUpdateMaxPerDay }: SettingsViewProps) {
  return (
    <div className="space-y-4">
      {/* Theme */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Appearance</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateTheme('light')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-colors',
              settings.theme === 'light'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => onUpdateTheme('dark')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-colors',
              settings.theme === 'dark'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>
      </div>

      {/* Daily Task Limit */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Daily Task Limit</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Maximum number of to-dos per day of the week.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onUpdateMaxPerDay(settings.maxPerDay - 1)}
            disabled={settings.maxPerDay <= 2}
            className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease limit"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="text-3xl font-bold text-foreground w-12 text-center tabular-nums">
            {settings.maxPerDay}
          </span>

          <button
            onClick={() => onUpdateMaxPerDay(settings.maxPerDay + 1)}
            disabled={settings.maxPerDay >= 10}
            className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase limit"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {settings.maxPerDay > 5 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              More than 5 daily tasks reduces the likelihood of completion. Consider focusing on fewer, higher-impact items.
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Settings are saved automatically and synced across your devices.
      </p>
    </div>
  )
}
