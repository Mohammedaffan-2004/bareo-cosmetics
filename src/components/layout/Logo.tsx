import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export function Logo({
  className,
  markOnly,
  subtitle,
}: {
  className?: string
  markOnly?: boolean
  subtitle?: string
}) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group outline-none', className)} aria-label="Bareo home">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-xl bg-[#111111] text-white font-serif text-base font-bold transition-transform duration-200 group-hover:scale-104 shadow-2xs border border-[#111111]">
        B
      </span>
      {!markOnly && (
        <div className="flex flex-col justify-center">
          <span className="font-serif text-xl font-bold tracking-[0.12em] text-[#111111] leading-none uppercase">
            BAREO
          </span>
          <span className="text-[9px] font-medium tracking-[0.08em] text-[#6B7280] uppercase mt-0.5 leading-none">
            {subtitle || 'Science for Everyday Skin.'}
          </span>
        </div>
      )}
    </Link>
  )
}


