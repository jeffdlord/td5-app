import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { GripVertical, Archive, Trash2, Check, MessageSquare } from 'lucide-react'
import type { Todo, DailyStatus } from '@/types'
import { cn } from '@/lib/utils'

interface TodoItemProps {
  todo: Todo
  status: DailyStatus
  onEdit: (id: string, title: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onToggleCompleted: (todoId: string, date: string) => void
  onSetNote: (todoId: string, date: string, note: string) => void
  currentDate: string
}

export function TodoItem({
  todo,
  status,
  onEdit,
  onArchive,
  onDelete,
  onToggleCompleted,
  onSetNote,
  currentDate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [showNote, setShowNote] = useState(false)
  const [noteValue, setNoteValue] = useState(status.note)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleEditSubmit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed)
    } else {
      setEditTitle(todo.title)
    }
    setIsEditing(false)
  }

  const handleNoteBlur = () => {
    onSetNote(todo.id, currentDate, noteValue)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-3 mb-2',
        isDragging && 'opacity-50 shadow-lg',
        status.completed === 1 && 'opacity-70'
      )}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => onToggleCompleted(todo.id, currentDate)}
          className={cn(
            'shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
            status.completed === 1
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-primary'
          )}
          aria-label={status.completed === 1 ? 'Mark incomplete' : 'Mark complete'}
        >
          {status.completed === 1 && <Check className="h-3 w-3" />}
        </button>

        {isEditing ? (
          <Input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSubmit()
              if (e.key === 'Escape') {
                setEditTitle(todo.title)
                setIsEditing(false)
              }
            }}
            className="h-7 text-sm flex-1"
            maxLength={100}
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={cn(
              'flex-1 text-sm cursor-pointer hover:text-primary transition-colors',
              status.completed === 1 && 'line-through'
            )}
          >
            {todo.title}
          </span>
        )}

        <button
          onClick={() => setShowNote(!showNote)}
          className={cn(
            'p-1 text-muted-foreground hover:text-foreground transition-colors',
            status.note && 'text-primary'
          )}
          aria-label="Toggle note"
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onArchive(todo.id)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Archive"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {showNote && (
        <Input
          placeholder="Add a note for today..."
          value={noteValue}
          onChange={e => setNoteValue(e.target.value)}
          onBlur={handleNoteBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSetNote(todo.id, currentDate, noteValue)
              setShowNote(false)
            }
          }}
          className="h-8 text-xs ml-12"
          maxLength={200}
        />
      )}
    </div>
  )
}
