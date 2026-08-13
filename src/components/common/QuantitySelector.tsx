import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function QuantitySelector({ value, onChange, min = 1, max = 10, size = 'md', className }: QuantitySelectorProps) {
  const btn = size === 'sm' ? 'size-7' : 'size-9'
  const text = size === 'sm' ? 'w-8 text-sm' : 'w-10 text-base'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-border bg-card',
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn('flex items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40', btn)}
      >
        <Minus className="size-4" />
      </button>
      <span className={cn('text-center font-semibold tabular-nums', text)}>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn('flex items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40', btn)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
