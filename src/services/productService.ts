// Product catalogue service — powers the shop listing, detail page
// and product lookups across the app (Live API + Persistent Fallback).

import type { Category, Product } from '@/types'
import { CATEGORIES } from '@/mocks/productCatalog'
import { mockError, mockFetch } from './mockApi'
import { getCatalog, setCatalog } from './productStore'
import { apiFetch } from './apiClient'

export interface ProductQuery {
  search?: string
  category?: string
  concern?: string
  skinType?: string
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount'
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStockOnly?: boolean
  page?: number
  pageSize?: number
}

export interface ProductPage {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  facets: {
    minPrice: number
    maxPrice: number
    categories: { slug: string; name: string; count: number }[]
    concerns: { value: string; label: string; count: number }[]
  }
}

function applyQuery(query: ProductQuery): Product[] {
  let list = [...getCatalog()]

  if (query.search) {
    const q = query.search.toLowerCase()
    list = list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.tags || []).join(' ').toLowerCase().includes(q))
  }
  if (query.category && query.category !== 'all' && query.category !== 'all-products') {
    const cat = query.category
    list = list.filter((p) => p.categorySlug === cat || (p.categoryName || '').toLowerCase() === cat.toLowerCase())
  }
  if (query.concern) {
    const concerns = query.concern.split(',')
    list = list.filter((p) => (p.concerns || []).some((c) => concerns.includes(c)))
  }
  if (query.skinType) {
    const types = query.skinType.split(',')
    list = list.filter((p) => (p.skinTypes || []).some((t) => types.includes(t)))
  }
  if (query.minRating) {
    list = list.filter((p) => (p.rating || 0) >= (query.minRating as number))
  }
  if (typeof query.minPrice === 'number') {
    list = list.filter((p) => p.offerPrice >= (query.minPrice as number))
  }
  if (typeof query.maxPrice === 'number') {
    list = list.filter((p) => p.offerPrice <= (query.maxPrice as number))
  }
  if (query.inStockOnly) {
    list = list.filter((p) => p.stock > 0)
  }

  const sort = query.sort || 'popular'
  if (sort === 'price-asc') list.sort((a, b) => a.offerPrice - b.offerPrice)
  if (sort === 'price-desc') list.sort((a, b) => b.offerPrice - a.offerPrice)
  if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  if (sort === 'newest') list.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1))
  if (sort === 'discount') list.sort((a, b) => (b.discount || 0) - (a.discount || 0))
  if (sort === 'popular') list.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))

  return list
}

