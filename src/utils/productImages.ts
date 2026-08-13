import type { Category, Product } from '@/types'

/**
 * Maps any product (from client mock or MongoDB backend) to its corresponding
 * high-definition product image asset in public/images/products/.
 */
export function getProductImage(product?: Partial<Product> | null): string {
  if (!product) return '/images/products/bareo-cica-serum.png'

  const rawUrl = product.images?.[0]?.url
  const validFiles = [
    'babybodywash.png',
    'babyMoisturizer.png',
    'bareo-cica-serum.png',
    'bodywash.png',
    'conditioner.png',
    'facewash.png',
    'Moisturizer.png',
    'serum.png',
    'shampoo.png',
    'sunscreen.png',
    'vitaminc.png',
    'bareo-hero-ad.png',
  ]

  if (rawUrl && !rawUrl.includes('unsplash.com') && !rawUrl.includes('placeholder')) {
    const filename = rawUrl.split('/').pop() || ''
    if (validFiles.includes(filename)) {
      return `/images/products/${filename}`
    }
  }

  const name = (product.name || '').toLowerCase()
  const catSlug = (product.categorySlug || '').toLowerCase()
  const catName = (product.categoryName || '').toLowerCase()
  const tags = (product.tags || []).join(' ').toLowerCase()
  const combined = `${name} ${catSlug} ${catName} ${tags}`

  // Direct match for Cica & Niacinamide Serum
  if (combined.includes('cica') || combined.includes('calming serum')) {
    return '/images/products/bareo-cica-serum.png'
  }

  // 1. Baby Care
  if (catSlug.includes('baby') || catName.includes('baby') || combined.includes('baby')) {
    if (combined.includes('wash') || combined.includes('shampoo') || combined.includes('cleanser')) {
      return '/images/products/babybodywash.png'
    }
    return '/images/products/babyMoisturizer.png'
  }

  // 2. Hair Care
  if (catSlug.includes('hair') || catName.includes('hair') || combined.includes('hair') || combined.includes('scalp')) {
    if (combined.includes('conditioner') || combined.includes('mask') || combined.includes('oil')) {
      return '/images/products/conditioner.png'
    }
    return '/images/products/shampoo.png'
  }

  // 3. Body Care
  if (catSlug.includes('body') || catName.includes('body') || combined.includes('body') || combined.includes('hand') || combined.includes('cuticle') || combined.includes('scrub') || combined.includes('heel')) {
    return '/images/products/bodywash.png'
  }

  // 4. Skincare Specifics
  if (combined.includes('vitamin c') || combined.includes('radiance') || combined.includes('vit-c')) {
    return '/images/products/vitaminc.png'
  }
  if (combined.includes('sunscreen') || combined.includes('spf') || combined.includes('sun')) {
    return '/images/products/sunscreen.png'
  }
  if (combined.includes('wash') || combined.includes('cleanser') || combined.includes('facewash')) {
    return '/images/products/facewash.png'
  }
  if (combined.includes('moisturizer') || combined.includes('hydrator') || combined.includes('cream') || combined.includes('balm')) {
    return '/images/products/Moisturizer.png'
  }

  return '/images/products/bareo-cica-serum.png'
}

/**
 * Maps category objects to existing clean PNG image assets.
 */
export function getCategoryImage(category?: Partial<Category> | null): string {
  if (!category) return '/images/products/bareo-cica-serum.png'

  const rawUrl = category.image
  const validFiles = [
    'babybodywash.png',
    'babyMoisturizer.png',
    'bareo-cica-serum.png',
    'bodywash.png',
    'conditioner.png',
    'facewash.png',
    'Moisturizer.png',
    'serum.png',
    'shampoo.png',
    'sunscreen.png',
    'vitaminc.png',
  ]

  if (rawUrl && !rawUrl.includes('unsplash.com')) {
    const filename = rawUrl.split('/').pop() || ''
    if (validFiles.includes(filename)) {
      return `/images/products/${filename}`
    }
  }

  const slug = (category.slug || category.name || '').toLowerCase()
  if (slug.includes('hair')) return '/images/products/shampoo.png'
  if (slug.includes('body')) return '/images/products/bodywash.png'
  if (slug.includes('baby')) return '/images/products/babyMoisturizer.png'

  return '/images/products/bareo-cica-serum.png'
}
