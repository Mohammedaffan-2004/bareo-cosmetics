import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, PackageSearch, AlertCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
import type { OrderStatus } from '@/types'
import { formatINR, formatNumber, timeAgo, formatDate, cn } from '@/utils'

const PAGE_SIZE = 8

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

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
        className: 'bg-sky-50 text-sky-900 border-sky-200/80',
        dot: 'bg-sky-500',
      }
    case 'packed':
      return {
        label: 'Processing',
        className: 'bg-amber-50 text-amber-900 border-amber-200/80',
        dot: 'bg-amber-500',
      }
    case 'confirmed':
      return {
        label: 'Confirmed',
        className: 'bg-[#FAF7F2] text-[#111111] border-[#E5E7EB]',
        dot: 'bg-[#111111]',
      }
    case 'cancelled':
    case 'refunded':
      return {
        label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
        className: 'bg-rose-50 text-rose-900 border-rose-200/80',
        dot: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        className: 'bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB]',
        dot: 'bg-[#9CA3AF]',
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

  // KPI & Live Tab Counts Computations
  const { kpis, counts } = useMemo(() => {
    if (!orders) {
      return {
        kpis: { totalRevenue: 0, totalOrders: 0, pending: 0, aov: 0 },
        counts: { all: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 },
      }
    }

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0)
    const pending = orders.filter((o) => ['pending', 'confirmed', 'packed'].includes(o.status)).length
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

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
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
          Orders & Fulfillment
        </h1>
        <p className="text-xs text-[#6B7280] font-light mt-1">
          Manage customer orders, payments and delivery status.
        </p>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            TOTAL ORDERS
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {formatNumber(kpis.totalOrders)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Lifetime completed orders</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            TOTAL REVENUE
          </span>
          <p className="font-serif text-2xl font-normal text-[#111111]">
            {formatINR(kpis.totalRevenue)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Processed transaction volume</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AWAITING FULFILLMENT
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {formatNumber(kpis.pending)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Confirmed or processing</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AVERAGE ORDER VALUE
          </span>
          <p className="font-serif text-2xl font-normal text-[#111111]">
            {formatINR(kpis.aov)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Net checkout average</p>
        </div>
      </div>

      {/* 3. STATUS FILTER TABS & SEARCH TOOLBAR */}
      <div className="space-y-4">
        {/* Horizontal Segmented Tabs with Live Counts */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#E5E7EB]">
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
                  'shrink-0 flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-xs transition-all duration-200 min-h-[40px]',
                  isActive
                    ? 'border-[#111111] bg-white font-semibold text-[#111111]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111111]'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-mono font-medium',
                    isActive ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] text-[#6B7280] border border-[#E5E7EB]'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Field */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search order ID, customer name, email or phone..."
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-xs text-[#111111] placeholder-[#9CA3AF] outline-none focus:border-[#111111] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. ORDERS DATA TABLE / STATES */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">Failed to load orders</p>
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
          <PackageSearch className="size-8 text-[#9CA3AF] mx-auto" />
          <p className="font-serif text-base font-semibold text-[#111111]">No matching orders found</p>
          <p className="text-xs text-[#6B7280]">
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
              className="rounded-xl border-[#E5E7EB] text-xs text-[#111111]"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAF7F2] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
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
              <tbody className="divide-y divide-[#E5E7EB]">
                {paged.map((o) => {
                  const badge = getStatusBadge(o.status)

                  return (
                    <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                      {/* ORDER ID */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                          className="font-mono font-bold text-[#111111] hover:underline block text-left"
                        >
                          {o.orderId}
                        </button>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#111111]">
                          {o.address?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-[#6B7280] font-light truncate max-w-[180px]">
                          {o.address?.email || o.address?.city || 'N/A'}
                        </p>
                      </td>

                      {/* ITEMS */}
                      <td className="px-4 py-4 text-[#374151] font-medium">
                        {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                      </td>

                      {/* TOTAL */}
                      <td className="px-4 py-4 font-mono font-semibold text-[#111111]">
                        {formatINR(o.total)}
                      </td>

                      {/* PAYMENT */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : 'bg-[#FAF7F2] text-[#111111] border-[#E5E7EB]'
                          )}
                        >
                          {o.paymentStatus || 'pending'}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                            badge.className
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full', badge.dot)} />
                          {badge.label}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-4 text-[11px] text-[#6B7280] whitespace-nowrap">
                        {timeAgo(o.placedAt)}
                      </td>

                      {/* ACTION: SINGLE CLEAN ACTION LINK */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                          className="rounded-xl text-xs font-medium text-[#111111] hover:bg-[#FAF7F2] hover:text-[#000000]"
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
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

