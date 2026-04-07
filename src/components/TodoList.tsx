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
import { AddTodoButton } from './AddTodoButton'
import type { Todo } from '@/types'

interface TodoListProps {
  todos: Todo[]
  currentDate: string
  activeCount: number
  maxActive: number
  getStatus: (todoId: string, date: string) => { todoId: string; date: string; completed: 1 | null; note: string }
  onAdd: (title: string) => { success: boolean; error?: string }
  onEdit: (id: string, title: string) => void
  onReorder: (ids: string[]) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onToggleCompleted: (todoId: string, date: string) => void
  onSetNote: (todoId: string, date: string, note: string) => void
}

export function TodoList({
  todos,
  currentDate,
  activeCount,
  maxActive,
  getStatus,
  onAdd,
  onEdit,
  onReorder,
  onArchive,
  onDelete,
  onToggleCompleted,
  onSetNote,
}: TodoListProps) {
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

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No to-dos yet. Add your first one!</p>
        <AddTodoButton onAdd={onAdd} disabled={activeCount >= maxActive} />
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
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onToggleCompleted={onToggleCompleted}
              onSetNote={onSetNote}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddTodoButton onAdd={onAdd} disabled={activeCount >= maxActive} />
    </div>
  )
}
