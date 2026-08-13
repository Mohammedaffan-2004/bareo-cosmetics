import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MapPin, CreditCard, User, Truck, AlertCircle, RefreshCw, CheckCircle, Loader2 } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Timeline } from '@/components/common/Timeline'
import { AppSelect } from '@/components/common/AppSelect'
import { getProductImage } from '@/utils/productImages'
import type { OrderStatus } from '@/types'
import { formatDate, formatTime, formatINR, cn } from '@/utils'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed (Processing)' },
  { value: 'shipped', label: 'Shipped via Courier' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
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
        label: 'Processing (Packed)',
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

export function AdminOrderDetailPage() {
  const { orderId } = useParams()
  const toast = useToast()
  const qc = useQueryClient()
  const [targetStatus, setTargetStatus] = useState<OrderStatus | ''>('')

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => adminService().getAdminOrderById(orderId ?? ''),
    enabled: !!orderId,
  })

  const updateStatus = useMutation({
    mutationFn: (s: OrderStatus) => adminService().updateOrderStatus(orderId ?? '', s),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['admin-order', orderId] })
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated', `${updated.orderId} → ${updated.status}`)
      setTargetStatus('')
    },
    onError: (err: any) => {
      toast.error('Failed to update status', err?.message || 'Server error occurred')
    },
  })

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
        <p className="font-serif text-lg font-semibold text-rose-900">Failed to load order details</p>
        <p className="text-xs text-rose-700">{(error as Error)?.message || 'Server error occurred'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-rose-300 text-rose-900">
            <Link to="/admin/orders">Back to Orders</Link>
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

  if (!order) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center space-y-3">
        <p className="font-serif text-lg font-semibold text-[#111111]">Order not found</p>
        <p className="text-xs text-[#6B7280]">We couldn't find an order matching identifier "{orderId}".</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] text-xs">
          <Link to="/admin/orders">Back to Orders List</Link>
        </Button>
      </div>
    )
  }

  const badge = getStatusBadge(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const selectedNext = targetStatus || order.status

  const handleApplyStatusUpdate = () => {
    if (!selectedNext || selectedNext === order.status) return
    updateStatus.mutate(selectedNext as OrderStatus)
  }

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE ORDER HEADER */}
      <div className="space-y-3 border-b border-[#E5E7EB] pb-6">
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs text-[#6B7280] hover:text-[#111111] -ml-2">
          <Link to="/admin/orders">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back to Orders
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                {order.orderId}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide',
                  badge.className
                )}
              >
                <span className={cn('size-1.5 rounded-full', badge.dot)} />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] font-light mt-1">
              Placed on <strong className="font-medium text-[#111111]">{formatDate(order.placedAt)}</strong> at{' '}
              {formatTime(order.placedAt)} · Customer: <strong className="font-medium text-[#111111]">{order.address?.fullName || 'N/A'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN 68/32 MASTER LAYOUT GRID */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* PRIMARY CONTENT COLUMN (68%) */}
        <div className="space-y-6 min-w-0">
          {/* A. FULFILLMENT TIMELINE */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-[#111111]">
                <Truck className="size-4 text-[#111111]" /> Fulfillment Progression
              </h2>
              <span className="text-[11px] font-mono text-[#6B7280]">
                ETA: {order.eta || '3 – 5 days'}
              </span>
            </div>
            <div className="pt-2">
              <Timeline
                items={order.timeline || []}
                currentStatus={order.status}
                cancelled={isCancelled}
              />
            </div>
          </div>

          {/* B. PURCHASED PRODUCTS BREAKDOWN */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h2 className="font-serif text-lg font-normal text-[#111111]">
                Ordered Formulations ({order.items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {order.items?.map((item, idx) => {
                const itemImg = getProductImage({
                  name: item.name,
                  images: item.image ? [{ id: '1', url: item.image }] : [],
                })

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="size-16 shrink-0 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] p-1.5 flex items-center justify-center overflow-hidden">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="size-full object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/images/products/serum.png'
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-semibold text-sm text-[#111111] hover:underline line-clamp-1 leading-snug block"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                          <span className="font-mono text-[10px] bg-[#FAF7F2] border border-[#E5E7EB] px-2 py-0.5 rounded-md font-semibold text-[#111111]">
                            {item.productId ? `ID: ${item.productId.slice(-6).toUpperCase()}` : 'BAR-SKU'}
                          </span>
                          <span>•</span>
                          <span>Qty: <strong className="font-medium text-[#111111]">{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Unit: {formatINR(item.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono font-bold text-sm text-[#111111]">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* C. CUSTOMER & SHIPPING INFORMATION */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Customer Details */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs">
              <h3 className="flex items-center gap-2 font-serif text-base font-normal text-[#111111]">
                <User className="size-4 text-[#111111]" /> Customer Profile
              </h3>
              <div className="space-y-1.5 text-xs text-[#374151]">
                <p className="font-semibold text-[#111111] text-sm">{order.address?.fullName || 'Anonymous User'}</p>
                <p className="text-[#6B7280]">{order.address?.email || 'No email registered'}</p>
                <p className="text-[#6B7280]">{order.address?.phone || 'No phone registered'}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs">
              <h3 className="flex items-center gap-2 font-serif text-base font-normal text-[#111111]">
                <MapPin className="size-4 text-[#111111]" /> Shipping Address
              </h3>
              <div className="space-y-1 text-xs text-[#374151]">
                <p className="font-semibold text-[#111111]">{order.address?.fullName}</p>
                <p className="text-[#6B7280]">{order.address?.line1}</p>
                {order.address?.line2 && <p className="text-[#6B7280]">{order.address.line2}</p>}
                <p className="text-[#6B7280]">
                  {order.address?.city}, {order.address?.state} — {order.address?.pincode}
                </p>
                {order.address?.landmark && <p className="text-[11px] text-[#9CA3AF]">Landmark: {order.address.landmark}</p>}
              </div>
            </div>
          </div>

          {/* D. PAYMENT METHOD & STATUS */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3 shadow-2xs">
            <h3 className="flex items-center gap-2 font-serif text-base font-normal text-[#111111]">
              <CreditCard className="size-4 text-[#111111]" /> Payment Method & Verification
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  PAYMENT TYPE
                </span>
                <span className="font-semibold text-[#111111] text-sm">
                  {order.paymentMethod || 'Cash on Delivery (COD)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                  TRANSACTION STATUS
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-0.5',
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                      : 'bg-[#FAF7F2] text-[#111111] border-[#E5E7EB]'
                  )}
                >
                  {order.paymentStatus || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL SIDEBAR COLUMN (32%) */}
        <div className="space-y-6 min-w-0">
          {/* A. FULFILLMENT ACTION CARD */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                FULFILLMENT ACTION
              </span>
              <h3 className="font-serif text-lg font-normal text-[#111111] mt-0.5">
                Update Order Status
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#6B7280] block">
                Select next transition status:
              </label>
              <AppSelect
                className="w-full text-xs"
                value={selectedNext}
                onValueChange={(v) => setTargetStatus(v as OrderStatus)}
                options={STATUS_OPTIONS}
              />
            </div>

            <Button
              type="button"
              disabled={updateStatus.isPending || selectedNext === order.status}
              onClick={handleApplyStatusUpdate}
              className="w-full rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] transition-colors min-h-[40px]"
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" /> Updating Status...
                </>
              ) : selectedNext === order.status ? (
                'Current Status Active'
              ) : (
                'Confirm Status Update →'
              )}
            </Button>

            <p className="text-[11px] text-[#9CA3AF] font-light leading-relaxed">
              Updates persist directly to MongoDB and write an entry into the customer's fulfillment timeline.
            </p>
          </div>

          {/* B. ORDER FINANCIAL SUMMARY CARD */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="font-serif text-lg font-normal text-[#111111] border-b border-[#E5E7EB] pb-3">
              Order Financial Summary
            </h3>

            <div className="space-y-2 text-xs text-[#6B7280]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-[#111111]">{formatINR(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-800">
                  <span>Product Savings</span>
                  <span className="font-mono font-semibold">− {formatINR(order.discount)}</span>
                </div>
              )}

              {order.couponCode && (
                <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/60 p-2 rounded-xl border border-emerald-200/60">
                  <span>Coupon ({order.couponCode})</span>
                  <span className="font-mono font-bold">− {formatINR(order.couponDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-800">
                  {order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>GST (Included)</span>
                <span className="font-mono font-medium text-[#111111]">
                  {!order.gst || order.gst === 0 ? 'Included' : formatINR(order.gst)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-[#111111]">
                <span className="font-serif text-sm font-semibold">Final Total</span>
                <span className="font-serif text-xl font-bold text-[#111111]">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
