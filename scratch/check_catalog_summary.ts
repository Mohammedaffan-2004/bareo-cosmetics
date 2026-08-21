import { PRODUCTS, CATEGORIES } from '../src/mocks/productCatalog'

console.log(`CATEGORIES: ${CATEGORIES.length}`)
CATEGORIES.forEach(c => console.log(` - ${c.name} (${c.slug}): ${c.image}`))

console.log(`\nPRODUCTS: ${PRODUCTS.length}`)
const catCounts: Record<string, number> = {}
PRODUCTS.forEach(p => {
  catCounts[p.categoryName || 'Unknown'] = (catCounts[p.categoryName || 'Unknown'] || 0) + 1
})
console.log('Categories breakdown:', catCounts)
