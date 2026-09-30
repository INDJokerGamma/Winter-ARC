import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { fetchDashboardStats, fetchGoals, type DashboardStats, type Goal } from '@/services/dataService'
import { Award, Flame, Target, Star, Zap, Crown, Trophy, Heart } from 'lucide-react'

interface Achievement {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  unlocked: boolean
  progress?: number
  target?: number
}

export default function Achievements() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchDashboardStats(user.id),
      fetchGoals(user.id),
    ])
      .then(([s, g]) => { setStats(s); setGoals(g) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const streak = stats?.currentStreak ?? 0

  const achievements: Achievement[] = [
    {
      id: 'first-goal',
      icon: <Target className="h-6 w-6" />,
      title: 'First Step',
      description: 'Create your first goal',
      unlocked: goals.length > 0,
      progress: Math.min(goals.length, 1),
      target: 1,
    },
    {
      id: 'five-goals',
      icon: <Star className="h-6 w-6" />,
      title: 'Goal Setter',
      description: 'Create 5 goals',
      unlocked: goals.length >= 5,
      progress: Math.min(goals.length, 5),
      target: 5,
    },
    {
      id: 'first-complete',
      icon: <Award className="h-6 w-6" />,
      title: 'Achiever',
      description: 'Complete your first goal',
      unlocked: completedGoals >= 1,
      progress: Math.min(completedGoals, 1),
      target: 1,
    },
    {
      id: 'five-complete',
      icon: <Trophy className="h-6 w-6" />,
      title: 'On Fire',
      description: 'Complete 5 goals',
      unlocked: completedGoals >= 5,
      progress: Math.min(completedGoals, 5),
      target: 5,
    },
    {
      id: 'streak-3',
      icon: <Flame className="h-6 w-6" />,
      title: 'Three-Peat',
      description: 'Maintain a 3-day streak',
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      target: 3,
    },
    {
      id: 'streak-7',
      icon: <Zap className="h-6 w-6" />,
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      id: 'streak-30',
      icon: <Crown className="h-6 w-6" />,
      title: 'Unstoppable',
      description: 'Maintain a 30-day streak',
      unlocked: streak >= 30,
      progress: Math.min(streak, 30),
      target: 30,
    },
    {
      id: 'streak-90',
      icon: <Heart className="h-6 w-6" />,
      title: 'Winter Arc Legend',
      description: 'Complete the full 90-day challenge',
      unlocked: streak >= 90,
      progress: Math.min(streak, 90),
      target: 90,
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Achievements</h1>
        <p className="text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Achievement Progress</span>
          <span className="text-sm font-bold text-primary">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`rounded-xl border p-5 transition-all ${
              a.unlocked
                ? 'bg-gradient-to-br from-amber-500/5 to-amber-600/10 border-amber-500/30 shadow-sm'
                : 'bg-card opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                a.unlocked
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {a.icon}
              </div>
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </div>
            {a.target != null && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{a.progress}/{a.target}</span>
                  {a.unlocked && <span className="text-amber-600 font-medium">✓ Unlocked</span>}
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      a.unlocked ? 'bg-amber-500' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${((a.progress || 0) / a.target) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
