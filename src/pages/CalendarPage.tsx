import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchActivityLogRange, type ActivityLog } from '@/services/dataService'

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    setLoading(true)
    fetchActivityLogRange(
      user.id,
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd')
    )
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, currentMonth])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const today = new Date()

  const getStatusForDay = (dateStr: string) => {
    const dayLogs = logs.filter(l => l.scheduled_date === dateStr)
    if (dayLogs.length === 0) return 'none'
    const completed = dayLogs.filter(l => l.status === 'completed').length
    if (completed === dayLogs.length) return 'complete'
    if (completed > 0) return 'partial'
    return 'missed'
  }

  const selectedDayLogs = selectedDay ? logs.filter(l => l.scheduled_date === selectedDay) : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Calendar</h1>
        <p className="text-muted-foreground">View your activity history at a glance.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const inMonth = isSameMonth(day, currentMonth)
                const isCurrentDay = isSameDay(day, today)
                const isSelected = selectedDay === dateStr
                const status = getStatusForDay(dateStr)

                const statusColors = {
                  complete: 'bg-green-500/20 text-green-700 dark:text-green-400',
                  partial: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
                  missed: 'bg-red-500/10 text-red-600 dark:text-red-400',
                  none: '',
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    className={`
                      relative aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                      ${!inMonth ? 'text-muted-foreground/30' : ''}
                      ${isCurrentDay ? 'ring-2 ring-primary font-bold' : ''}
                      ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                      ${inMonth && status !== 'none' ? statusColors[status] : 'hover:bg-muted'}
                    `}
                  >
                    {format(day, 'd')}
                    {status === 'complete' && inMonth && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-500" />
                    )}
                    {status === 'partial' && inMonth && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            All done
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Partial
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Missed
          </div>
        </div>
      </div>

      {/* Day Detail */}
      {selectedDay && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            {format(new Date(selectedDay + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedDayLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity logged for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedDayLogs.map(log => (
                <div
                  key={log.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    log.status === 'completed' ? 'border-green-500/20 bg-green-500/5' : ''
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${
                    log.status === 'completed' ? 'bg-green-500' :
                    log.status === 'partial' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {(log.goal as any)?.title || 'Unknown Goal'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{log.status.replace('_', ' ')}</p>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
