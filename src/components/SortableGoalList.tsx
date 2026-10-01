import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import type { Goal } from '@/services/dataService'

type SortableGoalListProps = {
  goals: Goal[]
  onReorder: (goals: Goal[]) => void
  children: (goal: Goal) => React.ReactNode
  className?: string
}

export function SortableGoalList({ goals, onReorder, children, className = '' }: SortableGoalListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const moveGoal = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return
    const draggedIndex = goals.findIndex(goal => goal.id === draggedId)
    const targetIndex = goals.findIndex(goal => goal.id === targetId)
    if (draggedIndex < 0 || targetIndex < 0) return

    const reordered = [...goals]
    const [draggedGoal] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedGoal)
    onReorder(reordered)
  }

  return (
    <div className={className}>
      {goals.map(goal => (
        <div
          key={goal.id}
          draggable
          onDragStart={() => setDraggedId(goal.id)}
          onDragOver={event => {
            event.preventDefault()
            setOverId(goal.id)
          }}
          onDrop={event => {
            event.preventDefault()
            moveGoal(goal.id)
            setDraggedId(null)
            setOverId(null)
          }}
          onDragEnd={() => {
            setDraggedId(null)
            setOverId(null)
          }}
          className={`relative cursor-grab touch-none active:cursor-grabbing ${
            overId === goal.id && draggedId !== goal.id ? 'before:absolute before:-top-2 before:left-0 before:right-0 before:h-1 before:rounded-full before:bg-primary' : ''
          } ${draggedId === goal.id ? 'opacity-45' : ''}`}
        >
          <div className="pointer-events-none absolute left-1 top-1/2 z-10 -translate-y-1/2 text-muted-foreground opacity-60">
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="pl-5">{children(goal)}</div>
        </div>
      ))}
    </div>
  )
}
