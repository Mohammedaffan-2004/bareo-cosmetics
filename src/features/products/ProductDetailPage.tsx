import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag,
  Zap,
  Heart,
  Sparkles,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Star,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, setDrawerOpen } from '@/store/slices/cartSlice'
import { toggleWishlist } from '@/store/slices/wishlistSlice'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useProductCompatibility } from '@/hooks/useRecommendations'
import { useToast } from '@/hooks/useToast'
import { getProductImage } from '@/utils/productImages'
import { ProductVisualStage } from '@/components/common/ProductVisualStage'
import { RatingStars } from '@/components/common/RatingStars'
import { PriceTag } from '@/components/common/PriceTag'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { ProductCard } from '@/components/cards/ProductCard'
import { ReviewCard } from '@/components/cards/ReviewCard'
import { PageTransition } from '@/components/common/PageTransition'
import { AppModal } from '@/components/common/AppModal'
import { AppTextarea } from '@/components/common/AppTextarea'
import { RatingStarsInput } from './RatingStarsInput'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatINR, formatNumber } from '@/utils'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { ids, add } = useRecentlyViewed()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const imageBoxRef = useRef<HTMLDivElement>(null)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService().getProductBySlug(slug!),
    enabled: !!slug,
  })

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} — Bareo Cosmetics`
    } else {
      document.title = 'Bareo Cosmetics — Science for Everyday Skin'
    }
    if (product?.images && product.images.length > 0) {
      const primaryIdx = product.images.findIndex((img) => img.type === 'primary')
      setActiveImage(primaryIdx >= 0 ? primaryIdx : 0)
    }
  }, [product])

  const { data: compatibility } = useProductCompatibility(product?.id || slug)

  const { data: related } = useQuery({
    queryKey: ['related', product?.id],
    queryFn: () => productService().getRelatedProducts(product!),
    enabled: !!product,
  })

  const { data: recentlyViewed } = useQuery({
    queryKey: ['recently-viewed', ids],
    queryFn: () => productService().getRecentlyViewed(ids),
    enabled: ids.length > 0,
  })

  useEffect(() => {
    if (product) add(product.id)
  }, [product, add])

  const inWishlist = useAppSelector((s) => s.wishlist.products.some((p) => p.id === product?.id))

  const ratingSummary = useMemo(() => {
    if (!product) return { average: 0, total: 0, counts: {} as Record<number, number> }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const reviews = product.reviews?.length ? product.reviews : [{ rating: product.rating }]
    reviews.forEach((r) => {
      const key = Math.round(r.rating) as keyof typeof counts
      if (counts[key] !== undefined) counts[key]++
    })
    return { average: product.rating, total: product.ratingCount, counts }
  }, [product])

  const handleZoom = (e: React.MouseEvent) => {
    const rect = imageBoxRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y })
  }

  const addToCart = (openDrawer = true) => {
    if (!product) return
    dispatch(addItem({ product, quantity }))
    toast.success('Added to cart', `${quantity} × ${product.name}`)
    if (openDrawer) dispatch(setDrawerOpen(true))
  }

  const buyNow = () => {
    if (!product) return
    dispatch(addItem({ product, quantity }))
    navigate('/checkout')
  }

  if (isLoading) {
    return (
      <div className="container-page grid gap-8 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="font-serif text-2xl font-normal text-[#111111]">Product Not Found</p>
        <p className="text-xs text-[#6B7280]">The requested formulation may have been moved or updated.</p>
        <Button variant="outline" onClick={() => navigate('/shop')}>Return to Shop</Button>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 3

  // Determine single primary badge to avoid badge stacking
  let primaryBadge: { label: string; style: string; icon?: React.ReactNode } | null = null
  if (product.isDoctorRecommended) {
    primaryBadge = { label: 'DERM APPROVED', style: 'bg-[#ECFDF5] text-[#047857] border border-[#059669]/20' }
  } else if (product.isBestSeller) {
    primaryBadge = { label: 'BESTSELLER', style: 'bg-[#FEF3C7] text-[#92400E] border border-amber-300' }
  } else if (product.isNewProduct || product.isNew) {
    primaryBadge = { label: 'NEW', style: 'bg-[#111111] text-white' }
  } else if (isLowStock) {
    primaryBadge = { label: 'LOW STOCK', style: 'bg-amber-100 text-amber-900 border border-amber-300' }
  }

  return (
    <PageTransition>
      {/* 1. BREADCRUMBS */}
      <nav className="container-page py-4 text-xs text-[#6B7280]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-[#111111] transition-colors">Home</Link></li>
          <li><ChevronRight className="size-3.5" /></li>
          <li><Link to="/shop" className="hover:text-[#111111] transition-colors">Shop</Link></li>
          <li><ChevronRight className="size-3.5" /></li>
          <li>
            <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-[#111111] transition-colors">
              {product.categoryName}
            </Link>
          </li>
          <li><ChevronRight className="size-3.5" /></li>
          <li className="line-clamp-1 max-w-[16rem] text-[#111111] font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* 2. MAIN PRODUCT HERO STAGE (2-COLUMN EDITORIAL) */}
      <div className="container-page grid gap-10 pb-16 lg:grid-cols-12">
        {/* Left Column: Product Gallery & Wishlist (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <ProductVisualStage
            product={product}
            imageUrl={product.images?.[activeImage]?.url || getProductImage(product)}
            alt={product.name}
            variant="detail"
            priority
            containerRef={imageBoxRef}
            onMouseMove={handleZoom}
            onMouseLeave={() => setZoom(null)}
            imageClassName={cn(
              'h-full w-full object-contain transition-transform duration-300 ease-out',
              zoom ? 'scale-[1.8]' : 'scale-100'
            )}
            imageStyle={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          >
            {/* Primary Badge */}
            {primaryBadge && (
              <div className="absolute left-4 top-4 z-10">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-2xs',
                    primaryBadge.style
                  )}
                >
                  {primaryBadge.icon}
                  <span>{primaryBadge.label}</span>
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWishlist(product))
                toast.info(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', product.name)
              }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-[#E5E7EB]',
                inWishlist ? 'text-[#EF4444]' : 'text-[#6B7280] hover:text-[#111111]'
              )}
            >
              <Heart className={cn('size-4 transition-transform', inWishlist && 'fill-[#EF4444] text-[#EF4444] scale-110')} />
            </button>
          </ProductVisualStage>

          {/* Gallery Thumbnails (Only render if available) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-2xl border p-2 bg-[#FAF7F2] transition-all',
                    i === activeImage ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Metadata & Actions (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand Header */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] block">
              {product.brand || 'BAREO ACTIVE'}
            </span>

            {/* Dominant Product Name */}
            <h1 className="font-serif text-3xl font-medium leading-snug text-[#111111] sm:text-4xl tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs">
              <RatingStars rating={product.rating} size={15} showValue />
              <span className="text-[#6B7280] font-light">({formatNumber(product.ratingCount)} reviews)</span>
            </div>

            {/* Price & MRP Block */}
            <div className="pt-1 flex items-baseline gap-3">
              <PriceTag offerPrice={product.offerPrice} mrp={product.mrp} discount={product.discount} size="lg" />
            </div>
            <p className="text-[11px] text-[#6B7280] font-light">
              Inclusive of all taxes · Free express shipping on orders over ₹499
            </p>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-[#4B5563] font-light leading-relaxed pt-1">
              {product.shortDescription}
            </p>

            {/* AI COMPATIBILITY MODULE */}
            <div className="pt-2">
              {compatibility && compatibility.matchPercent !== null ? (
                <div className="rounded-2xl border border-[#7C3AED]/30 bg-[#F5F3FF]/80 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#7C3AED] px-3 py-1 text-xs font-bold text-white shadow-2xs">
                        <Sparkles className="size-3.5 text-amber-200" /> {compatibility.matchPercent}% AI Match
                      </span>
                      <span className="text-xs font-semibold text-[#111111]">
                        {compatibility.isCompatible ? 'Highly Recommended Formulation' : 'Low Compatibility Profile'}
                      </span>
                    </div>
                  </div>

                  {compatibility.reasons && compatibility.reasons.length > 0 && (
                    <ul className="text-xs text-[#374151] space-y-1.5 pt-1">
                      {compatibility.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="size-3.5 text-[#047857] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="pt-1">
                    <Link to="/skin-analysis" className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1">
                      View Full Skin Analysis →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#7C3AED]/20 bg-[#F5F3FF] p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                      <Sparkles className="size-4 text-[#7C3AED]" /> Personalized For Your Skin
                    </span>
                  </div>
                  <p className="text-xs text-[#374151] leading-relaxed font-light">
                    Not sure whether this formula is right for you? Check your compatibility using the Bareo AI Skin Assessment.
                  </p>
                  <div className="pt-1">
                    <Button
                      onClick={() => navigate('/skin-analysis')}
                      className="h-9 px-4 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black"
                    >
                      Check Compatibility →
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Suitability (Skin Types & Concerns) */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[#111111] text-[11px] uppercase tracking-wider">BEST FOR:</span>
                {(product.skinTypes || ['All Skin Types']).map((st) => (
                  <span key={st} className="rounded-full bg-[#FAF7F2] border border-[#E5E7EB] px-3 py-0.5 text-xs font-medium text-[#111111]">
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </span>
                ))}
              </div>
              {product.concerns && product.concerns.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#111111] text-[11px] uppercase tracking-wider">TARGETS:</span>
                  {product.concerns.map((c) => (
                    <span key={c} className="rounded-full bg-[#FAF7F2] border border-[#E5E7EB] px-3 py-0.5 text-xs font-medium text-[#374151]">
                      {c.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Product Assurances */}
            {product.keyFacts && product.keyFacts.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#374151]">
                {product.keyFacts.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 font-medium">
                    <Check className="size-3.5 text-[#047857]" /> {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <Button
                size="lg"
                disabled={isOutOfStock}
                className="flex-1 rounded-xl bg-[#111111] text-white hover:bg-black h-12 text-xs sm:text-sm font-semibold shadow-2xs border border-[#111111]"
                onClick={() => addToCart()}
              >
                <ShoppingBag className="size-4 mr-2" /> {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={isOutOfStock}
                className="rounded-xl h-12 border-[#E5E7EB] text-xs sm:text-sm font-semibold"
                onClick={buyNow}
              >
                <Zap className="size-4 mr-1.5" /> Buy Now
              </Button>
            </div>

            {/* Trust Strip */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-3 space-y-0.5">
                <Truck className="mx-auto size-4 text-[#111111]" />
                <p className="text-[11px] font-semibold text-[#111111]">Free Express Shipping</p>
                <p className="text-[10px] text-[#6B7280]">On orders over ₹499</p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-3 space-y-0.5">
                <RotateCcw className="mx-auto size-4 text-[#111111]" />
                <p className="text-[11px] font-semibold text-[#111111]">7-Day Easy Returns</p>
                <p className="text-[10px] text-[#6B7280]">Guaranteed resolution</p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-3 space-y-0.5">
                <ShieldCheck className="mx-auto size-4 text-[#111111]" />
                <p className="text-[11px] font-semibold text-[#111111]">100% Authentic</p>
                <p className="text-[10px] text-[#6B7280]">Direct from Bareo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BELOW-THE-FOLD PRODUCT SYSTEM */}
      <div className="container-page pb-16 space-y-12">
        <Tabs defaultValue="benefits">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar border-b border-[#E5E7EB] bg-transparent rounded-none p-0 h-auto gap-8 sm:w-auto">
            <TabsTrigger value="benefits" className="border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-medium text-[#111111]">Why Your Skin Will Love It</TabsTrigger>
            <TabsTrigger value="ingredients" className="border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-medium text-[#111111]">Key Actives</TabsTrigger>
            <TabsTrigger value="usage" className="border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-medium text-[#111111]">How to Use</TabsTrigger>
            <TabsTrigger value="reviews" className="border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-medium text-[#111111]">Reviews ({formatNumber(product.ratingCount)})</TabsTrigger>
            <TabsTrigger value="faqs" className="border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-medium text-[#111111]">FAQs</TabsTrigger>
          </TabsList>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#111111]">Key Formulation Benefits</h3>
            <p className="text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed">
              {product.description}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 pt-2">
              {product.benefits?.map((b) => (
                <li key={b} className="flex items-start gap-3 text-xs sm:text-sm text-[#111111] font-normal leading-relaxed">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857] border border-[#059669]/20">
                    <Check className="size-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#111111]">Active Key Ingredients</h3>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {product.ingredients?.map((ing) => (
                <div key={ing.name} className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-semibold text-[#111111]">{ing.name}</p>
                    {ing.concentration && (
                      <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#059669]/20">
                        {ing.concentration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-light">{ing.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#111111]">Step-by-Step Instructions</h3>
            <ol className="space-y-3 pt-2">
              {product.usage?.map((step, i) => (
                <li key={i} className="flex items-start gap-3.5 text-xs sm:text-sm text-[#111111] leading-relaxed">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 font-light">{step}</span>
                </li>
              ))}
            </ol>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <RatingSummary summary={ratingSummary} />
              <div className="space-y-4">
                {product.reviews?.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
                {(!product.reviews || product.reviews.length === 0) && (
                  <p className="text-xs text-[#6B7280] font-light">No customer reviews written yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>
            <WriteReview productName={product.name} />
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-3 rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 mt-6">
            <h3 className="font-serif text-xl font-normal text-[#111111] pb-2">Frequently Asked Questions</h3>
            {product.faqs?.map((f) => (
              <details key={f.id || f.question} className="group rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] px-4 py-3">
                <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-semibold text-[#111111]">
                  {f.question}
                  <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 text-xs text-[#6B7280] leading-relaxed font-light">{f.answer}</p>
              </details>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* 4. RELATED PRODUCTS RAIL */}
      {related && related.length > 0 && (
        <div className="container-page pb-16">
          <div className="border-b border-[#E5E7EB] pb-4 mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-normal text-[#111111]">You May Also Like</h2>
            <Link to="/shop" className="text-xs font-semibold text-[#111111] hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 5. RECENTLY VIEWED RAIL */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="container-page pb-20">
          <div className="border-b border-[#E5E7EB] pb-4 mb-6">
            <h2 className="font-serif text-2xl font-normal text-[#111111]">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentlyViewed.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 6. MOBILE STICKY PURCHASE BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E5E7EB] p-3 sm:hidden z-40 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] text-[#6B7280] block font-light">Price</span>
          <span className="font-serif text-base font-bold text-[#111111]">
            {formatINR(product.offerPrice ?? product.mrp)}
          </span>
        </div>
        <Button
          onClick={() => addToCart()}
          disabled={isOutOfStock}
          className="h-10 px-5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black shrink-0"
        >
          <ShoppingBag className="size-3.5 mr-1.5" /> {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
        </Button>
      </div>
    </PageTransition>
  )
}

function RatingSummary({ summary }: { summary: { average: number; total: number; counts: Record<number, number> } }) {
  const maxCount = Math.max(...Object.values(summary.counts), 1)
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-xs space-y-2">
      <p className="font-serif text-4xl font-semibold text-[#111111]">{summary.average.toFixed(1)}</p>
      <RatingStars rating={summary.average} size={16} className="justify-center" />
      <p className="text-xs text-[#6B7280] font-light">{formatNumber(summary.total)} ratings</p>
      <div className="mt-4 space-y-1.5 pt-2 border-t border-[#E5E7EB]">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="flex w-8 items-center gap-0.5"><Star className="size-3 fill-amber-400 text-amber-400" />{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#FAF7F2] border border-[#E5E7EB]">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${(summary.counts[star] / maxCount) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-[10px] font-mono">{summary.counts[star]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WriteReview({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast.success('Review submitted', `Thanks for reviewing ${productName}`)
    }, 800)
  }

  return (
    <>
      <Button variant="outline" size="sm" className="rounded-xl text-xs font-medium border-[#E5E7EB]" onClick={() => setOpen(true)}>
        Write a Review
      </Button>
      <AppModal open={open} onOpenChange={setOpen} title="Write a Review" description={productName}>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[#111111] block pb-1">Your Rating</label>
            <RatingStarsInput value={rating} onChange={setRating} />
          </div>
          <AppTextarea name="review" label="Your Review" placeholder="Share your experience with this formulation..." rows={4} />
          <AppTextarea name="title" label="Headline" placeholder="Short summary of your experience" rows={1} />
          <Button type="submit" variant="primary" className="w-full rounded-xl bg-[#111111] text-white font-semibold text-xs h-10 hover:bg-black" loading={loading}>
            Submit Review
          </Button>
        </form>
      </AppModal>
    </>
  )
}
