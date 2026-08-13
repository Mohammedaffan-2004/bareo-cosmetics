import { Check, X } from 'lucide-react'
import { formatDate, formatTime, cn } from '@/utils'

export interface TimelineItem {
  status: string
  label: string
  at: string
  note?: string
}

interface TimelineProps {
  items: TimelineItem[]
  currentStatus?: string
  cancelled?: boolean
  className?: string
}

/** Executive quiet-luxury vertical order timeline. */
export function Timeline({ items = [], currentStatus, cancelled, className }: TimelineProps) {
  const currentIndex = currentStatus ? items.findIndex((i) => i.status === currentStatus) : items.length - 1
  const doneThrough = cancelled ? -1 : currentIndex === -1 ? items.length - 1 : currentIndex

  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((item, i) => {
        const done = i <= doneThrough
        const isCurrent = i === doneThrough && !cancelled
        const isLast = i === items.length - 1

        return (
          <li key={`${item.status}-${i}`} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 rounded-full transition-colors',
                  i < doneThrough ? 'bg-[#111111]' : 'bg-[#E5E7EB]'
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-200',
                cancelled
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : isCurrent
                  ? 'border-[#111111] bg-[#111111] text-white ring-4 ring-[#FAF7F2] shadow-2xs font-bold'
                  : done
                  ? 'border-[#111111] bg-[#111111] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#9CA3AF]'
              )}
            >
              {cancelled ? (
                <X className="size-3.5 stroke-[2.5]" />
              ) : done || isCurrent ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : (
                <span className="size-1.5 rounded-full bg-[#D1D5DB]" />
              )}
            </span>
            <div className="pt-0.5 min-w-0 flex-1">
              <p
                className={cn(
                  'text-xs leading-tight',
                  isCurrent
                    ? 'font-bold text-[#111111]'
                    : done
                    ? 'font-semibold text-[#111111]'
                    : 'font-medium text-[#9CA3AF]'
                )}
              >
                {cancelled && i === 0 ? 'Order Cancelled' : item.label}
              </p>
              <p className="mt-1 text-[11px] text-[#6B7280] font-light">
                {formatDate(item.at)} · {formatTime(item.at)}
              </p>
              {item.note && (
                <p className="mt-1 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 text-[11px] text-[#374151]">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
