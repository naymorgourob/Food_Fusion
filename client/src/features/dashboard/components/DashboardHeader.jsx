import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Calendar, Sparkles, Activity } from 'lucide-react'

export function DashboardHeader({
  user,
  isLoading,
  onRefresh,
  lastUpdated,
}) {
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const name = user?.fullName || 'Administrator'

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-rule/60 pb-6">
      {/* Title & Context */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-body sm:text-3xl">
            {greeting}, <span className="text-brand-600 dark:text-brand-400">{name}</span>
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Service Active
          </span>
        </div>
        <p className="text-xs sm:text-sm text-body-muted max-w-2xl">
          Executive operational pulse for FoodFusion. Monitor dining floor activity, kitchen queue, revenue growth, and table reservations.
        </p>
      </div>

      {/* Date & Refresh */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-rule bg-card px-3.5 py-2 text-xs font-medium text-body-muted shadow-xs">
          <Calendar className="h-3.5 w-3.5 text-body-faint" />
          <span>{formattedDate}</span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title={lastUpdated ? `Last updated at ${lastUpdated}` : 'Refresh dashboard data'}
          className="inline-flex items-center gap-2 rounded-xl border border-rule bg-card px-3.5 py-2 text-xs font-semibold text-body hover:bg-canvas-2 hover:border-brand-300 transition-all shadow-xs active:scale-[0.98] disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-body-muted ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>
    </div>
  )
}

