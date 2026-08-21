import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, PackageSearch, AlertCircle, RefreshCw, ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
import { formatINR, formatNumber, timeAgo, cn } from '@/utils'

const PAGE_SIZE = 8

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

function getInitials(name?: string) {
  if (!name || !name.trim()) return 'BC'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
        dot: 'bg-emerald-600',
      }
    case 'shipped':
    case 'out-for-delivery':
      return {
        label: status === 'out-for-delivery' ? 'Out for Delivery' : 'Shipped',
        className: 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30',
        dot: 'bg-[#167C86]',
      }
    case 'packed':
      return {
        label: 'Processing',
        className: 'bg-amber-50 text-amber-900 border-amber-200/80',
        dot: 'bg-amber-600',
      }
    case 'confirmed':
      return {
        label: 'Confirmed',
        className: 'bg-[#FAF7F2] text-[#172126] border-[#DCE6E9]',
        dot: 'bg-[#172126]',
      }
    case 'cancelled':
    case 'refunded':
      return {
        label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
        className: 'bg-rose-50 text-rose-900 border-rose-200/80',
        dot: 'bg-rose-600',
      }
    default:
      return {
        label: status,
        className: 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]',
        dot: 'bg-[#7A8A91]',
      }
  }
}

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminService().getAdminOrders(),
  })

  // KPI & Live Tab Counts Computations (FIX: Net Revenue excludes cancelled orders to align with Overview dashboard)
  const { kpis, counts } = useMemo(() => {
    if (!orders) {
      return {
        kpis: { totalRevenue: 0, totalOrders: 0, pending: 0, aov: 0 },
        counts: { all: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 },
      }
    }

    const totalOrders = orders.length
    // Exclude cancelled & refunded orders for Net Revenue
    const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    const totalRevenue = validOrders.reduce((acc, o) => acc + (o.total || 0), 0)
    const pending = orders.filter((o) => ['pending', 'confirmed', 'packed'].includes(o.status)).length
    const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0

    const counts = {
      all: totalOrders,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      packed: orders.filter((o) => o.status === 'packed').length,
      shipped: orders.filter((o) => ['shipped', 'out-for-delivery'].includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => ['cancelled', 'refunded'].includes(o.status)).length,
    }

    return {
      kpis: { totalRevenue, totalOrders, pending, aov },
      counts,
    }
  }, [orders])

  const filtered = (orders ?? [])
    .filter((o) => {
      let matchesStatus = true
      if (statusFilter === 'confirmed') matchesStatus = o.status === 'confirmed'
      else if (statusFilter === 'packed') matchesStatus = o.status === 'packed'
      else if (statusFilter === 'shipped') matchesStatus = ['shipped', 'out-for-delivery'].includes(o.status)
      else if (statusFilter === 'delivered') matchesStatus = o.status === 'delivered'
      else if (statusFilter === 'cancelled') matchesStatus = ['cancelled', 'refunded'].includes(o.status)

      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        (o.address?.fullName || '').toLowerCase().includes(q) ||
        (o.address?.phone || '').includes(q) ||
        (o.address?.email || '').toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
          FULFILLMENT OPERATIONS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight">
          Orders &amp; Fulfillment
        </h1>
        <p className="text-xs text-[#52636B] font-light">
          Manage customer orders, payments and delivery status.
        </p>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">TOTAL ORDERS</span>
            <ShoppingBag className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatNumber(kpis.totalOrders)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Completed / active order context</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">NET REVENUE</span>
            <DollarSign className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatINR(kpis.totalRevenue)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Valid paid-order volume</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">AWAITING FULFILLMENT</span>
            <Clock className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatNumber(kpis.pending)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Confirmed or processing</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between text-[#7A8A91]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">AVERAGE ORDER VALUE</span>
            <TrendingUp className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {formatINR(kpis.aov)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Net checkout average</p>
        </div>
      </div>

      {/* 3. STATUS FILTER TABS & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DCE6E9] bg-white p-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
        {/* Search Field */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A8A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search order ID, customer name, email or phone..."
            className="h-10 w-full rounded-xl border border-[#DCE6E9] bg-[#FAF7F2]/40 pl-10 pr-4 text-xs text-[#172126] placeholder-[#7A8A91] outline-none focus:bg-white focus:border-[#167C86] transition-all"
          />
        </div>

        {/* Horizontal Segmented Operational Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TABS.map((tab) => {
            const count = (counts as any)[tab.key] ?? 0
            const isActive = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key)
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

      {/* 4. ORDERS DATA TABLE / REGISTER */}
      {isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-3 shadow-2xs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#DCE6E9] last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-8 rounded-full shrink-0 bg-[#FAF7F2]" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-48 rounded-md bg-[#FAF7F2]" />
                  <Skeleton className="h-3 w-24 rounded-md bg-[#FAF7F2]" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-4 w-16 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-5 w-16 rounded-full bg-[#FAF7F2]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">Failed to load order register</p>
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
          <PackageSearch className="size-8 text-[#167C86] mx-auto" />
          <p className="font-serif text-base font-normal text-[#172126]">No matching orders found</p>
          <p className="text-xs text-[#52636B] font-light">
            No customer orders match your selected status filter or search parameters.
          </p>
          {(search || statusFilter !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
              className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2]"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE6E9] bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Items</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6E9]">
                {paged.map((o) => {
                  const badge = getStatusBadge(o.status)
                  const custName = o.address?.fullName || 'Customer'

                  return (
                    <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                      {/* ORDER ID */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                          className="font-mono font-bold text-[#172126] hover:text-[#167C86] hover:underline block text-left"
                        >
                          {o.orderId}
                        </button>
                      </td>

                      {/* CUSTOMER CELL WITH INITIALS AVATAR */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-[10px] text-[#172126] shrink-0">
                            {getInitials(custName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#172126] line-clamp-1">
                              {custName}
                            </p>
                            <p className="text-[11px] text-[#7A8A91] font-light truncate max-w-[180px]">
                              {o.address?.email || o.address?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ITEMS */}
                      <td className="px-4 py-4 text-[#52636B] font-medium text-[12px]">
                        {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                      </td>

                      {/* TOTAL */}
                      <td className="px-4 py-4 font-serif font-bold text-[#172126]">
                        {formatINR(o.total)}
                      </td>

                      {/* PAYMENT */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            o.paymentStatus === 'paid'
                              ? 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'
                              : 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]'
                          )}
                        >
                          {o.paymentStatus || 'pending'}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            badge.className
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full', badge.dot)} />
                          {badge.label}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-4 text-[11px] text-[#7A8A91] whitespace-nowrap font-light">
                        {timeAgo(o.placedAt)}
                      </td>

                      {/* ACTION LINK */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                          className="rounded-xl text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] hover:text-[#167C86]"
                        >
                          View details <ArrowRight className="size-3.5 ml-1" />
                        </Button>
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
    </div>
  )
}

