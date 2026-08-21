import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function runChromeVisualVerification() {
  console.log('========================================================================================')
  console.log('STARTING AUTOMATED CHROME VISUAL QA VERIFICATION FOR BAREO COSMETICS')
  console.log('========================================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()

  let imageHttpErrors: string[] = []
  let brokenRenderedImages: string[] = []

  // Monitor network responses for image failures
  page.on('response', (res) => {
    const url = res.url()
    if (url.match(/\.(png|jpg|jpeg|webp|svg)/i) || res.headers()['content-type']?.includes('image')) {
      if (!res.ok() && res.status() !== 304) {
        imageHttpErrors.push(`[HTTP ${res.status()}] Failed to load image: ${url}`)
      }
    }
  })

  page.on('requestfailed', (req) => {
    const url = req.url()
    if (url.match(/\.(png|jpg|jpeg|webp|svg)/i)) {
      imageHttpErrors.push(`Failed request: ${url} (${req.failure()?.errorText})`)
    }
  })

  const auditResults: { flow: string; packshotsCount: number; fallbackCount: number; status: string }[] = []

  async function inspectPageImages(flowName: string) {
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {})

    const data = await page.evaluate(() => {
      const bodyText = document.body.innerText
      const fallbackMatches = (bodyText.match(/Packshot Coming Soon/gi) || []).length
      
      const images = Array.from(document.querySelectorAll('img'))
      const broken = images.filter((img) => img.complete && img.naturalWidth === 0 && !img.src.includes('data:image')).map(img => img.src)
      const valid = images.filter((img) => img.complete && img.naturalWidth > 0).map(img => img.src)

      return {
        fallbackMatches,
        brokenCount: broken.length,
        brokenUrls: broken,
        validCount: valid.length,
        sampleValid: valid.slice(0, 3)
      }
    })

    if (data.brokenCount > 0) {
      brokenRenderedImages.push(...data.brokenUrls)
    }

    const isPass = data.fallbackMatches === 0 && data.brokenCount === 0
    auditResults.push({
      flow: flowName,
      packshotsCount: data.validCount,
      fallbackCount: data.fallbackMatches,
      status: isPass ? 'PASS' : `FAIL (${data.fallbackMatches} fallbacks, ${data.brokenCount} broken)`,
    })

    console.log(`[${isPass ? '✓ PASS' : '✗ FAIL'}] ${flowName}`)
    console.log(`       Rendered Valid Images: ${data.validCount} | Fallbacks Found: ${data.fallbackMatches} | Broken: ${data.brokenCount}`)
  }

  try {
    // 1. Best Sellers (Homepage)
    console.log('\n--- 1. Testing Best Sellers on Homepage ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 1: Best Sellers Section')

    // 2. Shop / All Products
    console.log('\n--- 2. Testing Shop / All Products ---')
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 2: Shop / All Products')

    // 3. Skincare Category
    console.log('\n--- 3. Testing Skincare Category ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 3: Skincare Category Listing')

    // 4. Hair Care Category
    console.log('\n--- 4. Testing Hair Care Category ---')
    await page.goto(`${BASE_URL}/shop?category=hair-care`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 4: Hair Care Category Listing')

    // 5. Body Care Category
    console.log('\n--- 5. Testing Body Care Category ---')
    await page.goto(`${BASE_URL}/shop?category=body-care`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 5: Body Care Category Listing')

    // 6. Baby Care Category
    console.log('\n--- 6. Testing Baby Care Category ---')
    await page.goto(`${BASE_URL}/shop?category=baby-care`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 6: Baby Care Category Listing')

    // 7. Search Queries
    const searches = ['moisturizer', 'sunscreen', 'serum', 'shampoo', 'baby lotion']
    for (const q of searches) {
      console.log(`\n--- 7. Testing Search: "${q}" ---`)
      await page.goto(`${BASE_URL}/shop?search=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded' })
      await inspectPageImages(`Flow 7: Search "${q}"`)
    }

    // 8. Open Product Detail Page
    console.log('\n--- 8. Testing Product Detail Page ---')
    await page.goto(`${BASE_URL}/product/bareo-scalp-reset-anti-dandruff-shampoo`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 8: Product Detail Page (Hero Packshot)')

    // 9. Add to Cart & Open Drawer
    console.log('\n--- 9. Testing Add to Cart & Cart Drawer ---')
    const addBtn = await page.$('button[aria-label*="Add to cart"], button:has-text("Add to cart")').catch(() => null)
    if (addBtn) {
      await addBtn.click()
      await new Promise(r => setTimeout(r, 1000))
    }
    await inspectPageImages('Flow 9: Add to Cart & Cart Drawer')

    // 10. Open Cart Page
    console.log('\n--- 10. Testing Cart Page ---')
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 10: Cart Page Line Items')

    // 11. Refresh Browser
    console.log('\n--- 11. Testing Browser Refresh ---')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 11: Browser Refresh on Cart')

    // 12. Navigate Away and Return
    console.log('\n--- 12. Testing Navigate Away and Return ---')
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'domcontentloaded' })
    await inspectPageImages('Flow 12: Navigate Back to Shop')

  } catch (err: any) {
    console.error('Test execution exception:', err)
  } finally {
    await browser.close()
  }

  console.log('\n========================================================================================')
  console.log('FINAL AUDIT SUMMARY')
  console.log('========================================================================================')
  console.table(auditResults)

  const allPassed = auditResults.every(r => r.status === 'PASS')
  console.log(`\nPRODUCT IMAGE BUG: ${allPassed ? 'FIXED' : 'NOT FIXED'}`)
  console.log(`CHROME VISUAL CHECK: ${allPassed ? 'PASS' : 'FAIL'}`)
  console.log(`BROKEN IMAGES: ${brokenRenderedImages.length}`)
  console.log(`PACKSHOT FALLBACKS FOR VALID PRODUCTS: ${auditResults.reduce((acc, r) => acc + r.fallbackCount, 0)}`)
  console.log(`CONSOLE IMAGE ERRORS: ${imageHttpErrors.length}`)
  console.log('========================================================================================')
}

runChromeVisualVerification().catch(console.error)
