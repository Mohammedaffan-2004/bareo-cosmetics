import { apiFetch } from './apiClient'
import type { RecommendationResult } from '@/types'

export const recommendationService = {
  /**
   * Retrieves dynamic ranked product recommendations for the active user.
   */
  async getRecommendations(options: { category?: string; limit?: number } = {}): Promise<RecommendationResult[]> {
    const queryParams = new URLSearchParams()
    if (options.category && options.category !== 'all' && options.category !== 'all-products') {
      queryParams.set('category', options.category)
    }
    if (options.limit) {
      queryParams.set('limit', String(options.limit))
    }

    const endpoint = `/ai/recommendations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const res = await apiFetch<{ items: RecommendationResult[] }>(endpoint)

    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items
    }
    return []
  },

  /**
   * Calculates compatibility score and rationale for a single product.
   */
  async getProductCompatibility(productId: string): Promise<RecommendationResult | null> {
    if (!productId) return null
    try {
      const res = await apiFetch<RecommendationResult>(`/ai/compatibility/${productId}`)
      if (res.data) {
        return res.data
      }
    } catch (err) {
      console.warn(`[Recommendation Service] Failed to fetch compatibility for ${productId}:`, err)
    }
    return null
  },
}
