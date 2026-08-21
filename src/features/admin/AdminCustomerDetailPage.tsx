import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, ShoppingBag, Calendar, User, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatINR, formatNumber, timeAgo, cn } from '@/utils'

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

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => adminService().getCustomerById(id ?? ''),
    enabled: !!id,
  })

  // Calculations derived from real customer data (server LTV already excludes cancelled/refunded orders)
  const totalLtv = customer?.lifetimeValue ?? customer?.totalSpent ?? 0
  const ordersCount = typeof customer?.orders === 'number' ? customer.orders : customer?.orderHistory?.length ?? 0
  const aov = ordersCount > 0 ? Math.round(totalLtv / ordersCount) : 0
  const orderList = Array.isArray(customer?.orderHistory) ? customer.orderHistory : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl bg-[#FAF7F2]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-[480px] rounded-2xl bg-[#FAF7F2]" />
          <Skeleton className="h-[480px] rounded-2xl bg-[#FAF7F2]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
        <AlertCircle className="size-8 text-rose-600 mx-auto" />
        <p className="font-serif text-lg font-normal text-rose-900">Failed to load customer profile</p>
        <p className="text-xs text-rose-700">{(error as Error)?.message || 'Server error occurred'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-rose-300 text-rose-900">
            <Link to="/admin/customers">Back to Customer Directory</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl bg-rose-900 text-white hover:bg-rose-950"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
          </Button>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="rounded-2xl border border-[#DCE6E9] bg-white p-12 text-center space-y-3 shadow-2xs">
        <p className="font-serif text-lg font-normal text-[#172126]">Customer profile not found</p>
        <p className="text-xs text-[#52636B] font-light">We couldn't find a user account matching identifier "{id}".</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126]">
          <Link to="/admin/customers">Back to Customers Register</Link>
        </Button>
      </div>
    )
  }

  const custName = customer.name || 'Customer'

  return (
    <div className="space-y-6">
      {/* 1. EDITORIAL DOSSIER HEADER */}
      <div className="space-y-3 border-b border-[#DCE6E9] pb-6">
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-medium text-[#52636B] hover:text-[#167C86] hover:bg-[#FAF7F2] -ml-2">
          <Link to="/admin/customers">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back to Customers
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-sm text-[#172126] shrink-0">
              {getInitials(custName)}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
                CUSTOMER PROFILE
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight">
                  {custName}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#167C86]/30 bg-[#EDF6F8] px-3 py-0.5 text-[10px] font-bold uppercase text-[#167C86] tracking-wider">
                  <span className="size-1.5 rounded-full bg-[#167C86]" />
                  Active Customer
                </span>
              </div>
              <p className="text-xs text-[#52636B] font-light mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Joined {customer.joinedAt ? formatDate(customer.joinedAt) : 'N/A'}</span>
                <span>•</span>
                <span>Email: <strong className="font-medium text-[#172126]">{customer.email}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="font-medium text-[#172126]">{customer.phone}</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MASTER 68/32 LAYOUT GRID */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* PRIMARY COLUMN (68%) */}
        <div className="space-y-6 min-w-0">
          {/* A. PERFORMANCE BRIEFING CARDS */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                TOTAL ORDERS
              </span>
              <p className="font-serif text-3xl font-bold text-[#172126]">
                {formatNumber(ordersCount)}
              </p>
              <p className="text-[11px] text-[#52636B] font-light">Lifetime checkouts</p>
            </div>

            <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                LIFETIME SPEND
              </span>
              <p className="font-serif text-3xl font-bold text-[#172126]">
                {formatINR(totalLtv)}
              </p>
              <p className="text-[11px] text-[#52636B] font-light">Valid net customer spend</p>
            </div>

            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                AVG ORDER VALUE
              </span>
              <p className="font-serif text-3xl font-bold text-[#172126]">
                {formatINR(aov)}
              </p>
              <p className="text-[11px] text-[#52636B] font-light">Mean spend per cart</p>
            </div>

            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                LATEST PURCHASE
              </span>
              <p className="font-mono text-base font-semibold text-[#172126] truncate">
                {customer.lastOrder ? timeAgo(customer.lastOrder) : customer.lastOrderAt ? timeAgo(customer.lastOrderAt) : '—'}
              </p>
              <p className="text-[11px] text-[#52636B] font-light">Recent transaction</p>
            </div>
          </div>

          {/* B. ITEMISED CUSTOMER ORDER HISTORY TABLE */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div className="border-b border-[#DCE6E9] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                ORDER HISTORY
              </span>
              <h2 className="font-serif text-lg font-normal text-[#172126] mt-0.5">
                Customer Purchase Record ({orderList.length})
              </h2>
            </div>

            {orderList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#52636B] space-y-2">
                <ShoppingBag className="size-7 text-[#167C86] mx-auto mb-2" />
                <p className="font-serif text-base text-[#172126]">No purchases recorded yet</p>
                <p className="text-xs text-[#52636B] font-light">This customer has not completed any store checkouts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#DCE6E9] bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Placed Date</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6E9]">
                    {orderList.map((o: any) => {
                      const badge = getStatusBadge(o.status)
                      const orderCode = o.orderId || o.id

                      return (
                        <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/orders/${orderCode}`)}
                              className="font-mono font-bold text-[#172126] hover:text-[#167C86] hover:underline block text-left"
                            >
                              {orderCode}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-[#7A8A91] font-light">
                            {formatDate(o.placedAt || o.createdAt)}
                          </td>
                          <td className="px-4 py-3.5 text-[#52636B] font-medium">
                            {o.itemCount || (o.items?.length ?? 1)} item{(o.itemCount || (o.items?.length ?? 1)) !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                o.paymentStatus === 'paid'
                                  ? 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'
                                  : 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]'
                              )}
                            >
                              {o.paymentStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                badge.className
                              )}
                            >
                              <span className={cn('size-1.5 rounded-full', badge.dot)} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-serif font-bold text-[#172126]">
                            {formatINR(o.total)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${orderCode}`)}
                              className="h-7 px-2.5 text-[11px] font-semibold text-[#172126] hover:bg-[#FAF7F2] hover:text-[#167C86]"
                            >
                              View <ArrowRight className="size-3 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* C. CUSTOMER CONTACT DETAILS */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div className="border-b border-[#DCE6E9] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                CONTACT INFORMATION
              </span>
              <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-[#172126] mt-0.5">
                <User className="size-4 text-[#167C86]" /> Customer Identity &amp; Reachability
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  FULL NAME
                </span>
                <p className="font-semibold text-[#172126] text-sm">{custName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  EMAIL ADDRESS
                </span>
                <p className="font-medium text-[#172126] flex items-center gap-1.5">
                  <Mail className="size-3.5 text-[#167C86]" /> {customer.email}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  PHONE NUMBER
                </span>
                <p className="font-medium text-[#172126] flex items-center gap-1.5">
                  <Phone className="size-3.5 text-[#167C86]" /> {customer.phone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  ACCOUNT REGISTRATION
                </span>
                <p className="font-medium text-[#172126] flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[#167C86]" />{' '}
                  {customer.joinedAt ? formatDate(customer.joinedAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL SIDEBAR COLUMN (32%) */}
        <div className="space-y-6 min-w-0">
          {/* A. ACCOUNT OVERVIEW CARD */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                ACCOUNT OVERVIEW
              </span>
              <h3 className="font-serif text-lg font-normal text-[#172126] mt-0.5">
                Status &amp; Standing
              </h3>
            </div>

            <div className="space-y-3 text-xs border-y border-[#DCE6E9] py-4">
              <div className="flex items-center justify-between">
                <span className="text-[#52636B]">Account Standing</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#167C86]/30 bg-[#EDF6F8] px-2.5 py-0.5 text-[10px] font-bold text-[#167C86] uppercase tracking-wider">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52636B]">Account Type</span>
                <span className="font-semibold text-[#172126]">Registered Customer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52636B]">Database Identifier</span>
                <span className="font-mono text-[10px] bg-[#FAF7F2] border border-[#DCE6E9] px-2 py-0.5 rounded-md font-semibold text-[#172126]">
                  {customer.id ? customer.id.slice(-8).toUpperCase() : 'USER-ID'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#7A8A91] font-light leading-relaxed">
              Customer identity and transaction summaries are computed dynamically from MongoDB collections.
            </p>
          </div>

          {/* B. ENGAGEMENT SUMMARY CARD */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                ACCOUNT ACTIVITY LOG
              </span>
              <h3 className="font-serif text-lg font-normal text-[#172126] border-b border-[#DCE6E9] pb-3 mt-0.5">
                Engagement History
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {(!customer.activity || customer.activity.length === 0) && orderList.length === 0 ? (
                <p className="text-[#7A8A91] text-[11px]">No activity logged.</p>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-[#167C86] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#172126] leading-tight">Account Registered</p>
                      <p className="text-[10px] text-[#7A8A91] mt-0.5">{customer.joinedAt ? formatDate(customer.joinedAt) : 'N/A'}</p>
                    </div>
                  </div>

                  {orderList.slice(0, 4).map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="size-1.5 rounded-full bg-[#172126] mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#172126] leading-tight">
                          Order Placed ({a.orderId || a.id})
                        </p>
                        <p className="text-[10px] text-[#7A8A91] mt-0.5">{timeAgo(a.placedAt || a.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

