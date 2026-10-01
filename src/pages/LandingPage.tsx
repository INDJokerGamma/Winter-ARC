import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarDays, CheckCheck, Sparkles, Target, Trophy } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useAuth } from '@/components/AuthProvider'

const featureCards = [
  {
    icon: Target,
    title: 'Focused Goals',
    description: 'Turn big ambitions into consistent actions with structured weekly objectives.',
  },
  {
    icon: CheckCheck,
    title: 'Daily Momentum',
    description: 'Track wins, habits, and reflections without losing your rhythm.',
  },
  {
    icon: BarChart3,
    title: 'Progress Insights',
    description: 'See the trends behind your effort and build sustainable momentum.',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,#f8f9ff_0%,#eef2ff_100%)] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 text-slate-900" />
          <span className="text-lg font-black tracking-tight">WINTER ARC</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#features" className="transition hover:text-slate-950">Features</a>
          <a href="#why-it-works" className="transition hover:text-slate-950">Why it works</a>
          <a href="#results" className="transition hover:text-slate-950">Results</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.02]"
          >
            Start your arc
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10">
        <section className="grid items-center gap-12 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Build discipline. Keep momentum.
            </div>

            <h1 className="max-w-xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Turn your goals into a year-long transformation.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Winter Arc helps you define your next challenge, track your habits, and stay consistent with a system built for progress that lasts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Begin your challenge
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-600" />
                Habit streaks
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-600" />
                Daily tracking
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Real progress
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-12 top-12 h-44 w-44 rounded-full bg-violet-400/30 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-52 w-52 rounded-full bg-cyan-400/30 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-inner">
                <div className="flex items-center justify-between pb-5">
                  <div className="flex items-center gap-3">
                    <BrandLogo className="h-11 w-11 text-violet-400" />
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Season challenge</div>
                      <div className="mt-1 text-xl font-bold">Winter Arc</div>
                    </div>
                  </div>
                  <div className="rounded-full border border-violet-500/60 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-200">
                    84% complete
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Current streak</span>
                      <span className="font-semibold text-violet-300">18 days</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Goals</div>
                      <div className="mt-3 text-3xl font-black text-white">12</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Wins</div>
                      <div className="mt-3 text-3xl font-black text-cyan-300">34</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Today</span>
                      <span className="font-semibold text-emerald-300">On track</span>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-slate-200">
                      <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Workout completed</li>
                      <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-400" />Water intake goal hit</li>
                      <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />Reading session logged</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">Built for consistency</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Everything your season needs</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="why-it-works" className="py-16">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/10 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">Why it works</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Your challenge, designed to keep you moving.</h2>
              </div>

              <div className="space-y-5 text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="font-semibold text-white">Clear goals</div>
                  <p className="mt-2 text-sm leading-6">Set the exact standards for your challenge and keep your focus sharp.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="font-semibold text-white">Daily accountability</div>
                  <p className="mt-2 text-sm leading-6">Check in every day and turn good intentions into repeatable habits.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="font-semibold text-white">Visible progress</div>
                  <p className="mt-2 text-sm leading-6">See your momentum build in real time so you stay motivated through the grind.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="results" className="py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Results</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Consistency compounds.</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                <div className="text-4xl font-black text-violet-600">2x</div>
                <p className="mt-2 text-sm text-slate-600">More likely to complete goals with visible tracking</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                <div className="text-4xl font-black text-cyan-600">90%</div>
                <p className="mt-2 text-sm text-slate-600">Of users report better adherence with daily check-ins</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                <div className="text-4xl font-black text-slate-900">12+</div>
                <p className="mt-2 text-sm text-slate-600">Habit categories to align with your season goals</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
