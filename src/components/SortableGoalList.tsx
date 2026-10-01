import { useRef, useState } from 'react'
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
  const draggedIdRef = useRef<string | null>(null)
  const overIdRef = useRef<string | null>(null)
  const holdTimerRef = useRef<number | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  const moveGoal = (targetId: string) => {
    const currentDraggedId = draggedIdRef.current
    if (!currentDraggedId || currentDraggedId === targetId) return
    const draggedIndex = goals.findIndex(goal => goal.id === currentDraggedId)
    const targetIndex = goals.findIndex(goal => goal.id === targetId)
    if (draggedIndex < 0 || targetIndex < 0) return

    const reordered = [...goals]
    const [draggedGoal] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedGoal)
    onReorder(reordered)
  }

  const clearDragState = () => {
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
    draggedIdRef.current = null
    overIdRef.current = null
    pointerStartRef.current = null
    setDraggedId(null)
    setOverId(null)
  }

  return (
    <div className={className}>
      {goals.map(goal => (
        <div
          key={goal.id}
          draggable
          data-sortable-goal-id={goal.id}
          style={{ touchAction: 'pan-y' }}
          onPointerDown={event => {
            if (event.pointerType === 'mouse' && event.button !== 0) return
            pointerStartRef.current = { x: event.clientX, y: event.clientY }
            holdTimerRef.current = window.setTimeout(() => {
              draggedIdRef.current = goal.id
              setDraggedId(goal.id)
            }, 250)
          }}
          onPointerMove={event => {
            const start = pointerStartRef.current
            if (!draggedIdRef.current && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
              if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current)
              holdTimerRef.current = null
              return
            }
            if (!draggedIdRef.current) return
            event.preventDefault()
            const target = document.elementFromPoint(event.clientX, event.clientY)
              ?.closest<HTMLElement>('[data-sortable-goal-id]')
            const targetId = target?.dataset.sortableGoalId ?? null
            overIdRef.current = targetId
            setOverId(targetId)
          }}
          onPointerUp={event => {
            if (draggedIdRef.current && overIdRef.current) moveGoal(overIdRef.current)
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
            clearDragState()
          }}
          onPointerCancel={clearDragState}
          onDragStart={() => {
            draggedIdRef.current = goal.id
            setDraggedId(goal.id)
          }}
          onDragOver={event => {
            event.preventDefault()
            overIdRef.current = goal.id
            setOverId(goal.id)
          }}
          onDrop={event => {
            event.preventDefault()
            moveGoal(goal.id)
            clearDragState()
          }}
          onDragEnd={clearDragState}
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
