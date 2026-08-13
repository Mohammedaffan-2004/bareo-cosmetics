import { useQuery } from '@tanstack/react-query'
import { recommendationService } from '@/services/recommendationService'
import type { RecommendationResult } from '@/types'

/**
 * Custom React Query hook for fetching user recommendations.
 */
export function useRecommendations(options: { category?: string; limit?: number } = {}) {
  return useQuery<RecommendationResult[], Error>({
    queryKey: ['recommendations', options.category || 'all', options.limit || 6],
    queryFn: () => recommendationService.getRecommendations(options),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

/**
 * Custom React Query hook for fetching product compatibility.
 */
export function useProductCompatibility(productId?: string) {
  return useQuery<RecommendationResult | null, Error>({
    queryKey: ['product-compatibility', productId],
    queryFn: () => (productId ? recommendationService.getProductCompatibility(productId) : Promise.resolve(null)),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
