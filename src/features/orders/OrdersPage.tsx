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
import { printInvoiceDocument } from '@/utils/invoiceGenerator'
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
        badgeClass: 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30',
        dotClass: 'bg-[#167C86]',
      }
    case 'confirmed':
    case 'packed':
    case 'shipped':
      return {
        label: status === 'confirmed' ? 'Processing' : status.replace('-', ' '),
        badgeClass: 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30',
        dotClass: 'bg-[#167C86]',
      }
    case 'pending':
    case 'out-for-delivery':
      return {
        label: status === 'pending' ? 'Pending' : 'Out for Delivery',
        badgeClass: 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30',
        dotClass: 'bg-[#167C86]',
      }
    case 'cancelled':
    case 'refunded':
      return {
        label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-600',
      }
    default:
      return {
        label: status,
        badgeClass: 'bg-[#FAF7F2] text-[#7A8A91] border-[#DCE6E9]',
        dotClass: 'bg-[#7A8A91]',
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
      toast.info('Opening invoice...', 'Please wait')
      await orderService().generateInvoice(order)
      printInvoiceDocument(order)
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
    <div className="container-page py-8 sm:py-12 max-w-5xl mx-auto space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE6E9] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
            ORDER HISTORY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight mt-0.5">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-[#52636B] font-medium">
            Track your formulations, delivery progress and past purchases.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-3.5 py-1.5 text-[11px] font-medium text-[#172126]">
          <ShieldCheck className="size-3.5 text-[#167C86]" />
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
                ? 'border-[#172126] bg-[#172126] text-white shadow-2xs font-semibold'
                : 'border-[#DCE6E9] bg-white text-[#52636B] hover:bg-[#FAF7F2] hover:text-[#172126]'
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
            <Skeleton key={i} className="h-60 rounded-2xl bg-[#FAF7F2]" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<PackageSearch className="size-8 text-[#167C86]" />}
            title={filter === 'all' ? 'No orders yet' : `No ${filter} orders yet`}
            description={
              filter === 'all'
                ? "Your saved formulations will appear here once you place your first order."
                : `Your ${filter} orders will appear here once an order has reached this stage.`
            }
            action={
              <Button asChild className="rounded-xl bg-[#172126] text-white text-xs px-6 hover:bg-[#253239] min-h-[44px] border border-[#172126]">
                <Link to="/shop">
                  Explore Formulations <ArrowRight className="size-4 ml-1.5" />
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
                className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-2xs transition-all duration-200 hover:border-[#172126]/30"
              >
                {/* 1. ORDER CARD HEADER METADATA BAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE6E9] bg-[#FAF7F2] px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">
                        ORDER ID
                      </span>
                      <span className="font-mono font-bold text-[#172126] text-xs sm:text-sm">
                        {order.orderId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">
                        ORDER DATE
                      </span>
                      <span className="font-medium text-[#172126]">
                        {formatDate(order.placedAt)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">
                        TOTAL AMOUNT
                      </span>
                      <span className="font-serif font-bold text-[#172126] text-xs sm:text-sm whitespace-nowrap">
                        {formatINR(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
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
                      <div className="size-20 sm:size-22 shrink-0 rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] p-1.5 flex items-center justify-center overflow-hidden">
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
                          className="font-serif text-base sm:text-lg font-medium text-[#172126] hover:underline line-clamp-2 leading-snug"
                        >
                          {leadItem?.name || 'Bareo Formulation'}
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-[#52636B]">
                          <span className="font-medium text-[#172126]">
                            Qty: {leadItem?.quantity || 1}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#172126]">
                            {formatINR((leadItem?.price || 0) * (leadItem?.quantity || 1))}
                          </span>
                          {remainingCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#167C86] font-semibold bg-[#EDF6F8] border border-[#167C86]/20 px-2 py-0.5 rounded-md text-[11px]">
                                +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Expected Delivery Accent */}
                        <div className="pt-1 flex items-center gap-1.5 text-xs text-[#52636B]">
                          <Clock className="size-3.5 text-[#167C86] shrink-0" />
                          <span>
                            {order.status === 'delivered' ? (
                              <strong className="text-[#167C86] font-semibold">
                                Delivered on {formatDate(order.placedAt)}
                              </strong>
                            ) : isCancelled ? (
                              <span className="text-rose-700 font-medium">Order Cancelled</span>
                            ) : (
                              <span>
                                Expected delivery:{' '}
                                <strong className="font-semibold text-[#172126]">
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
                      <div className="hidden lg:flex items-center gap-2 border-l border-[#DCE6E9] pl-5 shrink-0">
                        {order.items.slice(1, 4).map((it, idx) => {
                          const subImg = getProductImage({
                            name: it.name,
                            images: it.image ? [{ id: '1', url: it.image }] : [],
                          })
                          return (
                            <div key={idx} className="size-12 rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] p-1 flex items-center justify-center overflow-hidden">
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
                    <div className="border-t border-[#DCE6E9] pt-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#7A8A91]">
                        <span className="flex items-center gap-1.5 font-semibold text-[#172126] uppercase text-[10px] tracking-wider">
                          <Truck className="size-3.5 text-[#167C86]" />
                          <span>ORDER PROGRESS</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#7A8A91]">
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
                                    'flex size-5 sm:size-6 items-center justify-center rounded-full transition-all duration-200 text-xs',
                                    isCurrent
                                      ? 'bg-[#172126] text-white shadow-2xs font-bold'
                                      : isCompleted
                                      ? 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30'
                                      : 'bg-white border border-[#DCE6E9] text-transparent'
                                  )}
                                >
                                  {isCompleted ? (
                                    <Check className="size-3 stroke-[2.5]" />
                                  ) : (
                                    <span className="size-1.5 rounded-full bg-[#DCE6E9]" />
                                  )}
                                </div>

                                <span
                                  className={cn(
                                    'text-[10px] font-medium leading-tight',
                                    isCurrent
                                      ? 'text-[#172126] font-bold'
                                      : isCompleted
                                      ? 'text-[#167C86]'
                                      : 'text-[#7A8A91]'
                                  )}
                                >
                                  {stepItem.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Connecting Line */}
                        <div className="absolute top-[18px] sm:top-[20px] left-[10%] right-[10%] h-0.5 bg-[#DCE6E9] -z-0">
                          <div
                            className="h-full bg-[#167C86] transition-all duration-300 rounded-full"
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
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE6E9] bg-white px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {/* Primary: Track Order */}
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-4 hover:bg-[#253239] transition-colors min-h-[36px] shadow-2xs border border-[#172126]"
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
                      className="rounded-xl border-[#DCE6E9] bg-white text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] transition-colors min-h-[36px]"
                    >
                      <FileText className="size-3.5 mr-1.5 text-[#167C86]" /> View Invoice
                    </Button>

                    {/* Secondary: Buy Again */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={reorderMutation.isPending}
                      onClick={() => reorderMutation.mutate(order.orderId)}
                      className="rounded-xl border-[#DCE6E9] bg-white text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] transition-colors min-h-[36px]"
                    >
                      <RotateCcw className="size-3.5 mr-1.5 text-[#167C86]" /> Buy Again
                    </Button>

                    {/* Quiet: Need Help */}
                    <a
                      href={`mailto:care@bareo.in?subject=Help%20with%20Order%20${order.orderId}`}
                      className="text-xs font-normal text-[#52636B] hover:text-[#172126] hover:underline flex items-center gap-1 ml-1"
                    >
                      <HelpCircle className="size-3.5 text-[#7A8A91]" /> Need Help
                    </a>
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

