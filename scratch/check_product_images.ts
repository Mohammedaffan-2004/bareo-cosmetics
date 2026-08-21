import { PRODUCTS } from '../src/mocks/productCatalog'

async function checkCatalogImages() {
  console.log('--- Checking mock/local product images ---')
  for (const p of PRODUCTS.slice(0, 10)) {
    console.log(`Product: ${p.name}`)
    console.log(`  images:`, JSON.stringify(p.images))
  }
}

checkCatalogImages()
