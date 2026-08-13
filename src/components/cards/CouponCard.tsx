import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Coupon } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn, formatDate, formatINR } from '@/utils'

interface CouponCardProps {
  coupon: Coupon
  onApply?: (coupon: Coupon) => void
  applied?: boolean
  className?: string
}

export function CouponCard({ coupon, onApply, applied, className }: CouponCardProps) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(coupon.code)
    setCopied(true)
    toast.success('Coupon copied', coupon.code)
    setTimeout(() => setCopied(false), 1500)
  }

  const discountLabel =
    coupon.discountType === 'percent' ? `${coupon.value}% OFF` : coupon.value > 0 ? `₹${coupon.value} OFF` : 'FREE SHIPPING'

  return (
    <button
      type="button"
      onClick={() => onApply?.(coupon)}
      disabled={!onApply}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl border border-dashed p-4 text-left transition-all',
        applied ? 'border-success bg-success/10' : 'border-border bg-card hover:border-primary hover:shadow-soft',
        !onApply && 'cursor-default',
        className
      )}
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-primary">
        {coupon.discountType === 'percent' ? `${coupon.value}%` : discountLabel === 'FREE SHIPPING' ? 'FREE' : `₹${coupon.value}`}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold tracking-wide">{coupon.code}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{coupon.description}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Min. order {formatINR(coupon.minOrder ?? 0)} {coupon.validTill ? `· Valid till ${formatDate(coupon.validTill)}` : ''}
        </p>
      </div>
      {applied ? (
        <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
          <Check className="size-3.5" /> Applied
        </span>
      ) : onApply ? (
        <span className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          Apply
        </span>
      ) : null}
      <button type="button" onClick={copy} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary" aria-label="Copy code">
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
    </button>
  )
}
