import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowRight, Share2, Check, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearWishlist } from '@/store/slices/wishlistSlice'
import { addItem, setDrawerOpen } from '@/store/slices/cartSlice'
import { ProductCard } from '@/components/cards/ProductCard'
import { productService } from '@/services/productService'
import { useToast } from '@/hooks/useToast'

export function WishlistPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const products = useAppSelector((s) => s.wishlist.products)
  const [copied, setCopied] = useState(false)

  // Fetch bestseller recommendations for the discovery rail
  const { data: recData } = useQuery({
    queryKey: ['wishlist-recommendations'],
    queryFn: () => productService().getProducts({ pageSize: 8, sort: 'popular' }),
  })

  const addAllToCart = () => {
    if (products.length === 0) return
    products.forEach((p) => dispatch(addItem({ product: p })))
    toast.success('All items added to cart', `${products.length} products added`)
    dispatch(setDrawerOpen(true))
  }

  const shareWishlist = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/wishlist?share=1`)
    setCopied(true)
    toast.success('Wishlist link copied', 'Share it with friends')
    setTimeout(() => setCopied(false), 1600)
  }

  // Filter out products already in the wishlist for recommendation rail
  const wishlistIds = new Set(products.map((p) => p.id))
  const recommendedProducts = recData?.products.filter((p) => !wishlistIds.has(p.id)).slice(0, 4) ?? []

  if (products.length === 0) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111] shadow-2xs">
            <Heart className="size-6 text-[#111111]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">
              Your wishlist is waiting.
            </h1>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mx-auto">
              Save products you love and come back to them anytime for your skincare routine.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-xs font-semibold text-white hover:bg-black transition-colors min-h-[44px] shadow-2xs"
            >
              Explore Bareo Formulations <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Discovery Rail for Empty State */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 border-t border-[#E5E7EB] pt-12 space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#111111]">
                POPULAR FORMULATIONS
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Explore clinical active skincare loved by our community.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-12 space-y-10">
      {/* WISHLIST HEADER */}
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">My Wishlist</h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            {products.length} {products.length === 1 ? 'saved product' : 'saved products'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={shareWishlist}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-medium text-[#111111] hover:bg-[#FAFAFA] transition-colors min-h-[44px] shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-[#059669]" /> : <Share2 className="size-3.5" />} Share Wishlist
          </button>

          <button
            type="button"
            onClick={addAllToCart}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors min-h-[44px] shadow-2xs"
          >
            <ShoppingBag className="size-3.5" /> Add All to Cart
          </button>

          <button
            type="button"
            onClick={() => dispatch(clearWishlist())}
            className="inline-flex items-center px-3 py-2.5 text-xs font-normal text-[#9CA3AF] hover:text-[#EF4444] transition-colors min-h-[44px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* WISHLIST PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* DISCOVERY RAIL: COMPLETE YOUR ROUTINE */}
      {recommendedProducts.length > 0 && (
        <div className="border-t border-[#E5E7EB] pt-14 sm:pt-20 mt-12 sm:mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">
                COMPLETE YOUR ROUTINE
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Clinical active formulations designed to pair with your saved essentials.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:underline"
            >
              View Catalog <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

