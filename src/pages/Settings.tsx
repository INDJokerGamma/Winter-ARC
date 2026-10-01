import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { applyTheme, isTheme, type Theme, THEME_STORAGE_KEY } from '@/lib/theme'
import { REMINDER_TIME_KEY, REMINDERS_ENABLED_KEY } from '@/lib/reminders'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [theme, setTheme] = useState<Theme>('system')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('18:00')

  useEffect(() => {
    if (!user) return
    setFullName(user.user_metadata?.full_name || '')
    setRemindersEnabled(window.localStorage.getItem(REMINDERS_ENABLED_KEY) === 'true')
    setReminderTime(window.localStorage.getItem(REMINDER_TIME_KEY) || '18:00')
    // Load profile preferences
    supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (isTheme(data?.theme)) setTheme(data.theme)
      })
  }, [user])

  const updateReminders = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }
    setRemindersEnabled(enabled)
    window.localStorage.setItem(REMINDERS_ENABLED_KEY, String(enabled))
  }

  const updateReminderTime = (time: string) => {
    setReminderTime(time)
    window.localStorage.setItem(REMINDER_TIME_KEY, time)
  }

  // Apply theme
  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName, theme } as any, { onConflict: 'id' })

      if (profileError) throw profileError

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
      applyTheme(theme)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action is irreversible and will delete all your data.')) {
      return
    }
    try {
      await signOut()
    } catch (err) {
      console.error('Failed to delete account:', err)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-lg">Profile</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>

      {/* Reminders */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <div>
          <h2 className="font-semibold text-lg">Daily reminders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get a browser notification when unfinished goals remain and Winter Arc is open.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="daily-reminders" className="text-sm font-medium">Enable reminders</label>
          <button
            id="daily-reminders"
            type="button"
            role="switch"
            aria-checked={remindersEnabled}
            onClick={() => updateReminders(!remindersEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${remindersEnabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${remindersEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div>
          <label htmlFor="reminder-time" className="block text-sm font-medium mb-1.5">Reminder time</label>
          <input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={event => updateReminderTime(event.target.value)}
            disabled={!remindersEnabled}
            className="rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-lg">Appearance</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-md border py-2.5 text-sm font-medium capitalize transition-colors ${
                  theme === t ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {t === 'light' && '☀️ '}
                {t === 'dark' && '🌙 '}
                {t === 'system' && '💻 '}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors self-start"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
      </button>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <h2 className="font-semibold text-lg text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. All data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={signOut}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
