import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  fetchGoals,
  fetchActivityLogRange,
  fetchDashboardStats,
  type Goal,
  type ActivityLog,
  type DashboardStats,
} from '@/services/dataService'
import { format, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ef4444']

export default function Analytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; completed: number; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const today = new Date()
        const weekAgo = subDays(today, 6)

        const [s, g, logs] = await Promise.all([
          fetchDashboardStats(user!.id),
          fetchGoals(user!.id),
          fetchActivityLogRange(user!.id, format(weekAgo, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')),
        ])

        setStats(s)
        setGoals(g)

        // Build weekly chart data
        const weekly: { day: string; completed: number; total: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const d = subDays(today, i)
          const dateStr = format(d, 'yyyy-MM-dd')
          const dayLogs = logs.filter((l: ActivityLog) => l.scheduled_date === dateStr)
          weekly.push({
            day: format(d, 'EEE'),
            completed: dayLogs.filter((l: ActivityLog) => l.status === 'completed').length,
            total: dayLogs.length,
          })
        }
        setWeeklyData(weekly)
      } catch (err) {
        console.error('Analytics load error:', err)
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

  // Goal type distribution for pie chart
  const typeDistribution = goals.reduce<Record<string, number>>((acc, g) => {
    acc[g.goal_type] = (acc[g.goal_type] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }))

  // Goal status distribution
  const statusDistribution = goals.reduce<Record<string, number>>((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Analytics</h1>
        <p className="text-muted-foreground">Visualize your progress and identify trends.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Goals" value={stats?.totalGoals ?? 0} />
        <MetricCard label="Completed" value={stats?.completedGoals ?? 0} accent="text-green-500" />
        <MetricCard label="Current Streak" value={`${stats?.currentStreak ?? 0} days`} accent="text-orange-500" />
        <MetricCard label="Completion Rate" value={`${stats?.overallProgress ?? 0}%`} accent="text-primary" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Weekly Activity</h3>
          {weeklyData.every(d => d.total === 0) ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">No activity data for the past week.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Goal Type Distribution */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Goal Types</h3>
          {pieData.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">Create goals to see distribution.</p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="capitalize">{entry.name}</span>
                    <span className="text-muted-foreground">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goal Status Breakdown */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Goal Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(statusDistribution).map(([status, count]) => (
            <div key={status} className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent || ''}`}>{value}</p>
    </div>
  )
}
