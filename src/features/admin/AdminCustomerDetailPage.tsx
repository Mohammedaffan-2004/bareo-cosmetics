import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, ShoppingBag, Calendar, User, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { avatarImage } from '@/utils/images'
import { formatDate, formatINR, formatNumber, timeAgo, cn } from '@/utils'

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

  // AOV Computation
  const aov = useMemo(() => {
    if (!customer || !customer.orders || customer.orders === 0) return 0
    return Math.round((customer.lifetimeValue || 0) / customer.orders)
  }, [customer])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-[480px] rounded-2xl" />
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
        <AlertCircle className="size-8 text-rose-600 mx-auto" />
        <p className="font-serif text-lg font-semibold text-rose-900">Failed to load customer profile</p>
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
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center space-y-3">
        <p className="font-serif text-lg font-semibold text-[#111111]">Customer profile not found</p>
        <p className="text-xs text-[#6B7280]">We couldn't find a user account matching identifier "{id}".</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] text-xs">
          <Link to="/admin/customers">Back to Customers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER */}
      <div className="space-y-3 border-b border-[#E5E7EB] pb-6">
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs text-[#6B7280] hover:text-[#111111] -ml-2">
          <Link to="/admin/customers">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back to Customers
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-[#E5E7EB] bg-[#FAFAFA]">
              <AvatarImage src={avatarImage(customer.name.length + (customer.orders || 0), '#111111')} />
              <AvatarFallback className="bg-[#FAF7F2] font-serif text-xl font-normal text-[#111111]">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
                  {customer.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-900">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  Active Customer
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-light mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Joined {customer.joinedAt ? formatDate(customer.joinedAt) : 'N/A'}</span>
                <span>•</span>
                <span>Email: <strong className="font-medium text-[#111111]">{customer.email}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="font-medium text-[#111111]">{customer.phone}</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MASTER 68/32 LAYOUT GRID */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* PRIMARY COLUMN (68%) */}
        <div className="space-y-6 min-w-0">
          {/* A. COMMERCE OVERVIEW CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                TOTAL ORDERS
              </span>
              <p className="font-mono text-2xl font-bold text-[#111111]">
                {formatNumber(customer.orders || 0)}
              </p>
              <p className="text-[11px] text-[#6B7280] font-light">Lifetime checkouts</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-5 space-y-1 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                LIFETIME SPEND
              </span>
              <p className="font-serif text-2xl font-normal text-[#111111]">
                {formatINR(customer.lifetimeValue || 0)}
              </p>
              <p className="text-[11px] text-[#6B7280] font-light">Gross revenue</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                AVG ORDER VALUE
              </span>
              <p className="font-serif text-2xl font-normal text-[#111111]">
                {formatINR(aov)}
              </p>
              <p className="text-[11px] text-[#6B7280] font-light">Mean spend per cart</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                LATEST PURCHASE
              </span>
              <p className="font-mono text-base font-semibold text-[#111111] truncate">
                {customer.lastOrder ? timeAgo(customer.lastOrder) : '—'}
              </p>
              <p className="text-[11px] text-[#6B7280] font-light">Recent transaction</p>
            </div>
          </div>

          {/* B. ITEMISED CUSTOMER ORDER HISTORY TABLE */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h2 className="font-serif text-lg font-normal text-[#111111]">
                Order History ({customer.orderHistory?.length || 0})
              </h2>
            </div>

            {!customer.orderHistory || customer.orderHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B7280] space-y-1">
                <ShoppingBag className="size-6 text-[#9CA3AF] mx-auto mb-2" />
                <p className="font-medium text-[#111111]">No purchases recorded yet</p>
                <p className="text-[11px]">This customer has not completed any store checkouts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#FAF7F2] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Placed Date</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {customer.orderHistory.map((o) => {
                      const badge = getStatusBadge(o.status)

                      return (
                        <tr key={o.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                              className="font-mono font-bold text-[#111111] hover:underline block text-left"
                            >
                              {o.orderId}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-[#6B7280]">
                            {formatDate(o.placedAt)}
                          </td>
                          <td className="px-4 py-3.5 text-[#374151] font-medium">
                            {o.itemCount} item{o.itemCount !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                                o.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                  : 'bg-[#FAF7F2] text-[#111111] border-[#E5E7EB]'
                              )}
                            >
                              {o.paymentStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide',
                                badge.className
                              )}
                            >
                              <span className={cn('size-1.5 rounded-full', badge.dot)} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-[#111111]">
                            {formatINR(o.total)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                              className="h-7 px-2.5 text-[11px] font-medium text-[#111111] hover:bg-[#FAF7F2]"
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
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-[#111111] border-b border-[#E5E7EB] pb-3">
              <User className="size-4 text-[#111111]" /> Contact Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  FULL NAME
                </span>
                <p className="font-semibold text-[#111111] text-sm">{customer.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  EMAIL ADDRESS
                </span>
                <p className="font-medium text-[#111111] flex items-center gap-1.5">
                  <Mail className="size-3.5 text-[#6B7280]" /> {customer.email}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  PHONE NUMBER
                </span>
                <p className="font-medium text-[#111111] flex items-center gap-1.5">
                  <Phone className="size-3.5 text-[#6B7280]" /> {customer.phone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  ACCOUNT REGISTRATION
                </span>
                <p className="font-medium text-[#111111] flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[#6B7280]" />{' '}
                  {customer.joinedAt ? formatDate(customer.joinedAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL SIDEBAR COLUMN (32%) */}
        <div className="space-y-6 min-w-0">
          {/* A. ACCOUNT OVERVIEW CARD */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                ACCOUNT OVERVIEW
              </span>
              <h3 className="font-serif text-lg font-normal text-[#111111] mt-0.5">
                Status & Standing
              </h3>
            </div>

            <div className="space-y-3 text-xs border-y border-[#E5E7EB] py-4">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Account Standing</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Account Type</span>
                <span className="font-medium text-[#111111]">Registered Customer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Database Identifier</span>
                <span className="font-mono text-[10px] bg-[#FAF7F2] border border-[#E5E7EB] px-2 py-0.5 rounded-md font-semibold text-[#111111]">
                  {customer.id ? customer.id.slice(-8).toUpperCase() : 'USER-ID'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#9CA3AF] font-light leading-relaxed">
              Customer identity and transaction summaries are computed dynamically from MongoDB collections.
            </p>
          </div>

          {/* B. ENGAGEMENT SUMMARY CARD */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="font-serif text-lg font-normal text-[#111111] border-b border-[#E5E7EB] pb-3">
              Account Activity Log
            </h3>

            <div className="space-y-3 text-xs">
              {!customer.activity || customer.activity.length === 0 ? (
                <p className="text-[#9CA3AF] text-[11px]">No activity logged.</p>
              ) : (
                customer.activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-[#111111] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-[#111111] leading-tight">{a.action}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{timeAgo(a.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

