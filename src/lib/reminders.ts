export const REMINDERS_ENABLED_KEY = 'winter-arc-reminders-enabled'
export const REMINDER_TIME_KEY = 'winter-arc-reminder-time'
export const REMINDER_LAST_SENT_KEY = 'winter-arc-reminder-last-sent'

export function maybeSendDailyReminder(remainingGoalCount: number) {
  if (remainingGoalCount === 0 || window.localStorage.getItem(REMINDERS_ENABLED_KEY) !== 'true') return
  if (!window.isSecureContext || !('Notification' in window) || Notification.permission !== 'granted') return

  const reminderTime = window.localStorage.getItem(REMINDER_TIME_KEY) || '18:00'
  const [hours, minutes] = reminderTime.split(':').map(Number)
  const now = new Date()
  const reminderDate = new Date(now)
  reminderDate.setHours(hours, minutes, 0, 0)
  const today = now.toISOString().split('T')[0]

  if (now < reminderDate || window.localStorage.getItem(REMINDER_LAST_SENT_KEY) === today) return

  try {
    new Notification('Winter Arc reminder', {
      body: `${remainingGoalCount} goal${remainingGoalCount === 1 ? '' : 's'} still need attention today.`,
    })
    window.localStorage.setItem(REMINDER_LAST_SENT_KEY, today)
  } catch (error) {
    console.warn('Browser notifications are unavailable on this device:', error)
  }
}
