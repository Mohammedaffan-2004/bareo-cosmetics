import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  Download,
  AlertCircle,
  RefreshCw,
  Tag,
  TrendingUp,
  ShoppingBag,
  Users,
  BarChart2,
  ArrowRight,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatINR, formatCompact } from '@/utils'
import type { RealAnalyticsPayload } from '@/types'

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Confirmed',  color: '#167C86' },
  processing: { label: 'Processing', color: '#52636B' },
  shipped:    { label: 'Shipped',    color: '#172126' },
  delivered:  { label: 'Delivered',  color: '#2D6A4F' },
  cancelled:  { label: 'Cancelled',  color: '#7A8A91' },
}
const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s.toLowerCase()] ?? { label: s, color: '#7A8A91' }

// ─── Range options ─────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { value: '30d',            label: 'Last 30 days' },
  { value: '7d',             label: 'Last 7 days' },
  { value: 'today',          label: 'Today' },
  { value: 'yesterday',      label: 'Yesterday' },
  { value: 'this_month',     label: 'This month' },
  { value: 'previous_month', label: 'Previous month' },
  { value: 'this_year',      label: 'This year' },
  { value: 'custom',         label: 'Custom range' },
]

// ─── Date formatter — strips ISO noise, produces "22 Jul 2026" ────────────
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDateStr(raw: string): string {
  if (!raw) return raw
  // Handle ISO strings like 2026-07-22T00:00:00.000Z  or  2026-07-22
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`
}

function fmtDateWindow(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${start} — ${end}`
  // Same year — compress
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${MONTH_ABBR[s.getMonth()]} — ${e.getDate()} ${MONTH_ABBR[e.getMonth()]} ${e.getFullYear()}`
  }
  return `${fmtDateStr(start)} — ${fmtDateStr(end)}`
}

// ─── Custom BAREO Revenue Tooltip ─────────────────────────────────────────
interface RevTooltipProps {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}
function RevTooltip({ active, payload, label }: RevTooltipProps) {
  if (!active || !payload?.length) return null
  const rev = payload.find((p) => p.name === 'revenue')
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #DCE6E9',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(23,33,38,0.07)',
        minWidth: 140,
      }}
    >
      {label && (
        <p style={{ fontSize: 10, color: '#7A8A91', fontFamily: 'monospace', marginBottom: 6 }}>
          {label}
        </p>
      )}
      {rev !== undefined && (
        <div>
          <span style={{ fontSize: 9, color: '#7A8A91', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
            Revenue
          </span>
          <span style={{ fontSize: 14, color: '#172126', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
            {formatINR(rev.value || 0)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Order bar tooltip ─────────────────────────────────────────────────────
interface OrdTooltipProps {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}
function OrdTooltip({ active, payload, label }: OrdTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #DCE6E9',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(23,33,38,0.07)',
        minWidth: 130,
      }}
    >
      {label && (
        <p style={{ fontSize: 10, color: '#7A8A91', fontFamily: 'monospace', marginBottom: 6 }}>
          {label}
        </p>
      )}
      {payload.map((p) => (
        <div key={p.name} style={{ marginTop: 3 }}>
          <span style={{ fontSize: 9, color: '#7A8A91', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
            {p.name === 'orders' ? 'Valid' : 'Cancelled'}
          </span>
          <span style={{ fontSize: 13, color: '#172126', fontFamily: 'monospace', fontWeight: 600 }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

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

  const { data, isLoading, isError, error, refetch } = useQuery<RealAnalyticsPayload>({
    queryKey: ['admin-analytics-data', queryParams],
    queryFn: () => adminService().getAnalytics(queryParams),
  })

  // ── Export CSV ─────────────────────────────────────────────────────────
  const exportCsv = () => {
    if (!data) return
    const rows = (data.revenueTrend || []).map((r) => `${r.date},${r.revenue || 0}`)
    const csv = ['Date,Revenue(INR)', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bareo-analytics-${data.range.key}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Peak revenue day ───────────────────────────────────────────────────
  const peakRevDay = useMemo(() => {
    if (!data?.revenueTrend?.length) return null
    return data.revenueTrend.reduce((best, pt) =>
      (pt.revenue ?? 0) > (best.revenue ?? 0) ? pt : best
    )
  }, [data?.revenueTrend])

  // ── Peak share of period ───────────────────────────────────────────────
  const peakSharePct = useMemo(() => {
    if (!peakRevDay || !data?.summary?.rangeRevenue) return null
    const total = data.summary.rangeRevenue
    if (total <= 0) return null
    return Math.round(((peakRevDay.revenue ?? 0) / total) * 100)
  }, [peakRevDay, data?.summary?.rangeRevenue])

  // ── Cancelled all-zero check (suppress legend if no cancellations) ────
  const hasCancelled = useMemo(() => {
    if (!data?.orderTrend) return false
    return data.orderTrend.some((p) => (p.cancelled ?? 0) > 0)
  }, [data?.orderTrend])

  // ── Commerce signals ───────────────────────────────────────────────────
  const signals = useMemo(() => {
    if (!data) return []
    const out: { label: string; value: string }[] = []
    const { summary, topProducts, orderTrend } = data

    if (topProducts.length > 0) {
      out.push({ label: 'Top Formulation', value: topProducts[0].name })
    }
    if (peakRevDay?.date && (peakRevDay.revenue ?? 0) > 0) {
      out.push({ label: 'Peak Revenue Day', value: fmtDateStr(peakRevDay.date) })
    }
    if ((summary.rangeOrders ?? 0) > 0) {
      out.push({ label: 'Valid Orders', value: String(summary.rangeOrders ?? 0) })
    }
    if ((summary.newCustomers ?? 0) > 0) {
      out.push({ label: 'New Customers', value: String(summary.newCustomers ?? 0) })
    }
    const totalCancelled = orderTrend.reduce((s, p) => s + (p.cancelled ?? 0), 0)
    if (totalCancelled > 0) {
      out.push({ label: 'Cancelled Orders', value: String(totalCancelled) })
    }
    return out
  }, [data, peakRevDay])

  // ── Period summary sentence ────────────────────────────────────────────
  const periodSummary = useMemo(() => {
    if (!data) return null
    const { rangeOrders, rangeRevenue } = data.summary
    if (!rangeOrders || !rangeRevenue) return null
    return `${rangeOrders} valid order${rangeOrders !== 1 ? 's' : ''} generated ${formatINR(rangeRevenue)} in revenue across the selected period.`
  }, [data])

  // ── LOADING STATE ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-28 rounded" style={{ background: '#EDF6F8' }} />
            <Skeleton className="h-8 w-64 rounded-xl" style={{ background: '#EDF6F8' }} />
            <Skeleton className="h-2.5 w-80 rounded" style={{ background: '#EDF6F8' }} />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-xl" style={{ background: '#EDF6F8' }} />
            <Skeleton className="h-9 w-28 rounded-xl" style={{ background: '#EDF6F8' }} />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" style={{ background: '#EDF6F8' }} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" style={{ background: '#EDF6F8' }} />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" style={{ background: '#EDF6F8' }} />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" style={{ background: '#EDF6F8' }} />
          <Skeleton className="h-64 rounded-2xl" style={{ background: '#EDF6F8' }} />
        </div>
        <Skeleton className="h-48 rounded-2xl" style={{ background: '#EDF6F8' }} />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" style={{ background: '#EDF6F8' }} />
          <Skeleton className="h-52 rounded-2xl" style={{ background: '#EDF6F8' }} />
        </div>
      </div>
    )
  }

  // ── ERROR STATE ────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div
        className="rounded-2xl border p-12 text-center space-y-4 max-w-lg mx-auto my-12"
        style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
      >
        <AlertCircle className="size-7 mx-auto" style={{ color: '#167C86' }} />
        <div>
          <p className="font-serif text-base font-normal" style={{ color: '#172126' }}>
            Analytics Unavailable
          </p>
          <p className="text-xs font-light mt-1" style={{ color: '#52636B' }}>
            {(error as Error)?.message || 'Commerce intelligence could not be loaded right now.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl text-xs px-5 h-9"
          style={{ background: '#172126', color: '#fff' }}
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    )
  }

  const { summary, revenueTrend, orderTrend, orderStatus, topProducts, customerTrend, promotions } = data
  const totalStatusCount = orderStatus.reduce((acc, curr) => acc + curr.count, 0)

  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-12">

      {/* ── 01  PAGE HEADER + CONTROLS ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase block mb-0.5"
            style={{ color: '#167C86' }}
          >
            COMMERCE INTELLIGENCE
          </span>
          <h1
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight"
            style={{ color: '#172126' }}
          >
            Commerce Intelligence
          </h1>
          <p className="text-xs font-light mt-1 max-w-lg" style={{ color: '#52636B' }}>
            Understand revenue, demand, customer acquisition and formulation performance over time.
          </p>
        </div>

        {/* Control cluster */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Analysis window selector */}
          <div
            className="inline-flex items-center gap-2 rounded-xl border px-3 h-9"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            <span
              className="text-[9px] font-semibold tracking-widest uppercase shrink-0"
              style={{ color: '#7A8A91' }}
            >
              WINDOW
            </span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer"
              style={{ color: '#172126' }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="rounded-xl border px-2.5 py-1.5 text-xs font-mono"
                style={{ borderColor: '#DCE6E9', background: '#fff', color: '#172126' }}
              />
              <span style={{ color: '#7A8A91', fontSize: 11 }}>→</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="rounded-xl border px-2.5 py-1.5 text-xs font-mono"
                style={{ borderColor: '#DCE6E9', background: '#fff', color: '#172126' }}
              />
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            className="rounded-xl text-xs h-9 px-3.5 font-medium transition-colors"
            style={{ borderColor: '#DCE6E9', background: '#fff', color: '#172126' }}
          >
            <Download className="size-3.5 mr-1.5" style={{ color: '#167C86' }} />
            Export Report
          </Button>
        </div>
      </div>

      {/* ── 02  PERFORMANCE BRIEF ──────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-5 py-2.5"
        style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
      >
        <div>
          <span
            className="text-[9px] font-semibold tracking-widest uppercase block"
            style={{ color: '#7A8A91' }}
          >
            PERFORMANCE BRIEF
          </span>
          <p className="text-[11px] font-light mt-0.5" style={{ color: '#52636B' }}>
            Commerce activity across the selected period.
          </p>
        </div>
        <div className="sm:text-right">
          <span
            className="text-[9px] font-semibold tracking-widest uppercase block"
            style={{ color: '#7A8A91' }}
          >
            DATA WINDOW
          </span>
          <p className="font-mono text-[11px] font-semibold mt-0.5" style={{ color: '#172126' }}>
            {data.range.start && data.range.end
              ? fmtDateWindow(data.range.start, data.range.end)
              : data.range.label}
          </p>
        </div>
      </div>

      {/* ── 03  EXECUTIVE KPIs ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* REVENUE — hero emphasis */}
        <div
          className="rounded-xl border p-4 space-y-1.5"
          style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
              REVENUE
            </span>
            <TrendingUp className="size-3.5" style={{ color: '#167C86' }} />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal tracking-tight" style={{ color: '#172126' }}>
            {formatINR(summary.rangeRevenue ?? 0)}
          </p>
          <p className="text-[10px] font-light" style={{ color: '#52636B' }}>
            Paid orders in {data.range.label}
          </p>
        </div>

        {/* ORDERS */}
        <div
          className="rounded-xl border p-4 space-y-1.5"
          style={{ borderColor: '#DCE6E9', background: '#fff' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
              ORDERS
            </span>
            <ShoppingBag className="size-3.5" style={{ color: '#DCE6E9' }} />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#172126' }}>
            {(summary.rangeOrders ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-light" style={{ color: '#52636B' }}>
            Valid orders in {data.range.label}
          </p>
        </div>

        {/* AOV */}
        <div
          className="rounded-xl border p-4 space-y-1.5"
          style={{ borderColor: '#DCE6E9', background: '#fff' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
              AVG. ORDER VALUE
            </span>
            <BarChart2 className="size-3.5" style={{ color: '#DCE6E9' }} />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal tracking-tight" style={{ color: '#172126' }}>
            {formatINR(summary.rangeAov ?? 0)}
          </p>
          <p className="text-[10px] font-light" style={{ color: '#52636B' }}>Per valid order</p>
        </div>

        {/* NEW CUSTOMERS */}
        <div
          className="rounded-xl border p-4 space-y-1.5"
          style={{ borderColor: '#DCE6E9', background: '#fff' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
              NEW CUSTOMERS
            </span>
            <Users className="size-3.5" style={{ color: '#DCE6E9' }} />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#172126' }}>
            {(summary.newCustomers ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-light" style={{ color: '#52636B' }}>
            Signed up in {data.range.label}
          </p>
        </div>
      </div>

      {/* ── 04  REVENUE PERFORMANCE HERO ───────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
        {/* Header */}
        <div
          className="px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ borderColor: '#DCE6E9', background: '#fff' }}
        >
          <div>
            <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
              Revenue Performance
            </h2>
            <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
              Daily paid revenue from valid non-cancelled orders
            </p>
          </div>
          {(summary.rangeRevenue ?? 0) > 0 && (
            <div className="sm:text-right shrink-0">
              <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: '#7A8A91' }}>
                PERIOD TOTAL
              </span>
              <p className="font-serif text-lg font-semibold" style={{ color: '#172126' }}>
                {formatINR(summary.rangeRevenue ?? 0)}
              </p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="px-1 pt-4 pb-2 bg-white">
          {revenueTrend.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <TrendingUp className="size-6 mx-auto" style={{ color: '#DCE6E9' }} />
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#7A8A91' }}>
                NO REVENUE ACTIVITY
              </p>
              <p className="text-[11px] font-light" style={{ color: '#7A8A91' }}>
                No valid paid orders were recorded during this period.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueTrend} margin={{ left: -8, right: 6, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#167C86" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#167C86" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 6" stroke="#EDF6F8" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#7A8A91', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#7A8A91', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${formatCompact(v || 0)}`}
                />
                <Tooltip content={<RevTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#167C86"
                  strokeWidth={1.5}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#167C86', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Peak footer */}
        {peakRevDay && (peakRevDay.revenue ?? 0) > 0 && (
          <div
            className="px-5 py-2.5 border-t flex items-center gap-5 flex-wrap"
            style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
          >
            <div>
              <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: '#7A8A91' }}>
                PEAK REVENUE DAY
              </span>
              <span className="font-mono text-[11px] font-semibold" style={{ color: '#172126' }}>
                {fmtDateStr(peakRevDay.date)}
              </span>
            </div>
            <div className="w-px h-6 self-center" style={{ background: '#DCE6E9' }} />
            <div>
              <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: '#7A8A91' }}>
                PEAK DAY REVENUE
              </span>
              <span className="font-serif text-[11px] font-semibold" style={{ color: '#172126' }}>
                {formatINR(peakRevDay.revenue ?? 0)}
              </span>
            </div>
            {peakSharePct !== null && (
              <>
                <div className="w-px h-6 self-center" style={{ background: '#DCE6E9' }} />
                <div>
                  <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: '#7A8A91' }}>
                    SHARE OF PERIOD
                  </span>
                  <span className="font-mono text-[11px] font-semibold" style={{ color: '#172126' }}>
                    {peakSharePct}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 05  ORDER VOLUME + FULFILLMENT MIX ─────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* ORDER VOLUME */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
          <div
            className="px-5 py-3.5 border-b"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
              Order Volume
            </h2>
            <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
              Valid orders vs cancellations in selected period
            </p>
          </div>
          <div className="px-2 pt-3 pb-2 bg-white">
            {orderTrend.length === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <ShoppingBag className="size-5 mx-auto" style={{ color: '#DCE6E9' }} />
                <p className="text-[11px] font-light" style={{ color: '#7A8A91' }}>
                  No orders recorded in this period.
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={orderTrend} margin={{ left: -8, right: 6, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 6" stroke="#EDF6F8" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#7A8A91', fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#7A8A91' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<OrdTooltip />} />
                    <Bar dataKey="orders" name="orders" fill="#172126" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    {hasCancelled && (
                      <Bar dataKey="cancelled" name="cancelled" fill="#DCE6E9" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-1.5 px-2 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-sm shrink-0" style={{ background: '#172126' }} />
                    <span className="text-[9px] uppercase tracking-wide" style={{ color: '#52636B' }}>Valid</span>
                  </div>
                  {hasCancelled && (
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-sm shrink-0" style={{ background: '#DCE6E9' }} />
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: '#52636B' }}>Cancelled</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* FULFILLMENT MIX — content-driven height, no stretch */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
          <div
            className="px-5 py-3.5 border-b"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
              Fulfillment Mix
            </h2>
            <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
              Order status distribution for selected period
            </p>
          </div>
          <div className="px-5 pt-4 pb-4 bg-white space-y-0">
            {orderStatus.length === 0 ? (
              <p className="py-6 text-center text-[11px] font-light" style={{ color: '#7A8A91' }}>
                No status distribution available.
              </p>
            ) : (
              <>
                <div className="space-y-2.5">
                  {orderStatus.map((st) => {
                    const pct =
                      totalStatusCount > 0
                        ? Math.round((st.count / totalStatusCount) * 100)
                        : 0
                    const cfg = getStatusCfg(st.status)
                    return (
                      <div key={st.status}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 rounded-full shrink-0"
                              style={{ background: cfg.color }}
                            />
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wide"
                              style={{ color: '#172126' }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[11px] font-semibold" style={{ color: '#172126' }}>
                              {st.count}
                            </span>
                            <span
                              className="font-mono text-[10px] tabular-nums w-8 text-right"
                              style={{ color: '#7A8A91' }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div
                          className="h-0.5 w-full rounded-full overflow-hidden"
                          style={{ background: '#EDF6F8' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: cfg.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div
                  className="mt-3 pt-2.5 border-t flex items-center justify-between"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <span className="text-[10px] font-light" style={{ color: '#7A8A91' }}>
                    Total analyzed
                  </span>
                  <span className="font-mono text-[11px] font-semibold" style={{ color: '#172126' }}>
                    {totalStatusCount}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 06  TOP FORMULATIONS ────────────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
        <div
          className="px-5 py-3.5 border-b flex items-center justify-between"
          style={{ borderColor: '#DCE6E9', background: '#fff' }}
        >
          <div>
            <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
              Top Formulations
            </h2>
            <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
              Best-performing formulations by revenue — {data.range.label}
            </p>
          </div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#167C86' }}
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-10 text-center bg-white">
            <p className="text-[11px] font-light" style={{ color: '#7A8A91' }}>
              No product sales recorded in this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}>
                  <th className="py-2.5 px-5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
                    Rank & Formulation
                  </th>
                  <th className="py-2.5 px-4 text-right text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
                    Units
                  </th>
                  <th className="py-2.5 px-4 text-right text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
                    Revenue
                  </th>
                  <th className="py-2.5 px-5 text-right text-[9px]">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr
                    key={p.productId || idx}
                    className="border-b transition-colors hover:bg-[#FAF7F2]/60"
                    style={{ borderColor: '#DCE6E9' }}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                          style={
                            idx === 0
                              ? { background: '#172126', color: '#FAF7F2' }
                              : idx === 1
                              ? { background: '#EDF6F8', color: '#167C86' }
                              : { background: '#FAF7F2', color: '#7A8A91', border: '1px solid #DCE6E9' }
                          }
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium text-[12px] leading-snug" style={{ color: '#172126' }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold" style={{ color: '#172126' }}>
                      {p.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-semibold" style={{ color: '#172126' }}>
                      {formatINR(p.revenue)}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        to="/admin/products"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: '#167C86' }}
                      >
                        View <ArrowRight className="size-2.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 07  CUSTOMER ACQUISITION + PROMOTION PERFORMANCE ───────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* CUSTOMER ACQUISITION */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
          <div
            className="px-5 py-3.5 border-b"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
              Customer Acquisition
            </h2>
            <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
              New registered customers during selected period
            </p>
          </div>
          <div className="bg-white">
            {customerTrend.length === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <Users className="size-5 mx-auto" style={{ color: '#DCE6E9' }} />
                <p className="text-[11px] font-light" style={{ color: '#7A8A91' }}>
                  No customer signups in this period.
                </p>
              </div>
            ) : customerTrend.length === 1 ? (
              // Single data point — compact signal card
              <div className="px-5 py-5 flex items-start gap-5">
                <div
                  className="rounded-xl border p-4 text-center shrink-0"
                  style={{ background: '#FAF7F2', borderColor: '#DCE6E9', minWidth: 100 }}
                >
                  <p className="font-mono text-2xl font-semibold" style={{ color: '#172126' }}>
                    {customerTrend[0].customers ?? 0}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#167C86' }}>
                    NEW CUSTOMER{(customerTrend[0].customers ?? 0) !== 1 ? 'S' : ''}
                  </p>
                </div>
                <div className="pt-1 space-y-1">
                  <span className="text-[9px] font-semibold tracking-widest uppercase block" style={{ color: '#7A8A91' }}>
                    RECORDED ON
                  </span>
                  <p className="font-mono text-[11px] font-semibold" style={{ color: '#172126' }}>
                    {fmtDateStr(customerTrend[0].date)}
                  </p>
                  <p className="text-[10px] font-light mt-1" style={{ color: '#7A8A91' }}>
                    Single activity point in this period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-1 pt-3 pb-2">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={customerTrend} margin={{ left: -8, right: 6, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#172126" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#172126" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 6" stroke="#EDF6F8" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#7A8A91', fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#7A8A91' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #DCE6E9',
                        background: '#fff',
                        fontSize: 11,
                        boxShadow: '0 4px 12px rgba(23,33,38,0.07)',
                      }}
                      labelStyle={{ color: '#172126', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      name="New Customers"
                      stroke="#172126"
                      strokeWidth={1.5}
                      fill="url(#custGrad)"
                      dot={false}
                      activeDot={{ r: 3.5, fill: '#172126', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* PROMOTION PERFORMANCE */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#DCE6E9' }}>
          <div
            className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            <div>
              <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
                Promotion Performance
              </h2>
              <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
                Coupon redemptions during selected period
              </p>
            </div>
            <Link
              to="/admin/offers"
              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#167C86' }}
            >
              Manage offers <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="bg-white">
            {!promotions || promotions.couponOrders === 0 ? (
              <div className="px-5 py-7 flex flex-col items-center gap-3 text-center">
                <Tag className="size-5" style={{ color: '#DCE6E9' }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#7A8A91' }}>
                    NO PROMOTION ACTIVITY
                  </p>
                  <p className="text-[11px] font-light mt-1" style={{ color: '#7A8A91' }}>
                    No coupon redemptions were recorded during this period.
                  </p>
                </div>
                <Link
                  to="/admin/offers"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  Manage offers <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{ background: '#FAF7F2', borderColor: '#DCE6E9' }}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-widest block" style={{ color: '#7A8A91' }}>
                      REDEMPTIONS
                    </span>
                    <span className="font-mono text-xl font-semibold mt-1 block" style={{ color: '#172126' }}>
                      {promotions.couponOrders}
                    </span>
                  </div>
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{ background: '#FAF7F2', borderColor: '#DCE6E9' }}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-widest block" style={{ color: '#7A8A91' }}>
                      SAVINGS GIVEN
                    </span>
                    <span className="font-serif text-xl font-semibold mt-1 block" style={{ color: '#172126' }}>
                      {formatINR(promotions.totalDiscount)}
                    </span>
                  </div>
                </div>

                {promotions.topCoupons.length > 0 && (
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#7A8A91' }}>
                      TOP CODES
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {promotions.topCoupons.map((tc) => (
                        <span
                          key={tc.code}
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold"
                          style={{ borderColor: '#DCE6E9', background: '#EDF6F8', color: '#172126' }}
                        >
                          <Tag className="size-2.5" style={{ color: '#167C86' }} />
                          {tc.code}
                          <span className="font-mono text-[9px]" style={{ color: '#7A8A91' }}>({tc.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 08  COMMERCE SIGNALS ────────────────────────────────────────── */}
      {signals.length >= 2 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#DCE6E9' }}
        >
          {/* Teal left accent + header */}
          <div
            className="flex items-center gap-0 border-b"
            style={{ borderColor: '#DCE6E9' }}
          >
            <div className="w-1 self-stretch" style={{ background: '#167C86' }} />
            <div className="flex-1 px-5 py-3.5" style={{ background: '#FAF7F2' }}>
              <h2 className="font-serif text-base font-normal" style={{ color: '#172126' }}>
                Commerce Signals
              </h2>
              <p className="text-[10px] font-light mt-0.5" style={{ color: '#7A8A91' }}>
                Data-derived observations from the selected period
              </p>
            </div>
          </div>

          {/* Signal cells with vertical dividers */}
          <div
            className="flex flex-wrap divide-x bg-white"
            style={{ borderColor: '#DCE6E9' }}
          >
            {signals.map((sig) => (
              <div
                key={sig.label}
                className="px-5 py-4 flex-1 min-w-[140px]"
                style={{ borderColor: '#DCE6E9' }}
              >
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest block"
                  style={{ color: '#7A8A91' }}
                >
                  {sig.label}
                </span>
                <p
                  className="font-mono text-sm font-semibold mt-1 truncate"
                  style={{ color: '#172126' }}
                >
                  {sig.value}
                </p>
              </div>
            ))}
          </div>

          {/* Period summary sentence */}
          {periodSummary && (
            <div
              className="px-5 py-2.5 border-t"
              style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
            >
              <p className="text-[10px] font-light italic" style={{ color: '#52636B' }}>
                {periodSummary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