export function productService() {
  const service = {
    async queryProducts(query: ProductQuery = {}): Promise<ProductPage> {
      try {
        const queryParams = new URLSearchParams()
        if (query.category && query.category !== 'all' && query.category !== 'all-products') {
          queryParams.set('category', query.category)
        }
        if (query.skinType) queryParams.set('skinType', query.skinType)
        if (query.concern) queryParams.set('concern', query.concern)
        const searchTerm = query.search || (query as any).q
        if (searchTerm) queryParams.set('search', searchTerm)
        if (query.sort) queryParams.set('sort', query.sort)
        if (query.page) queryParams.set('page', String(query.page))
        if (query.pageSize) queryParams.set('limit', String(query.pageSize))

        const res = await apiFetch<any>(`/products?${queryParams.toString()}`)
        if (res.data?.items) {
          const apiProducts = res.data.items.map((p: any) => ({
            ...p,
            images: Array.isArray(p.images)
              ? p.images.map((img: any, idx: number) => (typeof img === 'string' ? { id: `img-${idx}`, url: img } : img))
              : [{ id: 'img-def', url: '/images/products/bareo-cica-serum.png' }],
          }))

          // Update product store with live backend data
          setCatalog(apiProducts)

          const minPrice = Math.min(...apiProducts.map((p: any) => p.offerPrice), 199)
          const maxPrice = Math.max(...apiProducts.map((p: any) => p.offerPrice), 1499)
          const categories = Array.from(new Set(apiProducts.map((p: any) => p.categorySlug))).map((slug) => ({
            slug: String(slug),
            name: apiProducts.find((p: any) => p.categorySlug === slug)?.categoryName || String(slug),
            count: apiProducts.filter((p: any) => p.categorySlug === slug).length,
          }))

          return {
            products: apiProducts,
            total: res.data.total,
            page: res.data.page,
            pageSize: res.data.limit,
            totalPages: res.data.totalPages,
            facets: { minPrice, maxPrice, categories, concerns: [] },
          }
        }
      } catch (err) {
        console.warn('[Product Service] Live backend query fallback.', err)
      }

      const all = applyQuery(query)
      const pageSize = query.pageSize || 12
      const totalPages = Math.ceil(all.length / pageSize) || 1
      const safePage = Math.max(1, Math.min(query.page || 1, totalPages))
      const start = (safePage - 1) * pageSize

      const minPrice = Math.min(...all.map((p) => p.offerPrice), 199)
      const maxPrice = Math.max(...all.map((p) => p.offerPrice), 1499)
      const categories = Array.from(new Set(all.map((p) => p.categorySlug))).map((slug) => ({
        slug: String(slug),
        name: all.find((p) => p.categorySlug === slug)?.categoryName || String(slug),
        count: all.filter((p) => p.categorySlug === slug).length,
      }))
      const concerns = ['acne', 'pigmentation', 'dryness', 'oiliness', 'sensitivity', 'anti-aging'].map((value) => ({
        value,
        label: value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count: all.filter((p) => (p.concerns || []).includes(value as any)).length,
      }))

      return mockFetch<ProductPage>(() => ({
        products: all.slice(start, start + pageSize),
        total: all.length,
        page: safePage,
        pageSize,
        totalPages,
        facets: { minPrice, maxPrice, categories, concerns },
      })).then((res) => res.data)
    },

    getProducts(query: ProductQuery = {}): Promise<ProductPage> {
      return service.queryProducts(query)
    },

    async getProductBySlug(slug: string): Promise<Product> {
      try {
        const res = await apiFetch<Product>(`/products/${slug}`)
        if (res.data) return res.data
      } catch {
        // Fallback
      }
      const product = getCatalog().find((p) => p.slug === slug || p.id === slug)
      if (!product) mockError('Product not found', 404)
      return mockFetch(product!).then((res) => res.data)
    },

    async getProductById(id: string): Promise<Product> {
      const product = getCatalog().find((p) => p.id === id || p.slug === id)
      if (!product) mockError('Product not found', 404)
      return mockFetch(product!).then((res) => res.data)
    },

    async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
      const related = getCatalog().filter(
        (p) =>
          p.id !== product.id &&
          (p.categoryId === product.categoryId || (p.concerns || []).some((c) => (product.concerns || []).includes(c)))
      )
      const picked = related.slice(0, limit)
      const fill = getCatalog().filter((p) => !picked.some((x) => x.id === p.id)).slice(0, limit - picked.length)
      return mockFetch([...picked, ...fill]).then((res) => res.data)
    },

    async getRecentlyViewed(productIds: string[]): Promise<Product[]> {
      const viewed = productIds.map((id) => getCatalog().find((p) => p.id === id)).filter(Boolean) as Product[]
      return mockFetch(viewed).then((res) => res.data)
    },

    async searchSuggestions(query: string): Promise<Product[]> {
      const q = query.toLowerCase().trim()
      if (!q) return mockFetch([]).then((res) => res.data)
      const matches = getCatalog().filter((p) => (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)).slice(0, 6)
      return mockFetch(matches).then((res) => res.data)
    },

    async getAiRecommended(): Promise<Product[]> {
      const ai = getCatalog().filter((p) => p.isAiRecommended)
      const fill = getCatalog().filter((p) => !p.isAiRecommended && (p.isBestSeller || p.isTrending))
      return mockFetch([...ai, ...fill].slice(0, 6)).then((res) => res.data)
    },

    async getCategories(): Promise<Category[]> {
      try {
        const res = await apiFetch<Category[]>('/products/categories')
        if (Array.isArray(res.data) && res.data.length > 0) return res.data
      } catch {
        // fallback
      }
      return mockFetch(CATEGORIES).then((res) => res.data)
    },
  }

  return service
}
