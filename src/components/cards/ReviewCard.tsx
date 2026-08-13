import { Check, ShieldCheck, ThumbsUp } from 'lucide-react'
import type { Review } from '@/types'
import { RatingStars } from '@/components/common/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, cn } from '@/utils'

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const initials = review.userName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  return (
    <div className={cn('rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-[#111111] text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold text-[#111111]">{review.userName}</p>
            <p className="text-[10px] text-[#6B7280]">{formatDate(review.date)}</p>
          </div>
        </div>
        {review.verified && (
          <Badge variant="success" className="gap-1 text-[10px]">
            <ShieldCheck className="size-3" /> Verified Buyer
          </Badge>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <RatingStars rating={review.rating} size={14} />
        {review.title && <h4 className="font-serif text-sm font-semibold text-[#111111]">{review.title}</h4>}
        <p className="text-xs text-[#6B7280] leading-relaxed font-normal">{review.comment}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
        <ThumbsUp className="size-3 text-[#111111]" />
        <span>{review.helpful} people found this helpful</span>
        <button type="button" className="ml-auto flex items-center gap-1 rounded-md bg-[#FAFAFA] border border-[#E5E7EB] px-2 py-0.5 text-[10px] font-medium text-[#111111] hover:bg-[#111111] hover:text-white transition-colors">
          <Check className="size-3" /> Helpful
        </button>
      </div>
    </div>
  )
}
