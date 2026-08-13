import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ArrowRight, ShieldCheck, Tag, Sparkles, Gift, Check, Plus, Package } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeItem, updateQuantity, clearCart, applyCoupon, addItem } from '@/store/slices/cartSlice'
import { selectCartTotals } from '@/store/selectors/cartSelectors'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { EmptyState } from '@/components/common/EmptyState'
import { AppInput } from '@/components/common/AppInput'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/utils'
import { PRODUCTS } from '@/mocks/productCatalog'
import { getProductImage } from '@/utils/productImages'
import { useToast } from '@/hooks/useToast'
import { SmartImage } from '@/components/common/SmartImage'
import { motion } from 'framer-motion'

/**
 * Redesigned Full Shopping Cart Page — Rewarding, trustworthy, and clean.
 * Features:
 * - Zero GST in order summary
 * - Green savings pill ("You saved ₹140 today")
 * - Free Shipping & Free Gift Progress Bar
 * - Frequently Bought Together / Bundle recommendations with 1-click add
 * - Security & Trust badges
 */
export function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { items, coupon } = useAppSelector((s) => s.cart)
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const totals = selectCartTotals(items, coupon)

  // Frequently Bought Together Add-ons (e.g. Cleanser, Lip Balm, Sunscreen)
  const bundleAddons = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.product.id))
    return PRODUCTS.filter((p) => !cartProductIds.has(p.id)).slice(0, 3)
  }, [items])

  const handleCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setTimeout(() => {
      setCouponLoading(false)
      if (couponInput.trim().toUpperCase() === 'WELCOME10') {
        const discount = Math.round(totals.subtotal * 0.1)
        dispatch(applyCoupon({ code: 'WELCOME10', discountType: 'percent', value: 10, discount }))
        toast.success('Coupon applied', `WELCOME10 saved you ${formatINR(discount)}`)
        setCouponInput('')
      } else {
        toast.error('Invalid coupon code', 'Use promo code WELCOME10 for 10% OFF')
      }
    }, 500)
  }

  const handleAddAddon = (product: typeof PRODUCTS[0]) => {
    dispatch(addItem({ product, quantity: 1 }))
    toast.success('Bundle item added', product.name)
  }

  return (
    <div className="container-page py-10 space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="font-serif text-3xl font-normal text-[#111111] tracking-tight">Shopping Bag</h1>
        <p className="text-xs text-[#6B7280] font-light mt-1">{totals.itemCount} active formulations in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="Your cart is empty"
            description="Discover dermatologist-formulated skincare tailored for everyday skin."
            action={
              <Button variant="primary" onClick={() => navigate('/shop')} className="rounded-xl bg-[#111111] text-white">
                Continue Shopping <ArrowRight className="size-4 ml-1" />
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Items & Bundles Column */}
          <div className="space-y-6">
            {/* Free Gift & Free Shipping Progress Bar Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-[#111111]">
                  <Gift className="size-4 text-amber-500" />
                  {totals.freeGiftEligible ? (
                    <span className="font-semibold text-emerald-600">✓ Free Dermatological Travel Kit Unlocked!</span>
                  ) : (
                    <span>Add <strong className="font-bold text-[#111111]">{formatINR(totals.freeGiftRemaining)}</strong> more for a free gift!</span>
                  )}
                </span>
                <span className="text-xs text-[#6B7280] font-semibold">{totals.giftProgressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAFAFA] border border-[#E5E7EB]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totals.giftProgressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-[#111111] rounded-full"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-4">
              {items.map((item) => {
                const imgUrl = getProductImage(item.product)
                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                    <Link to={`/product/${item.product.slug}`} className="shrink-0">
                      <SmartImage src={imgUrl} alt={item.product.name} className="size-20 rounded-xl object-contain bg-[#FAFAFA] border border-[#E5E7EB] p-1.5 sm:size-24" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/product/${item.product.slug}`} className="line-clamp-1 font-serif text-sm font-semibold text-[#111111] hover:underline">
                            {item.product.name}
                          </Link>
                          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mt-0.5">{item.product.brand || 'Bareo'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(removeItem(item.product.id))
                            toast.info('Removed from cart', item.product.name)
                          }}
                          className="text-[#9CA3AF] hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(q) => dispatch(updateQuantity({ productId: item.product.id, quantity: q }))}
                          size="sm"
                        />
                        <div className="text-right">
                          {(() => {
                            const unitPrice = item.product?.offerPrice ?? item.product?.price ?? 0
                            const mrp = item.product?.mrp ?? unitPrice
                            return (
                              <>
                                <span className="font-serif text-base font-bold text-[#111111]">
                                  {formatINR(unitPrice * item.quantity)}
                                </span>
                                {mrp > unitPrice && (
                                  <span className="block text-[10px] text-[#9CA3AF] line-through">
                                    {formatINR(mrp * item.quantity)}
                                  </span>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
                <Button variant="ghost" size="sm" className="text-xs text-rose-600 hover:bg-rose-50" onClick={() => dispatch(clearCart())}>
                  Clear entire cart
                </Button>
                <Link to="/shop" className="text-xs font-medium text-[#111111] hover:underline">
                  + Add More Formulations
                </Link>
              </div>
            </div>

            {/* Frequently Bought Together / Bundle Add-Ons */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-[#111111]" />
                <h3 className="font-serif text-base font-normal text-[#111111]">Frequently Bought Together</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {bundleAddons.map((addon) => {
                  const imgUrl = getProductImage(addon)
                  return (
                    <div key={addon.id} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]/50 p-3 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <img src={imgUrl} alt={addon.name} className="h-16 w-full object-contain mx-auto" />
                        <p className="line-clamp-1 font-serif text-xs font-semibold text-[#111111]">{addon.name}</p>
                        <p className="text-[11px] font-bold text-[#111111]">{formatINR(addon.offerPrice)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 rounded-lg text-[11px] font-medium border-[#E5E7EB] bg-white text-[#111111] hover:bg-[#111111] hover:text-white transition-all"
                        onClick={() => handleAddAddon(addon)}
                      >
                        <Plus className="size-3 mr-1" /> Add to Cart
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary Sidebar Column */}
          <div className="space-y-6">
            {/* Rewarding Order Summary Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-5">
              <h2 className="font-serif text-xl font-normal text-[#111111] tracking-tight">Order Summary</h2>

              {/* Green Savings Highlight Badge */}
              {totals.savings > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs font-semibold text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-emerald-600" />
                    <span>You saved {formatINR(totals.savings)} today</span>
                  </span>
                  <Check className="size-4" />
                </div>
              )}

              {/* Clean Summary Rows */}
              <div className="space-y-3 text-xs text-[#6B7280]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-normal text-[#6B7280]">Subtotal</span>
                  <span className="shrink-0 text-right font-semibold text-[#111111] whitespace-nowrap">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex items-center justify-between gap-3 text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span className="shrink-0 text-right font-semibold whitespace-nowrap">− {formatINR(totals.discount)}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex items-center justify-between gap-3 text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="truncate flex items-center gap-1">
                      <Tag className="size-3 shrink-0" /> Coupon ({coupon.code})
                    </span>
                    <div className="shrink-0 text-right flex items-center gap-1.5 whitespace-nowrap">
                      <span>− {formatINR(totals.couponDiscount)}</span>
                      <button type="button" onClick={() => dispatch(applyCoupon(null))} className="text-rose-600 hover:underline text-[10px] font-normal">
                        (Remove)
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span>Shipping</span>
                  <span className="shrink-0 text-right font-semibold text-emerald-700 whitespace-nowrap">{totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>GST {totals.isGstIncluded ? '' : `(${totals.gstPercent}%)`}</span>
                  <span className="shrink-0 text-right font-medium text-emerald-700 whitespace-nowrap">
                    {totals.isGstIncluded || totals.gst === 0 ? 'Included' : formatINR(totals.gst)}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="border-t border-[#E5E7EB] pt-4 flex items-center justify-between gap-4 font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                <span className="shrink-0 font-serif">Total Amount</span>
                <span className="shrink-0 text-right font-serif font-bold whitespace-nowrap text-[#111111]">{formatINR(totals.total)}</span>
              </div>

              <Button size="lg" variant="primary" className="w-full h-11 rounded-xl bg-[#111111] text-white text-xs font-medium shadow-2xs hover:bg-black" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>

            {/* Coupons & Offers Section */}
            <CouponSection />

            {/* Security & Trust Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 text-xs text-[#6B7280] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#111111]">
                <ShieldCheck className="size-4 text-emerald-600" /> Safe &amp; Encrypted Checkout
              </div>
              <p className="text-[11px] font-light leading-relaxed">
                All transactions are protected with 256-bit encryption. Guaranteed dispatch within 24 hours across India.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
