// ============================================================
// Domain types used across the whole application.
// These mirror what a future backend API would return so that
// swapping the mock layer never touches the UI.
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
  role?: 'USER' | 'ADMIN'
  joinedAt: string
}

export type SkinType =
  | 'dry'
  | 'oily'
  | 'combination'
  | 'normal'
  | 'sensitive'
  | 'all'
  | 'baby'
  | 'oily-scalp'
  | 'dry-scalp'
  | 'normal-scalp'
  | 'curly'
  | 'newborn'
  | 'toddler'
  | 'thinning'

export type Concern =
  | 'acne'
  | 'dryness'
  | 'oiliness'
  | 'pigmentation'
  | 'sensitivity'
  | 'anti-aging'
  | 'dark-circles'
  | 'redness'
  | 'hair-fall'
  | 'thinning'
  | 'dandruff'
  | 'dry-scalp'
  | 'frizz'
  | 'body-acne'
  | 'roughness'
  | 'body-dryness'
  | 'cradle-cap'
  | 'diaper-rash'
  | 'dehydration'
  | 'dullness'
  | 'blackheads'
  | 'sun-protection'
  | 'aging'
  | 'fine-lines'
  | 'uneven-texture'
  | 'scalp-care'
  | 'damage'
  | 'breakage'
  | 'heat-damage'
  | 'volume'
  | 'tan-removal'
  | 'rough-skin'
  | 'tanning'
  | 'back-acne'
  | 'dry-hands'
  | 'cracked-skin'
  | 'cracked-heels'
  | 'calluses'
  | 'baby-care'
  | 'drool-rash'
  | 'dry-cheeks'
  | 'sweat-folds'
  | 'chafing'
  | 'barrier-repair'
  | 'sensitive-skin'
  | 'kp'
  | 'pores'
  | 'blemishes'
  | 'texture'
  | 'glow'


export interface Ingredient {
  name: string
  description: string
  concentration?: string
  image?: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  title?: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  productId?: string
}

export interface Faq {
  id?: string
  question: string
  answer: string
}

export interface ProductImage {
  id?: string
  url: string
  publicId?: string
  alt?: string
  type?: 'primary' | 'gallery' | 'lifestyle' | 'detail'
}

export interface Product {
  id: string
  sku?: string
  slug: string
  name: string
  brand: string
  categoryId: string
  categoryName: string
  categorySlug: string
  shortDescription: string
  description: string
  images: ProductImage[]
  mrp: number
  offerPrice: number
  discount: number
  rating: number
  ratingCount: number
  stock: number
  isBestSeller: boolean
  isTrending: boolean
  isDoctorRecommended: boolean
  isNew?: boolean
  isNewProduct?: boolean
  isAiRecommended?: boolean
  skinTypes: SkinType[]
  concerns: Concern[]
  ingredients: Ingredient[]
  benefits: string[]
  usage: string[]
  keyFacts: string[]
  faqs: Faq[]
  tags: string[]
  reviews?: Review[]
  soldCount?: number
  status?: 'active' | 'inactive' | 'out-of-stock'
  createdAt?: string
  price?: number
  volume?: string
  badge?: string
  subtitle?: string
}

