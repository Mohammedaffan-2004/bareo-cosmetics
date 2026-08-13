import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/utils'

interface DashboardCardProps {
  title: string
  value: string
  icon: React.ReactNode
  delta?: number
  deltaLabel?: string
  sublabel?: string
  className?: string
  accent?: boolean
}

export function DashboardCard({ title, value, icon, delta, deltaLabel = 'vs last month', sublabel, className, accent }: DashboardCardProps) {
  const positive = (delta ?? 0) >= 0
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-card',
        accent && 'bg-gradient-to-br from-primary to-teal-600 text-primary-foreground',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex size-11 items-center justify-center rounded-xl', accent ? 'bg-white/15 text-white' : 'bg-primary-soft text-primary')}>
          {icon}
        </span>
        {typeof delta === 'number' && (
          <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', accent ? 'bg-white/15 text-white' : positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
            {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className={cn('mt-4 text-sm font-medium', accent ? 'text-white/80' : 'text-muted-foreground')}>{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      <p className={cn('mt-0.5 text-xs', accent ? 'text-white/70' : 'text-muted-foreground')}>{deltaLabel}{sublabel ? ` · ${sublabel}` : ''}</p>
    </motion.div>
  )
}
