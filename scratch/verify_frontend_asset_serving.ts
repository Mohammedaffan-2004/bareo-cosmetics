const VITE_PORT = 5173

async function verifyFrontendStaticAssetServing() {
  console.log('====================================================================')
  console.log('TESTING LOCAL FRONTEND ASSET SERVING ON PORT 5173')
  console.log('====================================================================\n')

  const testAssets = [
    '/new-img/bareo-scalp-reset-anti-dandruff-shampoo.png',
    '/new-img/bareo-cica-niacinamide-calming-serum-10.png',
    '/new-img/bareo-dewy-barrier-hyaluronic-hydrator-cream.png',
    '/new-img/bareo-fig-sandalwood-nourishing-body-wash.png',
    '/new-img/bareo-gentle-tear-free-baby-shampoo.png',
    '/images/products/bareo-scalp-reset-anti-dandruff-shampoo.png',
    '/images/products/bareo-cica-niacinamide-calming-serum-10.png',
    '/editorial/category/bareo-category-skincare.jpg',
    '/editorial/category/bareo-category-haircare.jpg',
    '/editorial/category/bareo-category-bodycare.jpg',
    '/editorial/category/bareo-category-babycare.jpg',
  ]

  let allPass = true
  for (const assetPath of testAssets) {
    const url = `http://localhost:${VITE_PORT}${assetPath}`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      const contentType = res.headers.get('content-type') || ''
      const contentLength = res.headers.get('content-length') || ''
      if (res.ok && (contentType.includes('image') || parseInt(contentLength, 10) > 1000)) {
        console.log(`✓ PASS: ${assetPath} -> HTTP ${res.status} (${contentType}, ${contentLength} bytes)`)
      } else {
        allPass = false
        console.error(`✗ FAIL: ${assetPath} -> HTTP ${res.status} (${contentType})`)
      }
    } catch (err: any) {
      allPass = false
      console.error(`✗ ERROR: ${assetPath} -> ${err.message}`)
    }
  }

  console.log('\n====================================================================')
  if (allPass) {
    console.log('✓ ALL LOCAL & CATEGORY ASSETS SERVING SUCCESSFULLY WITH HTTP 200!')
  } else {
    console.error('✗ SOME ASSETS FAILED TO LOAD.')
  }
}

verifyFrontendStaticAssetServing().catch(console.error)
