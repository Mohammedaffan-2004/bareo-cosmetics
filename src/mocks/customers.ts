// Mock customers for the admin customer-management panel.

import type { Customer } from '@/types'

const DAYS_AGO = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'u1', name: 'Aarav Malhotra', email: 'aarav@example.com', phone: '+91 98765 43210', joinedAt: DAYS_AGO(220), orders: 12, lifetimeValue: 18450, status: 'active', lastOrder: DAYS_AGO(1), wishlist: 8, activity: [{ date: DAYS_AGO(1), action: 'Placed order LMS-2026-482139' }, { date: DAYS_AGO(3), action: 'Viewed product: Retinal 0.05% Night Serum' }] },
  { id: 'u2', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 91234 56780', joinedAt: DAYS_AGO(180), orders: 9, lifetimeValue: 13200, status: 'active', lastOrder: DAYS_AGO(2), wishlist: 5, activity: [{ date: DAYS_AGO(2), action: 'Placed order' }, { date: DAYS_AGO(4), action: 'Added 3 items to wishlist' }] },
  { id: 'u3', name: 'Karan Mehta', email: 'karan@example.com', phone: '+91 90000 11111', joinedAt: DAYS_AGO(150), orders: 6, lifetimeValue: 8900, status: 'active', lastOrder: DAYS_AGO(5), wishlist: 3, activity: [{ date: DAYS_AGO(5), action: 'Redeemed coupon GLOW100' }] },
  { id: 'u4', name: 'Divya Reddy', email: 'divya.r@example.com', phone: '+91 98888 22222', joinedAt: DAYS_AGO(120), orders: 4, lifetimeValue: 6100, status: 'inactive', lastOrder: DAYS_AGO(40), wishlist: 2, activity: [{ date: DAYS_AGO(40), action: 'Last order placed' }] },
  { id: 'u5', name: 'Sneha Iyer', email: 'sneha@example.com', phone: '+91 97777 33333', joinedAt: DAYS_AGO(95), orders: 7, lifetimeValue: 10400, status: 'active', lastOrder: DAYS_AGO(3), wishlist: 6, activity: [{ date: DAYS_AGO(3), action: 'Completed AI Skin Analysis' }] },
  { id: 'u6', name: 'Ritika Bose', email: 'ritika@example.com', phone: '+91 96666 44444', joinedAt: DAYS_AGO(80), orders: 3, lifetimeValue: 4700, status: 'active', lastOrder: DAYS_AGO(8), wishlist: 4, activity: [{ date: DAYS_AGO(8), action: 'Left a 5-star review' }] },
  { id: 'u7', name: 'Arjun Kapoor', email: 'arjun@example.com', phone: '+91 95555 55555', joinedAt: DAYS_AGO(60), orders: 2, lifetimeValue: 2900, status: 'inactive', lastOrder: DAYS_AGO(55), wishlist: 1, activity: [{ date: DAYS_AGO(55), action: 'Cancelled order' }] },
  { id: 'u8', name: 'Meera Pillai', email: 'meera@example.com', phone: '+91 94444 66666', joinedAt: DAYS_AGO(45), orders: 5, lifetimeValue: 7800, status: 'active', lastOrder: DAYS_AGO(6), wishlist: 7, activity: [{ date: DAYS_AGO(6), action: 'Referred 2 friends' }] },
  { id: 'u9', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 93333 77777', joinedAt: DAYS_AGO(30), orders: 1, lifetimeValue: 1100, status: 'blocked', lastOrder: DAYS_AGO(20), wishlist: 0, activity: [{ date: DAYS_AGO(20), action: 'Chargeback dispute raised' }] },
  { id: 'u10', name: 'Isha Verma', email: 'isha@example.com', phone: '+91 92222 88888', joinedAt: DAYS_AGO(12), orders: 1, lifetimeValue: 1600, status: 'active', lastOrder: DAYS_AGO(10), wishlist: 3, activity: [{ date: DAYS_AGO(10), action: 'First order placed' }] },
  { id: 'u11', name: 'Rohan Bhatt', email: 'rohan@example.com', phone: '+91 91111 99999', joinedAt: DAYS_AGO(8), orders: 0, lifetimeValue: 0, status: 'active', wishlist: 2, activity: [{ date: DAYS_AGO(8), action: 'Signed up' }] },
]
