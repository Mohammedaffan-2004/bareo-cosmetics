import { SearchX } from 'lucide-react'
import { cn } from '@/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

/**
 * Modernized Empty State Component — Apple / Notion inspired glass card aesthetic.
 */
export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#F1F3F5] bg-gradient-to-b from-[#FAFAFA]/80 via-white to-[#FAFAFA]/30 px-8 py-16 text-center shadow-2xs', className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] text-[#111111] shadow-2xs">
        {icon ?? <SearchX className="size-6 text-[#111111]" />}
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-serif text-xl font-normal text-[#111111] tracking-tight">{title}</h3>
        {description && <p className="text-xs text-[#6B7280] leading-relaxed font-light">{description}</p>}
      </div>
      {action && <div className="pt-3">{action}</div>}
    </div>
  )
}
