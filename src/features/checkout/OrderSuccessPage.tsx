import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Download, PackageCheck, ChevronRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { Confetti } from '@/components/common/Confetti'
import { Timeline } from '@/components/common/Timeline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatINR } from '@/utils'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order') ?? ''

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService().getOrderById(orderId),
    enabled: !!orderId,
  })

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <Skeleton className="mx-auto h-24 w-72" />
        <Skeleton className="mx-auto mt-6 h-4 w-64" />
        <Skeleton className="mx-auto mt-4 h-96 w-full max-w-3xl rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Order not found" description="We couldn't locate that order." action={<Button asChild><Link to="/shop">Continue Shopping</Link></Button>} />
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#ECFDF5] border border-[#059669]/20 text-[#059669] shadow-2xs"
        >
          <CheckCircle2 className="size-9 stroke-[2]" />
        </motion.div>

        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">
          Order placed successfully!
        </h1>

        <p className="text-xs sm:text-sm text-[#6B7280] font-light max-w-md mx-auto leading-relaxed">
          Thank you for shopping with Bareo. Your order <span className="font-mono font-bold text-[#111111]">{order.orderId}</span> is confirmed and being prepared.
        </p>

        <p className="text-xs text-[#6B7280]">
          A confirmation receipt has been sent to <span className="font-medium text-[#111111]">{order.address.email}</span>
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-5 hover:bg-black min-h-[44px]">
            <Link to={`/orders/tracking?order=${order.orderId}`}>
              Track Order <ChevronRight className="size-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-[#E5E7EB] text-xs font-medium px-5 text-[#111111] hover:bg-[#FAFAFA] min-h-[44px]">
            <Link to="/orders">View Orders</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xl text-xs text-[#6B7280] hover:text-[#111111] min-h-[44px]">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>

      {/* INVOICE & ORDER DETAILS CARD */}
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#111111]">Invoice</h2>
            <p className="text-xs text-[#6B7280]">Order {order.orderId} · {formatDate(order.placedAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] text-xs font-medium text-[#111111]">
              <Printer className="size-3.5 mr-1.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] text-xs font-medium text-[#111111]">
              <Download className="size-3.5 mr-1.5" /> Download
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">SHIPPED TO</p>
            <p className="font-semibold text-[#111111]">{order.address.fullName}</p>
            <p className="text-[#6B7280]">{order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
            <p className="text-[#6B7280]">{order.address.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">PAYMENT &amp; DISPATCH</p>
            <p className="font-semibold text-[#111111]">{order.paymentMethod}</p>
            <p className="font-medium text-[#047857]">{order.paymentStatus}</p>
            <p className="text-[#6B7280]">Expected delivery: <strong className="font-medium text-[#111111]">{order.eta}</strong></p>
          </div>
        </div>

        <Separator className="my-4 border-[#E5E7EB]" />

        {/* Product Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3.5 text-xs">
              <img src={item.image} alt="" className="size-14 rounded-xl object-cover bg-[#FAFAFA] border border-[#E5E7EB]" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-[#111111]">{item.name}</p>
                <p className="text-[#6B7280]">Qty {item.quantity} × {formatINR(item.price)}</p>
              </div>
              <span className="font-semibold text-[#111111]">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4 border-[#E5E7EB]" />

        {/* Pricing Breakdown */}
        <div className="ml-auto max-w-xs space-y-2 text-xs text-[#6B7280]">
          <div className="flex items-center justify-between gap-3">
            <span>Subtotal</span>
            <span className="font-semibold text-[#111111]">{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between gap-3 text-[#047857] font-medium">
              <span>Product Savings</span>
              <span className="font-semibold">− {formatINR(order.discount)}</span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex items-center justify-between gap-3 text-[#047857] font-semibold bg-[#ECFDF5] p-2 rounded-lg border border-[#059669]/20">
              <span className="truncate">Coupon ({order.couponCode})</span>
              <span className="font-bold">− {formatINR(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span>Shipping</span>
            <span className="font-semibold text-[#047857]">{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>GST</span>
            <span className="font-medium text-[#047857]">
              {!order.gst || order.gst === 0 ? 'Included' : formatINR(order.gst)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-3 text-lg font-serif font-bold text-[#111111]">
            <span className="font-serif">Total Paid</span>
            <span className="font-serif font-bold text-[#111111]">{formatINR(order.total)}</span>
          </div>
        </div>

        <Separator className="my-4 border-[#E5E7EB]" />

        {/* Order Progress Timeline Container */}
        <div className="flex items-start gap-3 rounded-2xl bg-[#FAF7F2] border border-[#E5E7EB] p-4.5">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-[#059669]" />
          <div className="text-xs w-full">
            <p className="font-semibold text-[#111111]">Order progress</p>
            <Timeline className="mt-3" items={order.timeline} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  )
}
