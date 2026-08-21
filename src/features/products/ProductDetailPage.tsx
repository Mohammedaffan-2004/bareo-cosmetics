import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingBag,
  Zap,
  Heart,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Star,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, setDrawerOpen } from '@/store/slices/cartSlice'
import { toggleWishlist } from '@/store/slices/wishlistSlice'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
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
      document.title = `${product.name} — BAREO Skincare`
    } else {
      document.title = 'BAREO — Science for Everyday Skin'
    }
    if (product?.images && product.images.length > 0) {
      const primaryIdx = product.images.findIndex((img) => img.type === 'primary')
      setActiveImage(primaryIdx >= 0 ? primaryIdx : 0)
    }
  }, [product])

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
    const reviews = product.reviews || []
    if (reviews.length > 0) {
      reviews.forEach((r) => {
        const key = Math.round(r.rating) as keyof typeof counts
        if (counts[key] !== undefined) counts[key]++
      })
    }
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
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-[#F4F6F7]" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="aspect-square rounded-xl bg-[#F4F6F7]" />
            <Skeleton className="aspect-square rounded-xl bg-[#F4F6F7]" />
            <Skeleton className="aspect-square rounded-xl bg-[#F4F6F7]" />
            <Skeleton className="aspect-square rounded-xl bg-[#F4F6F7]" />
          </div>
        </div>
        <div className="lg:col-span-6 space-y-6 pt-2">
          <Skeleton className="h-4 w-28 bg-[#F4F6F7]" />
          <Skeleton className="h-10 w-3/4 bg-[#F4F6F7]" />
          <Skeleton className="h-5 w-44 bg-[#F4F6F7]" />
          <Skeleton className="h-8 w-36 bg-[#F4F6F7]" />
          <Skeleton className="h-20 w-full rounded-xl bg-[#F4F6F7]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#F4F6F7]" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="text-[10px] font-bold tracking-widest text-[#7A8A91] uppercase">BAREO CATALOG</span>
        <h1 className="font-serif text-3xl font-normal text-[#172126]">Product Not Found</h1>
        <p className="max-w-md text-xs text-[#627279] leading-relaxed">
          The requested product details may have been updated or relocated within our dermatological store.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => navigate('/shop')}
            className="h-11 px-6 rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239]"
          >
            Explore BAREO Products
          </Button>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 3

  let primaryBadge: { label: string; style: string; icon?: React.ReactNode } | null = null
  if (product.isDoctorRecommended) {
    primaryBadge = { label: 'DERM APPROVED', style: 'bg-[#EDF6F8] text-[#167C86] border border-[#DCE6E9]' }
  } else if (product.isBestSeller) {
    primaryBadge = { label: 'BESTSELLER', style: 'bg-[#FAF7F2] text-[#8C6D3B] border border-[#E8E2D7]' }
  } else if (product.isNewProduct || product.isNew) {
    primaryBadge = { label: 'NEW RELEASE', style: 'bg-[#172126] text-white border border-[#172126]' }
  } else if (isLowStock) {
    primaryBadge = { label: 'LIMITED UNITS', style: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]' }
  }

  return (
    <PageTransition>
      {/* BREADCRUMB NAVIGATION */}
      <nav className="container-page py-4 text-xs text-[#7A8A91]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-[#172126] transition-colors">Home</Link></li>
          <li><ChevronRight className="size-3 text-[#A0AEC0]" /></li>
          <li><Link to="/shop" className="hover:text-[#172126] transition-colors">Shop</Link></li>
          <li><ChevronRight className="size-3 text-[#A0AEC0]" /></li>
          <li>
            <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-[#172126] transition-colors">
              {product.categoryName || 'Products'}
            </Link>
          </li>
          <li><ChevronRight className="size-3 text-[#A0AEC0]" /></li>
          <li className="line-clamp-1 max-w-[18rem] text-[#172126] font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* 1. HERO PRODUCT SECTION (50/50 BALANCE) */}
      <div className="container-page grid gap-10 pb-12 lg:grid-cols-12">
        {/* Left Column: Premium Editorial Gallery (6 Cols) */}
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
            containerClassName="cursor-pointer"
            imageClassName={cn(
              'h-full w-full object-contain transition-transform duration-300 ease-out cursor-pointer',
              zoom ? 'scale-[1.8]' : 'scale-100'
            )}
            imageStyle={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          >
            {/* Restrained Badge */}
            {primaryBadge && (
              <div className="absolute left-4 top-4 z-10">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-2xs',
                    primaryBadge.style
                  )}
                >
                  {primaryBadge.icon}
                  <span>{primaryBadge.label}</span>
                </span>
              </div>
            )}

            {/* Wishlist Toggle Button */}
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWishlist(product))
                toast.info(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', product.name)
              }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-[#DCE6E9]',
                inWishlist ? 'text-[#E53E3E]' : 'text-[#7A8A91] hover:text-[#172126]'
              )}
            >
              <Heart className={cn('size-4 transition-transform', inWishlist && 'fill-[#E53E3E] text-[#E53E3E] scale-110')} />
            </button>
          </ProductVisualStage>

          {/* Gallery Thumbnails (Rendered if multi-image) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 cursor-pointer">
              {product.images.map((img, i) => (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-xl border p-2 bg-[#FAF9F6] transition-all',
                    i === activeImage ? 'border-[#172126] ring-1 ring-[#172126]' : 'border-[#DCE6E9] opacity-75 hover:opacity-100'
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-contain cursor-pointer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Decision Hierarchy (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* 1. Brand/Category Eyebrow */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">
              {product.brand || 'BAREO CLINICAL FORMULATION'}
            </span>

            {/* 2. Dominant Product Name */}
            <h1 className="font-serif text-3xl font-normal leading-snug text-[#172126] sm:text-4xl tracking-tight">
              {product.name}
            </h1>

            {/* 3. Rating & Verified Review Count */}
            <div className="flex items-center gap-2 text-xs">
              <RatingStars rating={product.rating} size={14} showValue />
              <span className="text-[#7A8A91] font-light">({formatNumber(product.ratingCount)} verified ratings)</span>
            </div>

            {/* 4. Price & MRP Block */}
            <div className="pt-1 flex items-baseline gap-3">
              <PriceTag offerPrice={product.offerPrice} mrp={product.mrp} discount={product.discount} size="lg" />
            </div>

            {/* 5. Tax & Shipping Subtext */}
            <p className="text-[11px] text-[#7A8A91] font-light">
              Inclusive of all taxes · Free express shipping on orders over ₹499
            </p>

            {/* 6. Short Product Positioning */}
            <p className="text-xs sm:text-sm text-[#4A5568] font-light leading-relaxed pt-1">
              {product.shortDescription}
            </p>

            {/* 7. BEST FOR & 8. TARGETS & 9. FORMULATION SIGNALS */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              {product.skinTypes && product.skinTypes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#172126] text-[10px] uppercase tracking-widest">BEST FOR:</span>
                  {product.skinTypes.map((st) => (
                    <span key={st} className="rounded-full bg-[#EDF6F8] border border-[#DCE6E9] px-3 py-0.5 text-xs font-medium text-[#172126]">
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
                  ))}
                </div>
              )}

              {product.concerns && product.concerns.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#172126] text-[10px] uppercase tracking-widest">TARGETS:</span>
                  {product.concerns.map((c) => (
                    <span key={c} className="rounded-full bg-[#FAF9F6] border border-[#E5E2DA] px-3 py-0.5 text-xs font-medium text-[#2C3E50]">
                      {c.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Formulation Signals & Key Assurances */}
              {product.keyFacts && product.keyFacts.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#4A5568]">
                  {product.keyFacts.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 font-normal">
                      <Check className="size-3.5 text-[#167C86]" /> {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 10. PURCHASE CONTROLS (QUANTITY + ADD TO CART + BUY NOW) */}
          <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <QuantitySelector value={quantity} onChange={setQuantity} />
                <Button
                  size="lg"
                  disabled={isOutOfStock}
                  className="flex-1 rounded-xl bg-[#172126] text-white hover:bg-[#253239] h-12 text-xs sm:text-sm font-semibold shadow-2xs border border-[#172126] transition-colors"
                  onClick={() => addToCart()}
                >
                  <ShoppingBag className="size-4 mr-2 text-[#167C86]" /> {isOutOfStock ? 'Out of Stock' : 'ADD TO CART'}
                </Button>
              </div>
              <Button
                size="lg"
                variant="outline"
                disabled={isOutOfStock}
                className="w-full sm:w-auto rounded-xl h-12 border-[#DCE6E9] text-[#172126] hover:bg-[#EDF6F8] px-5 text-xs sm:text-sm font-semibold transition-colors"
                onClick={buyNow}
              >
                <Zap className="size-4 mr-1.5 text-[#167C86]" /> Buy Now
              </Button>
            </div>

            {/* 11. INTEGRATED TRUST SIGNALS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
              <div className="rounded-xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-3 space-y-0.5">
                <Lock className="mx-auto size-4 text-[#167C86]" />
                <p className="text-[11px] font-semibold text-[#172126]">ENCRYPTED CHECKOUT</p>
                <p className="text-[10px] text-[#7A8A91]">Secure processing</p>
              </div>
              <div className="rounded-xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-3 space-y-0.5">
                <Truck className="mx-auto size-4 text-[#167C86]" />
                <p className="text-[11px] font-semibold text-[#172126]">EXPRESS DISPATCH</p>
                <p className="text-[10px] text-[#7A8A91]">Ships in 24–48h</p>
              </div>
              <div className="rounded-xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-3 space-y-0.5">
                <RotateCcw className="mx-auto size-4 text-[#167C86]" />
                <p className="text-[11px] font-semibold text-[#172126]">EASY RETURNS</p>
                <p className="text-[10px] text-[#7A8A91]">7-day resolution</p>
              </div>
              <div className="rounded-xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-3 space-y-0.5">
                <ShieldCheck className="mx-auto size-4 text-[#167C86]" />
                <p className="text-[11px] font-semibold text-[#172126]">100% AUTHENTIC</p>
                <p className="text-[10px] text-[#7A8A91]">Direct from BAREO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BELOW-THE-FOLD PRODUCT DOSSIER TABS */}
      <div className="container-page pb-16 space-y-12">
        <Tabs defaultValue="benefits">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar border-b border-[#E2E8F0] bg-transparent rounded-none p-0 h-auto gap-8 sm:w-auto">
            <TabsTrigger
              value="benefits"
              className="border-b-2 border-transparent data-[state=active]:border-[#172126] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-normal text-[#172126]"
            >
              Why Your Skin Will Love It
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              className="border-b-2 border-transparent data-[state=active]:border-[#172126] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-normal text-[#172126]"
            >
              Active Key Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="border-b-2 border-transparent data-[state=active]:border-[#172126] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-normal text-[#172126]"
            >
              Application Instructions
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="border-b-2 border-transparent data-[state=active]:border-[#172126] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-normal text-[#172126]"
            >
              Customer Reviews ({formatNumber(product.ratingCount)})
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="border-b-2 border-transparent data-[state=active]:border-[#172126] data-[state=active]:bg-transparent font-serif text-base rounded-none pb-3 font-normal text-[#172126]"
            >
              Product FAQs
            </TabsTrigger>
          </TabsList>

          {/* Product Overview Tab */}
          <TabsContent value="benefits" className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#172126]">Key Product Benefits</h3>
            <p className="text-xs sm:text-sm text-[#627279] font-light leading-relaxed">
              {product.description}
            </p>
            {product.benefits && product.benefits.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2 pt-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-xs sm:text-sm text-[#172126] font-normal leading-relaxed">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#EDF6F8] text-[#167C86] border border-[#DCE6E9]">
                      <Check className="size-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* Active Ingredients Tab */}
          <TabsContent value="ingredients" className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#172126]">Active Ingredients & Concentrations</h3>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {product.ingredients && product.ingredients.length > 0 ? (
                product.ingredients.map((ing) => (
                  <div key={ing.name} className="rounded-xl border border-[#E5E2DA] bg-[#FAF9F6] p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-semibold text-[#172126]">{ing.name}</p>
                      {ing.concentration && (
                        <span className="text-[10px] font-bold text-[#167C86] bg-[#EDF6F8] px-2 py-0.5 rounded-md border border-[#DCE6E9]">
                          {ing.concentration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#627279] leading-relaxed font-light">{ing.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#7A8A91] font-light">Full dermatological ingredient breakdown available on packaging.</p>
              )}
            </div>
          </TabsContent>

          {/* Application Instructions Tab (Numbered Step Routine) */}
          <TabsContent value="usage" className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 mt-6 space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#172126]">Application Instructions & Ritual</h3>
            {product.usage && product.usage.length > 0 ? (
              <ol className="grid gap-3 sm:grid-cols-3 pt-2">
                {product.usage.map((step, i) => (
                  <li key={i} className="rounded-xl border border-[#E5E2DA] bg-[#FAF9F6] p-4 space-y-2">
                    <span className="font-serif text-lg font-bold text-[#167C86]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-[#2C3E50] leading-relaxed font-light">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-[#7A8A91] font-light">Apply 2-3 drops after cleansing morning and evening.</p>
            )}
          </TabsContent>

          {/* Customer Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE6E9] pb-4">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#172126]">Customer Reviews</h3>
                <p className="text-xs text-[#7A8A91] font-light">Verified customer feedback and dermal experience.</p>
              </div>
              <WriteReview product={product} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <RatingSummary summary={ratingSummary} />
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((r, idx) => <ReviewCard key={r.id || `rev-${idx}`} review={r} />)
                ) : (
                  <div className="rounded-xl border border-[#DCE6E9] bg-[#FAF9F6] p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#172126]">No written reviews yet</p>
                      <p className="text-xs text-[#7A8A91] font-light">Be the first to share your experience with this product.</p>
                    </div>
                    <WriteReview product={product} />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-3 rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 mt-6">
            <h3 className="font-serif text-xl font-normal text-[#172126] pb-1">Frequently Asked Questions</h3>
            {product.faqs && product.faqs.length > 0 ? (
              product.faqs.map((f) => (
                <details key={f.id || f.question} className="group rounded-xl border border-[#E5E2DA] bg-[#FAF9F6] px-4 py-3">
                  <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-semibold text-[#172126]">
                    {f.question}
                    <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 text-xs text-[#627279] leading-relaxed font-light">{f.answer}</p>
                </details>
              ))
            ) : (
              <p className="text-xs text-[#7A8A91] font-light">No additional FAQs available for this product.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* RELATED PRODUCTS RAIL ("COMPLETE YOUR ROUTINE") */}
      {related && related.length > 0 && (
        <div className="container-page pb-16">
          <div className="border-b border-[#E2E8F0] pb-4 mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-normal text-[#172126]">Complete Your Routine</h2>
            <Link to="/shop" className="text-xs font-semibold text-[#172126] hover:underline flex items-center gap-1">
              <span>Explore All Products</span> <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* RECENTLY VIEWED RAIL */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="container-page pb-20">
          <div className="border-b border-[#E2E8F0] pb-4 mb-6">
            <h2 className="font-serif text-2xl font-normal text-[#172126]">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentlyViewed.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STICKY PURCHASE BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#DCE6E9] p-3.5 sm:hidden z-40 flex items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-[9px] font-bold text-[#7A8A91] uppercase tracking-wider block">PRICE</span>
          <span className="font-serif text-base font-bold text-[#172126]">
            {formatINR(product.offerPrice ?? product.mrp)}
          </span>
        </div>
        <Button
          onClick={() => addToCart()}
          disabled={isOutOfStock}
          className="h-11 px-6 rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239] shrink-0 border border-[#172126] shadow-2xs"
        >
          <ShoppingBag className="size-3.5 mr-1.5 text-[#167C86]" /> {isOutOfStock ? 'Out of Stock' : 'ADD TO CART'}
        </Button>
      </div>
    </PageTransition>
  )
}

function RatingSummary({ summary }: { summary: { average: number; total: number; counts: Record<number, number> } }) {
  const hasCounts = Object.values(summary.counts).some((v) => v > 0)
  const maxCount = Math.max(...Object.values(summary.counts), 1)

  return (
    <div className="rounded-xl border border-[#DCE6E9] bg-white p-6 text-center space-y-2">
      <p className="font-serif text-4xl font-normal text-[#172126]">{summary.average.toFixed(1)}</p>
      <RatingStars rating={summary.average} size={15} className="justify-center" />
      <p className="text-xs text-[#7A8A91] font-light">{formatNumber(summary.total)} verified customer ratings</p>
      {hasCounts && (
        <div className="mt-4 space-y-1.5 pt-2 border-t border-[#E2E8F0]">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-xs text-[#7A8A91]">
              <span className="flex w-8 items-center gap-0.5"><Star className="size-3 fill-amber-400 text-amber-400" />{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDF6F8] border border-[#DCE6E9]">
                <div className="h-full rounded-full bg-[#167C86]" style={{ width: `${(summary.counts[star] / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-[10px] font-mono">{summary.counts[star]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WriteReview({ product }: { product: any }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const queryClient = useQueryClient()
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast.error('Authentication required', 'Please sign in to write a review.')
      navigate('/login')
      return
    }

    if (!comment.trim()) {
      toast.error('Validation error', 'Please enter a review comment.')
      return
    }

    try {
      setLoading(true)
      await productService().submitReview(product.slug || product.id, {
        rating,
        title,
        comment,
      })
      await queryClient.invalidateQueries({ queryKey: ['product', product.slug] })
      await queryClient.invalidateQueries({ queryKey: ['product', product.id] })
      toast.success('Review submitted', `Thanks for reviewing ${product.name}!`)
      setOpen(false)
      setComment('')
      setTitle('')
    } catch (err: any) {
      toast.error('Submission failed', err.message || 'Unable to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl text-xs font-medium border-[#DCE6E9] text-[#172126] hover:bg-[#EDF6F8] shadow-2xs"
        onClick={() => {
          if (!user) {
            toast.error('Authentication required', 'Please sign in to write a review.')
            navigate('/login')
            return
          }
          setOpen(true)
        }}
      >
        Write a Review
      </Button>
      <AppModal open={open} onOpenChange={setOpen} title="Write a Review" description={product.name}>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[#172126] block pb-1">Your Rating</label>
            <RatingStarsInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#172126] block pb-1">Headline (Optional)</label>
            <AppTextarea
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of your experience"
              rows={1}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#172126] block pb-1">Your Review</label>
            <AppTextarea
              name="review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-xl bg-[#172126] text-white font-semibold text-xs h-10 hover:bg-[#253239] border border-[#172126]"
            loading={loading}
            disabled={loading}
          >
            Submit Review
          </Button>
        </form>
      </AppModal>
    </>
  )
}
