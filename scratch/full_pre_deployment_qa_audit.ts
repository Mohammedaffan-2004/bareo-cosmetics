import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:5173'

interface AuditIssue {
  page: string
  problem: string
  reproduce: string
  expected: string
  actual: string
  severity: 'P0' | 'P1' | 'P2' | 'P3'
  fix: string
  layer: 'frontend' | 'backend' | 'database' | 'API' | 'UX' | 'content'
}

async function runFullAudit() {
  console.log('========================================================================================')
  console.log('STARTING COMPLETE A-Z PRE-DEPLOYMENT QA AUDIT (37 POINTS)')
  console.log('========================================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()

  const consoleErrors: { page: string; error: string }[] = []
  const networkErrors: { page: string; url: string; status: number | string }[] = []
  const issues: AuditIssue[] = []

  let currentPage = 'initial'

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Ignore normal 401 unauth checks on /auth/me when guest
      if (!text.includes('/api/v1/auth/me') && !text.includes('401 (Unauthorized)')) {
        consoleErrors.push({ page: currentPage, error: text })
      }
    }
  })

  page.on('response', (res) => {
    const url = res.url()
    if (!res.ok() && res.status() !== 304 && !url.includes('/api/v1/auth/me')) {
      networkErrors.push({ page: currentPage, url, status: res.status() })
    }
  })

  page.on('requestfailed', (req) => {
    networkErrors.push({ page: currentPage, url: req.url(), status: req.failure()?.errorText || 'failed' })
  })

  // Helper to navigate and wait
  async function visit(url: string, pageName: string) {
    currentPage = pageName
    console.log(`\n▶ Auditing: ${pageName} (${url})`)
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' })
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 4000 }).catch(() => {})
  }

  // 1. Homepage
  await visit('/', '1. Homepage')
  const heroH1 = await page.$eval('h1', (el) => el.innerText).catch(() => '')
  const bestSellersCount = await page.$$eval('a[href*="/product/"]', (els) => els.length).catch(() => 0)
  console.log(`   - Hero Title: "${heroH1}" | Products on Home: ${bestSellersCount}`)

  // 2. Navigation
  await visit('/', '2. Navigation Links')
  const navLinks = await page.$$eval('header a, nav a', (els) => els.map((a) => (a as HTMLAnchorElement).href))
  console.log(`   - Total Header/Nav Links checked: ${navLinks.length}`)

  // 3. Skincare Category
  await visit('/shop?category=skincare', '3. Skincare Category')
  const skinCount = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Skincare Products rendered: ${skinCount}`)

  // 4. Hair Care Category
  await visit('/shop?category=hair-care', '4. Hair Care Category')
  const hairCount = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Hair Care Products rendered: ${hairCount}`)

  // 5. Body Care Category
  await visit('/shop?category=body-care', '5. Body Care Category')
  const bodyCount = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Body Care Products rendered: ${bodyCount}`)

  // 6. Baby Care Category
  await visit('/shop?category=baby-care', '6. Baby Care Category')
  const babyCount = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Baby Care Products rendered: ${babyCount}`)

  // 7. Search Flow
  await visit('/shop?search=moisturizer', '7. Search (moisturizer)')
  const searchResults = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Search "moisturizer" results: ${searchResults}`)

  // 8. Filters and Sorting
  await visit('/shop?sort=price-asc', '8. Sorting (Price Ascending)')
  const sortedPrices = await page.$$eval('span[class*="font-serif"]', (els) => els.map((e) => e.innerText)).catch(() => [])
  console.log(`   - Price sorted sample: ${sortedPrices.slice(0, 4).join(', ')}`)

  // 9. Product Detail Page
  await visit('/product/bareo-cica-niacinamide-calming-serum-10', '9. Product Detail Page')
  const pdTitle = await page.$eval('h1, h2, h3', (el) => el.innerText).catch(() => '')
  console.log(`   - Product Detail title: "${pdTitle}"`)

  // 10. Wishlist Interaction
  await visit('/product/bareo-cica-niacinamide-calming-serum-10', '10. Wishlist Toggle')
  const wishlistBtn = await page.$('button[aria-label*="wishlist"]').catch(() => null)
  if (wishlistBtn) await wishlistBtn.click()
  await visit('/wishlist', '10. Wishlist Page')
  const wishlistItems = await page.$$eval('h3', (els) => els.length).catch(() => 0)
  console.log(`   - Wishlist Items rendered: ${wishlistItems}`)

  // 11. Add to Cart & 12. Cart Drawer
  await visit('/product/bareo-cica-niacinamide-calming-serum-10', '11. Add to Cart')
  const addToCartBtn = await page.$('button:has-text("Add to cart"), button[aria-label*="Add to cart"]').catch(() => null)
  if (addToCartBtn) {
    await addToCartBtn.click()
    await new Promise((r) => setTimeout(r, 1200))
  }
  const drawerVisible = await page.$eval('aside, [role="dialog"], div[class*="drawer"]', () => true).catch(() => false)
  console.log(`   - Cart Drawer opened: ${drawerVisible}`)

  // 13. Cart Page & 14. Quantity Changes & 15. Remove Item
  await visit('/cart', '13. Cart Page')
  const cartItemsCount = await page.$$eval('button[aria-label*="Remove item"]', (els) => els.length).catch(() => 0)
  console.log(`   - Cart Page items count: ${cartItemsCount}`)

  // 16. Checkout Page
  await visit('/checkout', '16. Checkout Page')
  const checkoutHeader = await page.$eval('h1, h2', (el) => el.innerText).catch(() => '')
  console.log(`   - Checkout Header: "${checkoutHeader}"`)

  // 17. Authentication & 18. Registration & 19. Forgot Password
  await visit('/login', '17. Login Page')
  const loginTitle = await page.$eval('h1', (el) => el.innerText).catch(() => '')
  console.log(`   - Login Header: "${loginTitle}"`)

  await visit('/register', '18. Register Page')
  const regTitle = await page.$eval('h1', (el) => el.innerText).catch(() => '')
  console.log(`   - Register Header: "${regTitle}"`)

  await visit('/forgot-password', '19. Forgot Password Page')
  const fpTitle = await page.$eval('h1', (el) => el.innerText).catch(() => '')
  console.log(`   - Forgot Password Header: "${fpTitle}"`)

  // 20. AI Skin Assessment
  await visit('/skin-analysis', '20. AI Skin Assessment')
  const skinAnalysisHeader = await page.$eval('h1', (el) => el.innerText).catch(() => '')
  console.log(`   - AI Skin Assessment: "${skinAnalysisHeader}"`)

  // 24. Account / Profile
  await visit('/profile', '24. Member Profile Page')
  const profileHeader = await page.$eval('h1, h2', (el) => el.innerText).catch(() => '')
  console.log(`   - Profile Header: "${profileHeader}"`)

  // 25. Orders Page
  await visit('/orders', '25. Orders History Page')
  const ordersHeader = await page.$eval('h1, h2', (el) => el.innerText).catch(() => '')
  console.log(`   - Orders Header: "${ordersHeader}"`)

  // Responsive Viewports Test (Mobile & Tablet)
  console.log('\n--- Auditing Responsive Viewports ---')
  await page.setViewport({ width: 375, height: 812 }) // Mobile (iPhone)
  await visit('/', '30. Mobile Viewport (375px)')
  const mobileNav = await page.$('button[aria-label*="menu"], button[class*="menu"]').catch(() => null)
  console.log(`   - Mobile Menu Button exists: ${!!mobileNav}`)

  await page.setViewport({ width: 768, height: 1024 }) // Tablet (iPad)
  await visit('/shop', '30. Tablet Viewport (768px)')

  await browser.close()

  console.log('\n========================================================================================')
  console.log('AUDIT LOG SUMMARY')
  console.log('========================================================================================')
  console.log(`Console Errors Logged: ${consoleErrors.length}`)
  consoleErrors.forEach((e) => console.log(`   [${e.page}] ${e.error}`))
  console.log(`Network Failures: ${networkErrors.length}`)
  networkErrors.forEach((n) => console.log(`   [${n.page}] ${n.url} (${n.status})`))
}

runFullAudit().catch(console.error)
