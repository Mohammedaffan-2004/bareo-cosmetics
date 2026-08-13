import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import {
  Download,
  Calendar,
  AlertCircle,
  RefreshCw,
  Tag,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatINR, formatCompact, cn } from '@/utils'
import type { RealAnalyticsPayload } from '@/types'

function getStatusBadge(status: string) {
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

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<string>('30d')
  const [startDateInput, setStartDateInput] = useState<string>('')
  const [endDateInput, setEndDateInput] = useState<string>('')

  const queryParams = {
    range,
    ...(range === 'custom' && startDateInput && endDateInput
      ? { startDate: startDateInput, endDate: endDateInput }
      : {}),
  }

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<RealAnalyticsPayload>({
    queryKey: ['admin-analytics-data', queryParams],
    queryFn: () => adminService().getAnalytics(queryParams),
  })

  // Export Real Data CSV Function
  const exportCsv = () => {
    if (!data) return
    const rows = (data.revenueTrend || []).map(
      (r) => `${r.date},${r.revenue || 0}`
    )
    const csv = ['Date,Revenue(INR)', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bareo-analytics-${data.range.key}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-12 w-64 rounded-xl bg-[#FAFAFA]" />
          <Skeleton className="h-10 w-48 rounded-xl bg-[#FAFAFA]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl bg-[#FAFAFA]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl bg-[#FAFAFA]" />
          <Skeleton className="h-72 rounded-2xl bg-[#FAFAFA]" />
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
          <p className="font-serif text-lg font-semibold text-rose-900">Unable to load analytics</p>
          <p className="text-xs text-rose-700 font-light mt-1">
            {(error as Error)?.message || 'Failed to connect to analytics server.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-rose-900 text-white text-xs px-5 h-10 hover:bg-rose-950"
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry Analytics Request
        </Button>
      </div>
    )
  }

  const { summary, revenueTrend, orderTrend, orderStatus, topProducts, customerTrend, promotions } = data

  const totalStatusCount = orderStatus.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="space-y-8">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase block">
            ANALYTICS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-0.5">
            Commerce Intelligence
          </h1>
          <p className="text-xs text-[#6B7280] font-light mt-1">
            Understand sales, customer acquisition and formulation performance over time.
          </p>
        </div>

        {/* TIME PERIOD SELECTOR & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-2xs">
            <Calendar className="size-3.5 text-[#111111]" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#111111] focus:outline-hidden cursor-pointer"
            >
              <option value="30d">Last 30 days</option>
              <option value="7d">Last 7 days</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_month">This month</option>
              <option value="previous_month">Previous month</option>
              <option value="this_year">This year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-mono"
              />
              <span className="text-[#9CA3AF]">to</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-mono"
              />
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            className="rounded-xl border-[#E5E7EB] bg-white text-[#111111] text-xs h-9 px-3.5 font-medium hover:bg-[#FAF7F2]"
          >
            <Download className="size-3.5 mr-1.5 text-[#111111]" /> Export CSV
          </Button>
        </div>
      </div>

      {/* 2. 4 EXECUTIVE KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* REVENUE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            REVENUE
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {formatINR(summary.rangeRevenue ?? 0)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">
            Paid orders in {data.range.label}
          </p>
        </div>

        {/* ORDERS */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            ORDERS
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {(summary.rangeOrders ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">
            Valid orders in {data.range.label}
          </p>
        </div>

        {/* AVERAGE ORDER VALUE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            AVERAGE ORDER VALUE
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {formatINR(summary.rangeAov ?? 0)}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">Per valid order</p>
        </div>

        {/* NEW CUSTOMERS */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            NEW CUSTOMERS
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {(summary.newCustomers ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light pt-1">
            Signed up in {data.range.label}
          </p>
        </div>
      </div>

      {/* 3. REVENUE PERFORMANCE CENTERPIECE CHART */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div>
          <h3 className="font-serif text-lg font-normal text-[#111111]">Revenue Performance</h3>
          <p className="text-[11px] text-[#6B7280] font-light">
            Daily gross revenue from paid non-cancelled orders ({data.range.label})
          </p>
        </div>

        {revenueTrend.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6B7280] font-light">
            No commerce revenue recorded in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrend} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="bareoRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                stroke="#E5E7EB"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                stroke="#E5E7EB"
                tickFormatter={(v) => `₹${formatCompact(v || 0)}`}
              />
              <Tooltip
                formatter={(v: number) => [`₹${(v || 0).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#111111"
                strokeWidth={2}
                fill="url(#bareoRevGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 4. ORDER PERFORMANCE GRID (VOLUME & STATUS) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DAILY ORDER VOLUME BAR CHART */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#111111]">Order Volume</h3>
            <p className="text-[11px] text-[#6B7280] font-light">
              Valid orders vs cancellations ({data.range.label})
            </p>
          </div>

          {orderTrend.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#6B7280] font-light">
              No orders recorded in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={orderTrend} margin={{ left: -8, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="orders" name="Valid Orders" fill="#111111" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ORDER STATUS DISTRIBUTION */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#111111]">Order Status Distribution</h3>
            <p className="text-[11px] text-[#6B7280] font-light">
              Fulfillment breakdown for orders placed in period
            </p>
          </div>

          {orderStatus.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280] font-light">
              No status distribution available.
            </div>
          ) : (
            <div className="space-y-3.5 my-auto">
              {orderStatus.map((st) => {
                const pct = totalStatusCount > 0 ? Math.round((st.count / totalStatusCount) * 100) : 0
                return (
                  <div key={st.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#111111] capitalize flex items-center gap-1.5">
                        <span
                          className={cn(
                            'size-2 rounded-full border',
                            getStatusBadge(st.status)
                          )}
                        />
                        {st.status}
                      </span>
                      <span className="font-mono text-[#6B7280]">
                        {st.count} orders ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#FAFAFA] border border-[#E5E7EB] overflow-hidden">
                      <div
                        className="h-full bg-[#111111] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Total Orders Analyzed</span>
            <span className="font-mono font-bold text-[#111111]">{totalStatusCount}</span>
          </div>
        </div>
      </div>

      {/* 5. TOP FORMULATIONS PERFORMANCE TABLE */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#111111]">Top Formulations</h3>
            <p className="text-[11px] text-[#6B7280] font-light">
              Formulation sales ranked by total revenue ({data.range.label})
            </p>
          </div>
          <Link to="/admin/products" className="text-xs font-semibold text-[#111111] hover:underline">
            View all products →
          </Link>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B7280] font-light">
            No product sales recorded in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  <th className="py-2.5 pr-2">Rank & Formulation</th>
                  <th className="py-2.5 px-2 text-right">Units Sold</th>
                  <th className="py-2.5 px-2 text-right">Total Revenue</th>
                  <th className="py-2.5 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {topProducts.map((p, idx) => (
                  <tr key={p.productId || idx} className="transition-colors hover:bg-[#FAF7F2]/40">
                    <td className="py-3 pr-2 font-medium text-[#111111] flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] border border-[#E5E7EB] text-[10px] font-bold text-[#111111]">
                        {idx + 1}
                      </span>
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-right text-[#111111]">
                      {p.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 font-serif font-bold text-right text-[#111111]">
                      {formatINR(p.revenue)}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <Link
                        to={`/admin/products`}
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

      {/* 6. PROMOTIONS & CUSTOMER ACQUISITION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CUSTOMER ACQUISITION TREND */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#111111]">Customer Acquisition</h3>
            <p className="text-[11px] text-[#6B7280] font-light">
              Daily registered account signups ({data.range.label})
            </p>
          </div>

          {customerTrend.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280] font-light">
              No customer signups in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={customerTrend} margin={{ left: -8, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111111" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Area type="monotone" dataKey="customers" stroke="#111111" strokeWidth={2} fill="url(#custGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PROMOTION USAGE PERFORMANCE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-normal text-[#111111]">Promotion Redemptions</h3>
              <Link to="/admin/offers" className="text-xs font-semibold text-[#111111] hover:underline">
                Manage offers →
              </Link>
            </div>
            <p className="text-[11px] text-[#6B7280] font-light">
              Coupon discount redemptions in period
            </p>
          </div>

          {!promotions || promotions.couponOrders === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280] font-light my-auto">
              No coupon redemptions recorded in this period.
            </div>
          ) : (
            <div className="space-y-4 my-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                    DISCOUNTED ORDERS
                  </span>
                  <span className="font-mono text-xl font-bold text-[#111111]">
                    {promotions.couponOrders}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                    TOTAL SAVINGS GIVEN
                  </span>
                  <span className="font-serif text-xl font-bold text-[#111111]">
                    {formatINR(promotions.totalDiscount)}
                  </span>
                </div>
              </div>

              {promotions.topCoupons.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                    TOP PERFORMING CODES
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {promotions.topCoupons.map((tc) => (
                      <span
                        key={tc.code}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 font-mono text-xs font-bold text-[#111111]"
                      >
                        <Tag className="size-3 text-[#111111]" /> {tc.code} ({tc.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Promotional Campaign Impact</span>
            <span className="font-medium text-[#111111]">100% Real Order Tracking</span>
          </div>
        </div>
      </div>
    </div>
  )
}
