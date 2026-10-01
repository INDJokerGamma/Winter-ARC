export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'winter-arc-theme'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (
    theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  root.classList.toggle('dark', isDark)
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}
