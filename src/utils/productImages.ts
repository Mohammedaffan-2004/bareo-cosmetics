import type { Category, Product } from '@/types'

/**
 * Maps any product (from client mock or MongoDB backend) to its primary
 * Cloudinary product image URL. Returns `null` if no valid primary image exists.
 */
export function getProductImage(product?: Partial<Product> | null): string | null {
  if (!product) return null

  // 1. Prefer explicit type === 'primary' image, falling back to images[0]
  const primaryObj = product.images?.find((img) => img.type === 'primary')
  const rawUrl = primaryObj?.url || product.images?.[0]?.url

  // If rawUrl is a valid URL or local product image, return it
  if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/new-img/'))) {
    return rawUrl
  }

  return rawUrl || null
}

/**
 * Maps category objects to existing clean image assets.
 */
export function getCategoryImage(category?: Partial<Category> | null): string {
  if (!category) return '/editorial/category/bareo-category-skincare.jpg'

  const rawUrl = category.image
  if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/editorial/'))) {
    return rawUrl
  }

  const slug = (category.slug || category.name || '').toLowerCase()
  if (slug.includes('hair')) return '/editorial/category/bareo-category-haircare.jpg'
  if (slug.includes('body')) return '/editorial/category/bareo-category-bodycare.jpg'
  if (slug.includes('baby')) return '/editorial/category/bareo-category-babycare.jpg'

  return '/editorial/category/bareo-category-skincare.jpg'
}
