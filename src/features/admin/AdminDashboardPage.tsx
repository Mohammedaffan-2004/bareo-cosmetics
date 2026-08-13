import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag,
  Package,
  TicketPercent,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatINR, formatDate, cn } from '@/utils'
import type { DashboardOverviewData } from '@/types'

function getOrderStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
    case 'shipped':
      return 'bg-sky-50 text-sky-900 border-sky-200/80'
    case 'confirmed':
      return 'bg-amber-50 text-amber-900 border-amber-200/80'
    case 'cancelled':
      return 'bg-rose-50 text-rose-900 border-rose-200/80'
    default:
      return 'bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB]'
  }
}

export function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DashboardOverviewData>({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => adminService().getDashboard(),
  })

  // Format dynamic browser date
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-12 w-64 rounded-xl bg-[#FAFAFA]" />
          <Skeleton className="h-8 w-36 rounded-xl bg-[#FAFAFA]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-2xl bg-[#FAFAFA]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl bg-[#FAFAFA]" />
          <Skeleton className="h-80 rounded-2xl bg-[#FAFAFA]" />
        </div>
      </div>
    )
  }

  // 2. ERROR STATE
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="size-10 text-rose-600 mx-auto" />
        <div>
          <p className="font-serif text-lg font-semibold text-rose-900">Unable to load overview</p>
          <p className="text-xs text-rose-700 font-light mt-1">
            {(error as Error)?.message || 'Failed to connect to backend service.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-rose-900 text-white text-xs px-5 h-10 hover:bg-rose-950"
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
        </Button>
      </div>
    )
  }

  const { summary, attention, recentOrders, recentCustomers } = data

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase block">
            OVERVIEW
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-0.5">
            Overview
          </h1>
          <p className="text-xs text-[#6B7280] font-light mt-1">
            Business performance and operational activity at a glance.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs text-[#6B7280] font-medium shadow-2xs self-start sm:self-auto">
          <Calendar className="size-3.5 text-[#111111]" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* 2. 4 PRIMARY KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* REVENUE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            REVENUE
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {formatINR(summary.revenue)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">Paid orders</p>
        </div>

        {/* ORDERS */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            ORDERS
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {summary.orders.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">Valid orders</p>
        </div>

        {/* CUSTOMERS */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            CUSTOMERS
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {summary.customers.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">Registered accounts</p>
        </div>

        {/* AVERAGE ORDER VALUE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AVERAGE ORDER VALUE
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {formatINR(summary.averageOrderValue)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">Per valid order</p>
        </div>
      </div>

      {/* 3. ACTION CENTER ("ATTENTION REQUIRED") */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#111111] tracking-wider uppercase flex items-center gap-2">
          <Clock className="size-3.5 text-[#111111]" /> Attention Required
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* ORDERS TO FULFILL */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/80 p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-800">
                <ShoppingBag className="size-4 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">ORDERS TO FULFILL</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#111111]">
                {attention.awaitingFulfillment > 0
                  ? `${attention.awaitingFulfillment} ${
                      attention.awaitingFulfillment === 1 ? 'order' : 'orders'
                    } awaiting packing`
                  : 'All orders are up to date.'}
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 self-start"
            >
              View orders <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {/* LOW STOCK */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#374151]">
                <Package className="size-4 shrink-0 text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">LOW STOCK</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#111111]">
                {attention.lowStock > 0
                  ? `${attention.lowStock} ${
                      attention.lowStock === 1 ? 'formulation needs' : 'formulations need'
                    } attention`
                  : 'Inventory is healthy.'}
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 self-start"
            >
              View inventory <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {/* ACTIVE COUPONS */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#374151]">
                <TicketPercent className="size-4 shrink-0 text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">ACTIVE COUPONS</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#111111]">
                {attention.activeCoupons > 0
                  ? `${attention.activeCoupons} ${
                      attention.activeCoupons === 1 ? 'promotion live' : 'promotions live'
                    }`
                  : 'No active promotions.'}
              </p>
            </div>
            <Link
              to="/admin/offers"
              className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 self-start"
            >
              Manage promotions <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY GRID (RECENT ORDERS & RECENT CUSTOMERS) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RECENT ORDERS TABLE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#111111]">Recent Orders</h3>
              <p className="text-[11px] text-[#6B7280] font-light">Latest purchase transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-0.5">
              View all orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280] font-light">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    <th className="py-2.5 pr-2">Order</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Total</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                      <td className="py-3 pr-2 font-mono font-bold text-[#111111]">
                        {o.orderId}
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-[#111111] block line-clamp-1">
                          {o.customerName}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] block line-clamp-1">
                          {o.customerEmail}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono font-semibold text-[#111111]">
                        {formatINR(o.total)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                            getOrderStatusBadge(o.status)
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Link
                          to={`/admin/orders/${o.orderId}`}
                          className="font-semibold text-[#111111] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT CUSTOMERS TABLE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#111111]">Recent Customers</h3>
              <p className="text-[11px] text-[#6B7280] font-light">Newly registered customer accounts</p>
            </div>
            <Link to="/admin/customers" className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-0.5">
              View all customers →
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280] font-light">
              No registered customers yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    <th className="py-2.5 pr-2">Customer</th>
                    <th className="py-2.5 px-2">Joined</th>
                    <th className="py-2.5 px-2">Orders</th>
                    <th className="py-2.5 px-2">LTV</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {recentCustomers.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                      <td className="py-3 pr-2">
                        <span className="font-medium text-[#111111] block line-clamp-1">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] block line-clamp-1">
                          {c.email}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[11px] text-[#6B7280] whitespace-nowrap">
                        {formatDate(c.joinedAt)}
                      </td>
                      <td className="py-3 px-2 font-mono font-medium text-[#111111]">
                        {c.ordersCount}
                      </td>
                      <td className="py-3 px-2 font-serif font-semibold text-[#111111]">
                        {formatINR(c.lifetimeValue)}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Link
                          to={`/admin/customers/${c.id}`}
                          className="font-semibold text-[#111111] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

