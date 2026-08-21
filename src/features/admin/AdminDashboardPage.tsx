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
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatINR, formatDate, cn } from '@/utils'
import type { DashboardOverviewData } from '@/types'

function getOrderStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30 font-bold'
    case 'shipped':
      return 'bg-sky-50 text-sky-900 border-sky-200/80 font-bold'
    case 'confirmed':
      return 'bg-[#FAF7F2] text-amber-900 border-amber-300/80 font-bold'
    case 'cancelled':
      return 'bg-rose-50 text-rose-800 border-rose-200/80 font-bold'
    default:
      return 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]'
  }
}

function getInitials(name: string): string {
  if (!name) return 'BC'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
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
  }).toUpperCase()

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-12 w-64 rounded-xl bg-white" />
          <Skeleton className="h-8 w-36 rounded-xl bg-white" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-white" />
          ))}
        </div>
        <Skeleton className="h-28 rounded-2xl bg-white" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl bg-white" />
          <Skeleton className="h-80 rounded-2xl bg-white" />
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
      {/* 1. EXECUTIVE PAGE INTRODUCTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
            EXECUTIVE OVERVIEW
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight mt-0.5">
            Business performance & operational intelligence
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#DCE6E9] bg-[#FAF7F2] px-3.5 py-1.5 text-xs text-[#52636B] font-medium shadow-2xs self-start sm:self-auto">
          <Calendar className="size-3.5 text-[#167C86]" />
          <span className="font-mono text-[11px] font-semibold text-[#172126]">TODAY · {currentDateFormatted}</span>
        </div>
      </div>

      {/* 2. PRIMARY KPI METRIC CARDS — HERO REVENUE COMPOSITION */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* HERO REVENUE METRIC */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-2 shadow-[0_4px_12px_rgba(23,33,38,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86]">
              NET REVENUE
            </span>
            <TrendingUp className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#172126] tracking-tight">
            {formatINR(summary.revenue)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light pt-0.5">Paid orders across store operations</p>
        </div>

        {/* ORDERS METRIC */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-2 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">
            VALID ORDERS
          </span>
          <p className="font-serif text-3xl font-bold text-[#172126] tracking-tight">
            {summary.orders.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#52636B] font-light pt-0.5">Total processed purchases</p>
        </div>

        {/* CUSTOMERS METRIC */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-2 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">
            REGISTERED CUSTOMERS
          </span>
          <p className="font-serif text-3xl font-bold text-[#172126] tracking-tight">
            {summary.customers.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#52636B] font-light pt-0.5">Bareo customer accounts</p>
        </div>

        {/* AVERAGE ORDER VALUE */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-2 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">
            AVG ORDER VALUE
          </span>
          <p className="font-serif text-3xl font-bold text-[#172126] tracking-tight">
            {formatINR(summary.averageOrderValue)}
          </p>
          <p className="text-[11px] text-[#52636B] font-light pt-0.5">Average checkout total</p>
        </div>
      </div>

      {/* 3. EXECUTIVE BRIEFING SNAPSHOT STRIP */}
      <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-[#167C86]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86]">
            EXECUTIVE SNAPSHOT BRIEFING
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DCE6E9]">
          <div className="pt-2 sm:pt-0 sm:pr-4 space-y-0.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#7A8A91]">FULFILMENT STATUS</span>
            <p className="font-serif text-base font-semibold text-[#172126]">
              {attention.awaitingFulfillment > 0
                ? `${attention.awaitingFulfillment} ${attention.awaitingFulfillment === 1 ? 'order' : 'orders'} awaiting dispatch`
                : 'Fulfilment pipeline clear'}
            </p>
          </div>

          <div className="pt-3 sm:pt-0 sm:px-4 space-y-0.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#7A8A91]">INVENTORY HEALTH</span>
            <p className="font-serif text-base font-semibold text-[#172126]">
              {attention.lowStock > 0
                ? `${attention.lowStock} ${attention.lowStock === 1 ? 'formulation requires' : 'formulations require'} restock`
                : 'All formulation stocks healthy'}
            </p>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4 space-y-0.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#7A8A91]">PROMOTIONS</span>
            <p className="font-serif text-base font-semibold text-[#172126]">
              {attention.activeCoupons > 0
                ? `${attention.activeCoupons} active discount ${attention.activeCoupons === 1 ? 'code' : 'codes'} live`
                : 'No active promotional codes'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S ACTION REQUIRED CENTER */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#172126] tracking-widest uppercase flex items-center gap-2">
          <Clock className="size-3.5 text-[#167C86]" /> Action Required
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* ORDERS TO FULFILL */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900">
                <ShoppingBag className="size-4 shrink-0 text-[#167C86]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86]">ORDERS TO FULFILL</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#172126]">
                {attention.awaitingFulfillment > 0
                  ? `${attention.awaitingFulfillment} ${
                      attention.awaitingFulfillment === 1 ? 'order' : 'orders'
                    } awaiting packing`
                  : 'All orders up to date.'}
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#172126] hover:text-[#167C86] hover:underline flex items-center gap-1 self-start"
            >
              View orders <ChevronRight className="size-3.5 text-[#167C86]" />
            </Link>
          </div>

          {/* LOW STOCK */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#52636B]">
                <Package className="size-4 shrink-0 text-[#167C86]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">LOW STOCK</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#172126]">
                {attention.lowStock > 0
                  ? `${attention.lowStock} ${
                      attention.lowStock === 1 ? 'formulation needs' : 'formulations need'
                    } attention`
                  : 'Inventory is healthy.'}
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#172126] hover:text-[#167C86] hover:underline flex items-center gap-1 self-start"
            >
              View inventory <ChevronRight className="size-3.5 text-[#167C86]" />
            </Link>
          </div>

          {/* ACTIVE COUPONS */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#52636B]">
                <TicketPercent className="size-4 shrink-0 text-[#167C86]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">ACTIVE COUPONS</span>
              </div>
              <p className="font-serif text-lg font-semibold text-[#172126]">
                {attention.activeCoupons > 0
                  ? `${attention.activeCoupons} ${
                      attention.activeCoupons === 1 ? 'promotion live' : 'promotions live'
                    }`
                  : 'No active promotions.'}
              </p>
            </div>
            <Link
              to="/admin/offers"
              className="text-xs font-semibold text-[#172126] hover:text-[#167C86] hover:underline flex items-center gap-1 self-start"
            >
              Manage promotions <ChevronRight className="size-3.5 text-[#167C86]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY GRID (RECENT ORDERS & RECENT CUSTOMERS) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RECENT ORDERS TABLE */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#172126]">Recent Orders</h3>
              <p className="text-[11px] text-[#52636B] font-light">Latest purchase transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#172126] hover:text-[#167C86] hover:underline flex items-center gap-0.5">
              View all orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#52636B] font-light">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#DCE6E9] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                    <th className="py-2.5 pr-2">Order</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Total</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6E9]">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                      <td className="py-3 pr-2 font-mono font-bold text-[#172126]">
                        {o.orderId}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="size-6 shrink-0 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-[9px] text-[#172126]">
                            {getInitials(o.customerName)}
                          </span>
                          <div>
                            <span className="font-semibold text-[#172126] block line-clamp-1">
                              {o.customerName}
                            </span>
                            <span className="text-[10px] text-[#7A8A91] block line-clamp-1">
                              {o.customerEmail}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-serif font-bold text-[#172126]">
                        {formatINR(o.total)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
                            getOrderStatusBadge(o.status)
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Link
                          to={`/admin/orders/${o.orderId}`}
                          className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline"
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
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#172126]">Recent Customers</h3>
              <p className="text-[11px] text-[#52636B] font-light">Newly registered customer accounts</p>
            </div>
            <Link to="/admin/customers" className="text-xs font-semibold text-[#172126] hover:text-[#167C86] hover:underline flex items-center gap-0.5">
              View all customers →
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#52636B] font-light">
              No registered customers yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#DCE6E9] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                    <th className="py-2.5 pr-2">Customer</th>
                    <th className="py-2.5 px-2">Joined</th>
                    <th className="py-2.5 px-2">Orders</th>
                    <th className="py-2.5 px-2">LTV</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6E9]">
                  {recentCustomers.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="size-6 shrink-0 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-[9px] text-[#172126]">
                            {getInitials(c.name)}
                          </span>
                          <div>
                            <span className="font-semibold text-[#172126] block line-clamp-1">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-[#7A8A91] block line-clamp-1">
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[11px] text-[#52636B] whitespace-nowrap">
                        {formatDate(c.joinedAt)}
                      </td>
                      <td className="py-3 px-2 font-serif font-semibold text-[#172126]">
                        {c.ordersCount}
                      </td>
                      <td className="py-3 px-2 font-serif font-bold text-[#172126]">
                        {formatINR(c.lifetimeValue)}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Link
                          to={`/admin/customers/${c.id}`}
                          className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline"
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

