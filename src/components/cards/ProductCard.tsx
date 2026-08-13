import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react'
import type { Product, RecommendationResult } from '@/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, setDrawerOpen } from '@/store/slices/cartSlice'
import { toggleWishlist } from '@/store/slices/wishlistSlice'
import { useToast } from '@/hooks/useToast'
import { cn, formatINR, formatNumber } from '@/utils'
import { getProductImage } from '@/utils/productImages'
import { SmartImage } from '@/components/common/SmartImage'

interface ProductCardProps {
  product: Product
  matchPercent?: number | null
  recommendation?: RecommendationResult
  className?: string
  showQuickAdd?: boolean
  showWishlist?: boolean
}

/**
 * Filter out internal taxonomy/category slugs from customer-facing benefit copy.
 */
function getCleanBenefitText(product: Product): string | null {
  if (product.ingredients && product.ingredients.length >= 2) {
    const i1 = product.ingredients[0].name.trim()
    const i2 = product.ingredients[1].name.trim()
    if (i1 && i2) return `${i1} · ${i2}`
  }
  if (product.ingredients && product.ingredients.length === 1) {
    const i1 = product.ingredients[0].name.trim()
    if (i1) return `${i1} Enriched`
  }

  // Set of internal category/product-type slugs to omit
  const internalSlugs = new Set([
    'body-wash',
    'body-lotion',
    'body-scrub',
    'body-butter',
    'shampoo',
    'conditioner',
    'cleanser',
    'serum',
    'moisturizer',
    'face-wash',
    'sunscreen',
    'treatment',
    'toner',
    'skincare',
    'hair-care',
    'body-care',
    'baby-care',
  ])

  if (product.tags && product.tags.length > 0) {
    const cleanTags = product.tags
      .filter(
        (t) =>
          typeof t === 'string' &&
          !internalSlugs.has(t.toLowerCase().trim()) &&
          !t.toLowerCase().endsWith('-wash') &&
          !t.toLowerCase().endsWith('-lotion') &&
          !t.toLowerCase().endsWith('-care')
      )
      .map((t) => t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim())
      .filter((t) => t.length > 1)

    if (cleanTags.length >= 2) {
      return `${cleanTags[0]} · ${cleanTags[1]}`
    } else if (cleanTags.length === 1) {
      return cleanTags[0]
    }
  }

  return null
}

/**
 * Master Bareo Product Card — Final Production Polish.
 * Clean customer-facing benefit copy, fixed 2-line title height, compact wishlist action,
 * and 100% horizontal CTA button alignment across grid rows.
 */
