import fs from 'fs'
import path from 'path'
import { PRODUCTS } from '../src/mocks/productCatalog'

function auditImageMapping() {
  const newImgDir = path.resolve('public/new-img')
  const newImgFiles = fs.readdirSync(newImgDir)
  console.log(`Total files in public/new-img: ${newImgFiles.length}`)

  let matchCount = 0
  let missingCount = 0

  for (const p of PRODUCTS) {
    const primaryUrl = p.images?.[0]?.url || ''
    // Extract filename from Cloudinary URL or slug
    const filename = `${p.slug}.png`
    const exists = newImgFiles.includes(filename)

    if (exists) {
      matchCount++
    } else {
      missingCount++
      console.log(`Missing file for slug "${p.slug}": expected "${filename}" (URL: ${primaryUrl})`)
    }
  }

  console.log(`\nAudit Results: ${matchCount}/${PRODUCTS.length} products have exact matching local PNGs.`)
}

auditImageMapping()
