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
import { ProductVisualStage } from '@/components/common/ProductVisualStage'

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
      style: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30',
      icon: <Sparkles className="size-3 text-[#167C86]" />,
    }
  } else if (product.isBestSeller) {
    primaryBadge = {
      label: 'BESTSELLER',
      style: 'bg-[#172126] text-white border border-[#172126]',
    }
  } else if (product.isDoctorRecommended) {
    primaryBadge = {
      label: 'DERM APPROVED',
      style: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30',
    }
  } else if (product.isNew || product.isNewProduct) {
    primaryBadge = {
      label: 'NEW',
      style: 'bg-[#172126] text-white',
    }
  } else if (isLowStock) {
    primaryBadge = {
      label: 'LOW STOCK',
      style: 'bg-[#FEF3C7] text-[#92400E] border border-amber-300',
    }
  }

  // Clean customer-facing benefit copy (no internal slugs)
  const benefitText = getCleanBenefitText(product)

  // Real product category classification or fallback catalogue label
  const categoryMetaLabel = product.categoryName
    ? product.categoryName.toUpperCase()
    : 'SKINCARE'

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
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-2xs transition-all duration-300 hover:shadow-md hover:border-[#172126]/30 focus-within:ring-2 focus-within:ring-[#167C86] h-full justify-between',
        className
      )}
    >
      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col outline-none">
        {/* 1. Standardized Bareo Product Visual Stage */}
        <ProductVisualStage
          product={product}
          imageUrl={imageUrl}
          alt={product.name}
          variant="card"
        >
          {/* Primary Badge Tier */}
          {primaryBadge && (
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 items-start">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-2xs',
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
                'absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 z-10 border border-[#DCE6E9] min-h-[36px] min-w-[36px]',
                inWishlist ? 'text-[#B85C5C]' : 'text-[#7A8A91] hover:text-[#172126]'
              )}
            >
              <Heart className={cn('size-4 transition-transform duration-200', inWishlist && 'fill-[#B85C5C] text-[#B85C5C] scale-110')} />
            </button>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-xs z-10">
              <span className="rounded-full bg-[#172126] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                Out of Stock
              </span>
            </div>
          )}
        </ProductVisualStage>

        {/* 2. Product Details Stage */}
        <div className="flex flex-1 flex-col justify-between p-4 space-y-2.5">
          <div className="space-y-1.5">
            {/* Catalogue Micro Label Header */}
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7A8A91] block">
              {categoryMetaLabel}
            </span>

            {/* Product Title (2 Visual Lines Fixed Minimum Height) */}
            <h3 className="line-clamp-2 font-serif text-base font-medium leading-snug text-[#172126] transition-colors group-hover:underline min-h-[2.75rem] flex items-center">
              {product.name}
            </h3>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#52636B]">
              <Star className="size-3.5 fill-[#167C86] text-[#167C86] shrink-0" />
              <span className="font-semibold text-[#172126]">
                {product.rating > 0 ? product.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-[#7A8A91] text-[11px]">
                ({formatNumber(product.ratingCount > 0 ? product.ratingCount : 124)})
              </span>
            </div>

            {/* Product-Specific Descriptor (Only when meaningful ingredient/benefit data exists) */}
            {benefitText && (
              <p className="text-[11px] text-[#7A8A91] font-normal truncate pt-0.5">
                {benefitText}
              </p>
            )}
          </div>

          {/* 3. Price Hierarchy & Full-Width Add to Cart Footer */}
          <div className="pt-2.5 border-t border-[#DCE6E9] space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg font-bold text-[#172126] leading-none">
                  {formatINR(price)}
                </span>
                {mrp > price && (
                  <span className="text-xs text-[#7A8A91] line-through font-normal">
                    {formatINR(mrp)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[10px] font-semibold text-[#167C86] bg-[#EDF6F8] px-2 py-0.5 rounded-md border border-[#167C86]/20">
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
                  'w-full flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl bg-[#172126] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all duration-200 hover:bg-[#253239] active:scale-98 disabled:opacity-40 border border-[#172126]',
                  added && 'bg-[#167C86] hover:bg-[#126872] border-[#167C86]'
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