export interface Offer {
  id: string
  title: string
  subtitle: string
  code?: string
  badge: string
  background: string
  image?: string
  discountLabel: string
  type: 'flash' | 'season' | 'combo' | 'referral'
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'flat' | 'percent'
  value: number
  minOrderValue?: number
  minOrder?: number
  maxDiscount?: number
  expiresAt?: string
  validTill?: string
  description?: string
  isActive?: boolean
  active?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description: string
  itemCount?: number
  icon?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Address {
  id?: string
  // Backend canonical fields
  name?: string
  address?: string
  locality?: string
  type?: 'home' | 'work' | 'other'
  // Frontend / checkout fields
  fullName?: string
  email?: string
  line1?: string
  line2?: string
  landmark?: string
  label?: string
  // Shared fields
  phone: string
  pincode: string
  city: string
  state: string
  isDefault?: boolean
}

export interface ShippingAddress {
  id: string
  fullName: string
  phone: string
  email?: string
  line1: string
  line2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  label?: string
}

export interface DeliveryOption {
  id: string
  name: string
  price: number
  estimatedDays?: string
  eta?: string
  freeThreshold?: number
  description?: string
  chip?: string
  arrivalHint?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  label: string
  last4?: string
  upiId?: string
  isDefault: boolean
}

export interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderTimeline {
  status: OrderStatus
  label: string
  at: string
}

export interface Order {
  id: string
  orderId: string
  placedAt: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax?: number
  gst?: number
  total: number
  paymentMethod: string
  paymentStatus: 'paid' | 'pending' | 'failed' | string
  status: OrderStatus
  shippingAddress?: Address | ShippingAddress
  address?: Address | ShippingAddress
  estimatedDelivery?: string
  eta?: string
  timeline: OrderTimeline[]
  trackingNumber?: string
  courier?: string
  couponCode?: string
  couponDiscount?: number
  refunded?: boolean
  rated?: boolean
}

export interface CustomerActivity {
  date: string
  action: string
}

export interface CustomerOrderSummary {
  id: string
  orderId: string
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  itemCount: number
  placedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  joinedAt?: string
  orders?: number
  lifetimeValue?: number
  lastOrder?: string
  status?: 'active' | 'blocked' | 'inactive' | string
  wishlist?: number
  activity?: CustomerActivity[]
  orderHistory?: CustomerOrderSummary[]
  // Legacy alias fields
  totalOrders?: number
  totalSpent?: number
  lastOrderAt?: string
  skinType?: SkinType
}

export interface AiMetric {
  label: string
  score: number | null
  level?: 'good' | 'fair' | 'low' | 'insufficient-data'
  evidence?: 'measured' | 'inferred' | 'insufficient-data'
  status?: 'good' | 'fair' | 'low' | 'measured' | 'inferred' | 'insufficient-data'
  confidence?: number
  source?: ('questionnaire' | 'selfie')[]
  detail: string
}

export interface AiFocusArea {
  key: string
  label: string
  reasoning: string
}

export interface AiDataQuality {
  questionnaireScore: number
  selfieScore: number
  overallConfidence: number
  imageQualityReason?: string
}

export interface AiReport {
  analysisVersion?: '1.0' | '2.0'
  primaryFocus?: AiFocusArea
  secondaryFocus?: AiFocusArea
  dataQuality?: AiDataQuality
  skinScore: number | null
  confidence?: number
  analysisSource?: 'questionnaire+selfie' | 'questionnaire' | 'selfie' | 'insufficient-data'
  isComplete?: boolean
  hydration: AiMetric
  oilBalance: AiMetric
  sensitivity: AiMetric
  barrier: AiMetric
  acneRisk?: AiMetric
  pigmentation: AiMetric
  elasticity: AiMetric
  summary: string[]
}

export interface AiRoutineStep {
  name: string
  time: string
  products: Product[]
}

export interface AiConsultationAnswers {
  age?: number
  gender?: string
  skinType?: SkinType
  concerns?: Concern[]
  sleepHours?: string
  waterIntake?: string
  sunExposure?: string
  oilySkin?: boolean
  drySkin?: boolean
  hasSensitiveSkin?: boolean
  hasDarkCircles?: boolean
}

export interface AiConsultation {
  id: string
  userId?: string
  date: string
  answers: AiConsultationAnswers
  hasPhotoAnalysis?: boolean
  dermalMetrics?: Record<string, any> | null
  report: AiReport
  routine: {
    morning: AiRoutineStep
    night: AiRoutineStep
  }
  lifestyleTips: string[]
  recommendedProductIds: string[]
}

export interface RecommendationResult {
  productId: string
  matchPercent: number | null
  reasons: string[]
  keyTags: string[]
  isCompatible: boolean
  product: Product
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  products?: Product[]
  timestamp?: string
}

export interface HomeBanner {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  bgGradient: string
  image: string
  tag: string
  eyebrow?: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: { name: string; avatar: string; role: string }
  category: string
  publishedAt: string
  readTime: string
  tags: string[]
  isFeatured?: boolean
  date?: string
  image?: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  comment: string
  skinConcern: string
  productUsed: string
  verified: boolean
  quote?: string
  skinType?: string
  result?: string
  avatarColor?: string
}

export interface HomeContent {
  banners: HomeBanner[]
  categories: Category[]
  bestSellers: Product[]
  testimonials: Testimonial[]
  blogPosts?: BlogPost[]
  blogs?: BlogPost[]
  trending?: Product[]
  featured?: Product[]
  doctorRecommended?: Product[]
  ingredients?: { name: string; description: string; image: string }[]
  concerns?: { value: string; label: string; image: string; description: string }[]
  offers?: Offer[]
}

export interface AnalyticsSummary {
  revenue: number
  revenueGrowth: number
  orders: number
  ordersGrowth: number
  customers: number
  customersGrowth: number
  products: number
  conversion?: number
  visitors?: number
  averageOrderValue?: number
}

export interface RevenueTrend {
  month: string
  revenue: number
}

export interface OrderTrend {
  month: string
  orders: number
  cancelled: number
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  revenueTrend: RevenueTrend[]
  orderTrend: OrderTrend[]
  topProducts: Product[]
  lowStock?: Product[]
  recentOrders?: Order[]
  notifications?: { id: string; type: 'order' | 'stock' | 'review' | 'customer'; title: string; message: string; time: string }[]
  visitorTrend?: unknown[]
  categorySales?: unknown[]
  customerGrowth?: unknown[]
  salesFunnel?: unknown[]
  topCategories?: unknown[]
}

export interface DashboardAttention {
  awaitingFulfillment: number
  lowStock: number
  activeCoupons: number
}

export interface DashboardRecentCustomer {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  ordersCount: number
  lifetimeValue: number
}

export interface DashboardRecentOrder {
  id: string
  orderId: string
  total: number
  status: OrderStatus
  paymentStatus: string
  placedAt: string
  customerName: string
  customerEmail: string
}

export interface DashboardOverviewData {
  summary: {
    revenue: number
    orders: number
    products: number
    customers: number
    averageOrderValue: number
  }
  attention: DashboardAttention
  lowStock: Partial<Product>[]
  recentOrders: DashboardRecentOrder[]
  recentCustomers: DashboardRecentCustomer[]
}

export interface RealAnalyticsSummary {
  revenue: number
  orders: number
  averageOrderValue: number
  newCustomers: number
  rangeRevenue?: number
  rangeOrders?: number
  rangeAov?: number
}

export interface AnalyticsTimePoint {
  date: string
  label?: string
  revenue?: number
  orders?: number
  cancelled?: number
  customers?: number
}

export interface AnalyticsOrderStatus {
  status: string
  count: number
}

export interface AnalyticsTopProduct {
  productId: string
  name: string
  unitsSold: number
  revenue: number
}

export interface AnalyticsPromotionsSummary {
  couponOrders: number
  totalDiscount: number
  topCoupons: { code: string; count: number }[]
}

export interface RealAnalyticsPayload {
  range: {
    key: string
    label: string
    start: string
    end: string
  }
  summary: RealAnalyticsSummary
  revenueTrend: AnalyticsTimePoint[]
  orderTrend: AnalyticsTimePoint[]
  orderStatus: AnalyticsOrderStatus[]
  topProducts: AnalyticsTopProduct[]
  customerTrend: AnalyticsTimePoint[]
  promotions: AnalyticsPromotionsSummary
}

export interface StoreSettingsPayload {
  id?: string
  storeName: string
  supportEmail: string
  supportPhone: string
  freeShippingThreshold: number
  gstRate: number
  lowStockThreshold: number
  maintenanceMode: boolean
  aiAssistantEnabled: boolean
  updatedAt?: string
}


