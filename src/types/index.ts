export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sun=0 ... Sat=6

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6]

export interface Todo {
  id: string
  title: string
  order: number
  days: DayOfWeek[] // which days of the week this todo appears on
  createdAt: string
  archivedAt: string | null
}

export interface DailyStatus {
  todoId: string
  date: string
  completed: 1 | null
  note: string
}

export interface DailyTask {
  id: string
  title: string
  date: string       // YYYY-MM-DD — exists only for this date
  completed: boolean
  createdAt: string
}

export interface UserSettings {
  theme: 'light' | 'dark'
  maxPerDay: number // 2–10
}
