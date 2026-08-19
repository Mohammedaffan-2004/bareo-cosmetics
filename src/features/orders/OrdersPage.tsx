import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PackageSearch,
  ArrowRight,
  RotateCcw,
  Ban,
  Truck,
  FileText,
  HelpCircle,
  Check,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import { formatINR, formatDate, cn } from '@/utils'
import { getProductImage } from '@/utils/productImages'
import type { Order } from '@/types'

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Ordered' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

function getStepIndex(status: string): number {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0
    case 'packed':
      return 1
    case 'shipped':
      return 2
    case 'out-for-delivery':
      return 3
    case 'delivered':
      return 4
    case 'cancelled':
    case 'refunded':
      return -1
    default:
      return 0
  }
}

function getStatusBadgeConfig(status: string) {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#059669]/20',
        dotClass: 'bg-[#059669]',
      }
    case 'confirmed':
    case 'packed':
    case 'shipped':
      return {
        label: status === 'confirmed' ? 'Processing' : status.replace('-', ' '),
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
        dotClass: 'bg-sky-500',
      }
    case 'pending':
    case 'out-for-delivery':
      return {
        label: status === 'pending' ? 'Pending' : 'Out for Delivery',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotClass: 'bg-amber-500',
      }
    case 'cancelled':
    case 'refunded':
      return {
        label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
        dotClass: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        badgeClass: 'bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB]',
        dotClass: 'bg-[#9CA3AF]',
      }
  }
}

