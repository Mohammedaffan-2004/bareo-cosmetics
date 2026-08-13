import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, UserSearch, AlertCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Pagination } from '@/components/common/Pagination'
import { formatDate, formatINR, formatNumber, timeAgo } from '@/utils'
import { avatarImage } from '@/utils/images'

const PAGE_SIZE = 8

export function AdminCustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const {
    data: customers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminService().getCustomers(),
  })

  // KPI Computations
  const kpis = useMemo(() => {
    if (!customers) return { total: 0, totalLtv: 0, avgOrders: '0.0', aov: 0 }
    const total = customers.length
    const totalLtv = customers.reduce((acc, c) => acc + (c.lifetimeValue || 0), 0)
    const totalOrdersCount = customers.reduce((acc, c) => acc + (c.orders || 0), 0)
    const avgOrders = total > 0 ? (totalOrdersCount / total).toFixed(1) : '0.0'
    const aov = totalOrdersCount > 0 ? Math.round(totalLtv / totalOrdersCount) : 0
    return { total, totalLtv, avgOrders, aov }
  }, [customers])

  const filtered = (customers ?? []).filter((c) => {
    const q = search.trim().toLowerCase()
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs text-[#6B7280] font-light mt-1">
          Monitor customer relationships, order history and lifetime value.
        </p>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            REGISTERED CUSTOMERS
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {formatNumber(kpis.total)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Verified user profiles</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            TOTAL LIFETIME VALUE
          </span>
          <p className="font-serif text-2xl font-normal text-[#111111]">
            {formatINR(kpis.totalLtv)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Accumulated customer spend</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AVG ORDERS / CUSTOMER
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {kpis.avgOrders}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Repeat purchase frequency</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AVERAGE ORDER VALUE
          </span>
          <p className="font-serif text-2xl font-normal text-[#111111]">
            {formatINR(kpis.aov)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Mean revenue per checkout</p>
        </div>
      </div>

      {/* 3. TOOLBAR SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search customer by name, email address or phone..."
          className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-xs text-[#111111] placeholder-[#9CA3AF] outline-none focus:border-[#111111] transition-all shadow-2xs"
        />
      </div>

      {/* 4. CUSTOMERS DATA TABLE / STATES */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">Failed to load customer directory</p>
          <p className="text-xs text-rose-700">{(error as Error)?.message || 'Server error occurred'}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
          </Button>
        </div>
      ) : paged.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center space-y-3">
          <UserSearch className="size-8 text-[#9CA3AF] mx-auto" />
          <p className="font-serif text-base font-semibold text-[#111111]">No customers found</p>
          <p className="text-xs text-[#6B7280]">
            No customer accounts match your search parameters.
          </p>
          {search && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearch('')}
              className="rounded-xl border-[#E5E7EB] text-xs text-[#111111]"
            >
              Reset Search
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAF7F2] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3.5">Customer Profile</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Lifetime Value (LTV)</th>
                  <th className="px-4 py-3.5">Last Order</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paged.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                    {/* CUSTOMER PROFILE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-[#E5E7EB] bg-[#FAFAFA]">
                          <AvatarImage src={avatarImage(c.name.length + (c.orders || 0), '#111111')} />
                          <AvatarFallback className="bg-[#FAF7F2] font-semibold text-[#111111]">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/customers/${c.id}`)}
                            className="font-semibold text-[#111111] hover:underline block text-left"
                          >
                            {c.name}
                          </button>
                          <p className="truncate text-[11px] text-[#6B7280] font-light">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ORDERS */}
                    <td className="px-4 py-4 font-mono font-medium text-[#111111]">
                      {c.orders || 0} order{(c.orders || 0) !== 1 ? 's' : ''}
                    </td>

                    {/* LTV */}
                    <td className="px-4 py-4 font-mono font-bold text-[#111111]">
                      {formatINR(c.lifetimeValue || 0)}
                    </td>

                    {/* LAST ORDER */}
                    <td className="px-4 py-4 text-[11px] text-[#6B7280]">
                      {c.lastOrder ? timeAgo(c.lastOrder) : '—'}
                    </td>

                    {/* JOINED DATE */}
                    <td className="px-4 py-4 text-[11px] text-[#6B7280] whitespace-nowrap">
                      {c.joinedAt ? formatDate(c.joinedAt) : 'N/A'}
                    </td>

                    {/* ACTION LINK */}
                    <td className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                        className="rounded-xl text-xs font-medium text-[#111111] hover:bg-[#FAF7F2] hover:text-[#000000]"
                      >
                        View profile <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

