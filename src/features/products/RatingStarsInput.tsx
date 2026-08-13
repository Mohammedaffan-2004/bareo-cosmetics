import { Star } from 'lucide-react'
import { cn } from '@/utils'

interface RatingStarsInputProps {
  value: number
  onChange: (value: number) => void
}

/** Interactive star picker for review forms. */
export function RatingStarsInput({ value, onChange }: RatingStarsInputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn('size-7 transition-colors', star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
          />
        </button>
      ))}
    </div>
  )
}
