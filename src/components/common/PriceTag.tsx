import { formatINR } from '@/utils'
import { cn } from '@/utils'

interface PriceTagProps {
  offerPrice: number
  mrp?: number
  discount?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceTag({ offerPrice, mrp, discount, size = 'md', className }: PriceTagProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }
  const strikeSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-foreground', sizes[size])}>{formatINR(offerPrice)}</span>
      {mrp && mrp > offerPrice && (
        <>
          <span className={cn('text-muted-foreground line-through', strikeSizes[size])}>{formatINR(mrp)}</span>
          {discount ? (
            <span className={cn('font-semibold text-success', size === 'lg' ? 'text-sm' : 'text-xs')}>{discount}% OFF</span>
          ) : null}
        </>
      )}
    </span>
  )
}
