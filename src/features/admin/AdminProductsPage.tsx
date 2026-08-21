import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  X,
  AlertCircle,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
import { AppModal } from '@/components/common/AppModal'
import { SmartImage } from '@/components/common/SmartImage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatINR, formatNumber } from '@/utils'
import type { Product } from '@/types'

const PAGE_SIZE = 10

export function AdminProductsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService().getAdminProducts(),
    select: (d) => d.items,
  })

  // Operational KPI Computations
  const kpis = useMemo(() => {
    if (!products) return { total: 0, active: 0, lowStock: 0, totalSold: 0 }
    const total = products.length
    const active = products.filter((p) => p.status === 'active').length
    const lowStock = products.filter((p) => (p.stock ?? 0) <= 5).length
    const totalSold = products.reduce((acc, p) => acc + (p.soldCount ?? 0), 0)
    return { total, active, lowStock, totalSold }
  }, [products])

  // Filter & Search Logic
  const filtered = useMemo(() => {
    let list = [...(products ?? [])]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.categoryName || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      list = list.filter((p) => (p.status || 'active') === statusFilter)
    }
    return list.sort((a, b) => +new Date(b.createdAt || Date.now()) - +new Date(a.createdAt || Date.now()))
  }, [products, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-products'] })
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: ['home'] })
  }

  const toggleStatus = useMutation({
    mutationFn: (p: { id: string; currentStatus?: string }) =>
      adminService().updateProduct(p.id, { status: p.currentStatus === 'active' ? 'inactive' : 'active' }),
    onSuccess: (_d, v) => {
      invalidate()
      toast.success(v.currentStatus === 'active' ? 'Product hidden' : 'Product published')
    },
    onError: (err) => toast.error('Action failed', (err as Error).message),
  })

  const duplicate = useMutation({
    mutationFn: (p: Product) =>
      adminService().createProduct({
        ...p,
        name: `${p.name} (Copy)`,
        sku: p.sku ? `${p.sku}-COPY` : undefined,
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Product duplicated', 'A copy was added to the catalogue.')
    },
    onError: (err) => toast.error('Duplication failed', (err as Error).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminService().deleteProduct(id),
    onSuccess: () => {
      invalidate()
      setDeletingProduct(null)
      toast.success('Product deleted', 'Permanently removed from catalogue.')
    },
    onError: (err) => toast.error('Deletion failed', (err as Error).message),
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
            FORMULATION OPERATIONS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight">
            Product Catalogue
          </h1>
          <p className="text-xs text-[#52636B] font-light">
            Manage formulations, pricing, inventory and storefront visibility.
          </p>
        </div>

        <Button
          asChild
          className="h-11 px-5 rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239] transition-all shadow-2xs border border-[#172126] shrink-0"
        >
          <Link to="/admin/products/new">
            <Plus className="size-4 mr-1.5" /> Add New Formulation
          </Link>
        </Button>
      </div>

      {/* KPI METRICS OPERATIONAL OVERVIEW CARDS */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">TOTAL FORMULATIONS</span>
            <Package className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">{formatNumber(kpis.total)}</p>
          <p className="text-[11px] text-[#52636B] font-light">Across current store catalogue</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">ACTIVE &amp; LIVE</span>
            <CheckCircle className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">{formatNumber(kpis.active)}</p>
          <p className="text-[11px] text-[#52636B] font-light">Visible on storefront</p>
        </div>

        <div className={cn(
          "rounded-2xl border p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)] transition-colors",
          kpis.lowStock > 0 ? "bg-[#FAF7F2] border-[#DCE6E9]" : "bg-white border-[#DCE6E9]"
        )}>
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">LOW STOCK</span>
            <AlertTriangle className={cn("size-4", kpis.lowStock > 0 ? "text-amber-600" : "text-[#7A8A91]")} />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">{formatNumber(kpis.lowStock)}</p>
          <p className="text-[11px] text-[#52636B] font-light">5 units or fewer remaining</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">UNITS SOLD</span>
            <TrendingUp className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">{formatNumber(kpis.totalSold)}</p>
          <p className="text-[11px] text-[#52636B] font-light">Across fulfilled orders</p>
        </div>
      </div>

      {/* COMPACT TOOLBAR SEARCH & STATUS FILTERS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DCE6E9] bg-white p-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A8A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search formulations, SKU, category..."
            className="h-10 w-full rounded-xl border border-[#DCE6E9] bg-[#FAF7F2]/40 pl-10 pr-9 text-xs text-[#172126] placeholder-[#7A8A91] outline-none focus:bg-white focus:border-[#167C86] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A91] hover:text-[#172126]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Live' },
            { value: 'inactive', label: 'Hidden' },
            { value: 'out-of-stock', label: 'Out of Stock' },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setStatusFilter(s.value)
                setPage(1)
              }}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border',
                statusFilter === s.value
                  ? 'bg-[#172126] text-white border-[#172126] shadow-2xs'
                  : 'bg-white text-[#52636B] border-[#DCE6E9] hover:bg-[#FAF7F2] hover:text-[#172126]'
              )}
            >
              {s.label}
            </button>
          ))}

          {(search || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ERROR STATE */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <div>
            <h3 className="font-serif text-lg font-normal text-rose-900">Unable to load product catalogue</h3>
            <p className="text-xs text-rose-700 mt-1">We couldn't retrieve the latest catalogue data from the server.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl border-rose-300 text-rose-800 bg-white hover:bg-rose-100">
            Retry
          </Button>
        </div>
      )}

      {/* SKELETON LOADING STATE */}
      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-3 shadow-2xs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#DCE6E9] last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-10 rounded-xl shrink-0 bg-[#FAF7F2]" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-48 rounded-md bg-[#FAF7F2]" />
                  <Skeleton className="h-3 w-24 rounded-md bg-[#FAF7F2]" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-4 w-16 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-4 w-16 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-5 w-16 rounded-full bg-[#FAF7F2]" />
            </div>
          ))}
        </div>
      )}

      {/* CATALOGUE DATA TABLE & EMPTY STATES */}
      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-12 text-center space-y-4 shadow-2xs">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#DCE6E9] text-[#172126]">
                <Package className="size-6 text-[#167C86]" />
              </div>
              {products && products.length === 0 ? (
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-serif text-xl font-normal text-[#172126]">No formulations yet</h3>
                  <p className="text-xs text-[#52636B] font-light leading-relaxed">
                    Create your first formulation to begin building the Bareo catalogue.
                  </p>
                  <div className="pt-2">
                    <Button asChild className="rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239] border border-[#172126]">
                      <Link to="/admin/products/new"><Plus className="size-4 mr-1.5" /> Add New Formulation</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-serif text-xl font-normal text-[#172126]">No formulations found</h3>
                  <p className="text-xs text-[#52636B] font-light leading-relaxed">
                    Try adjusting your search or filters.
                  </p>
                  <div className="pt-2">
                    <Button onClick={clearFilters} variant="outline" className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2]">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#DCE6E9] bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5">Sold</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6E9]">
                    {paged.map((p) => {
                      const currentStatus = p.status || 'active'
                      const stockVal = p.stock ?? 0
                      const soldVal = p.soldCount ?? 0
                      const imageUrl = (typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url) || '/images/products/bareo-cica-serum.png'
                      const offerPrice = p.offerPrice ?? p.price ?? 0
                      const mrp = p.mrp ?? p.price ?? 0

                      return (
                        <tr key={p.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                          {/* PRODUCT COLUMN */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <SmartImage
                                src={imageUrl}
                                alt={p.name}
                                className="size-10 rounded-xl object-contain bg-[#FAF7F2] border border-[#DCE6E9] p-1 shrink-0"
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/product/${p.slug}`}
                                  className="line-clamp-1 font-semibold text-[#172126] hover:text-[#167C86] hover:underline"
                                >
                                  {p.name}
                                </Link>
                                <p className="text-[10px] text-[#7A8A91] font-mono">
                                  {p.brand || 'BAREO'}
                                  {p.sku ? <span className="text-[#7A8A91] ml-1">· SKU: {p.sku}</span> : null}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY COLUMN */}
                          <td className="px-4 py-3.5 text-[#52636B] font-medium text-[12px]">
                            {p.categoryName || 'Skincare'}
                          </td>

                          {/* PRICE COLUMN */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-serif font-bold text-[#172126]">
                                {formatINR(offerPrice)}
                              </span>
                              {mrp > offerPrice && (
                                <span className="text-[10px] text-[#7A8A91] line-through font-normal">
                                  {formatINR(mrp)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STOCK COLUMN */}
                          <td className="px-4 py-3.5">
                            {stockVal <= 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                                0 units <span className="font-normal">(Out of stock)</span>
                              </span>
                            ) : stockVal <= 3 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                                {stockVal} units <span className="font-normal">(Critical)</span>
                              </span>
                            ) : stockVal <= 8 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F2] border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                                {stockVal} units <span className="font-normal">(Low stock)</span>
                              </span>
                            ) : (
                              <span className="font-medium text-[#172126]">
                                {stockVal} units
                              </span>
                            )}
                          </td>

                          {/* SOLD COLUMN */}
                          <td className="px-4 py-3.5 font-serif font-bold text-[#172126]">
                            {soldVal}
                          </td>

                          {/* STATUS COLUMN */}
                          <td className="px-4 py-3.5">
                            {currentStatus === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#167C86]/30 bg-[#EDF6F8] px-2.5 py-0.5 text-[10px] font-bold text-[#167C86] uppercase tracking-wider">
                                <span className="size-1.5 rounded-full bg-[#167C86]" /> Live
                              </span>
                            ) : currentStatus === 'out-of-stock' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                                <span className="size-1.5 rounded-full bg-rose-600" /> Out of Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE6E9] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-medium text-[#52636B] uppercase tracking-wider">
                                <span className="size-1.5 rounded-full bg-[#7A8A91]" /> Hidden
                              </span>
                            )}
                          </td>

                          {/* ACTIONS MENU */}
                          <td className="px-5 py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-[#52636B] hover:bg-[#FAF7F2] hover:text-[#172126]"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-xl border-[#DCE6E9] text-xs">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/admin/products/${p.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="size-3.5 mr-2 text-[#7A8A91]" /> Edit formulation
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => toggleStatus.mutate({ id: p.id, currentStatus })}
                                  className="cursor-pointer"
                                >
                                  {currentStatus === 'active' ? (
                                    <>
                                      <EyeOff className="size-3.5 mr-2 text-[#7A8A91]" /> Hide from storefront
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="size-3.5 mr-2 text-[#167C86]" /> Publish formulation
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => duplicate.mutate(p)}
                                  className="cursor-pointer"
                                >
                                  <Copy className="size-3.5 mr-2 text-[#7A8A91]" /> Duplicate product
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => setDeletingProduct(p)}
                                  className="cursor-pointer text-rose-600 focus:text-rose-600"
                                >
                                  <Trash2 className="size-3.5 mr-2 text-rose-600" /> Delete formulation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-[#DCE6E9] bg-[#FAF7F2]/40">
                  <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AppModal
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Delete formulation?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-[#52636B] leading-relaxed">
            This action will permanently remove <strong className="font-semibold text-[#172126]">{deletingProduct?.name}</strong> from the store catalogue.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => deletingProduct && remove.mutate(deletingProduct.id)}
              loading={remove.isPending}
              className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Delete Formulation
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
