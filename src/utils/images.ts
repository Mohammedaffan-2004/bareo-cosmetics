// High-resolution local Bareo product photography for skincare, hair care, body care, and baby care.

const BAREO_PRODUCT_IMAGES: Record<string, string[]> = {
  skincare: [
    '/images/products/bareo-cica-serum.png',
    '/images/products/bareo-barrier-hydrator.png',
    '/images/products/bareo-facial-cleanser.png',
    '/images/products/bareo-fluid-sunscreen.png',
  ],
  'hair-care': [
    '/images/products/bareo-rosemary-shampoo.png',
    '/images/products/bareo-scalp-hair-oil.png',
  ],
  'body-care': [
    '/images/products/bareo-oat-body-wash.png',
    '/images/products/bareo-shea-body-lotion.png',
  ],
  'baby-care': [
    '/images/products/bareo-baby-wash.png',
  ],
  serum: ['/images/products/bareo-cica-serum.png'],
  moisturizer: ['/images/products/bareo-barrier-hydrator.png'],
  sunscreen: ['/images/products/bareo-fluid-sunscreen.png'],
  cleanser: ['/images/products/bareo-facial-cleanser.png'],
  default: [
    '/images/products/bareo-cica-serum.png',
    '/images/products/bareo-barrier-hydrator.png',
    '/images/products/bareo-rosemary-shampoo.png',
    '/images/products/bareo-shea-body-lotion.png',
    '/images/products/bareo-cica-serum.png',
  ],
}

/** Returns the official Bareo product image by category or slug. */
export function productImage(categorySlug: string, index: number, _name?: string): string {
  const list = BAREO_PRODUCT_IMAGES[categorySlug] || BAREO_PRODUCT_IMAGES.default
  const idx = Math.abs(index) % list.length
  return list[idx]
}

/** Lifestyle banner image. */
export function bannerImage(_seed: number, _emoji?: string, _tint?: string): string {
  return '/images/products/bareo-cica-serum.png'
}

/** Square social avatar tile. */
export function avatarImage(seed: number, tint: string): string {
  const a = String.fromCharCode(65 + (Math.abs(seed) % 26))
  const b = String.fromCharCode(65 + (Math.abs(seed * 7 + 3) % 26))
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="60" fill="${tint}"/>
  <text x="60" y="72" font-size="42" font-family="Segoe UI, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${a}${b}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
