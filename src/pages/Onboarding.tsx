import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

const DURATIONS = [
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days (Default)', value: 90 },
  { label: '120 Days', value: 120 },
]

const CATEGORIES = [
  'Fitness', 'Academics', 'Career', 'Coding & DSA',
  'Reading', 'Mental Discipline', 'Sleep', 'Nutrition',
  'Finance', 'Personal Development'
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [step, setStep] = useState(1)
  const [challengeName, setChallengeName] = useState('My 90-Day Transformation')
  const [duration, setDuration] = useState(90)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    
    // Calculate end date
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + duration)

    try {
      // 1. Create Challenge
      const { error: challengeError } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          name: challengeName,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
          status: 'active'
        } as any)

      if (challengeError) throw challengeError

      // 2. Create Categories
      if (selectedCategories.length > 0) {
        const categoriesToInsert = selectedCategories.map(name => ({
          user_id: user.id,
          name,
          is_default: false
        }))
        
        const { error: catError } = await supabase
          .from('categories')
          .insert(categoriesToInsert as any)
          
        if (catError) throw catError
      }

      navigate('/')
    } catch (error) {
      console.error('Error during onboarding:', error)
      alert('Failed to save your configuration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Winter Arc</h1>
        <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
      </div>

      <div className="rounded-xl border bg-card p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Name your challenge</h2>
              <p className="text-sm text-muted-foreground mb-4">Give your upcoming journey a meaningful name.</p>
              <input
                type="text"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                className="w-full rounded-md border bg-background px-4 py-2"
                placeholder="Winter Arc 2026"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!challengeName.trim()}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Choose duration & start date</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      duration === d.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{d.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border bg-background px-4 py-2"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-md border px-4 py-2 hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Areas of Improvement</h2>
              <p className="text-sm text-muted-foreground mb-4">Select the categories you want to focus on.</p>
              
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-4 py-1 text-sm transition-colors ${
                      selectedCategories.includes(cat) 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="w-full rounded-md border px-4 py-2 hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                {loading ? 'Saving...' : 'Start My Journey'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
