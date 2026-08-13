import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Truck, ShieldCheck } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { Timeline } from '@/components/common/Timeline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { RatingStarsInput } from '@/features/products/RatingStarsInput'
import { formatDate, formatINR } from '@/utils'

function RateProduct({ productId, name }: { productId: string; name: string }) {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    await orderService().rateProduct(productId, { rating })
    setSubmitted(true)
  }
  return (
    <div className="flex items-center gap-2" id={`rate-${productId}`}>
      {submitted ? (
        <p className="text-xs font-semibold text-success">Thanks for rating!</p>
      ) : (
        <>
          <RatingStarsInput value={rating} onChange={setRating} />
          <Button size="sm" variant="outline" disabled={rating === 0} onClick={submit}>
            Submit
          </Button>
        </>
      )}
      <span className="hidden text-xs text-muted-foreground sm:block">{name}</span>
    </div>
  )
}

export function OrderTrackingPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order') ?? ''

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService().getOrderById(orderId),
    enabled: !!orderId,
  })

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Order not found" description="We couldn't find that order." action={<Button asChild><Link to="/orders">View My Orders</Link></Button>} />
      </div>
    )
  }

  const cancelled = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order <span className="font-semibold text-foreground">{order.orderId}</span> · placed {formatDate(order.placedAt)}
          </p>
        </div>
        <Badge variant="soft" className={cancelled ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}>
          {order.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Truck className="size-5 text-primary" /> Delivery Progress
          </h2>
          <div className="mt-6">
            <Timeline items={order.timeline} currentStatus={order.status} cancelled={cancelled} />
          </div>
          {!cancelled && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Expected delivery: {order.eta}</p>
                <p className="text-xs text-muted-foreground">You'll receive SMS and email updates as your order moves.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><MapPin className="size-4 text-primary" /> Delivery Address</h3>
            <p className="mt-3 text-sm font-medium">{order.address?.fullName || 'Customer'}</p>
            {order.address && (
              <p className="text-sm text-muted-foreground">{order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
            )}
            {order.address?.phone && <p className="text-sm text-muted-foreground">{order.address.phone}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold">Items ({order.items.length})</h3>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${item.productId}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity} · {formatINR(item.price)}</p>
                  </div>
                  {order.status === 'delivered' && (
                    <RateProduct productId={item.productId} name={item.name} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold">Payment Summary</h3>
            <div className="mt-3 space-y-2 text-xs text-[#6B7280]">
              <div className="flex items-center justify-between gap-3"><span>Subtotal</span><span className="shrink-0 text-right font-semibold text-[#111111] whitespace-nowrap">{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex items-center justify-between gap-3 text-emerald-700 font-medium"><span>Savings</span><span className="shrink-0 text-right font-semibold whitespace-nowrap">− {formatINR(order.discount)}</span></div>}
              {order.couponCode && <div className="flex items-center justify-between gap-3 text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span>Coupon ({order.couponCode})</span><span className="shrink-0 text-right font-bold whitespace-nowrap">− {formatINR(order.couponDiscount)}</span></div>}
              <div className="flex items-center justify-between gap-3"><span>Shipping</span><span className="shrink-0 text-right font-semibold text-emerald-700 whitespace-nowrap">{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span></div>
              <div className="flex items-center justify-between gap-3">
                <span>GST</span>
                <span className="shrink-0 text-right font-medium text-emerald-700 whitespace-nowrap">
                  {!order.gst || order.gst === 0 ? 'Included' : formatINR(order.gst)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-3 text-base font-serif font-bold text-[#111111]">
                <span className="shrink-0 font-serif">Total Paid</span>
                <span className="shrink-0 text-right font-serif font-bold whitespace-nowrap text-[#111111]">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
