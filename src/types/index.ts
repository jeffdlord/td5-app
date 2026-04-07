export interface Todo {
  id: string
  title: string
  order: number
  createdAt: string
  archivedAt: string | null
}

export interface DailyStatus {
  todoId: string
  date: string
  completed: 1 | null
  note: string
}
