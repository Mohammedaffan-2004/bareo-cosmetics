import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/utils'

interface RatingStarsProps {
  rating: number
  size?: number
  className?: string
  showValue?: boolean
}

/** Render a 5-star rating with half-star support. */
export function RatingStars({ rating, size = 16, className, showValue }: RatingStarsProps) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.4

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />
        if (i === full && hasHalf) return <StarHalf key={i} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />
        return <Star key={i} style={{ width: size, height: size }} className="text-muted-foreground/30" />
      })}
      {showValue && <span className="ml-1 text-sm font-semibold">{rating.toFixed(1)}</span>}
    </span>
  )
}
