import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Truck, AlertCircle, RefreshCw, Loader2, ShoppingBag } from 'lucide-react'
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
        label: 'Processing (Packed)',
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
        <p className="font-serif text-lg font-normal text-rose-900">Failed to load order details</p>
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
      <div className="rounded-2xl border border-[#DCE6E9] bg-white p-12 text-center space-y-3 shadow-2xs">
        <p className="font-serif text-lg font-normal text-[#172126]">Order Record Unavailable</p>
        <p className="text-xs text-[#52636B] font-light">We couldn't find an order matching identifier "{orderId}".</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126]">
          <Link to="/admin/orders">Back to Orders Register</Link>
        </Button>
      </div>
    )
  }

  const badge = getStatusBadge(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const selectedNext = targetStatus || order.status
  const custName = order.address?.fullName || 'Customer'

  const handleApplyStatusUpdate = () => {
    if (!selectedNext || selectedNext === order.status) return
    updateStatus.mutate(selectedNext as OrderStatus)
  }

  return (
    <div className="space-y-6">
      {/* 1. EDITORIAL ORDER HEADER */}
      <div className="space-y-3 border-b border-[#DCE6E9] pb-6">
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-medium text-[#52636B] hover:text-[#167C86] hover:bg-[#FAF7F2] -ml-2">
          <Link to="/admin/orders">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back to Orders
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
              FULFILLMENT RECORD
            </span>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#172126] tracking-tight">
                {order.orderId}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider',
                  badge.className
                )}
              >
                <span className={cn('size-1.5 rounded-full', badge.dot)} />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#52636B] font-light mt-1">
              Placed on <strong className="font-medium text-[#172126]">{formatDate(order.placedAt)}</strong> at{' '}
              {formatTime(order.placedAt)} · Customer: <strong className="font-medium text-[#172126]">{custName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. MASTER 68/32 LAYOUT GRID */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* PRIMARY FULFILLMENT COLUMN (68%) */}
        <div className="space-y-6 min-w-0">
          {/* A. FULFILLMENT TIMELINE */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                  FULFILLMENT JOURNEY
                </span>
                <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-[#172126] mt-0.5">
                  <Truck className="size-4 text-[#167C86]" /> Order Progression Timeline
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#52636B] bg-[#FAF7F2] border border-[#DCE6E9] px-2.5 py-1 rounded-md font-semibold">
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

          {/* B. ORDERED FORMULATIONS */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div className="border-b border-[#DCE6E9] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                ORDER CONTENT
              </span>
              <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-[#172126] mt-0.5">
                <ShoppingBag className="size-4 text-[#167C86]" /> Ordered Formulations ({order.items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-[#DCE6E9]">
              {order.items?.map((item, idx) => {
                const itemImg = getProductImage({
                  name: item.name,
                  images: item.image ? [{ id: '1', url: item.image }] : [],
                })

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="size-16 shrink-0 rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] p-1.5 flex items-center justify-center overflow-hidden">
                        <img
                          src={itemImg || undefined}
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
                          className="font-semibold text-sm text-[#172126] hover:text-[#167C86] hover:underline line-clamp-1 leading-snug block"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-[#52636B]">
                          <span className="font-mono text-[10px] bg-[#FAF7F2] border border-[#DCE6E9] px-2 py-0.5 rounded-md font-semibold text-[#172126]">
                            {item.productId ? `ID: ${item.productId.slice(-6).toUpperCase()}` : 'BAR-SKU'}
                          </span>
                          <span>•</span>
                          <span>Qty: <strong className="font-medium text-[#172126]">{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Unit: {formatINR(item.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-serif font-bold text-sm text-[#172126]">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* C. PAYMENT RECORD */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div className="border-b border-[#DCE6E9] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                PAYMENT RECORD
              </span>
              <h3 className="flex items-center gap-2 font-serif text-base font-normal text-[#172126] mt-0.5">
                <CreditCard className="size-4 text-[#167C86]" /> Payment Method & Verification
              </h3>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  PAYMENT METHOD
                </span>
                <span className="font-semibold text-[#172126] text-sm mt-0.5 block">
                  {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Cash on Delivery (COD)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                  TRANSACTION STATUS
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1',
                    order.paymentStatus === 'paid'
                      ? 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'
                      : 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]'
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
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                FULFILLMENT CONTROL
              </span>
              <h3 className="font-serif text-lg font-normal text-[#172126] mt-0.5">
                Update Order Status
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#52636B] block">
                Select transition status:
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
              className="w-full rounded-xl bg-[#167C86] text-white text-xs font-semibold hover:bg-[#12646c] disabled:bg-[#FAF7F2] disabled:text-[#7A8A91] disabled:border-[#DCE6E9] transition-colors min-h-[40px]"
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

            <p className="text-[11px] text-[#7A8A91] font-light leading-relaxed">
              Updates persist directly to MongoDB and write an entry into the customer's fulfillment timeline.
            </p>
          </div>

          {/* B. ORDER FINANCIAL SUMMARY CARD */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-6 space-y-4 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                ORDER SUMMARY
              </span>
              <h3 className="font-serif text-lg font-normal text-[#172126] border-b border-[#DCE6E9] pb-3 mt-0.5">
                Financial Breakdown
              </h3>
            </div>

            <div className="space-y-2 text-xs text-[#52636B]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-[#172126]">{formatINR(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex items-center justify-between text-[#167C86]">
                  <span>Product Savings</span>
                  <span className="font-mono font-semibold">− {formatINR(order.discount)}</span>
                </div>
              )}

              {order.couponCode && (
                <div className="flex items-center justify-between text-[#167C86] bg-[#EDF6F8] p-2 rounded-xl border border-[#167C86]/20">
                  <span>Coupon ({order.couponCode})</span>
                  <span className="font-mono font-bold">− {formatINR(order.couponDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-[#167C86]">
                  {order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>GST (Included)</span>
                <span className="font-mono font-medium text-[#172126]">
                  {!order.gst || order.gst === 0 ? 'Included' : formatINR(order.gst)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#DCE6E9] pt-3 text-[#172126]">
                <span className="font-serif text-sm font-semibold">Final Total</span>
                <span className="font-serif text-xl font-bold text-[#172126]">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* C. CUSTOMER & SHIPPING CARD */}
          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 space-y-5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
            {/* Customer Profile */}
            <div className="space-y-3 border-b border-[#DCE6E9] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                CUSTOMER
              </span>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center font-bold text-xs text-[#172126] shrink-0">
                  {getInitials(custName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#172126] text-sm line-clamp-1">{custName}</p>
                  <p className="text-[11px] text-[#7A8A91] truncate">{order.address?.email || 'No email registered'}</p>
                  <p className="text-[11px] text-[#7A8A91] truncate">{order.address?.phone || 'No phone registered'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                DELIVERY ADDRESS
              </span>
              <div className="space-y-1 text-xs text-[#52636B]">
                <p className="font-semibold text-[#172126]">{order.address?.fullName}</p>
                <p>{order.address?.line1}</p>
                {order.address?.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address?.city}, {order.address?.state} — {order.address?.pincode}
                </p>
                {order.address?.landmark && <p className="text-[11px] text-[#7A8A91]">Landmark: {order.address.landmark}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
