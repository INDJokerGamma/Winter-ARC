import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { format, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react'
import {
  fetchGoals,
  fetchActivityLogs,
  fetchDailyReflection,
  upsertActivityLog,
  upsertDailyReflection,
  type Goal,
  type ActivityLog,
} from '@/services/dataService'

export default function DailyTracker() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [goals, setGoals] = useState<Goal[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState('')
  const [productivity, setProductivity] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [savingReflection, setSavingReflection] = useState(false)
  const [reflectionSaved, setReflectionSaved] = useState(false)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const isToday = isSameDay(selectedDate, new Date())

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [g, l, savedReflection] = await Promise.all([
        fetchGoals(user.id),
        fetchActivityLogs(user.id, dateStr),
        fetchDailyReflection(user.id, dateStr),
      ])
      // Only active goals
      setGoals(g.filter(goal => goal.status === 'active'))
      setLogs(l)
      setProductivity(savedReflection?.productivity ?? 3)
      setEnergy(savedReflection?.energy ?? 3)
      setReflection(savedReflection?.notes ?? '')
    } catch (err) {
      console.error('Failed to load tracker data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user, dateStr])

  const nextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(selectedDate.getDate() + 1)
    if (next <= new Date()) setSelectedDate(next)
  }

  const prevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(selectedDate.getDate() - 1)
    setSelectedDate(prev)
  }

  const getLogForGoal = (goalId: string) => {
    return logs.find(l => l.goal_id === goalId)
  }

  const toggleGoalStatus = async (goal: Goal) => {
    if (!user) return
    const existing = getLogForGoal(goal.id)
    const newStatus = existing?.status === 'completed' ? 'not_completed' : 'completed'
    try {
      await upsertActivityLog(user.id, {
        goal_id: goal.id,
        scheduled_date: dateStr,
        status: newStatus,
        quantity: goal.target_value || undefined,
      })
      loadData()
    } catch (err) {
      console.error('Failed to update log:', err)
    }
  }

  const saveReflection = async () => {
    if (!user) return
    setSavingReflection(true)
    setReflectionSaved(false)
    try {
      await upsertDailyReflection(user.id, {
        reflection_date: dateStr,
        productivity,
        energy,
        notes: reflection,
      })
      setReflectionSaved(true)
      window.setTimeout(() => setReflectionSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save reflection:', err)
    } finally {
      setSavingReflection(false)
    }
  }

  const completedCount = goals.filter(g => getLogForGoal(g.id)?.status === 'completed').length
  const totalCount = goals.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const orderedGoals = [
    ...goals.filter(goal => getLogForGoal(goal.id)?.status !== 'completed'),
    ...goals.filter(goal => getLogForGoal(goal.id)?.status === 'completed'),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Daily Tracker</h1>
        <p className="text-muted-foreground">Log your daily progress and stay consistent.</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
        <button onClick={prevDay} className="rounded-md p-2 hover:bg-muted transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {isToday ? 'Today' : format(selectedDate, 'EEEE')}
          </h2>
          <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={nextDay}
          disabled={isToday}
          className={`rounded-md p-2 transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {completedCount} of {totalCount} goals completed
            </span>
            <span className="text-sm font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No active goals</h3>
          <p className="text-sm text-muted-foreground mb-4">Create some goals first to start tracking daily progress.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orderedGoals.map(goal => {
            const log = getLogForGoal(goal.id)
            const isDone = log?.status === 'completed'
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoalStatus(goal)}
                className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                  isDone ? 'bg-green-500/5 border-green-500/20' : 'bg-card hover:bg-muted/50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground capitalize">{goal.goal_type}</span>
                    {goal.target_value != null && (
                      <span className="text-xs text-muted-foreground">
                        · {goal.target_value} {goal.unit || ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  goal.priority === 'High' ? 'bg-red-500/10 text-red-600' :
                  goal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-green-500/10 text-green-600'
                }`}>
                  {goal.priority}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Daily Reflection */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Daily Reflection</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Productivity</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setProductivity(n)}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      productivity >= n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Energy Level</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergy(n)}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      energy >= n ? 'bg-blue-500 text-white' : 'hover:bg-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">What went well today?</label>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm h-24 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Reflect on your day..."
            />
          </div>
          <button
            onClick={saveReflection}
            disabled={savingReflection}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {savingReflection ? 'Saving...' : reflectionSaved ? 'Saved' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  )
}
