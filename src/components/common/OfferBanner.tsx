import { BadgePercent } from 'lucide-react'
import { cn } from '@/utils'

interface OfferBannerProps {
  title: string
  subtitle: string
  badge: string
  discountLabel: string
  gradient: string
  ctaLabel?: string
  onClick?: () => void
  className?: string
}

export function OfferBanner({ title, subtitle, badge, discountLabel, gradient, ctaLabel, onClick, className }: OfferBannerProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-soft', gradient, className)}>
      <span className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
        {badge}
      </span>
      <div className="absolute -right-4 -top-6 flex size-32 items-center justify-center rounded-full bg-white/10">
        <span className="rotate-12 text-2xl font-extrabold drop-shadow">{discountLabel}</span>
      </div>
      <BadgePercent className="mb-3 size-8 text-white/80" />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 max-w-[75%] text-sm text-white/85">{subtitle}</p>
      {ctaLabel && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow transition-transform hover:scale-105"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
