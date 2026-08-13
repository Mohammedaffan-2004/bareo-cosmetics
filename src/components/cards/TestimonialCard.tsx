import { CheckCircle, Star } from 'lucide-react'
import type { Testimonial } from '@/types'
import { cn } from '@/utils'

interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div className={cn('relative flex h-full flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-amber-400" />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
            <CheckCircle className="size-3" /> Verified Buyer
          </span>
        </div>

        <blockquote className="text-sm leading-relaxed text-[#111111] font-normal">
          "{testimonial.quote}"
        </blockquote>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#111111]">{testimonial.name}</p>
          <p className="text-[11px] text-[#6B7280]">{testimonial.skinType} Skin &nbsp;•&nbsp; {testimonial.result}</p>
        </div>
      </div>
    </div>
  )
}