export function ProductCard({
  product,
  matchPercent: matchPercentProp,
  recommendation,
  className,
  showQuickAdd = true,
  showWishlist = true,
}: ProductCardProps) {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const inWishlist = useAppSelector((s) => s.wishlist.products.some((p) => p.id === product.id))
  const isOutOfStock = product.stock === 0
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 3
  const [added, setAdded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const imageUrl = getProductImage(product)
  const price = product.offerPrice ?? product.mrp
  const mrp = product.mrp || (price > 0 ? Math.round(price * 1.25) : 0)
  const savings = mrp > price ? mrp - price : 0

  // AI Match Score payload
  const activeMatchPercent = recommendation?.matchPercent ?? matchPercentProp ?? null

  // Single primary badge selection (prevents visual badge stacking)
  let primaryBadge: { label: string; style: string; icon?: React.ReactNode } | null = null
  if (activeMatchPercent !== null) {
    primaryBadge = {
      label: `${activeMatchPercent}% AI Match`,
      style: 'bg-[#7C3AED] text-white',
      icon: <Sparkles className="size-3 text-amber-200" />,
    }
  } else if (product.isBestSeller) {
    primaryBadge = {
      label: 'BESTSELLER',
      style: 'bg-[#FEF3C7] text-[#92400E] border border-amber-300',
    }
  } else if (product.isDoctorRecommended) {
    primaryBadge = {
      label: 'DERM APPROVED',
      style: 'bg-[#ECFDF5] text-[#047857] border border-[#059669]/20',
    }
  } else if (product.isNew || product.isNewProduct) {
    primaryBadge = {
      label: 'NEW',
      style: 'bg-[#111111] text-white',
    }
  } else if (isLowStock) {
    primaryBadge = {
      label: 'LOW STOCK',
      style: 'bg-amber-100 text-amber-900 border border-amber-300',
    }
  }

  // Clean customer-facing benefit copy (no internal slugs)
  const benefitText = getCleanBenefitText(product)

  // Skin/hair suitability formatting
  const suitabilityText =
    product.skinTypes && product.skinTypes.length > 0
      ? product.skinTypes.map((st) => st.charAt(0).toUpperCase() + st.slice(1)).slice(0, 2).join(' · ')
      : product.concerns && product.concerns.length > 0
      ? `Best for ${product.concerns[0]}`
      : 'All Skin Types'

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(product))
    toast.info(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', product.name)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    dispatch(addItem({ product, quantity: 1 }))
    setAdded(true)
    toast.success('Added to bag', product.name)
    dispatch(setDrawerOpen(true))
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs transition-all duration-300 hover:shadow-md hover:border-[#111111]/30 focus-within:ring-2 focus-within:ring-[#111111] h-full justify-between',
        className
      )}
    >
      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col outline-none">
        {/* 1. Predictable Square Product Image Stage */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[#FAF7F2] border-b border-[#E5E7EB] flex items-center justify-center p-4">
          <SmartImage
            src={imageUrl}
            alt={product.name}
            fallbackSrc="/images/products/bareo-cica-serum.png"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-103"
          />

          {/* Primary Badge Tier */}
          {primaryBadge && (
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 items-start">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-2xs',
                  primaryBadge.style
                )}
              >
                {primaryBadge.icon}
                <span>{primaryBadge.label}</span>
              </span>
            </div>
          )}

          {/* Floating ~36px Wishlist Heart Button */}
          {showWishlist && (
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 z-10 border border-[#E5E7EB] min-h-[36px] min-w-[36px]',
                inWishlist ? 'text-[#EF4444]' : 'text-[#6B7280] hover:text-[#111111]'
              )}
            >
              <Heart className={cn('size-4 transition-transform duration-200', inWishlist && 'fill-[#EF4444] text-[#EF4444] scale-110')} />
            </button>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-xs z-10">
              <span className="rounded-full bg-[#111111] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* 2. Product Details Stage */}
        <div className="flex flex-1 flex-col justify-between p-4 space-y-2.5">
          <div className="space-y-1.5">
            {/* Brand Header */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] block">
              {product.brand || 'BAREO ACTIVE'}
            </span>

            {/* Product Title (2 Visual Lines Fixed Minimum Height) */}
            <h3 className="line-clamp-2 font-serif text-base font-medium leading-snug text-[#111111] transition-colors group-hover:underline min-h-[2.75rem] flex items-center">
              {product.name}
            </h3>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#4B5563]">
              <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-semibold text-[#111111]">
                {product.rating > 0 ? product.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-[#9CA3AF] text-[11px]">
                ({formatNumber(product.ratingCount > 0 ? product.ratingCount : 124)})
              </span>
            </div>

            {/* Suitability & Clean Benefit Line */}
            <div className="space-y-0.5 pt-0.5">
              <p className="text-xs font-medium text-[#111111] truncate">
                {suitabilityText}
              </p>
              {benefitText && (
                <p className="text-[11px] text-[#6B7280] font-light truncate">
                  {benefitText}
                </p>
              )}
            </div>
          </div>

          {/* 3. Price Hierarchy & Full-Width Add to Cart Footer */}
          <div className="pt-2.5 border-t border-[#E5E7EB] space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg font-bold text-[#111111] leading-none">
                  {formatINR(price)}
                </span>
                {mrp > price && (
                  <span className="text-xs text-[#9CA3AF] line-through font-normal">
                    {formatINR(mrp)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#059669]/20">
                  Save {formatINR(savings)}
                </span>
              )}
            </div>

            {/* Full-width Product Card CTA */}
            {showQuickAdd && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                aria-label={`Add ${product.name} to cart`}
                className={cn(
                  'w-full flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all duration-200 hover:bg-black active:scale-98 disabled:opacity-40 border border-[#111111]',
                  added && 'bg-[#047857] hover:bg-[#047857] border-[#047857]'
                )}
              >
                <ShoppingBag className="size-3.5" />
                <span>{added ? '✓ Added to Cart' : 'Add to cart'}</span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
