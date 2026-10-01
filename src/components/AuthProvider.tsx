import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { applyTheme, isTheme, THEME_STORAGE_KEY } from '@/lib/theme'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(storedTheme)) applyTheme(storedTheme)
  }, [])

  const loadUserTheme = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Failed to load theme preference:', error)
      return
    }

    if (isTheme(data?.theme)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, data.theme)
      applyTheme(data.theme)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) void loadUserTheme(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) void loadUserTheme(session.user.id)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
