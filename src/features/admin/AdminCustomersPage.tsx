import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, UserSearch, AlertCircle, RefreshCw, Users, DollarSign, ShoppingBag, Award } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
import { formatDate, formatINR, formatNumber, timeAgo, cn } from '@/utils'

const PAGE_SIZE = 8

const SEGMENT_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Customers' },
  { key: 'active', label: 'Active Buyers' },
  { key: 'high-value', label: 'High Value' },
  { key: 'new', label: 'New Members' },
]

function getInitials(name?: string) {
  if (!name || !name.trim()) return 'BC'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AdminCustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
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

  // KPI Computations & Segment Live Counts
  const { kpis, segmentCounts } = useMemo(() => {
    if (!customers) {
      return {
        kpis: { total: 0, totalLtv: 0, avgOrders: '0.0', aov: 0 },
        segmentCounts: { all: 0, active: 0, 'high-value': 0, new: 0 },
      }
    }

    const total = customers.length
    // Server LTV is now strictly valid net orders (excluding cancelled/refunded)
    const totalLtv = customers.reduce((acc, c) => acc + (c.lifetimeValue || 0), 0)
    const totalOrdersCount = customers.reduce((acc, c) => acc + (c.orders || 0), 0)
    const avgOrders = total > 0 ? (totalOrdersCount / total).toFixed(1) : '0.0'
    const aov = totalOrdersCount > 0 ? Math.round(totalLtv / totalOrdersCount) : 0

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const segmentCounts = {
      all: total,
      active: customers.filter((c) => (c.orders || 0) > 0 && (c.lifetimeValue || 0) > 0).length,
      'high-value': customers.filter((c) => (c.lifetimeValue || 0) >= 2000).length,
      new: customers.filter((c) => {
        if (!c.joinedAt) return false
        return new Date(c.joinedAt) >= thirtyDaysAgo || (c.orders || 0) === 0
      }).length,
    }

    return {
      kpis: { total, totalLtv, avgOrders, aov },
      segmentCounts,
    }
  }, [customers])

  // Filtered dataset matching search query & segment filter
  const filtered = (customers ?? []).filter((c) => {
    // Segment Filter Logic
    let matchesSegment = true
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (segmentFilter === 'active') {
      matchesSegment = (c.orders || 0) > 0 && (c.lifetimeValue || 0) > 0
    } else if (segmentFilter === 'high-value') {
      matchesSegment = (c.lifetimeValue || 0) >= 2000
    } else if (segmentFilter === 'new') {
      matchesSegment = c.joinedAt ? new Date(c.joinedAt) >= thirtyDaysAgo || (c.orders || 0) === 0 : false
    }

    // Search Query Logic
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').includes(q)

    return matchesSegment && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
          CUSTOMER DIRECTORY
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight">
          Customer Register
        </h1>
        <p className="text-xs text-[#52636B] font-light">
          Monitor customer relationships, order history and lifetime value.
        </p>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">REGISTERED CUSTOMERS</span>
            <Users className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatNumber(kpis.total)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Verified user profiles</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">NET LIFETIME VALUE</span>
            <DollarSign className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatINR(kpis.totalLtv)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Valid net customer spend</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">AVG ORDERS / CUSTOMER</span>
            <ShoppingBag className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {kpis.avgOrders}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Repeat purchase frequency</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">AVERAGE ORDER VALUE</span>
            <Award className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatINR(kpis.aov)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Mean revenue per checkout</p>
        </div>
      </div>

      {/* 3. SEGMENT FILTERS & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DCE6E9] bg-white p-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A8A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search customer by name, email address or phone..."
            className="h-10 w-full rounded-xl border border-[#DCE6E9] bg-[#FAF7F2]/40 pl-10 pr-4 text-xs text-[#172126] placeholder-[#7A8A91] outline-none focus:bg-white focus:border-[#167C86] transition-all"
          />
        </div>

        {/* Customer Segment Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SEGMENT_TABS.map((tab) => {
            const count = (segmentCounts as any)[tab.key] ?? 0
            const isActive = segmentFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSegmentFilter(tab.key)
                  setPage(1)
                }}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border flex items-center gap-1.5',
                  isActive
                    ? 'bg-[#172126] text-white border-[#172126] shadow-2xs'
                    : 'bg-white text-[#52636B] border-[#DCE6E9] hover:bg-[#FAF7F2] hover:text-[#172126]'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.2 text-[10px] font-mono font-medium',
                    isActive ? 'bg-[#167C86] text-white' : 'bg-[#FAF7F2] text-[#7A8A91] border border-[#DCE6E9]'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. CUSTOMERS DATA TABLE / REGISTER */}
      {isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-3 shadow-2xs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#DCE6E9] last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-9 rounded-full shrink-0 bg-[#FAF7F2]" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-44 rounded-md bg-[#FAF7F2]" />
                  <Skeleton className="h-3 w-28 rounded-md bg-[#FAF7F2]" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-4 w-20 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-4 w-20 rounded-md bg-[#FAF7F2]" />
            </div>
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
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-12 text-center space-y-3 shadow-2xs">
          <UserSearch className="size-8 text-[#167C86] mx-auto" />
          <p className="font-serif text-base font-normal text-[#172126]">No customers match this view</p>
          <p className="text-xs text-[#52636B] font-light">
            No customer accounts match your active search or selected segment filter. Try another search or segment.
          </p>
          {(search || segmentFilter !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSegmentFilter('all')
              }}
              className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2]"
            >
              Reset Search &amp; Segments
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE6E9] bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                  <th className="px-5 py-3.5">Customer Profile</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Lifetime Value</th>
                  <th className="px-4 py-3.5">Last Order</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6E9]">
                {paged.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                    {/* CUSTOMER PROFILE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-xs text-[#172126] shrink-0">
                          {getInitials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/customers/${c.id}`)}
                            className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline block text-left"
                          >
                            {c.name}
                          </button>
                          <p className="truncate text-[11px] text-[#7A8A91] font-light">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ORDERS */}
                    <td className="px-4 py-4 font-mono font-semibold text-[#172126]">
                      {c.orders || 0} order{(c.orders || 0) !== 1 ? 's' : ''}
                    </td>

                    {/* LIFETIME VALUE */}
                    <td className="px-4 py-4 font-serif font-bold text-[#172126]">
                      {formatINR(c.lifetimeValue || 0)}
                    </td>

                    {/* LAST ORDER */}
                    <td className="px-4 py-4 text-[11px] text-[#7A8A91] font-light">
                      {c.lastOrder ? timeAgo(c.lastOrder) : '—'}
                    </td>

                    {/* JOINED DATE */}
                    <td className="px-4 py-4 text-[11px] text-[#7A8A91] whitespace-nowrap font-light">
                      {c.joinedAt ? formatDate(c.joinedAt) : 'N/A'}
                    </td>

                    {/* ACTION LINK */}
                    <td className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                        className="rounded-xl text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] hover:text-[#167C86]"
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
            <div className="p-4 border-t border-[#DCE6E9] bg-[#FAF7F2]/40">
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

