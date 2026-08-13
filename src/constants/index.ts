import { Concern, SkinType } from '@/types'

export const APP_NAME = 'Bareo'
export const APP_TAGLINE = 'Science for Everyday Skin.'
export const SUPPORT_EMAIL = 'care@bareo.in'

// Simulated network latency (ms) for every mock API call.
export const MOCK_DELAY = 700

// Flip this to true when a real backend is ready — the service layer
// will switch to Axios without touching any component.
export const USE_MOCK_API = true

export const CONCERNS: { value: Concern; label: string; image: string; description: string }[] = [
  { value: 'acne', label: 'Acne', image: '/images/concerns/acne.svg', description: 'Breakouts, pimples & blemishes' },
  { value: 'dryness', label: 'Dry Skin', image: '/images/concerns/dry.svg', description: 'Tightness, flaking & dullness' },
  { value: 'oiliness', label: 'Oily Skin', image: '/images/concerns/oily.svg', description: 'Excess shine & large pores' },
  { value: 'pigmentation', label: 'Pigmentation', image: '/images/concerns/pigmentation.svg', description: 'Dark spots & uneven tone' },
  { value: 'sensitivity', label: 'Sensitive Skin', image: '/images/concerns/sensitive.svg', description: 'Reactive, itchy & irritated' },
  { value: 'anti-aging', label: 'Anti Aging', image: '/images/concerns/aging.svg', description: 'Fine lines & firmness' },
  { value: 'dark-circles', label: 'Dark Circles', image: '/images/concerns/darkcircles.svg', description: 'Under-eye tiredness' },
  { value: 'redness', label: 'Redness', image: '/images/concerns/redness.svg', description: 'Flushing & inflammation' },
]

export const SKIN_TYPES: { value: SkinType; label: string; description: string }[] = [
  { value: 'dry', label: 'Dry', description: 'Tight, flaky, prone to dullness' },
  { value: 'oily', label: 'Oily', description: 'Shiny, large pores, breakouts' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
  { value: 'normal', label: 'Normal', description: 'Balanced, few concerns' },
  { value: 'sensitive', label: 'Sensitive', description: 'Easily irritated, reactive' },
]

export const INGREDIENTS_HIGHLIGHT = [
  {
    name: 'Niacinamide 5%',
    description: 'Refines pores, controls oil and evens tone without irritation.',
    image: '/images/ingredients/niacinamide.svg',
  },
  {
    name: 'Vitamin C 10%',
    description: 'Brightens pigmentation and boosts a radiant, glass-skin glow.',
    image: '/images/ingredients/vitaminc.svg',
  },
  {
    name: 'Hyaluronic Acid',
    description: 'Holds up to 1000x its weight in water for deep, lasting hydration.',
    image: '/images/ingredients/hyaluronic.svg',
  },
  {
    name: 'Retinal 0.05%',
    description: 'The most potent retinoid ester for smoothing lines and wrinkles.',
    image: '/images/ingredients/retinal.svg',
  },
  {
    name: 'Centella Asiatica',
    description: 'Soothes redness and strengthens the skin barrier.',
    image: '/images/ingredients/centella.svg',
  },
  {
    name: 'Azelic Acid 10%',
    description: 'Targets acne and pigmentation with gentle, effective action.',
    image: '/images/ingredients/azelic.svg',
  },
]

export const GENDERS = [
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'other', label: 'Other', icon: '🧑' },
]

export const AGE_RANGES = [
  { value: '13-17', label: '13 – 17', hint: 'Teens — early concerns' },
  { value: '18-24', label: '18 – 24', hint: 'Early adult skin' },
  { value: '25-34', label: '25 – 34', hint: 'First signs of aging' },
  { value: '35-44', label: '35 – 44', hint: 'Fine lines & firmness' },
  { value: '45+', label: '45+', hint: 'Mature skin care' },
]

export const SLEEP_OPTIONS = [
  { value: 'less-than-6', label: 'Less than 6 hours' },
  { value: '6-8', label: '6 – 8 hours' },
  { value: 'more-than-8', label: 'More than 8 hours' },
]

export const WATER_OPTIONS = [
  { value: 'less-than-2', label: 'Less than 2 glasses' },
  { value: '2-4', label: '2 – 4 glasses' },
  { value: 'more-than-4', label: 'More than 4 glasses' },
]

export const SUN_OPTIONS = [
  { value: 'indoor', label: 'Mostly indoors' },
  { value: 'moderate', label: 'Occasional outdoors' },
  { value: 'high', label: 'High sun exposure' },
]

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', detail: 'Google Pay · PhonePe · Paytm · BHIM' },
  { id: 'card', label: 'Credit / Debit Card', detail: 'Visa · Mastercard · RuPay · Amex' },
  { id: 'netbanking', label: 'Net Banking', detail: 'All major banks supported' },
  { id: 'wallet', label: 'Wallets', detail: 'Paytm · Amazon Pay · Mobikwik' },
  { id: 'cod', label: 'Cash on Delivery', detail: 'Pay when your order arrives' },
]

export const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    eta: '3 – 5 business days',
    price: 39,
    freeThreshold: 299,
    description: 'Eco-friendly consolidated dispatch',
    chip: 'Eco Friendly',
    arrivalHint: 'Estimated arrival in 3–5 business days',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    eta: '1 – 2 business days',
    price: 49,
    description: 'Priority air dispatch',
    chip: 'Fastest',
    arrivalHint: 'Tomorrow if ordered before 6PM',
  },
  {
    id: 'sameday',
    name: 'Same Day Delivery',
    eta: 'Today before 9 PM',
    price: 99,
    description: 'Available only in selected cities',
    chip: 'Selected Cities',
    arrivalHint: 'Today by 9 PM if ordered before 2PM',
  },
]

export const ORDER_STATUS_FLOW: { key: string; label: string }[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Products', href: '/admin/products', icon: 'Package' },
  { label: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
  { label: 'Customers', href: '/admin/customers', icon: 'Users' },
  { label: 'Offers & Coupons', href: '/admin/offers', icon: 'TicketPercent' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
]

export const COUNTRY_CODE = '+91'
export const FREE_SHIPPING_THRESHOLD = 499
export const GST_PERCENT = 18
