import { PRODUCTS } from '@/mocks/productCatalog'
import type { Product } from '@/types'

const STORAGE_KEY = 'bareo_catalog_v5'

function loadInitialCatalog(): Product[] {
  if (typeof window === 'undefined') return [...PRODUCTS]
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length >= 48) return parsed
    }
  } catch (_e) {
    // Ignore storage parse error
  }
  return [...PRODUCTS]
}

let store: Product[] = loadInitialCatalog()

export function getCatalog(): Product[] {
  return store
}

export function setCatalog(next: Product[]): void {
  store = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (_e) {
    // Ignore storage write error
  }
}
