import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Download, PackageCheck, ChevronRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { Timeline } from '@/components/common/Timeline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatINR } from '@/utils'

import { printInvoiceDocument, downloadInvoiceFile } from '@/utils/invoiceGenerator'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order') || ''

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService().getOrderById(orderId),
    enabled: !!orderId,
  })

  const handlePrint = () => {
    if (!order) return
    const prevTitle = document.title
    document.title = `BAREO-Invoice-${order.orderId}`
    printInvoiceDocument(order)
    setTimeout(() => {
      document.title = prevTitle
    }, 1000)
  }

  const handleDownload = () => {
    if (!order) return
    downloadInvoiceFile(order)
  }

  if (isLoading) {
    return (
      <div className="container-page py-16 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Order not found"
          description="We couldn't locate this order."
          action={<Button onClick={() => window.location.href = '/'}>Return Home</Button>}
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-12 max-w-4xl mx-auto space-y-8">
      {/* SUCCESS HERO BANNER (Hidden in Print Output) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="order-success-hero-banner print-hide rounded-3xl border border-[#DCE6E9] bg-gradient-to-b from-[#FAF7F2] to-white p-8 text-center space-y-4 shadow-2xs"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30">
          <CheckCircle2 className="size-8 text-[#167C86]" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
            CONFIRMED
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight mt-1">
            Order Placed Successfully
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-[#52636B] font-light max-w-md mx-auto leading-relaxed">
          Thank you for shopping with BAREO. Your order <span className="font-mono font-semibold text-[#172126]">{order.orderId}</span> is confirmed and being prepared for dispatch.
        </p>

        {order.address?.email && (
          <p className="text-xs text-[#7A8A91]">
            A confirmation receipt has been sent to <span className="font-medium text-[#172126]">{order.address.email}</span>
          </p>
        )}

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-6 hover:bg-[#253239] border border-[#172126] min-h-[44px] shadow-2xs">
            <Link to={`/orders/${order.id || order.orderId}`}>
              Track Order <ChevronRight className="size-4 ml-1 text-[#167C86]" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-[#DCE6E9] text-xs font-semibold px-6 text-[#172126] hover:bg-[#EDF6F8] min-h-[44px] shadow-2xs">
            <Link to="/orders">View Orders</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xl text-xs font-medium text-[#52636B] hover:text-[#172126] hover:bg-[#EDF6F8] min-h-[44px]">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>

      {/* INVOICE & ORDER DETAILS CARD */}
      <div className="invoice-card-container mx-auto max-w-3xl rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE6E9] pb-4">
          <div>
            <h2 className="font-serif text-lg font-normal text-[#172126]">Order Invoice</h2>
            <p className="text-xs text-[#7A8A91] mt-0.5">Order {order.orderId} · {formatDate(order.placedAt)}</p>
          </div>
          <div className="flex gap-2 print-hide">
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl border-[#DCE6E9] text-xs font-medium text-[#172126] hover:bg-[#FAF7F2]">
              <Printer className="size-3.5 mr-1.5 text-[#167C86]" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl border-[#DCE6E9] text-xs font-medium text-[#172126] hover:bg-[#FAF7F2]">
              <Download className="size-3.5 mr-1.5 text-[#167C86]" /> Download
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91]">SHIPPED TO</p>
            <p className="font-semibold text-[#172126]">{order.address?.fullName || 'Customer'}</p>
            {order.address && (
              <p className="text-[#52636B] leading-relaxed">{order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
            )}
            {order.address?.phone && <p className="text-[#7A8A91]">{order.address.phone}</p>}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91]">PAYMENT &amp; DISPATCH</p>
            <p className="font-semibold text-[#172126]">{order.paymentMethod}</p>
            <p className="font-medium text-[#167C86]">{order.paymentStatus}</p>
            <p className="text-[#52636B]">Expected delivery: <strong className="font-medium text-[#172126]">{order.eta}</strong></p>
          </div>
        </div>

        <Separator className="my-4 border-[#DCE6E9]" />

        {/* Product Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3.5 text-xs">
              <img src={item.image} alt="" className="size-14 rounded-xl object-contain bg-[#FAF7F2] border border-[#DCE6E9] p-1" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-serif text-sm font-medium text-[#172126]">{item.name}</p>
                <p className="text-[#7A8A91]">Qty {item.quantity} × {formatINR(item.price)}</p>
              </div>
              <span className="font-semibold text-[#172126]">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4 border-[#DCE6E9]" />

        {/* Pricing Breakdown */}
        <div className="ml-auto max-w-xs space-y-2 text-xs text-[#52636B]">
          <div className="flex items-center justify-between gap-3">
            <span>Subtotal</span>
            <span className="font-semibold text-[#172126]">{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between gap-3 text-[#167C86] font-medium">
              <span>Product Savings</span>
              <span className="font-semibold">− {formatINR(order.discount)}</span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex items-center justify-between gap-3 text-[#167C86] font-semibold bg-[#EDF6F8] p-2 rounded-lg border border-[#167C86]/20">
              <span className="truncate">Coupon ({order.couponCode})</span>
              <span className="font-bold">− {formatINR(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span>Shipping</span>
            <span className="font-semibold text-[#167C86]">{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>GST</span>
            <span className="font-medium text-[#167C86]">
              {!order.gst || order.gst === 0 ? 'Included' : formatINR(order.gst)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#DCE6E9] pt-3 text-lg font-serif font-bold text-[#172126]">
            <span className="font-serif">Total Paid</span>
            <span className="font-serif font-bold text-[#172126]">{formatINR(order.total)}</span>
          </div>
        </div>

        <Separator className="my-4 border-[#DCE6E9]" />

        {/* Order Progress Timeline Container */}
        <div className="flex items-start gap-3 rounded-2xl bg-[#FAF7F2] border border-[#DCE6E9] p-4.5">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-[#167C86]" />
          <div className="text-xs w-full">
            <p className="font-serif font-semibold text-[#172126]">Order progress</p>
            <Timeline className="mt-3" items={order.timeline} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  )
}
