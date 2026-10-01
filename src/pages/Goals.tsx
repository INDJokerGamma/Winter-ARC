import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  fetchGoals,
  fetchCategories,
  fetchActiveChallenge,
  createGoal,
  updateGoal,
  deleteGoal,
  reorderGoals,
  type Goal,
  type Category,
  type Challenge,
  type GoalCreateInput,
} from '@/services/dataService'
import { Plus, Trash2, Edit3, X, Target, CheckCircle2 } from 'lucide-react'
import { SortableGoalList } from '@/components/SortableGoalList'

const GOAL_TYPES: { value: Goal['goal_type']; label: string; desc: string }[] = [
  { value: 'habit', label: 'Habit', desc: 'Recurring daily/weekly action' },
  { value: 'measurable', label: 'Measurable', desc: 'Track a numeric value over time' },
  { value: 'task', label: 'Task', desc: 'A one-time to-do with a deadline' },
  { value: 'milestone', label: 'Milestone', desc: 'A major achievement to reach' },
  { value: 'time', label: 'Time-Based', desc: 'Track hours/minutes spent' },
]

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all')

  const loadData = async () => {
    if (!user) return
    try {
      const [g, c, ch] = await Promise.all([
        fetchGoals(user.id),
        fetchCategories(user.id),
        fetchActiveChallenge(user.id),
      ])
      setGoals(g)
      setCategories(c)
      setChallenge(ch)
    } catch (err) {
      console.error('Failed to load goals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  const handleCreate = async (input: GoalCreateInput) => {
    if (!user) return
    await createGoal(user.id, {
      ...input,
      challenge_id: challenge?.id,
    })
    setShowModal(false)
    loadData()
  }

  const handleUpdate = async (goalId: string, updates: Partial<GoalCreateInput> & { status?: Goal['status'] }) => {
    await updateGoal(goalId, updates)
    setEditingGoal(null)
    loadData()
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    await deleteGoal(goalId)
    loadData()
  }

  const handleMarkComplete = async (goalId: string) => {
    await updateGoal(goalId, { status: 'completed' })
    loadData()
  }

  const handleReorder = (reorderedVisibleGoals: Goal[]) => {
    if (!user) return
    const visibleIds = new Set(reorderedVisibleGoals.map(goal => goal.id))
    let visibleIndex = 0
    const reorderedGoals = goals.map(goal => {
      if (!visibleIds.has(goal.id)) return goal
      return reorderedVisibleGoals[visibleIndex++]
    })

    setGoals(reorderedGoals)
    void reorderGoals(user.id, reorderedGoals.map(goal => goal.id)).catch(error => {
      console.error('Failed to save goal order:', error)
      void loadData()
    })
  }

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return g.status !== 'archived'
    return g.status === filter
  })
  const orderedFilteredGoals = filter === 'all'
    ? [
        ...filteredGoals.filter(goal => goal.status !== 'completed'),
        ...filteredGoals.filter(goal => goal.status === 'completed'),
      ]
    : filteredGoals

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">My Goals</h1>
          <p className="text-muted-foreground">Create, track and manage your custom goals.</p>
        </div>
        <button
          onClick={() => { setEditingGoal(null); setShowModal(true) }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'completed', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f} {f !== 'all' && `(${goals.filter(g => g.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        </div>
      ) : orderedFilteredGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Target className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No goals found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {filter === 'all'
              ? 'Start by creating your first goal for the Winter Arc.'
              : `No ${filter} goals yet.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create your first goal
            </button>
          )}
        </div>
      ) : (
        <SortableGoalList
          goals={orderedFilteredGoals}
          onReorder={handleReorder}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {goal => (
            <GoalCard
              goal={goal}
              onEdit={() => { setEditingGoal(goal); setShowModal(true) }}
              onDelete={() => handleDelete(goal.id)}
              onComplete={() => handleMarkComplete(goal.id)}
            />
          )}
        </SortableGoalList>
      )}

      {/* Modal */}
      {showModal && (
        <GoalModal
          goal={editingGoal}
          categories={categories}
          onClose={() => { setShowModal(false); setEditingGoal(null) }}
          onSubmit={editingGoal
            ? (input) => handleUpdate(editingGoal.id, input)
            : handleCreate
          }
        />
      )}
    </div>
  )
}

// ── Goal Card ──

function GoalCard({ goal, onEdit, onDelete, onComplete }: {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
}) {
  const priorityColors = {
    High: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Low: 'bg-green-500/10 text-green-600 dark:text-green-400',
  }

  return (
    <div className="group rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-base leading-tight">{goal.title}</h3>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {goal.status === 'active' && (
            <button onPointerDown={event => event.stopPropagation()} onClick={onComplete} className="p-1 rounded hover:bg-green-500/10" title="Mark complete">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </button>
          )}
          <button onPointerDown={event => event.stopPropagation()} onClick={onEdit} className="p-1 rounded hover:bg-muted" title="Edit">
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onPointerDown={event => event.stopPropagation()} onClick={onDelete} className="p-1 rounded hover:bg-destructive/10" title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
          {goal.goal_type}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[goal.priority]}`}>
          {goal.priority}
        </span>
        {goal.status === 'completed' && (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
            ✓ Done
          </span>
        )}
      </div>

      {goal.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{goal.description}</p>
      )}

      {goal.target_value != null && (
        <div className="text-xs text-muted-foreground">
          Target: {goal.target_value} {goal.unit || ''}
        </div>
      )}

      {(goal.category as Category | null)?.name && (
        <div className="mt-2 text-xs text-muted-foreground">
          📂 {(goal.category as Category).name}
        </div>
      )}
    </div>
  )
}

// ── Goal Modal ──

function GoalModal({ goal, categories, onClose, onSubmit }: {
  goal: Goal | null
  categories: Category[]
  onClose: () => void
  onSubmit: (input: GoalCreateInput) => Promise<void>
}) {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [goalType, setGoalType] = useState<Goal['goal_type']>(goal?.goal_type || 'habit')
  const [unit, setUnit] = useState(goal?.unit || '')
  const [targetValue, setTargetValue] = useState(goal?.target_value?.toString() || '')
  const [priority, setPriority] = useState<Goal['priority']>(goal?.priority || 'Medium')
  const [startDate, setStartDate] = useState(goal?.start_date || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(goal?.due_date || '')
  const [categoryId, setCategoryId] = useState(goal?.category_id || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        title,
        description: description || undefined,
        goal_type: goalType,
        unit: unit || undefined,
        target_value: targetValue ? Number(targetValue) : undefined,
        priority,
        start_date: startDate,
        due_date: dueDate || startDate,
        category_id: categoryId || undefined,
      })
    } catch (err) {
      console.error('Failed to save goal:', err)
      alert('Failed to save goal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Goal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., Run 5km every morning"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm h-20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add details about this goal..."
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Goal Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOAL_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setGoalType(t.value)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    goalType === t.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Measurable fields */}
          {(goalType === 'measurable' || goalType === 'time') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Value</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={goalType === 'time' ? 'hours' : 'reps, km, pages...'}
                />
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                    priority === p ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
