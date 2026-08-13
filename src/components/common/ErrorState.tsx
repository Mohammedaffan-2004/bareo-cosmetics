import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  action?: React.ReactNode
  className?: string
}

/**
 * Standardized Bareo Error State Component — Clinical, clear, action-oriented.
 */
export function ErrorState({
  title = 'Unable to Load Formulation Data',
  message = 'We encountered an issue connecting to our servers. Please try refreshing or checking your network.',
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-100 bg-gradient-to-b from-red-50/40 via-white to-red-50/10 px-8 py-14 text-center shadow-2xs',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-2xs">
        <AlertCircle className="size-6 text-red-600" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-serif text-xl font-normal text-[#111111] tracking-tight">{title}</h3>
        <p className="text-xs text-[#6B7280] leading-relaxed font-light">{message}</p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl gap-2 text-xs">
            <RefreshCw className="size-3.5" /> Retry Request
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}
