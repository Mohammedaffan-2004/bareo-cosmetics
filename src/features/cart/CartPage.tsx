import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ArrowRight, ShieldCheck, Tag, Sparkles, Gift, Check, Plus, Package } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeItem, updateQuantity, clearCart, applyCoupon, addItem } from '@/store/slices/cartSlice'
import { selectCartTotals } from '@/store/selectors/cartSelectors'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { EmptyState } from '@/components/common/EmptyState'
import { CouponSection } from '@/components/checkout/CouponSection'
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

  const totals = selectCartTotals(items, coupon)

  // Frequently Bought Together Add-ons (e.g. Cleanser, Lip Balm, Sunscreen)
  const bundleAddons = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.product.id))
    return PRODUCTS.filter((p) => !cartProductIds.has(p.id)).slice(0, 3)
  }, [items])

  const handleAddAddon = (product: typeof PRODUCTS[0]) => {
    dispatch(addItem({ product, quantity: 1 }))
    toast.success('Bundle item added', product.name)
  }

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      {/* Header Title */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
          YOUR CART
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight mt-0.5">Shopping Bag</h1>
        <p className="text-xs text-[#7A8A91] font-medium mt-1">{totals.itemCount} active formulations in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="Your cart is empty"
            description="Discover dermatologist-formulated skincare tailored for everyday skin."
            action={
              <Button variant="primary" onClick={() => navigate('/shop')} className="rounded-xl bg-[#172126] text-white hover:bg-[#253239] min-h-[44px]">
                Continue Shopping <ArrowRight className="size-4 ml-1" />
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Items & Bundles Column */}
          <div className="space-y-6">
            {/* Free Shipping Progress Bar Card */}
            <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-[#172126]">
                  <Gift className="size-4 text-[#167C86]" />
                  {totals.freeGiftEligible ? (
                    <span className="font-semibold text-[#167C86]">✓ Free Shipping Unlocked!</span>
                  ) : (
                    <span>Add <strong className="font-bold text-[#172126]">{formatINR(totals.freeGiftRemaining)}</strong> more for free shipping!</span>
                  )}
                </span>
                <span className="text-xs text-[#7A8A91] font-semibold">{totals.giftProgressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white border border-[#DCE6E9]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totals.giftProgressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-[#167C86] rounded-full"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-[#DCE6E9] rounded-2xl border border-[#DCE6E9] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              {items.map((item) => {
                const imgUrl = getProductImage(item.product)
                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                    <Link to={`/product/${item.product.slug}`} className="shrink-0">
                      <SmartImage src={imgUrl} alt={item.product.name} className="size-20 rounded-xl object-contain bg-[#FAF7F2] border border-[#DCE6E9] p-1.5 sm:size-24" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/product/${item.product.slug}`} className="line-clamp-1 font-serif text-sm sm:text-base font-medium text-[#172126] hover:underline">
                            {item.product.name}
                          </Link>
                          <p className="text-[10px] text-[#7A8A91] uppercase font-bold tracking-wider mt-0.5">{item.product.categoryName || 'Skincare'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(removeItem(item.product.id))
                            toast.info('Removed from cart', item.product.name)
                          }}
                          className="text-[#7A8A91] hover:text-rose-600 transition-colors p-1"
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
                                <span className="font-serif text-base font-bold text-[#172126]">
                                  {formatINR(unitPrice * item.quantity)}
                                </span>
                                {mrp > unitPrice && (
                                  <span className="block text-[10px] text-[#7A8A91] line-through">
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

              <div className="pt-4 flex items-center justify-between border-t border-[#DCE6E9]">
                <button type="button" className="text-xs font-normal text-[#7A8A91] hover:text-rose-600 transition-colors" onClick={() => dispatch(clearCart())}>
                  Clear entire cart
                </button>
                <Link to="/shop" className="text-xs font-semibold text-[#172126] hover:text-[#167C86] transition-colors">
                  + Add More Formulations
                </Link>
              </div>
            </div>

            {/* Frequently Bought Together / Bundle Add-Ons */}
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-[#167C86]" />
                <h3 className="font-serif text-base font-normal text-[#172126]">Frequently Bought Together</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {bundleAddons.map((addon) => {
                  const imgUrl = getProductImage(addon)
                  return (
                    <div key={addon.id} className="rounded-xl border border-[#DCE6E9] bg-[#FAF7F2]/60 p-3 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <SmartImage src={imgUrl} alt={addon.name} className="h-20 w-full object-contain rounded-lg bg-white border border-[#DCE6E9] p-1" />
                        <p className="line-clamp-1 font-serif text-xs font-medium text-[#172126]">{addon.name}</p>
                        <p className="text-[11px] font-bold text-[#172126]">{formatINR(addon.offerPrice)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 rounded-lg text-[11px] font-semibold border-[#DCE6E9] bg-white text-[#172126] hover:bg-[#172126] hover:text-white transition-all shadow-2xs"
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
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-2xs space-y-5">
              <h2 className="font-serif text-xl font-normal text-[#172126] tracking-tight">Order Summary</h2>

              {/* Green Savings Highlight Badge */}
              {totals.savings > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-[#EDF6F8] border border-[#167C86]/20 p-3 text-xs font-semibold text-[#167C86]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-[#167C86]" />
                    <span>You saved {formatINR(totals.savings)} today</span>
                  </span>
                  <Check className="size-4 text-[#167C86]" />
                </div>
              )}

              {/* Clean Summary Rows */}
              <div className="space-y-3 text-xs text-[#52636B]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-normal text-[#52636B]">Subtotal</span>
                  <span className="shrink-0 text-right font-semibold text-[#172126] whitespace-nowrap">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[#167C86] font-medium">
                    <span>Discount</span>
                    <span className="shrink-0 text-right font-semibold whitespace-nowrap">− {formatINR(totals.discount)}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex items-center justify-between gap-3 text-[#167C86] font-bold bg-[#EDF6F8]/70 p-2.5 rounded-xl border border-[#167C86]/20">
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
                  <span className="shrink-0 text-right font-semibold text-[#167C86] whitespace-nowrap">{totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>GST {totals.isGstIncluded ? '' : `(${totals.gstPercent}%)`}</span>
                  <span className="shrink-0 text-right font-medium text-[#167C86] whitespace-nowrap">
                    {totals.isGstIncluded || totals.gst === 0 ? 'Included' : formatINR(totals.gst)}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="border-t border-[#DCE6E9] pt-4 flex items-center justify-between gap-4 font-serif text-xl sm:text-2xl font-bold text-[#172126]">
                <span className="shrink-0 font-serif">Total Amount</span>
                <span className="shrink-0 text-right font-serif font-bold whitespace-nowrap text-[#172126]">{formatINR(totals.total)}</span>
              </div>

              <Button size="lg" variant="primary" className="w-full min-h-[48px] rounded-xl bg-[#172126] text-white text-xs font-semibold shadow-2xs hover:bg-[#253239] transition-colors border border-[#172126]" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>

            {/* Coupons & Offers Section */}
            <CouponSection />

            {/* Security & Trust Card */}
            <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 sm:p-5 text-xs text-[#52636B] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#172126]">
                <ShieldCheck className="size-4 text-[#167C86]" /> Safe &amp; Encrypted Checkout
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