export function OrdersPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => orderService().getOrders() })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderService().cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled', 'Refund will be initiated within 5–7 business days.')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const order = orders?.find((o) => o.orderId === orderId)
      if (!order) throw new Error('Order not found')
      for (const item of order.items) {
        const product = await productService().getProductById(item.productId)
        dispatch(addItem({ product, quantity: item.quantity }))
      }
    },
    onSuccess: () => toast.success('Items added to cart', 'Review your cart and checkout.'),
  })

  const handleViewInvoice = async (order: Order) => {
    try {
      toast.info('Generating invoice...', 'Please wait')
      await orderService().generateInvoice(order)
      toast.success('Invoice generated', `Invoice for order ${order.orderId}`)
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${order.orderId} - Bareo Cosmetics</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-w: 680px; margin: 0 auto; line-height: 1.5; }
                h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
                .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
                table { width: 100%; border-collapse: collapse; margin: 24px 0; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                th { color: #666; font-weight: 600; text-transform: uppercase; font-size: 12px; }
                .total { text-align: right; font-size: 18px; font-weight: 700; margin-top: 16px; }
                .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
              </style>
            </head>
            <body>
              <h1>Bareo Cosmetics — Official Invoice</h1>
              <p class="meta">Order Ref: <strong>${order.orderId}</strong> &bull; Placed: ${formatDate(order.placedAt)} &bull; Payment: ${order.paymentMethod}</p>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th style="text-align:right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map((i) => `
                    <tr>
                      <td>${i.name}</td>
                      <td>${i.quantity}</td>
                      <td>₹${i.price}</td>
                      <td style="text-align:right;">₹${i.price * i.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="total">Total Paid: ${formatINR(order.total)}</div>
              <div class="footer">Thank you for choosing Bareo Cosmetics. Science for Everyday Skin.</div>
              <script>window.print();</script>
            </body>
          </html>
        `)
        win.document.close()
      }
    } catch {
      toast.error('Could not generate invoice')
    }
  }

  const filtered = orders?.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'processing') return ['confirmed', 'packed', 'shipped'].includes(o.status)
    return o.status === filter
  })

  return (
    <div className="container-page py-8 sm:py-12 space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-[#6B7280] font-light">
            Track dispatches, view invoices, rate formulations and re-order past favorites.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF7F2] border border-[#E5E7EB] px-3 py-1 text-[11px] text-[#6B7280]">
          <ShieldCheck className="size-3.5 text-[#059669]" />
          <span>100% Authentic Formulations</span>
        </div>
      </div>

      {/* 2. STATUS FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'processing', label: 'Processing' },
          { key: 'shipped', label: 'Shipped' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={cn(
              'shrink-0 rounded-xl border px-4 py-2 text-xs font-medium transition-all duration-200 min-h-[36px]',
              filter === t.key
                ? 'border-[#111111] bg-[#111111] text-white shadow-2xs font-semibold'
                : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN ORDERS LIST */}
      {isLoading ? (
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<PackageSearch className="size-8 text-[#111111]" />}
            title={filter === 'all' ? 'No orders yet' : `No ${filter} orders yet`}
            description={
              filter === 'all'
                ? "You haven't placed any skincare orders yet."
                : `Your ${filter} orders will appear here once an order has reached this stage.`
            }
            action={
              <Button asChild className="rounded-xl bg-[#111111] text-white text-xs px-5 hover:bg-black min-h-[44px]">
                <Link to="/shop">
                  Continue Shopping <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((order) => {
            const statusConfig = getStatusBadgeConfig(order.status)
            const currentStepIdx = getStepIndex(order.status)
            const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
            const leadItem = order.items[0]
            const remainingCount = order.items.length - 1

            // Resolve robust image fallback for lead item
            const leadItemImageUrl = getProductImage({
              name: leadItem?.name,
              images: leadItem?.image ? [{ id: '1', url: leadItem.image }] : [],
            })

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs transition-all duration-200 hover:border-[#111111]/30"
              >
                {/* 1. ORDER CARD HEADER METADATA BAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] bg-[#FAF7F2] px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                        ORDER ID
                      </span>
                      <span className="font-mono font-bold text-[#111111] text-xs sm:text-sm">
                        {order.orderId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                        ORDER DATE
                      </span>
                      <span className="font-medium text-[#111111]">
                        {formatDate(order.placedAt)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                        TOTAL AMOUNT
                      </span>
                      <span className="font-serif font-bold text-[#111111] text-xs sm:text-sm whitespace-nowrap">
                        {formatINR(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider',
                        statusConfig.badgeClass
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', statusConfig.dotClass)} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* 2. PRODUCT INFORMATION SECTION */}
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                    {/* Product Image & Title Details */}
                    <div className="flex gap-4 min-w-0 flex-1">
                      <div className="size-20 sm:size-24 shrink-0 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={leadItemImageUrl || undefined}
                          alt={leadItem?.name || 'Bareo Product'}
                          className="size-full object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/images/products/serum.png'
                          }}
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <Link
                          to={`/product/${leadItem?.productId}`}
                          className="font-serif text-base sm:text-lg font-semibold text-[#111111] hover:underline line-clamp-2 leading-snug"
                        >
                          {leadItem?.name || 'Bareo Formulation'}
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                          <span className="font-medium text-[#111111]">
                            Qty: {leadItem?.quantity || 1}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#111111]">
                            {formatINR((leadItem?.price || 0) * (leadItem?.quantity || 1))}
                          </span>
                          {remainingCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#047857] font-semibold bg-[#ECFDF5] border border-[#059669]/20 px-2 py-0.5 rounded-md text-[11px]">
                                +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Expected Delivery Accent */}
                        <div className="pt-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
                          <Clock className="size-3.5 text-[#059669] shrink-0" />
                          <span>
                            {order.status === 'delivered' ? (
                              <strong className="text-[#047857] font-semibold">
                                Delivered on {formatDate(order.placedAt)}
                              </strong>
                            ) : isCancelled ? (
                              <span className="text-[#EF4444] font-medium">Order Cancelled</span>
                            ) : (
                              <span>
                                Expected delivery:{' '}
                                <strong className="font-semibold text-[#111111]">
                                  {order.eta || '3 – 5 business days'}
                                </strong>
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-item Thumbnail Preview */}
                    {remainingCount > 0 && (
                      <div className="hidden lg:flex items-center gap-2 border-l border-[#E5E7EB] pl-5 shrink-0">
                        {order.items.slice(1, 4).map((it, idx) => {
                          const subImg = getProductImage({
                            name: it.name,
                            images: it.image ? [{ id: '1', url: it.image }] : [],
                          })
                          return (
                            <div key={idx} className="size-12 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] p-1 flex items-center justify-center overflow-hidden">
                              <img
                                src={subImg || undefined}
                                alt={it.name}
                                className="size-full object-contain"
                                title={it.name}
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = '/images/products/serum.png'
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. INTEGRATED ORDER PROGRESS TRACKER */}
                  {!isCancelled ? (
                    <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1.5 font-medium text-[#111111]">
                          <Truck className="size-3.5 text-[#059669]" />
                          <span>Order Progress Tracker</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#9CA3AF]">
                          Step {Math.max(1, currentStepIdx + 1)} of 5
                        </span>
                      </div>

                      {/* Timeline Bar & Nodes */}
                      <div className="relative pt-2 pb-1">
                        <div className="grid grid-cols-5 gap-2 relative z-10">
                          {TIMELINE_STEPS.map((stepItem, idx) => {
                            const isCompleted = idx <= currentStepIdx
                            const isCurrent = idx === currentStepIdx

                            return (
                              <div key={stepItem.key} className="flex flex-col items-center text-center space-y-1.5">
                                <div
                                  className={cn(
                                    'flex size-6 items-center justify-center rounded-full transition-all duration-200 font-bold text-xs',
                                    isCompleted
                                      ? 'bg-[#111111] text-white shadow-2xs'
                                      : 'bg-white border border-[#E5E7EB] text-transparent'
                                  )}
                                >
                                  {isCompleted ? (
                                    <Check className="size-3 stroke-[2.5]" />
                                  ) : (
                                    <span className="size-1.5 rounded-full bg-[#D1D5DB]" />
                                  )}
                                </div>

                                <span
                                  className={cn(
                                    'text-[10px] font-medium leading-tight',
                                    isCurrent
                                      ? 'text-[#111111] font-bold'
                                      : isCompleted
                                      ? 'text-[#374151]'
                                      : 'text-[#9CA3AF]'
                                  )}
                                >
                                  {stepItem.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Connecting Line */}
                        <div className="absolute top-[20px] left-[10%] right-[10%] h-0.5 bg-[#E5E7EB] -z-0">
                          <div
                            className="h-full bg-[#111111] transition-all duration-300 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, (currentStepIdx / (TIMELINE_STEPS.length - 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium">
                        <Ban className="size-4 text-rose-600 shrink-0" />
                        This order was cancelled. Refund will be processed back to source.
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {/* Primary: Track Order */}
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-4 hover:bg-black transition-colors min-h-[36px]"
                    >
                      <Link to={`/orders/tracking?order=${order.orderId}`}>
                        <Truck className="size-3.5 mr-1.5" /> Track Order
                      </Link>
                    </Button>

                    {/* Secondary: View Invoice */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(order)}
                      className="rounded-xl border-[#E5E7EB] bg-white text-xs font-medium text-[#111111] hover:bg-[#FAFAFA] transition-colors min-h-[36px]"
                    >
                      <FileText className="size-3.5 mr-1.5" /> View Invoice
                    </Button>

                    {/* Secondary: Buy Again */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={reorderMutation.isPending}
                      onClick={() => reorderMutation.mutate(order.orderId)}
                      className="rounded-xl border-[#E5E7EB] bg-white text-xs font-medium text-[#111111] hover:bg-[#FAFAFA] transition-colors min-h-[36px]"
                    >
                      <RotateCcw className="size-3.5 mr-1.5" /> Buy Again
                    </Button>

                    {/* Tertiary: Need Help */}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-xs text-[#6B7280] hover:text-[#111111] min-h-[36px]"
                    >
                      <a href={`mailto:care@bareo.in?subject=Help%20with%20Order%20${order.orderId}`}>
                        <HelpCircle className="size-3.5 mr-1" /> Need Help
                      </a>
                    </Button>
                  </div>

                  {/* Cancel Order (Only if Pending) */}
                  {['pending'].includes(order.status) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(order.orderId)}
                      className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 ml-auto sm:ml-0 min-h-[36px]"
                    >
                      <Ban className="size-3.5 mr-1" /> Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

