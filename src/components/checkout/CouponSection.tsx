import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { applyCoupon } from '@/store/slices/cartSlice'
import { selectCartTotals } from '@/store/selectors/cartSelectors'
import { adminService } from '@/services/adminService'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { formatINR, cn } from '@/utils'
import type { Coupon } from '@/types'

/**
 * Compact Coupon Section for Checkout — Collapsed by default.
 * Provides a clean single-row trigger "Have a promo code? +" that expands for code entry.
 */
export function CouponSection() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const items = useAppSelector((s) => s.cart.items)
  const appliedCoupon = useAppSelector((s) => s.cart.coupon)
  const totals = selectCartTotals(items, appliedCoupon)
  const subtotal = totals.subtotal

  const [inputCode, setInputCode] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [showOffers, setShowOffers] = useState(false)

  // Fetch live coupons from backend
  const { data: coupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService().getCoupons(),
  })

  // Filter active coupons
  const activeCoupons = (coupons || []).filter((c) => {
    if (c.active === false) return false
    if (c.validTill && new Date(c.validTill) <= new Date()) return false
    return true
  })

  const handleApplyCoupon = (couponToApply: Coupon) => {
    if (subtotal < (couponToApply.minOrder || 0)) {
      const diff = (couponToApply.minOrder || 0) - subtotal
      toast.error('Order threshold not met', `Add ${formatINR(diff)} more to your cart to use ${couponToApply.code}.`)
      return
    }

    let discountVal = 0
    if (couponToApply.discountType === 'percent') {
      discountVal = (subtotal * couponToApply.value) / 100
      if (couponToApply.maxDiscount && couponToApply.maxDiscount > 0) {
        discountVal = Math.min(discountVal, couponToApply.maxDiscount)
      }
    } else {
      discountVal = couponToApply.value
    }
    discountVal = Math.min(Math.round(discountVal), subtotal)

    dispatch(
      applyCoupon({
        code: couponToApply.code.toUpperCase(),
        discountType: couponToApply.discountType,
        value: couponToApply.value,
        maxDiscount: couponToApply.maxDiscount,
        discount: discountVal,
      })
    )

    toast.success(
      '✓ Coupon Applied!',
      `You save ${formatINR(discountVal)} on this order with ${couponToApply.code}.`
    )
    setInputCode('')
    setExpanded(false)
    setShowOffers(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return

    const normalized = inputCode.trim().toUpperCase()
    const found = activeCoupons.find((c) => c.code.toUpperCase() === normalized)

    if (found) {
      handleApplyCoupon(found)
    } else {
      toast.error('Invalid Coupon Code', `'${normalized}' is invalid or expired. Try GLOW20 or WELCOME10.`)
    }
  }

  const handleRemoveCoupon = () => {
    dispatch(applyCoupon(null))
    toast.info('Coupon removed', 'Cart total updated.')
  }

  // 1. APPLIED COUPON COMPACT STATE
  if (appliedCoupon) {
    return (
      <div className="rounded-2xl border border-[#059669]/30 bg-[#ECFDF5] p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="size-4 text-[#059669] shrink-0" />
            <span className="font-mono font-bold text-[#047857] truncate">{appliedCoupon.code}</span>
            <span className="text-[10px] font-semibold text-[#047857] bg-white px-2 py-0.5 rounded-md border border-[#059669]/20 shrink-0">
              ✓ Applied
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs font-medium text-[#EF4444] hover:underline flex items-center gap-1 shrink-0 ml-2 min-h-[32px]"
          >
            <X className="size-3.5" /> Remove
          </button>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-[#047857] pt-1 border-t border-[#059669]/20">
          <span>You saved with {appliedCoupon.code}</span>
          <span className="font-bold">− {formatINR(totals.couponDiscount)}</span>
        </div>
      </div>
    )
  }

  // 2. UNAPPLIED COLLAPSED / EXPANDABLE STATE
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3 shadow-2xs">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center justify-between w-full text-xs font-medium text-[#111111] hover:text-[#000000] min-h-[32px]"
        >
          <span className="flex items-center gap-2">
            <Tag className="size-4 text-[#111111]" />
            <span>Have a promo code?</span>
          </span>
          <span className="font-semibold text-sm text-[#6B7280]">+</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#111111] border-b border-[#E5E7EB] pb-2">
            <span>Promo Code</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[#6B7280] hover:text-[#111111]"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 h-10 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3.5 text-xs text-[#111111] placeholder-[#9CA3AF] font-mono uppercase focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="h-10 rounded-xl bg-[#111111] text-white text-xs font-semibold px-4 hover:bg-black disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] transition-colors shrink-0"
            >
              Apply
            </button>
          </form>

          {activeCoupons.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowOffers((s) => !s)}
                className="flex items-center justify-between w-full text-xs font-medium text-[#6B7280] hover:text-[#111111] pt-1 min-h-[32px]"
              >
                <span>View available offers ({activeCoupons.length})</span>
                {showOffers ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {showOffers && (
                <div className="mt-3 space-y-2 border-t border-[#E5E7EB] pt-3 max-h-56 overflow-y-auto">
                  {activeCoupons.map((c) => {
                    const isEligible = subtotal >= (c.minOrder || 0)
                    const needed = (c.minOrder || 0) - subtotal
                    const discountText =
                      c.discountType === 'percent'
                        ? `${c.value}% OFF`
                        : `₹${c.value} FLAT OFF`

                    return (
                      <div
                        key={c.id}
                        className={cn(
                          'flex items-center justify-between rounded-xl border p-3 text-xs transition-colors',
                          isEligible
                            ? 'border-[#E5E7EB] bg-white hover:border-[#111111]'
                            : 'border-[#E5E7EB] bg-[#FAFAFA] opacity-75'
                        )}
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#111111] bg-[#FAF7F2] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                              {c.code}
                            </span>
                            <span className="font-semibold text-[#047857]">{discountText}</span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] truncate">{c.description}</p>
                          {!isEligible && (
                            <p className="text-[10px] text-amber-700 font-medium">
                              Add {formatINR(needed)} more to qualify
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={!isEligible}
                          onClick={() => handleApplyCoupon(c)}
                          className={cn(
                            'h-8 rounded-lg text-xs font-semibold px-3 shrink-0',
                            isEligible
                              ? 'bg-[#111111] text-white hover:bg-black'
                              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                          )}
                        >
                          Apply
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


