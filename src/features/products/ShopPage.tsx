import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, List, SlidersHorizontal, Search, X, Sparkles, ChevronRight } from 'lucide-react'
import type { ProductQuery } from '@/services/productService'
import { productService } from '@/services/productService'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductGrid } from '@/components/cards/ProductGrid'
import { ProductCard } from '@/components/cards/ProductCard'
import { Pagination } from '@/components/common/Pagination'
import { FiltersPanel, type ShopFilters } from './FiltersPanel'
import { AppModal } from '@/components/common/AppModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn, formatNumber } from '@/utils'
import { useRecommendations } from '@/hooks/useRecommendations'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'discount', label: 'Best Discount' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

export function ShopPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileFilters, setMobileFilters] = useState(false)

  const category = searchParams.get('category') ?? ''
  const concern = searchParams.get('concern') ?? ''
  const q = searchParams.get('q') ?? ''
  const sort = (searchParams.get('sort') ?? 'popular') as ProductQuery['sort']
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const [searchInput, setSearchInput] = useState(q)
  const debouncedSearch = useDebounce(searchInput, 400)

  const [filters, setFilters] = useState<ShopFilters>({
    concern: concern ? [concern] : [],
    skinType: [],
    productType: [],
    ingredient: [],
    price: [0, 4000],
    minRating: 0,
    inStockOnly: false,
  })

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    if (concern) {
      setFilters((f) => ({ ...f, concern: [concern] }))
    }
  }, [concern])

  const queryParams: ProductQuery = useMemo(() => {
    const p: ProductQuery = { page, pageSize: 12, sort }
    if (category) p.category = category
    if (debouncedSearch) p.q = debouncedSearch
    if (filters.concern.length > 0) p.concern = filters.concern.join(',')
    if (filters.skinType.length > 0) p.skinType = filters.skinType.join(',')
    if (filters.price[0] > 0) p.minPrice = filters.price[0]
    if (filters.price[1] < 4000) p.maxPrice = filters.price[1]
    if (filters.minRating > 0) p.minRating = filters.minRating
    if (filters.inStockOnly) p.inStockOnly = true
    return p
  }, [category, debouncedSearch, filters, page, sort])

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productService().queryProducts(queryParams),
  })

  const { data: recData } = useRecommendations({ limit: 3 })

  const topRecommendations = useMemo(
    () => (recData || []).filter((r) => r && r.isCompatible && r.product && r.product.status === 'active'),
    [recData]
  )

  const updateParams = (newParams: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    })
    if ('category' in newParams || 'q' in newParams || 'sort' in newParams) {
      next.set('page', '1')
    }
    setSearchParams(next)
  }

  const resetFilters = () => {
    setFilters({
      concern: [],
      skinType: [],
      productType: [],
      ingredient: [],
      price: [0, 4000],
      minRating: 0,
      inStockOnly: false,
    })
    setSearchInput('')
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (sort) next.set('sort', sort)
    setSearchParams(next)
  }

  const activeFilterCount =
    filters.concern.length +
    filters.skinType.length +
    (filters.productType?.length ?? 0) +
    (filters.ingredient?.length ?? 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.price[0] > 0 || filters.price[1] < 4000 ? 1 : 0)

  const formattedCategoryName = category
    ? category
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Formulations'

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. SPACIOUS PAGE HERO HEADER (No Duplicate Product Count) */}
      <header className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6 sm:p-10 space-y-4">
        <nav className="flex items-center gap-1.5 text-xs text-[#9CA3AF] font-light">
          <Link to="/" className="hover:text-[#111111] transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-[#111111] font-normal">{formattedCategoryName}</span>
        </nav>

        <div className="space-y-1.5 max-w-2xl pt-1">
          <h1 className="font-serif text-3xl font-normal text-[#111111] sm:text-4xl tracking-tight">
            {formattedCategoryName}
          </h1>
          <p className="text-xs text-[#6B7280] font-light leading-relaxed">
            Professional dermatologist-formulated skincare and body essentials designed for everyday skin health.
          </p>
        </div>
      </header>

      {/* 2. COMPACT AI RECOMMENDATION BANNER */}
      {topRecommendations.length > 0 ? (
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">
                <Sparkles className="size-4" /> AI Diagnostic Match
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#111111] mt-1">Recommended For You</h3>
              <p className="text-xs text-[#6B7280] font-light">Chosen based on your backend AI skin profile.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/skin-analysis')} className="rounded-xl border-[#E5E7EB] text-xs font-medium">
              Retake AI Scan
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {topRecommendations.map((rec) => (
              <div key={rec.productId || rec.product.id} className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                <ProductCard product={rec.product} recommendation={rec} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 3. SEARCH + SORT TOOLBAR (Primary Count Source) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                updateParams({ q: e.target.value || null })
              }}
              placeholder="Search products..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] py-2 pl-9 pr-8 text-xs text-[#111111] placeholder-[#9CA3AF] focus:border-[#111111] focus:bg-white focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  updateParams({ q: null })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111111]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs font-serif font-semibold text-[#111111] sm:hidden">
            {data ? formatNumber(data.total) : '0'} products
          </span>

          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#111111] lg:hidden hover:bg-white"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-[#111111] text-[10px] text-white font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] hidden sm:inline font-light">Sort:</span>
            <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
              <SelectTrigger className="h-9 w-44 rounded-xl border-[#E5E7EB] bg-[#FAF7F2] text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#E5E7EB]">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden items-center border-l border-[#E5E7EB] pl-3 sm:flex gap-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                view === 'grid' ? 'bg-[#111111] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111111]'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                view === 'list' ? 'bg-[#111111] text-white shadow-2xs' : 'text-[#6B7280] hover:text-[#111111]'
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT LAYOUT (STICKY ACCORDION SIDEBAR + ACTIVE FILTERS SUMMARY BAR + PRODUCT GRID) */}
      <div className="flex gap-8 lg:gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
            <FiltersPanel
              category={category}
              filters={filters}
              priceBounds={[0, 4000]}
              onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          {/* Active Filter Summary Bar (Only Rendered When Active Filters Exist) */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-serif text-sm font-semibold text-[#111111] pr-2">
                  {data ? `${data.total} products` : '0 products'}
                </span>

                {filters.concern.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, concern: f.concern.filter((item) => item !== c) }))}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}

                {filters.skinType.map((st) => (
                  <span
                    key={st}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs"
                  >
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, skinType: f.skinType.filter((item) => item !== st) }))}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}

                {(filters.productType ?? []).map((pt) => (
                  <span
                    key={pt}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs"
                  >
                    <span>{pt}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((f) => ({ ...f, productType: (f.productType ?? []).filter((item) => item !== pt) }))
                      }
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}

                {(filters.ingredient ?? []).map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((f) => ({ ...f, ingredient: (f.ingredient ?? []).filter((item) => item !== ing) }))
                      }
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}

                {(filters.price[0] > 0 || filters.price[1] < 4000) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs">
                    <span>₹{filters.price[0]}–₹{filters.price[1]}</span>
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, price: [0, 4000] }))}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {filters.minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs">
                    <span>{filters.minRating}★+</span>
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, minRating: 0 }))}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {filters.inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#111111] shadow-2xs">
                    <span>In Stock Only</span>
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, inStockOnly: false }))}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline shrink-0 ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {debouncedSearch && (
            <p className="flex items-center gap-2 text-xs text-[#6B7280]">
              Active query for "<span className="font-semibold text-[#111111]">{debouncedSearch}</span>"
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-[#EF4444] font-semibold hover:underline"
              >
                clear search
              </button>
            </p>
          )}

          <ProductGrid
            products={data?.products ?? []}
            loading={isLoading}
            view={view}
            skeletonCount={8}
            emptyTitle="No formulations found"
            emptyDescription="Try adjusting your filters or searching for another skin concern."
          />

          {data && data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      <AppModal
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
        title="FILTERS"
      >
        <div className="space-y-4">
          <FiltersPanel
            category={category}
            filters={filters}
            priceBounds={[0, 4000]}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            onReset={resetFilters}
          />
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1 rounded-xl text-xs font-medium border-[#E5E7EB]"
            >
              Clear all
            </Button>
            <Button
              onClick={() => setMobileFilters(false)}
              className="flex-1 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black"
            >
              Apply Filters {data ? `(${data.total})` : ''}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
