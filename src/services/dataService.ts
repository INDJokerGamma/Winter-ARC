import { supabase } from '@/lib/supabase'

// ── Goal Service ──

export interface Goal {
  id: string
  user_id: string
  challenge_id: string | null
  category_id: string | null
  title: string
  description: string | null
  goal_type: 'measurable' | 'habit' | 'task' | 'milestone' | 'time'
  unit: string | null
  target_value: number | null
  initial_value: number
  priority: 'Low' | 'Medium' | 'High'
  start_date: string
  due_date: string
  recurrence_config: any | null
  status: 'not_started' | 'active' | 'paused' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  archived_at: string | null
  // joined
  category?: Category | null
}

export interface GoalCreateInput {
  title: string
  description?: string
  goal_type: Goal['goal_type']
  unit?: string
  target_value?: number
  initial_value?: number
  priority?: Goal['priority']
  start_date: string
  due_date: string
  recurrence_config?: any
  category_id?: string
  challenge_id?: string
}

export async function fetchGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Goal[]
}

export async function createGoal(userId: string, input: GoalCreateInput) {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...input, user_id: userId, status: 'active' } as any)
    .select()
    .single()
  if (error) throw error
  return data as Goal
}

export async function updateGoal(goalId: string, updates: Partial<GoalCreateInput> & { status?: Goal['status'] }) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates as any)
    .eq('id', goalId)
    .select()
    .single()
  if (error) throw error
  return data as Goal
}

export async function deleteGoal(goalId: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
  if (error) throw error
}

// ── Activity Log Service ──

export interface ActivityLog {
  id: string
  user_id: string
  goal_id: string
  scheduled_date: string
  quantity: number | null
  duration_minutes: number | null
  status: 'completed' | 'partial' | 'not_completed' | 'skipped'
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  goal?: Goal | null
}

export interface ActivityLogInput {
  goal_id: string
  scheduled_date: string
  quantity?: number
  duration_minutes?: number
  status: ActivityLog['status']
  notes?: string
}

export interface DailyReflection {
  id: string
  user_id: string
  reflection_date: string
  productivity: number
  energy: number
  notes: string
  created_at: string
  updated_at: string
}

export interface DailyReflectionInput {
  reflection_date: string
  productivity: number
  energy: number
  notes: string
}

export async function fetchDailyReflection(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('reflection_date', date)
    .maybeSingle()
  if (error) throw error
  return data as DailyReflection | null
}

export async function upsertDailyReflection(userId: string, input: DailyReflectionInput) {
  const { data, error } = await supabase
    .from('daily_reflections')
    .upsert({ ...input, user_id: userId, updated_at: new Date().toISOString() }, {
      onConflict: 'user_id,reflection_date',
    })
    .select()
    .single()
  if (error) throw error
  return data as DailyReflection
}

export async function fetchActivityLogs(userId: string, date: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, goal:goals(*)')
    .eq('user_id', userId)
    .eq('scheduled_date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []) as ActivityLog[]
}

export async function fetchActivityLogRange(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, goal:goals(title)')
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
  if (error) throw error
  return (data || []) as ActivityLog[]
}

export async function upsertActivityLog(userId: string, input: ActivityLogInput) {
  // Check if log exists for this goal + date
  const { data: existing } = await supabase
    .from('activity_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('goal_id', input.goal_id)
    .eq('scheduled_date', input.scheduled_date)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('activity_logs')
      .update({ ...input, updated_at: new Date().toISOString() } as any)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as ActivityLog
  } else {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({ ...input, user_id: userId } as any)
      .select()
      .single()
    if (error) throw error
    return data as ActivityLog
  }
}

// ── Challenge Service ──

export interface Challenge {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
}

export async function fetchActiveChallenge(userId: string) {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Challenge | null
}

// ── Category Service ──

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  is_default: boolean
}

export async function fetchCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []) as Category[]
}

// ── Dashboard Stats ──

export interface DashboardStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  currentStreak: number
  longestStreak: number
  todayCompletedCount: number
  todayTotalCount: number
  overallProgress: number
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  // Fetch goals
  const { data: goals } = await supabase
    .from('goals')
    .select('id, status')
    .eq('user_id', userId)

  const allGoals = goals || []
  const totalGoals = allGoals.length
  const activeGoals = allGoals.filter(g => g.status === 'active').length
  const completedGoals = allGoals.filter(g => g.status === 'completed').length

  // Today's logs
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('activity_logs')
    .select('id, status')
    .eq('user_id', userId)
    .eq('scheduled_date', today)

  const todayAll = todayLogs || []
  const todayCompletedCount = todayAll.filter(l => l.status === 'completed').length
  const todayTotalCount = todayAll.length

  // Streak calculation — count consecutive days with at least one completed log going backwards from today
  let currentStreak = 0
  const checkDate = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const { data: dayLogs } = await supabase
      .from('activity_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('scheduled_date', dateStr)
      .eq('status', 'completed')
      .limit(1)

    if (dayLogs && dayLogs.length > 0) {
      currentStreak++
    } else {
      // If today has no logs yet, don't break — check yesterday
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      }
      break
    }
    checkDate.setDate(checkDate.getDate() - 1)
  }

  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    currentStreak,
    longestStreak: currentStreak, // Simplified — same as current for now
    todayCompletedCount,
    todayTotalCount,
    overallProgress,
  }
}
