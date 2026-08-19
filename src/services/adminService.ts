// Admin service — dashboard, product CRUD, order & customer management (Live API + Fallback).

import type { DashboardOverviewData, RealAnalyticsPayload, StoreSettingsPayload, Customer, Order, OrderStatus, Product, Coupon, Offer } from '@/types'
import { OFFERS as INITIAL_OFFERS } from '@/mocks/static'
import { mockError, mockFetch } from './mockApi'
import { getCatalog, setCatalog } from './productStore'
import { apiFetch, apiUpload } from './apiClient'

let offerStore: Offer[] = [...INITIAL_OFFERS]

export type ProductFormInput = Partial<Product> & Pick<Product, 'name' | 'categoryId' | 'offerPrice' | 'mrp'>

export function adminService() {
  return {
    async uploadProductImage(file: File): Promise<{ url: string; publicId: string }> {
      const formData = new FormData()
      formData.append('image', file)

      const res = await apiUpload<{ url: string; publicId: string }>('/admin/products/upload-image', formData)
      if (res.data) {
        return res.data
      }
      throw new Error(res.message || 'Failed to upload product image')
    },

    async deleteProductImage(publicId: string): Promise<boolean> {
      const res = await apiFetch<{ success: boolean }>('/admin/products/delete-image', {
        method: 'POST',
        body: JSON.stringify({ publicId }),
      })
      return Boolean(res.data?.success)
    },
    async getDashboard(): Promise<DashboardOverviewData> {
      const res = await apiFetch<DashboardOverviewData>('/admin/analytics')
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to retrieve dashboard overview data')
    },

    async getAnalytics(params?: { range?: string; startDate?: string; endDate?: string }): Promise<RealAnalyticsPayload> {
      const queryParams = new URLSearchParams()
      if (params?.range) queryParams.set('range', params.range)
      if (params?.startDate) queryParams.set('startDate', params.startDate)
      if (params?.endDate) queryParams.set('endDate', params.endDate)

      const url = queryParams.toString() ? `/admin/analytics?${queryParams.toString()}` : '/admin/analytics'
      const res = await apiFetch<RealAnalyticsPayload>(url)
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to retrieve analytics data')
    },

    async getSettings(): Promise<StoreSettingsPayload> {
      const res = await apiFetch<StoreSettingsPayload>('/admin/settings')
      if (res.data) return res.data
      throw new Error('Failed to retrieve store settings')
    },

    async updateSettings(data: Partial<StoreSettingsPayload>): Promise<StoreSettingsPayload> {
      const res = await apiFetch<StoreSettingsPayload>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (res.data) return res.data
      throw new Error(res.message || 'Failed to update store settings')
    },

    // ------------------------------------------------------------
    // Products CRUD APIs
    // ------------------------------------------------------------
    async getAdminProducts(params?: { search?: string; category?: string; status?: string; stockFilter?: string; page?: number; limit?: number }): Promise<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }> {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.set('search', params.search)
      if (params?.category) queryParams.set('category', params.category)
      if (params?.status) queryParams.set('status', params.status)
      if (params?.stockFilter) queryParams.set('stockFilter', params.stockFilter)
      if (params?.page) queryParams.set('page', String(params.page))
      if (params?.limit) queryParams.set('limit', String(params.limit))

      const res = await apiFetch<any>(`/admin/products?${queryParams.toString()}`)
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to retrieve admin products')
    },

    async createProduct(input: ProductFormInput): Promise<Product> {
      if (!input.name || !input.offerPrice) mockError('Name and price are required', 422)

      const formattedImages = Array.isArray(input.images) && input.images.length > 0
        ? input.images.map((img: any) =>
            typeof img === 'string' ? { url: img, alt: input.name } : { url: img.url, alt: img.alt || input.name }
          )
        : [{ url: '/images/products/bareo-cica-serum.png', alt: input.name }]

      const payload = {
        name: input.name,
        brand: input.brand || 'Bareo',
        sku: input.sku,
        categoryId: input.categoryId || 'c1',
        shortDescription: input.shortDescription || input.description || input.name,
        description: input.description || input.name,
        mrp: input.mrp || Math.round(input.offerPrice * 1.25),
        offerPrice: input.offerPrice,
        stock: input.stock ?? 100,
        isBestSeller: input.isBestSeller ?? false,
        isTrending: input.isTrending ?? false,
        isDoctorRecommended: input.isDoctorRecommended ?? false,
        isNew: input.isNew ?? true,
        isAiRecommended: input.isAiRecommended ?? false,
        skinTypes: input.skinTypes || [],
        concerns: input.concerns || [],
        benefits: input.benefits || [],
        usage: input.usage || [],
        keyFacts: input.keyFacts || [],
        tags: input.tags || [],
        images: formattedImages,
        ingredients: input.ingredients || [],
        faqs: input.faqs || [],
        status: input.status || 'active',
      }

      const res = await apiFetch<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (res.data) {
        const prod: Product = {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images.map((img: any, idx: number) =>
                typeof img === 'string' ? { id: `img-${idx}`, url: img } : img
              )
            : [],
        }
        setCatalog([prod, ...getCatalog()])
        return prod
      }
      throw new Error('Failed to create product')
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
      let formattedUpdates: any = { ...updates }
      if (Array.isArray(updates.images)) {
        formattedUpdates.images = updates.images.map((img: any) =>
          typeof img === 'string'
            ? { url: img, alt: updates.name || '' }
            : { url: img.url, alt: img.alt || updates.name || '' }
        )
      }

      const res = await apiFetch<any>(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formattedUpdates),
      })
      if (res.data) {
        const updated: Product = {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images.map((img: any, idx: number) =>
                typeof img === 'string' ? { id: `img-${idx}`, url: img } : img
              )
            : [],
        }
        setCatalog(getCatalog().map((p) => (p.id === id ? updated : p)))
        return updated
      }
      throw new Error('Failed to update product')
    },

    async deleteProduct(id: string): Promise<{ success: boolean }> {
      const res = await apiFetch<any>(`/admin/products/${id}`, { method: 'DELETE' })
      setCatalog(getCatalog().filter((p) => p.id !== id))
      return res.data || { success: true }
    },

    // ------------------------------------------------------------
    // Orders APIs
    // ------------------------------------------------------------

    async getAdminOrders(): Promise<Order[]> {
      const res = await apiFetch<any>('/admin/orders')
      if (Array.isArray(res.data)) {
        return res.data
      }
      throw new Error('Failed to retrieve admin orders')
    },

    async getAdminOrderById(orderId: string): Promise<Order> {
      const res = await apiFetch<Order>(`/orders/${orderId}`)
      if (res.data) {
        return res.data
      }
      throw new Error('Order not found')
    },

    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
      const res = await apiFetch<any>(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to update order status')
    },

    // ------------------------------------------------------------
    // Customers APIs
    // ------------------------------------------------------------

    async getCustomers(): Promise<Customer[]> {
      const res = await apiFetch<Customer[]>('/admin/customers')
      if (Array.isArray(res.data)) {
        return res.data
      }
      throw new Error('Failed to retrieve customer directory')
    },

    async getCustomerById(id: string): Promise<Customer> {
      const res = await apiFetch<Customer>(`/admin/customers/${id}`)
      if (res.data) {
        return res.data
      }
      throw new Error('Customer profile not found')
    },

    // ------------------------------------------------------------
    // Coupons & Offers APIs
    // ------------------------------------------------------------

    async getCoupons(): Promise<Coupon[]> {
      const res = await apiFetch<Coupon[]>('/admin/coupons')
      if (Array.isArray(res.data)) {
        return res.data
      }
      throw new Error('Failed to retrieve coupons')
    },

    async getOffers(): Promise<Offer[]> {
      return mockFetch(offerStore).then((r) => r.data)
    },

    async createCoupon(input: {
      code: string
      description: string
      discountType: 'percent' | 'flat'
      value: number
      minOrder: number
      maxDiscount?: number
      validTill?: string
      active?: boolean
    }): Promise<Coupon> {
      const codeNormalized = input.code.trim().toUpperCase()

      const res = await apiFetch<Coupon>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({ ...input, code: codeNormalized }),
      })
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to create coupon')
    },

    async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
      const res = await apiFetch<Coupon>(`/admin/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      if (res.data) {
        return res.data
      }
      throw new Error('Failed to update coupon')
    },

    async deleteCoupon(id: string): Promise<{ success: boolean }> {
      const res = await apiFetch<{ success: boolean }>(`/admin/coupons/${id}`, { method: 'DELETE' })
      if (res.data) {
        return res.data
      }
      return { success: true }
    },
  }
}
