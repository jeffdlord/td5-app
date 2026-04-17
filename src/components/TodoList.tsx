import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TodoItem } from './TodoItem'
import { DailyTaskItem } from './DailyTaskItem'
import { AddTodoButton } from './AddTodoButton'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Todo, DailyTask, DayOfWeek } from '@/types'

interface TodoListProps {
  todos: Todo[]
  dailyTasks: DailyTask[]
  currentDate: string
  currentDay: DayOfWeek
  dayTodoCount: number
  maxPerDay: number
  totalActive: number
  maxTotal: number
  disabledDays: DayOfWeek[]
  getStatus: (todoId: string, date: string) => { todoId: string; date: string; completed: 1 | null; note: string }
  onAdd: (title: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  onAddDailyTask: (title: string, date: string) => { success: boolean; error?: string }
  onEdit: (id: string, title: string) => void
  onUpdateDays: (id: string, days: DayOfWeek[]) => { success: boolean; error?: string }
  onReorder: (ids: string[]) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onToggleCompleted: (todoId: string, date: string) => void
  onToggleDailyTask: (id: string) => void
  onDeleteDailyTask: (id: string) => void
  onSetNote: (todoId: string, date: string, note: string) => void
}

export function TodoList({
  todos,
  dailyTasks,
  currentDate,
  currentDay,
  dayTodoCount,
  maxPerDay,
  totalActive,
  maxTotal,
  disabledDays,
  getStatus,
  onAdd,
  onAddDailyTask,
  onEdit,
  onUpdateDays,
  onReorder,
  onArchive,
  onDelete,
  onToggleCompleted,
  onToggleDailyTask,
  onDeleteDailyTask,
  onSetNote,
}: TodoListProps) {
  const [showDailyInput, setShowDailyInput] = useState(false)
  const [dailyTitle, setDailyTitle] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const ids = todos.map(t => t.id)
      const oldIndex = ids.indexOf(active.id as string)
      const newIndex = ids.indexOf(over.id as string)

      const newIds = [...ids]
      newIds.splice(oldIndex, 1)
      newIds.splice(newIndex, 0, active.id as string)
      onReorder(newIds)
    }
  }

  const addDisabled = dayTodoCount >= maxPerDay || totalActive >= maxTotal

  const handleAddDailyTask = () => {
    const result = onAddDailyTask(dailyTitle, currentDate)
    if (result.success) {
      setDailyTitle('')
      setShowDailyInput(false)
    }
  }

  const dailyTasksSection = (
    <>
      {dailyTasks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Just for today</p>
          {dailyTasks.map(task => (
            <DailyTaskItem
              key={task.id}
              task={task}
              onToggle={onToggleDailyTask}
              onDelete={onDeleteDailyTask}
            />
          ))}
        </div>
      )}

      {showDailyInput ? (
        <div className="flex items-center gap-2 mt-3">
          <Input
            autoFocus
            placeholder="Just for today..."
            value={dailyTitle}
            onChange={e => setDailyTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddDailyTask()
              if (e.key === 'Escape') { setShowDailyInput(false); setDailyTitle('') }
            }}
            className="h-8 text-sm flex-1"
            maxLength={100}
          />
          <button
            onClick={handleAddDailyTask}
            className="text-xs text-primary hover:underline"
            title="Add daily task"
          >
            Add
          </button>
          <button
            onClick={() => { setShowDailyInput(false); setDailyTitle('') }}
            className="text-xs text-muted-foreground hover:underline"
            title="Cancel"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowDailyInput(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-3"
          title="Add a one-off task for today only"
        >
          <Plus className="h-3 w-3" />
          just for today
        </button>
      )}
    </>
  )

  if (todos.length === 0 && dailyTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="rounded-lg border bg-card p-8 mb-4">
          <p className="text-lg font-medium text-foreground mb-1">No tasks for this day</p>
          <p className="text-sm text-muted-foreground">Add a task to get started!</p>
        </div>
        <AddTodoButton
          onAdd={onAdd}
          disabled={addDisabled}
          disabledDays={disabledDays}
          currentDay={currentDay}
        />
        {dailyTasksSection}
      </div>
    )
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              status={getStatus(todo.id, currentDate)}
              currentDate={currentDate}
              disabledDays={disabledDays}
              onEdit={onEdit}
              onUpdateDays={onUpdateDays}
              onArchive={onArchive}
              onDelete={onDelete}
              onToggleCompleted={onToggleCompleted}
              onSetNote={onSetNote}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddTodoButton
        onAdd={onAdd}
        disabled={addDisabled}
        disabledDays={disabledDays}
        currentDay={currentDay}
      />
      {dailyTasksSection}
    </div>
  )
}
