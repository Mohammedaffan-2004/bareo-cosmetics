import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  Zap,
  Clock,
  Check,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearCart } from '@/store/slices/cartSlice'
import { selectCartTotals } from '@/store/selectors/cartSelectors'
import { checkoutService, type PaymentOutcome } from '@/services/checkoutService'
import { orderService } from '@/services/orderService'
import { addressService } from '@/services/addressService'
import { useToast } from '@/hooks/useToast'
import { Stepper } from '@/components/common/Stepper'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { getProductImage } from '@/utils/productImages'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { CouponSection } from '@/components/checkout/CouponSection'
import { PAYMENT_METHODS, STATES } from './constants'
import { formatINR } from '@/utils'
import { cn } from '@/utils'

const addressSchema = z.object({
  fullName: z.string().min(3, 'Enter the full name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email'),
  line1: z.string().min(5, 'Enter your address'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(2, 'Select your state'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
  landmark: z.string().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

const STEPS = [
  { key: 'address', label: 'Address' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

export function CheckoutPage() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const items = useAppSelector((s) => s.cart.items)
  const coupon = useAppSelector((s) => s.cart.coupon)
  const totals = selectCartTotals(items, coupon)

  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<AddressForm | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [delivery, setDelivery] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [paying, setPaying] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentOutcome | null>(null)
  const [placing, setPlacing] = useState(false)

  const { data: savedAddresses } = useQuery({ queryKey: ['addresses'], queryFn: () => addressService().getAddresses() })
  const { data: deliveryOptions } = useQuery({ queryKey: ['delivery-options'], queryFn: () => checkoutService().getDeliveryOptions() })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  // Pre-fill default address when savedAddresses are loaded
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !address) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0]
      if (def) {
        setSelectedAddressId(def.id)
        const a = {
          fullName: def.fullName,
          phone: def.phone.replace(/\D/g, '').slice(-10),
          email: def.email ?? '',
          line1: def.line1,
          line2: def.line2 ?? '',
          city: def.city,
          state: def.state || 'Karnataka',
          pincode: def.pincode,
          landmark: def.landmark ?? '',
        }
        setAddress(a)
        for (const k of Object.keys(a) as (keyof AddressForm)[]) {
          setValue(k, a[k])
        }
      }
    }
  }, [savedAddresses, address, setValue])

  const selectedDeliveryOpt = deliveryOptions?.find((d) => d.id === delivery)
  const isStandardFree = delivery === 'standard' && (totals.subtotal - totals.couponDiscount >= 299)
  const effectiveShipping = delivery === 'standard'
    ? (isStandardFree ? 0 : 39)
    : (selectedDeliveryOpt?.price ?? (delivery === 'express' ? 49 : 99))
  const grandTotal = totals.subtotal - totals.couponDiscount + effectiveShipping + (totals.isGstIncluded ? 0 : totals.gst)

  if (items.length === 0 && step === 0 && !paying) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Nothing to checkout"
          description="Your cart is empty — add some products first."
          action={<Button onClick={() => navigate('/shop')}>Go to Shop</Button>}
        />
      </div>
    )
  }

  const onAddressSubmit = (data: AddressForm) => {
    setAddress(data)
    setStep(1)
  }

  const startPayment = async (outcome?: PaymentOutcome) => {
    setPaying(true)
    setPaymentResult(null)
    setStep(2)
    const res = await checkoutService().processPayment({ method: paymentMethod, amount: grandTotal }, outcome)
    setTimeout(() => {
      setPaying(false)
      setPaymentResult(res.outcome)
    }, 400)
  }

  const placeOrder = async () => {
    let targetAddress = address
    if (!targetAddress && savedAddresses && savedAddresses.length > 0) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0]
      targetAddress = {
        fullName: def.fullName,
        phone: def.phone.replace(/\D/g, '').slice(-10),
        email: def.email ?? '',
        line1: def.line1,
        line2: def.line2 ?? '',
        city: def.city,
        state: def.state || 'Karnataka',
        pincode: def.pincode,
        landmark: def.landmark ?? '',
      }
    }
    if (!targetAddress) {
      toast.error('Shipping Address Required', 'Please provide a shipping address.')
      setStep(0)
      return
    }
    setPlacing(true)
    try {
      const order = await orderService().placeOrder({
        items,
        address: { ...targetAddress, phone: `+91 ${targetAddress.phone}` },
        deliveryId: delivery,
        paymentMethod: paymentMethodLabel(paymentMethod),
        couponCode: coupon?.code,
        totals: {
          subtotal: totals.subtotal,
          discount: totals.discount,
          couponDiscount: totals.couponDiscount,
          shipping: effectiveShipping,
          gst: totals.gst,
          total: grandTotal,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      dispatch(clearCart())
      navigate(`/order-success?order=${order.orderId}`)
    } catch (err) {
      toast.error('Could not place order', (err as { message?: string }).message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* 1. CHECKOUT EDITORIAL HEADER */}
      <div className="space-y-3 border-b border-[#DCE6E9] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
            CHECKOUT
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight mt-0.5">
            Step {step + 1} of 4 · {STEPS[step]?.label}
          </h1>
        </div>
        {/* 2. REFINED STEPPER */}
        <Stepper steps={STEPS} current={step} onStepClick={(i) => i < step && setStep(i)} />
      </div>

      {/* 3. MASTER 2-COLUMN CHECKOUT LAYOUT */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] items-start">
        {/* MAIN STEP CONTENT AREA */}
        <div className="min-w-0">
          {/* STEP 1 — Address */}
          {step === 0 && (
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
              <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-[#172126]">
                <MapPin className="size-5 text-[#167C86]" /> Shipping Address
              </h2>

              {savedAddresses && savedAddresses.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id ?? null)
                        const a = {
                          fullName: addr.fullName,
                          phone: addr.phone.replace(/\D/g, '').slice(-10),
                          email: addr.email ?? '',
                          line1: addr.line1,
                          line2: addr.line2 ?? '',
                          city: addr.city,
                          state: addr.state,
                          pincode: addr.pincode,
                          landmark: addr.landmark ?? '',
                        }
                        setAddress(a)
                        for (const k of Object.keys(a) as (keyof AddressForm)[]) {
                          setValue(k, a[k], { shouldValidate: true })
                        }
                      }}
                      className={cn(
                        'rounded-xl border p-4 text-left text-sm transition-all relative cursor-pointer min-h-[44px] shadow-2xs',
                        selectedAddressId === addr.id
                          ? 'border-[#172126] bg-[#FAF7F2] ring-1 ring-[#172126]'
                          : 'border-[#DCE6E9] bg-white hover:border-[#172126]/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#172126]">{addr.fullName} · <span className="uppercase text-[10px] text-[#7A8A91]">{addr.label}</span></p>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="size-4 text-[#167C86] shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#52636B] leading-relaxed">{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                      {addr.isDefault && <p className="mt-1.5 text-[10px] font-bold text-[#167C86] uppercase tracking-wider">Default Address</p>}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit(onAddressSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2">
                <AppInput label="Full name *" placeholder="Aarav Malhotra" error={errors.fullName?.message} {...register('fullName')} />
                <AppInput label="Mobile number *" inputMode="numeric" placeholder="98765 43210" error={errors.phone?.message} {...register('phone')} />
                <AppInput label="Email *" type="email" className="sm:col-span-2" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                <AppInput label="Address (house no, street) *" className="sm:col-span-2" placeholder="204, Palm Residency, MG Road" error={errors.line1?.message} {...register('line1')} />
                <AppInput label="Apartment / landmark" placeholder="Near Metro Pillar 42" {...register('landmark')} />
                <AppInput label="Area / locality" placeholder="Indiranagar" {...register('line2')} />
                <AppInput label="City *" placeholder="Bengaluru" error={errors.city?.message} {...register('city')} />
                <AppSelect
                  label="State *"
                  placeholder="Select state"
                  options={STATES.map((s) => ({ value: s, label: s }))}
                  onValueChange={(v) => {
                    setValue('state', v, { shouldValidate: true })
                    setAddress((a) => ({ ...(a as AddressForm), state: v }))
                  }}
                  error={errors.state?.message}
                />
                <AppInput label="Pincode *" inputMode="numeric" placeholder="560001" error={errors.pincode?.message} {...register('pincode')} />
                <div className="sm:col-span-2 pt-2">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#172126] px-6 py-3 text-xs font-semibold text-white shadow-2xs hover:bg-[#253239] transition-colors border border-[#172126]">
                    <span>Continue to Delivery</span>
                    <Truck className="size-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2 — Delivery */}
          {step === 1 && (
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-4">
                <div>
                  <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-[#172126]">
                    <Truck className="size-5 text-[#167C86]" /> Delivery Option
                  </h2>
                  <p className="text-xs text-[#52636B] font-light mt-0.5">Select your preferred dispatch speed & delivery service.</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-3 py-1 text-xs font-medium text-[#172126]">
                  <ShieldCheck className="size-3.5 text-[#167C86]" /> Guaranteed Dispatch
                </span>
              </div>

              {/* Delivery Cards Grid */}
              <div className="grid gap-4">
                {deliveryOptions?.map((opt) => {
                  const isSelected = delivery === opt.id
                  const isStandardFree = opt.id === 'standard' && (totals.subtotal - totals.couponDiscount >= 299)
                  const displayCost = opt.id === 'standard' ? (isStandardFree ? 0 : 39) : opt.price

                  const OptionIcon = opt.id === 'standard' ? Truck : opt.id === 'express' ? Zap : Clock

                  const chipLabel = (opt as any).chip || (opt.id === 'standard' ? 'Eco Friendly' : opt.id === 'express' ? 'Fastest' : 'Selected Cities')
                  const chipColor = opt.id === 'express'
                    ? 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'
                    : opt.id === 'sameday'
                      ? 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'
                      : 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30'

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setDelivery(opt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setDelivery(opt.id)}
                      className={cn(
                        'group relative flex cursor-pointer items-start justify-between rounded-2xl border p-5 transition-all duration-200',
                        isSelected
                          ? 'border-[#172126] bg-[#FAF7F2] shadow-2xs ring-1 ring-[#172126]'
                          : 'border-[#DCE6E9] bg-white hover:bg-[#FAF7F2]/50 hover:border-[#172126]/30'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors mt-0.5',
                            isSelected ? 'bg-[#172126] text-white' : 'bg-[#FAF7F2] text-[#7A8A91] group-hover:text-[#172126]'
                          )}
                        >
                          <OptionIcon className="size-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif text-base font-normal text-[#172126]">{opt.name}</h3>
                            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold', chipColor)}>
                              {chipLabel}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-[#172126] flex items-center gap-1">
                            <span>Estimate:</span>
                            <span className="font-semibold text-[#172126]">{opt.eta}</span>
                          </p>

                          <p className="text-[11px] text-[#52636B] font-light">{opt.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch space-y-3 shrink-0 pl-2">
                        <div className="text-right">
                          <span className={cn('font-serif text-base font-bold', displayCost === 0 ? 'text-[#167C86]' : 'text-[#172126]')}>
                            {displayCost === 0 ? 'FREE' : formatINR(displayCost)}
                          </span>
                          {opt.id === 'standard' && !isStandardFree && (
                            <span className="block text-[10px] text-[#167C86] font-medium">FREE above ₹299</span>
                          )}
                          {opt.id === 'standard' && isStandardFree && (
                            <span className="block text-[10px] text-[#167C86] font-semibold">✓ Free Unlocked</span>
                          )}
                        </div>

                        <div
                          className={cn(
                            'flex size-5 items-center justify-center rounded-full transition-all',
                            isSelected ? 'bg-[#172126] text-white ring-2 ring-black/10' : 'border-2 border-[#DCE6E9]'
                          )}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* COMPACT DELIVERY CONFIRMATION STRIP */}
              <div className="border-t border-[#DCE6E9] pt-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91]">
                      DELIVERING TO
                    </p>
                    <p className="font-medium text-[#172126] mt-0.5">
                      {address ? `${address.city} · ${address.pincode}` : 'Bengaluru · 560001'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-semibold text-[#172126] hover:text-[#167C86] transition-colors"
                  >
                    Change →
                  </button>
                </div>

                <div className="flex items-center justify-between text-[#52636B] pt-1">
                  <span className="font-normal text-[#52636B]">Estimated arrival</span>
                  <span className="font-semibold text-[#172126]">
                    {delivery === 'express'
                      ? 'Tomorrow if ordered before 6PM'
                      : delivery === 'sameday'
                        ? 'Today by 9 PM if ordered before 2PM'
                        : '3–5 business days'}
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button type="button" onClick={() => setStep(0)} className="text-xs text-[#7A8A91] hover:text-[#172126] flex items-center transition-colors">
                  <ChevronLeft className="size-4 mr-1" /> Back to Address
                </button>
                <button type="button" className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-6 hover:bg-[#253239] transition-colors min-h-[44px] shadow-2xs border border-[#172126] inline-flex items-center gap-1.5" onClick={() => setStep(2)}>
                  <span>Continue to Payment</span>
                  <CreditCard className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment */}
          {step === 2 && (
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
              <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-[#172126]">
                <CreditCard className="size-5 text-[#167C86]" /> Payment Method
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setPaymentResult(null) }} className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all', paymentMethod === m.id ? 'border-[#172126] bg-[#FAF7F2] ring-1 ring-[#172126]' : 'border-[#DCE6E9] hover:border-[#172126]/30')}>
                    <RadioGroupItem value={m.id} />
                    <div>
                      <p className="font-semibold text-xs text-[#172126]">{m.label}</p>
                      <p className="text-[11px] text-[#7A8A91]">{m.detail}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <AppInput className="sm:col-span-2" label="Card number" inputMode="numeric" placeholder="4242 4242 4242 4242" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} />
                  <AppInput className="sm:col-span-2" label="Name on card" placeholder="AARAV MALHOTRA" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} />
                  <AppInput label="Expiry (MM/YY)" placeholder="08/29" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} />
                  <AppInput label="CVV" inputMode="numeric" type="password" placeholder="•••" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} />
                </div>
              )}

              {!paying && !paymentResult && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => startPayment()}
                    className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#172126] px-6 py-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#253239] transition-colors border border-[#172126]"
                  >
                    Pay {formatINR(grandTotal)}
                  </button>
                </div>
              )}

              {paying && (
                <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#FAF7F2] border border-[#DCE6E9] py-10">
                  <div className="relative flex size-16 items-center justify-center">
                    <span className="absolute inset-0 animate-spin rounded-full border-4 border-[#DCE6E9] border-t-[#172126]" />
                    <Loader2 className="size-6 animate-pulse text-[#172126]" />
                  </div>
                  <p className="text-sm font-semibold text-[#172126]">Contacting your bank…</p>
                  <p className="text-xs text-[#7A8A91]">Please don't refresh this page</p>
                </div>
              )}

              {!paying && paymentResult && (
                <div className="mt-4">
                  {paymentResult === 'success' ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#167C86]/30 bg-[#EDF6F8] py-8 text-center">
                      <CheckCircle2 className="size-12 text-[#167C86]" />
                      <p className="text-lg font-bold text-[#167C86]">Payment successful!</p>
                      <p className="text-sm text-[#167C86]">Amount {formatINR(grandTotal)} charged to {paymentMethodLabel(paymentMethod)}</p>
                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={placing}
                        className="mt-2 min-h-[44px] rounded-xl bg-[#172126] px-6 py-3 text-xs font-semibold text-white hover:bg-[#253239] transition-colors shadow-2xs border border-[#172126]"
                      >
                        {placing ? 'Placing Order...' : 'Review & Place Order'}
                      </button>
                    </div>
                  ) : paymentResult === 'failed' ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 py-8 text-center">
                      <XCircle className="size-12 text-rose-600" />
                      <p className="text-lg font-bold text-rose-900">Payment failed</p>
                      <p className="text-sm text-rose-700">Your bank declined the transaction. Please try again.</p>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => startPayment()} className="bg-[#172126] text-white">Retry Payment</Button>
                        <Button variant="outline" onClick={() => setPaymentResult(null)} className="border-[#DCE6E9]">Change Method</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 py-8 text-center">
                      <Ban className="size-12 text-amber-600" />
                      <p className="text-lg font-bold text-amber-900">Payment cancelled</p>
                      <p className="text-sm text-amber-800">You cancelled the payment. Nothing was charged.</p>
                      <Button onClick={() => startPayment()} className="mt-2 bg-[#172126] text-white">Try Again</Button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#7A8A91] hover:text-[#172126] flex items-center transition-colors">
                  <ChevronLeft className="size-4 mr-1" /> Back to Delivery
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 3 && (
            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
              <h2 className="font-serif text-xl font-normal text-[#172126]">Review your order</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => {
                  const itemPrice = item.product?.offerPrice ?? item.product?.price ?? 0
                  return (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={getProductImage(item.product) || undefined} alt="" className="size-14 rounded-xl object-contain bg-[#FAF7F2] border border-[#DCE6E9] p-1" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-serif text-sm font-semibold text-[#172126]">{item.product.name}</p>
                        <p className="text-xs text-[#52636B]">Qty {item.quantity} × {formatINR(itemPrice)}</p>
                      </div>
                      <span className="font-semibold text-[#172126]">{formatINR(itemPrice * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <Separator className="my-4 border-[#DCE6E9]" />
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-serif font-semibold text-[#172126]">Deliver to</p>
                    <button type="button" onClick={() => setStep(0)} className="text-xs font-semibold text-[#167C86] hover:underline">Change →</button>
                  </div>
                  <p className="mt-1 text-[#52636B]">{address?.fullName}</p>
                  <p className="text-[#52636B]">{address?.line1}, {address?.city}, {address?.state} — {address?.pincode}</p>
                  <p className="mt-1 text-xs text-[#7A8A91]">{address?.phone} · {address?.email}</p>
                </div>
                <div className="rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-serif font-semibold text-[#172126]">Payment</p>
                    <button type="button" onClick={() => setStep(2)} className="text-xs font-semibold text-[#167C86] hover:underline">Change →</button>
                  </div>
                  <p className="mt-1 text-[#52636B]">{paymentMethodLabel(paymentMethod)}</p>
                  <p className="text-xs text-[#167C86] font-medium">Paid {formatINR(grandTotal)} · secured by gateway</p>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <button type="button" onClick={() => setStep(2)} className="text-xs text-[#7A8A91] hover:text-[#172126] flex items-center transition-colors">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing}
                  className="rounded-xl bg-[#172126] px-6 py-3 text-xs font-semibold text-white hover:bg-[#253239] transition-colors min-h-[44px] shadow-2xs border border-[#172126]"
                >
                  {placing ? 'Placing Order...' : `Place Order · ${formatINR(grandTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. REUSABLE ORDER SUMMARY SIDEBAR */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <CouponSection />

          <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-4 shadow-2xs">
            <h2 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#172126] border-b border-[#DCE6E9] pb-3 flex items-center justify-between">
              <span>YOUR ORDER</span>
              <span className="text-[11px] font-mono text-[#7A8A91]">
                ({totals.itemCount} {totals.itemCount === 1 ? 'ITEM' : 'ITEMS'})
              </span>
            </h2>

            {/* Itemized Order Products */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => {
                const itemPrice = item.product?.offerPrice ?? item.product?.price ?? 0
                return (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="line-clamp-1 min-w-0 flex-1 font-normal text-[#52636B]">
                      {item.product.name} <strong className="font-semibold text-[#172126]">× {item.quantity}</strong>
                    </span>
                    <span className="shrink-0 text-right font-semibold text-[#172126] whitespace-nowrap">
                      {formatINR(itemPrice * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <Separator className="my-2 border-[#DCE6E9]" />

            {/* Pricing Totals Breakdown */}
            <div className="space-y-2 text-xs text-[#52636B]">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="font-semibold text-[#172126]">{formatINR(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex items-center justify-between gap-3 text-[#167C86] font-medium">
                  <span>Product Savings</span>
                  <span className="font-semibold">− {formatINR(totals.discount)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex items-center justify-between gap-3 text-[#167C86] font-semibold bg-[#EDF6F8] p-2 rounded-lg border border-[#167C86]/20">
                  <span className="truncate">Coupon ({coupon?.code})</span>
                  <span className="font-bold">− {formatINR(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span>Shipping</span>
                <span className="font-semibold text-[#167C86]">
                  {effectiveShipping === 0 ? 'FREE' : formatINR(effectiveShipping)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>GST</span>
                <span className="font-medium text-[#167C86]">Included</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="flex items-center justify-between gap-4 border-t border-[#DCE6E9] pt-3 text-xl font-serif font-bold text-[#172126]">
              <span className="font-serif">Total</span>
              <span className="font-serif font-bold text-[#172126]">{formatINR(grandTotal)}</span>
            </div>

            {/* Green Savings Pill */}
            {totals.savings > 0 && (
              <div className="rounded-xl bg-[#EDF6F8] border border-[#167C86]/20 p-2.5 text-center text-xs font-semibold text-[#167C86]">
                You save {formatINR(totals.savings)} on this order
              </div>
            )}

            {/* Trust Note */}
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#7A8A91] font-light">
              <ShieldCheck className="size-3.5 text-[#167C86]" /> 256-bit SSL secured payment • Guaranteed Dispatch
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function paymentMethodLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id
}
