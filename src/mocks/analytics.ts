// Mock analytics data powering the admin dashboard + analytics page.

import type { AnalyticsData } from '@/types'
import { PRODUCTS } from './productCatalog'
import { MOCK_ORDERS } from './orders'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const base = [82, 91, 104, 98, 122, 136, 129, 151, 168, 161, 184, 210]

const revenueTrend = MONTHS.map((month, i) => ({
  month,
  revenue: base[i] * 100000,
  profit: Math.round(base[i] * 0.42) * 100000,
}))
const orderTrend = MONTHS.map((month, i) => ({
  month,
  orders: Math.round(base[i] * 34),
  cancelled: Math.round(base[i] * 3),
}))
const visitorTrend = MONTHS.map((month, i) => ({
  month,
  visitors: Math.round(base[i] * 480),
  sessions: Math.round(base[i] * 410),
}))
const customerGrowth = MONTHS.map((month, i) => ({
  month,
  customers: Math.round(base[i] * 96),
}))
const categorySales = [
  { name: 'Serums', value: 38 },
  { name: 'Moisturizers', value: 24 },
  { name: 'Sun Protection', value: 16 },
  { name: 'Cleansers', value: 12 },
  { name: 'Treatments', value: 7 },
  { name: 'Others', value: 3 },
]
const salesFunnel = [
  { stage: 'Visitors', value: 84000 },
  { stage: 'Product Views', value: 42000 },
  { stage: 'Add to Cart', value: 12600 },
  { stage: 'Checkout', value: 7100 },
  { stage: 'Purchased', value: 5400 },
]

const lowStock = PRODUCTS.filter((p) => p.stock > 0 && p.stock < 20).slice(0, 6)
const topProducts = [...PRODUCTS].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)).slice(0, 5)
const topCategories = [
  { name: 'Serums', sales: 4210000 },
  { name: 'Moisturizers', sales: 2680000 },
  { name: 'Sun Protection', sales: 1740000 },
  { name: 'Cleansers', sales: 1290000 },
  { name: 'Treatments', sales: 860000 },
]
const recentOrders = [...MOCK_ORDERS].sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)).slice(0, 6)

export const ANALYTICS: AnalyticsData = {
  summary: {
    revenue: 21080000,
    orders: 5400,
    products: PRODUCTS.length,
    customers: 18420,
    conversion: 6.43,
    visitors: 84000,
    averageOrderValue: 3903,
    revenueGrowth: 18.4,
    ordersGrowth: 12.1,
    customersGrowth: 8.7,
  },
  revenueTrend,
  orderTrend,
  visitorTrend,
  categorySales,
  customerGrowth,
  salesFunnel,
  topProducts,
  topCategories,
  lowStock,
  recentOrders,
  notifications: [
    { id: 'n1', title: 'New order received', message: 'Order LMS-2026-482139 worth ₹1,849 needs packing.', time: '5m ago', type: 'order' },
    { id: 'n2', title: 'Low stock alert', message: 'Retinal 0.05% Night Serum is below 20 units.', time: '32m ago', type: 'stock' },
    { id: 'n3', title: 'New 5-star review', message: 'Sneha Iyer reviewed Vitamin C 10% Brightening Serum.', time: '1h ago', type: 'review' },
    { id: 'n4', title: 'New customer', message: 'Rohan Bhatt just created an account.', time: '2h ago', type: 'customer' },
    { id: 'n5', title: 'Refund processed', message: 'Refund for order LMS-2026-118094 issued.', time: '3h ago', type: 'order' },
  ],
}
