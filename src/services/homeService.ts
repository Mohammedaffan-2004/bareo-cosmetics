import type { HomeContent } from '@/types'
import { CATEGORIES } from '@/mocks/productCatalog'
import { HOME_BANNERS, OFFERS, TESTIMONIALS, BLOGS } from '@/mocks/static'
import { CONCERNS, INGREDIENTS_HIGHLIGHT } from '@/constants'
import { mockFetch } from './mockApi'
import { productService } from './productService'
import { getCatalog } from './productStore'

export function homeService() {
  return {
    async getHomeContent(): Promise<HomeContent> {
      let products = getCatalog()
      try {
        const page = await productService().getProducts({ pageSize: 50 })
        if (page.products.length > 0) {
          products = page.products
        }
      } catch {
        // Fallback to getCatalog
      }

      return mockFetch<HomeContent>(() => ({
        banners: HOME_BANNERS,
        categories: CATEGORIES,
        trending: products.filter((p) => p.isTrending),
        bestSellers: products.filter((p) => p.isBestSeller).slice(0, 8),
        featured: products.filter((p) => p.isDoctorRecommended).slice(0, 4),
        doctorRecommended: products.filter((p) => p.isDoctorRecommended).slice(0, 8),
        shopByConcern: CONCERNS.map((c) => ({ concern: c.value, label: c.label, image: c.image })),
        ingredients: INGREDIENTS_HIGHLIGHT,
        testimonials: TESTIMONIALS,
        blogs: BLOGS,
        offers: OFFERS,
      })).then((res) => res.data)
    },
  }
}
