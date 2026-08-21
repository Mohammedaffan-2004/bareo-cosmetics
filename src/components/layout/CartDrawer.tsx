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
            <header className="flex items-center justify-between border-b border-[#DCE6E9] px-5 py-4 bg-white shrink-0">
              <h2 className="flex items-center gap-2 font-serif text-base font-medium text-[#172126]">
                <ShoppingBag className="size-4.5 text-[#172126]" />
                <span>Your Cart ({totals.itemCount})</span>
              </h2>
              <button
                type="button"
                onClick={() => dispatch(setDrawerOpen(false))}
                className="flex size-10 items-center justify-center rounded-xl text-[#7A8A91] hover:bg-[#FAF7F2] hover:text-[#172126] transition-colors"
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
                    <Button onClick={() => go('/shop')} className="rounded-xl bg-[#172126] text-white min-h-[44px] hover:bg-[#253239]">
                      Start Shopping <ArrowRight className="size-4 ml-1" />
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* 2. SCROLLABLE CONTENT BODY */}
                <div className="flex-1 overflow-y-auto">
                  {/* Free Shipping Progress Bar */}
                  <div className="border-b border-[#DCE6E9] bg-[#FAF7F2] px-5 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-[#172126]">
                        <Gift className="size-3.5 text-[#167C86]" />
                        {totals.freeGiftEligible ? (
                          <span className="font-semibold text-[#167C86]">✓ Free Shipping Unlocked!</span>
                        ) : (
                          <span>Add <strong className="font-bold text-[#172126]">{formatINR(totals.freeGiftRemaining)}</strong> more for free shipping!</span>
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-[#7A8A91]">{totals.giftProgressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE6E9]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totals.giftProgressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-[#167C86] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <ul className="divide-y divide-[#DCE6E9] px-5 py-2">
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
                              className="size-16 rounded-xl object-contain bg-[#FAF7F2] border border-[#DCE6E9] p-1 transition-transform group-hover:scale-102"
                            />
                          </button>
                          <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => go(`/product/${item.product.slug}`)}
                                  className="line-clamp-1 text-left font-serif text-xs font-medium text-[#172126] hover:underline"
                                >
                                  {item.product.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dispatch(removeItem(item.product.id))}
                                  className="p-1 text-[#7A8A91] hover:text-rose-600 transition-colors"
                                  aria-label={`Remove ${item.product.name} from cart`}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                              <p className="text-[11px] text-[#52636B] mt-0.5 font-normal">
                                {formatINR(itemPrice)} {item.product.volume ? `· ${item.product.volume}` : ''}
                              </p>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between">
                              <QuantitySelector
                                size="sm"
                                value={item.quantity}
                                onChange={(q) => dispatch(updateQuantity({ productId: item.product.id, quantity: q }))}
                              />
                              <span className="font-bold text-xs text-[#172126]">
                                {formatINR(itemPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  {/* SUBTLE PROMO ACCESS ROW */}
                  <div className="border-t border-b border-[#DCE6E9] bg-[#FAF7F2] px-5 py-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#52636B]">
                      <Tag className="size-3.5 text-[#7A8A91]" />
                      <span>Have a promo code?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => go('/checkout')}
                      className="font-medium text-[#172126] hover:text-[#167C86] flex items-center gap-1 min-h-[32px] transition-colors"
                    >
                      Apply at checkout <ArrowRight className="size-3 text-[#172126]" />
                    </button>
                  </div>
                </div>

                {/* 3. STICKY SUMMARY FOOTER */}
                <footer className="shrink-0 space-y-3 border-t border-[#DCE6E9] p-5 bg-white shadow-lg">
                  {/* You Saved Green Highlight Pill */}
                  {totals.savings > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-[#EDF6F8] border border-[#167C86]/20 px-3 py-2 text-xs font-semibold text-[#167C86]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-[#167C86]" />
                        <span>You saved {formatINR(totals.savings)} on this order</span>
                      </span>
                      <Check className="size-3.5 text-[#167C86]" />
                    </div>
                  )}

                  {/* Summary Cost Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#52636B]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#172126]">{formatINR(totals.subtotal)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[#167C86] font-medium">
                        <span>Discount</span>
                        <span className="font-semibold">− {formatINR(totals.discount)}</span>
                      </div>
                    )}
                    {totals.couponDiscount > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[#167C86] font-medium">
                        <span>Coupon Savings ({coupon?.code})</span>
                        <span className="font-bold">− {formatINR(totals.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span>Shipping</span>
                      <span className="font-semibold text-[#167C86]">
                        {totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>GST</span>
                      <span className="font-medium text-[#167C86]">Included</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-[#DCE6E9] pt-2 font-serif text-base font-bold text-[#172126]">
                      <span className="font-serif">Total</span>
                      <span className="font-serif font-bold text-[#172126]">{formatINR(totals.total)}</span>
                    </div>
                  </div>

                  {/* Primary & Secondary Checkout CTAs */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => go('/checkout')}
                      className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#172126] px-4 py-3 text-xs font-semibold text-white shadow-2xs hover:bg-[#253239] transition-colors border border-[#172126]"
                    >
                      Proceed to Checkout · {formatINR(totals.total)} <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go('/cart')}
                      className="w-full flex items-center justify-center min-h-[40px] rounded-xl border border-[#DCE6E9] bg-white px-4 py-2.5 text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] transition-colors shadow-2xs"
                    >
                      View Full Cart
                    </button>
                  </div>

                  {/* Security Line */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A8A91] font-light pt-1">
                    <ShieldCheck className="size-3.5 text-[#167C86]" />
                    <span>256-bit SSL Encrypted & Dermatologist Approved</span>
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
