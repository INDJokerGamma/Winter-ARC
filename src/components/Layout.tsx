import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Target, CalendarDays, BarChart2, Award, Settings, CheckSquare } from "lucide-react"
import { useAuth } from "./AuthProvider"

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'My Goals', path: '/goals', icon: Target },
  { name: 'Daily Tracker', path: '/tracker', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Settings', path: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const { signOut, user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            ❄️ WINTER ARC
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
           <div className="mb-4 flex items-center gap-3 px-3">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {user?.email?.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="truncate text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
               <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
             </div>
           </div>
           <button 
             onClick={signOut}
             className="w-full rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
           >
             Sign Out
           </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden sticky top-0 z-50">
        <Link to="/" className="font-bold tracking-tight text-lg">
          ❄️ WINTER ARC
        </Link>
        <button onClick={signOut} className="text-sm font-medium text-muted-foreground">
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 flex w-full border-t bg-card pb-safe md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
