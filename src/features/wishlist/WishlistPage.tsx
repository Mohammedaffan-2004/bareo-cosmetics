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
      <div className="container-page py-12 sm:py-20 space-y-12">
        <div className="mx-auto max-w-md rounded-3xl border border-[#DCE6E9] bg-[#FAF7F2] p-8 sm:p-10 text-center space-y-4 shadow-2xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white border border-[#DCE6E9] text-[#167C86] shadow-2xs">
            <Heart className="size-6 text-[#167C86]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126]">
              Your wishlist is empty.
            </h1>
            <p className="text-xs text-[#52636B] leading-relaxed max-w-xs mx-auto">
              Save products you love and return anytime to build your personalized skincare routine.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172126] px-6 py-3 text-xs font-semibold text-white hover:bg-[#253239] transition-colors min-h-[44px] shadow-2xs"
            >
              Explore Products <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Discovery Rail for Empty State */}
        {recommendedProducts.length > 0 && (
          <div className="border-t border-[#DCE6E9] pt-12 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                BAREO SELECTIONS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#172126] mt-0.5">
                Popular Products
              </h2>
              <p className="text-xs text-[#52636B] font-light mt-0.5">
                Explore clinical active skincare loved by our community.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="flex flex-col gap-4 border-b border-[#DCE6E9] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
            SAVED ESSENTIALS
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#172126] tracking-tight">My Wishlist</h1>
          <p className="mt-1 text-xs text-[#7A8A91] font-medium">
            {products.length} {products.length === 1 ? 'saved item' : 'saved items'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={shareWishlist}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE6E9] bg-white px-4 py-2 text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] transition-colors min-h-[40px] shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-[#167C86]" /> : <Share2 className="size-3.5 text-[#52636B]" />}
            <span>Share Wishlist</span>
          </button>

          <button
            type="button"
            onClick={addAllToCart}
            className="inline-flex items-center gap-2 rounded-xl bg-[#172126] px-5 py-2 text-xs font-semibold text-white hover:bg-[#253239] transition-colors min-h-[40px] shadow-2xs border border-[#172126]"
          >
            <ShoppingBag className="size-3.5" />
            <span>Add All to Cart</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(clearWishlist())}
            className="inline-flex items-center px-3 py-2 text-xs font-normal text-[#7A8A91] hover:text-rose-600 transition-colors min-h-[40px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* WISHLIST PRODUCT GRID (Natural column alignment, desktop max 4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* DISCOVERY RAIL: COMPLETE YOUR ROUTINE */}
      {recommendedProducts.length > 0 && (
        <div className="border-t border-[#DCE6E9] pt-12 sm:pt-16 mt-12 sm:mt-16 space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                ROUTINE SUGGESTIONS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#172126] mt-0.5">
                Complete Your Routine
              </h2>
              <p className="text-xs text-[#52636B] font-light mt-0.5 max-w-xl">
                Clinical active products designed to pair seamlessly with your saved essentials.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#172126] hover:text-[#167C86] transition-colors"
            >
              <span>View Catalog</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

