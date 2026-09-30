import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Link } from 'react-router-dom'
import {
  fetchDashboardStats,
  fetchGoals,
  fetchActiveChallenge,
  type DashboardStats,
  type Goal,
  type Challenge,
} from '@/services/dataService'
import { differenceInDays, format } from 'date-fns'
import { Target, Flame, TrendingUp, CheckCircle2, Calendar, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [s, g, c] = await Promise.all([
          fetchDashboardStats(user!.id),
          fetchGoals(user!.id),
          fetchActiveChallenge(user!.id),
        ])
        setStats(s)
        setGoals(g)
        setChallenge(c)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  const today = new Date()
  const daysElapsed = challenge ? differenceInDays(today, new Date(challenge.start_date)) : 0
  const totalDays = challenge ? differenceInDays(new Date(challenge.end_date), new Date(challenge.start_date)) : 90
  const daysRemaining = Math.max(0, totalDays - daysElapsed)
  const challengeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0

  const recentGoals = goals.filter(g => g.status === 'active').slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {challenge ? `Day ${daysElapsed} of your ${totalDays}-day challenge` : 'Start a challenge to begin tracking'}
        </p>
      </div>

      {/* Challenge Progress Bar */}
      {challenge && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-lg">{challenge.name}</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(challenge.start_date), 'MMM d')} → {format(new Date(challenge.end_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{daysRemaining}</span>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500"
              style={{ width: `${challengeProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{challengeProgress}% complete</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="Active Goals"
          value={stats?.activeGoals ?? 0}
          sub={`${stats?.totalGoals ?? 0} total`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Current Streak"
          value={`${stats?.currentStreak ?? 0}d`}
          sub="consecutive days"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          label="Today's Progress"
          value={`${stats?.todayCompletedCount ?? 0}/${stats?.todayTotalCount ?? 0}`}
          sub="tasks done today"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
          label="Completion Rate"
          value={`${stats?.overallProgress ?? 0}%`}
          sub="of all goals"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Goals */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Active Goals</h3>
            <Link to="/goals" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentGoals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No active goals yet.</p>
              <Link
                to="/goals"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create your first goal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGoals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 rounded-full ${
                    goal.priority === 'High' ? 'bg-red-500' :
                    goal.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{goal.goal_type}</p>
                  </div>
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 capitalize">
                    {goal.goal_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            <Link
              to="/tracker"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Log Today's Progress</p>
                <p className="text-xs text-muted-foreground">Record what you accomplished today</p>
              </div>
            </Link>
            <Link
              to="/calendar"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">View Calendar</p>
                <p className="text-xs text-muted-foreground">See your activity over time</p>
              </div>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">View Analytics</p>
                <p className="text-xs text-muted-foreground">Track trends and patterns</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}
