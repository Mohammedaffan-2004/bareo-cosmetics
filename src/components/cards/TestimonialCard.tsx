import { CheckCircle, Star } from 'lucide-react'
import type { Testimonial } from '@/types'
import { cn } from '@/utils'

interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div className={cn('relative flex h-full flex-col justify-between rounded-2xl border border-[#DCE6E9] bg-white p-5 sm:p-6 shadow-2xs', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#167C86]">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-[#167C86]" />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#167C86] bg-[#EDF6F8] border border-[#167C86]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <CheckCircle className="size-3" /> Verified Buyer
          </span>
        </div>

        <blockquote className="text-xs sm:text-sm leading-relaxed text-[#172126] font-normal">
          "{testimonial.quote}"
        </blockquote>
      </div>

      <div className="mt-6 pt-4 border-t border-[#DCE6E9] flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#172126]">{testimonial.name}</p>
          <p className="text-[11px] text-[#52636B]">{testimonial.skinType} Skin &nbsp;•&nbsp; {testimonial.result}</p>
        </div>
      </div>
    </div>
  )
}
