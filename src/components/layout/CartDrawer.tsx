import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Trash2, ArrowRight, Gift, Check, Sparkles, ShieldCheck, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeItem, setDrawerOpen, updateQuantity } from '@/store/slices/cartSlice'
import { selectCartTotals } from '@/store/selectors/cartSelectors'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { formatINR } from '@/utils'
import { getProductImage } from '@/utils/productImages'
import { SmartImage } from '../common/SmartImage'

/**
 * Premium Cart Drawer — Clean commerce panel with sticky checkout summary.
 * Removes heavy coupon browsing from drawer while preserving coupon logic at checkout/cart.
 */
export function CartDrawer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const open = useAppSelector((s) => s.cart.isDrawerOpen)
  const items = useAppSelector((s) => s.cart.items)
  const coupon = useAppSelector((s) => s.cart.coupon)
  const totals = selectCartTotals(items, coupon)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        dispatch(setDrawerOpen(false))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, dispatch])

  const go = (path: string) => {
    dispatch(setDrawerOpen(false))
    navigate(path)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setDrawerOpen(false))}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Slide-over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart Drawer"
          >
            {/* 1. COMPACT HEADER */}
            <header className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 bg-white shrink-0">
              <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-[#111111]">
                <ShoppingBag className="size-4.5 text-[#111111]" />
                <span>Your Cart ({totals.itemCount})</span>
              </h2>
              <button
                type="button"
                onClick={() => dispatch(setDrawerOpen(false))}
                className="flex size-11 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  title="Your cart is empty"
                  description="Discover dermatologist-formulated skincare tailored for everyday skin."
                  action={
                    <Button onClick={() => go('/shop')} className="rounded-xl bg-[#111111] text-white min-h-[44px]">
                      Start Shopping <ArrowRight className="size-4 ml-1" />
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* 2. SCROLLABLE CONTENT BODY */}
                <div className="flex-1 overflow-y-auto">
                  {/* Shipping & Gift Progress Bar */}
                  <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-[#111111]">
                        <Gift className="size-3.5 text-[#059669]" />
                        {totals.freeGiftEligible ? (
                          <span className="font-semibold text-[#059669]">✓ Free Shipping & Bonus Kit Unlocked!</span>
                        ) : (
                          <span>Add <strong className="font-bold text-[#111111]">{formatINR(totals.freeGiftRemaining)}</strong> more for free shipping!</span>
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-[#6B7280]">{totals.giftProgressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totals.giftProgressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-[#111111] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <ul className="divide-y divide-[#E5E7EB] px-5 py-2">
                    {items.map((item) => {
                      const imgUrl = getProductImage(item.product)
                      const itemPrice = item.product?.offerPrice ?? item.product?.price ?? 0
                      return (
                        <li key={item.product.id} className="py-4 flex gap-3.5 items-start">
                          <button
                            type="button"
                            onClick={() => go(`/product/${item.product.slug}`)}
                            className="shrink-0 group"
                          >
                            <SmartImage
                              src={imgUrl}
                              alt={item.product.name}
                              className="size-16 rounded-xl object-contain bg-[#FAFAFA] border border-[#E5E7EB] p-1 transition-transform group-hover:scale-102"
                            />
                          </button>
                          <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => go(`/product/${item.product.slug}`)}
                                  className="line-clamp-1 text-left font-serif text-xs font-semibold text-[#111111] hover:underline"
                                >
                                  {item.product.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dispatch(removeItem(item.product.id))}
                                  className="p-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                                  aria-label={`Remove ${item.product.name} from cart`}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                              <p className="text-[11px] text-[#6B7280] mt-0.5 font-normal">
                                {formatINR(itemPrice)} {item.product.volume ? `· ${item.product.volume}` : ''}
                              </p>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between">
                              <QuantitySelector
                                size="sm"
                                value={item.quantity}
                                onChange={(q) => dispatch(updateQuantity({ productId: item.product.id, quantity: q }))}
                              />
                              <span className="font-semibold text-xs text-[#111111]">
                                {formatINR(itemPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  {/* SUBTLE PROMO ACCESS ROW */}
                  <div className="border-t border-b border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#6B7280]">
                      <Tag className="size-3.5 text-[#6B7280]" />
                      <span>Have a promo code?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => go('/checkout')}
                      className="font-medium text-[#111111] hover:underline flex items-center gap-1 min-h-[32px]"
                    >
                      Apply at checkout <ArrowRight className="size-3 text-[#111111]" />
                    </button>
                  </div>
                </div>

                {/* 3. STICKY SUMMARY FOOTER */}
                <footer className="shrink-0 space-y-3 border-t border-[#E5E7EB] p-5 bg-white shadow-lg">
                  {/* You Saved Green Highlight Pill */}
                  {totals.savings > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-[#ECFDF5] border border-[#059669]/20 px-3 py-2 text-xs font-semibold text-[#047857]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-[#059669]" />
                        <span>You saved {formatINR(totals.savings)} on this order</span>
                      </span>
                      <Check className="size-3.5 text-[#059669]" />
                    </div>
                  )}

                  {/* Summary Cost Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#6B7280]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#111111]">{formatINR(totals.subtotal)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[#047857] font-medium">
                        <span>Discount</span>
                        <span className="font-semibold">− {formatINR(totals.discount)}</span>
                      </div>
                    )}
                    {totals.couponDiscount > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[#047857] font-medium">
                        <span>Coupon Savings ({coupon?.code})</span>
                        <span className="font-bold">− {formatINR(totals.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span>Shipping</span>
                      <span className="font-semibold text-[#047857]">
                        {totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>GST</span>
                      <span className="font-medium text-[#047857]">Included</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-2 font-serif text-base font-bold text-[#111111]">
                      <span className="font-serif">Total</span>
                      <span className="font-serif font-bold text-[#111111]">{formatINR(totals.total)}</span>
                    </div>
                  </div>

                  {/* Primary & Secondary Checkout CTAs */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => go('/checkout')}
                      className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#111111] px-4 py-3 text-xs font-semibold text-white shadow-2xs hover:bg-black transition-colors"
                    >
                      Proceed to Checkout · {formatINR(totals.total)} <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go('/cart')}
                      className="w-full flex items-center justify-center min-h-[40px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                    >
                      View Full Cart
                    </button>
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-[#6B7280] font-normal">
                    <ShieldCheck className="size-3 text-[#059669]" /> 256-bit SSL Encrypted • Guaranteed Dispatch
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
