import puppeteer from 'puppeteer-core'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { User } from '../server/src/models/User.model.js'
import { Order } from '../server/src/models/Order.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../server/.env') })

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function runE2EOrderTest() {
  console.log('========================================================================================')
  console.log('STARTING MANDATORY REAL END-TO-END ORDER PERSISTENCE QA IN GOOGLE CHROME')
  console.log('========================================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  const consoleErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('/api/v1/auth/me') && !text.includes('401 (Unauthorized)')) {
        consoleErrors.push(text)
      }
    }
  })

  let createdPostResponse: any = null
  let getOrdersResponse: any = null

  page.on('response', async (res) => {
    if (res.url().includes('/api/v1/orders')) {
      try {
        const json = await res.json()
        if (res.request().method() === 'POST') {
          createdPostResponse = { status: res.status(), body: json }
        } else if (res.request().method() === 'GET') {
          getOrdersResponse = { status: res.status(), body: json }
        }
      } catch {}
    }
  })

  try {
    // 1. Login with demo account
    console.log('--- 1 & 2. Login & User Identity Verification ---')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 600))

    await page.type('input[name="email"], input[type="email"]', 'user@bareo.in')
    await page.type('input[name="password"], input[type="password"]', 'user123')
    await page.click('button[type="submit"]')
    await new Promise((r) => setTimeout(r, 1500))

    const authSession = await page.evaluate(() => {
      const rawUser = localStorage.getItem('auth_user') || localStorage.getItem('user')
      const token = localStorage.getItem('bareo_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('token')
      return {
        user: rawUser ? JSON.parse(rawUser) : null,
        token: token ? `${token.slice(0, 20)}...` : null,
      }
    })
    console.log('   Authenticated User Identity:', authSession.user?.email, '| User ID:', authSession.user?.id)

    // 3. Add product to cart
    console.log('\n--- 3. Adding product to cart ---')
    await page.goto(`${BASE_URL}/product/bareo-cica-niacinamide-calming-serum-10`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 800))

    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('ADD TO CART') || b.textContent?.includes('ADD TO BAG') || b.textContent?.includes('Add')
      )
      if (addBtn) (addBtn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 800))

    // 4 & 5. Go to Checkout & Complete order
    console.log('\n--- 4 & 5. Checkout & Place Order ---')
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1200))

    // Step 0: Address
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'))
      inputs.forEach((inp) => {
        if (inp.name === 'fullName') inp.value = 'Aarav Malhotra'
        if (inp.name === 'phone') inp.value = '9876543210'
        if (inp.name === 'line1') inp.value = '123 Dermal Way'
        if (inp.name === 'city') inp.value = 'Bengaluru'
        if (inp.name === 'pincode') inp.value = '560001'
        inp.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })
    await new Promise((r) => setTimeout(r, 400))

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('CONTINUE TO DELIVERY') || b.textContent?.includes('Delivery')
      )
      if (btn) (btn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 800))

    // Step 1: Delivery
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('CONTINUE TO PAYMENT') || b.textContent?.includes('Payment')
      )
      if (btn) (btn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 800))

    // Step 2: Payment
    await page.evaluate(() => {
      const codBtn = Array.from(document.querySelectorAll('button, label, div')).find((el) =>
        el.textContent?.includes('Cash on Delivery') || el.textContent?.includes('COD')
      )
      if (codBtn) (codBtn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 400))

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('PROCEED TO REVIEW') || b.textContent?.includes('Review')
      )
      if (btn) (btn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 800))

    // Step 3: Place Order
    await page.evaluate(() => {
      const placeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Place Order') || b.textContent?.includes('PLACE ORDER')
      )
      if (placeBtn) (placeBtn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 3000))

    console.log('   POST /api/v1/orders HTTP Status:', createdPostResponse?.status)
    console.log('   Created Order Data:', createdPostResponse?.body?.data?.orderId || createdPostResponse?.body?.data?.id)

    const createdOrderId = createdPostResponse?.body?.data?.orderId || createdPostResponse?.body?.data?.id

    // 8 & 9. Check Profile MY ORDERS count
    console.log('\n--- 8 & 9. Checking Profile MY ORDERS Count ---')
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))

    const profileCount = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('a[href="/orders"]')).find((el) =>
        el.textContent?.includes('My Orders')
      )
      return card?.querySelector('.font-bold')?.textContent?.trim()
    })
    console.log('   Profile MY ORDERS Count:', profileCount)

    // 10 & 11. Check My Orders page
    console.log('\n--- 10 & 11. Checking My Orders Page ---')
    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))

    const ordersPageInfo = await page.evaluate(() => {
      const text = document.body.innerText
      const hasEmptyState = text.includes('No orders yet') || text.includes('No orders placed yet')
      const orderCards = Array.from(document.querySelectorAll('.border')).filter((el) =>
        el.textContent?.includes('BAR-ORD') || el.textContent?.includes('ORD-') || el.textContent?.includes('Placed') || el.textContent?.includes('Total')
      )
      return {
        hasEmptyState,
        renderedCardsCount: hasEmptyState ? 0 : orderCards.length,
      }
    })
    console.log('   My Orders Page Info:', ordersPageInfo)

    // 12 & 13. Refresh My Orders
    console.log('\n--- 12 & 13. Refreshing My Orders & Profile ---')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))
    const refreshedOrdersCount = await page.evaluate(() => {
      const text = document.body.innerText
      return text.includes('No orders yet') ? 0 : document.querySelectorAll('.border').length
    })

    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))
    const refreshedProfileCount = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('a[href="/orders"]')).find((el) =>
        el.textContent?.includes('My Orders')
      )
      return card?.querySelector('.font-bold')?.textContent?.trim()
    })

    console.log('   Refreshed Profile Count:', refreshedProfileCount, '| Refreshed My Orders Count:', refreshedOrdersCount)

    // 14 & 15 & 16. Logout & Login again
    console.log('\n--- 14, 15 & 16. Logout and Relogin Verification ---')
    await page.evaluate(() => {
      const logoutBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Logout') || b.textContent?.includes('LOG OUT') || b.textContent?.includes('Sign Out')
      )
      if (logoutBtn) (logoutBtn as HTMLElement).click()
    })
    await new Promise((r) => setTimeout(r, 1000))

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 600))
    await page.type('input[name="email"], input[type="email"]', 'user@bareo.in')
    await page.type('input[name="password"], input[type="password"]', 'user123')
    await page.click('button[type="submit"]')
    await new Promise((r) => setTimeout(r, 1500))

    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))
    const reloginProfileCount = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('a[href="/orders"]')).find((el) =>
        el.textContent?.includes('My Orders')
      )
      return card?.querySelector('.font-bold')?.textContent?.trim()
    })

    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 1000))
    const reloginOrdersCount = await page.evaluate(() => {
      const text = document.body.innerText
      return text.includes('No orders yet') ? 0 : document.querySelectorAll('.border').length
    })

    console.log('   Post-Relogin Profile Count:', reloginProfileCount, '| Post-Relogin Orders Count:', reloginOrdersCount)

    // Database verification in MongoDB Atlas
    console.log('\n--- MongoDB Atlas Direct Document Verification ---')
    const mongoUri = process.env.DATABASE_URL || ''
    await mongoose.connect(mongoUri)

    const dbUser = await User.findOne({ email: 'user@bareo.in' }).lean()
    const dbOrders = await Order.find({ userId: dbUser?._id?.toString() }).sort({ createdAt: -1 }).lean()

    console.log('   MongoDB User Email:', dbUser?.email)
    console.log('   MongoDB User ID:', dbUser?._id?.toString())
    console.log('   MongoDB Orders Found for User:', dbOrders.length)

    if (dbOrders.length > 0) {
      console.log('   Latest MongoDB Order:', {
        _id: dbOrders[0]._id.toString(),
        orderId: dbOrders[0].orderId,
        userId: dbOrders[0].userId,
        total: dbOrders[0].total,
        status: dbOrders[0].status,
        itemsCount: dbOrders[0].items?.length,
      })
    }

    await mongoose.disconnect()

    const finalPass =
      createdPostResponse?.status === 201 &&
      parseInt(profileCount || '0', 10) > 0 &&
      ordersPageInfo.renderedCardsCount > 0 &&
      parseInt(reloginProfileCount || '0', 10) > 0 &&
      dbOrders.length > 0

    console.log(`\n========================================================================================`)
    console.log(`FINAL E2E VERIFICATION RESULT: ${finalPass ? '✓ PASS' : '✗ FAIL'}`)
    console.log(`========================================================================================`)

  } catch (err: any) {
    console.error('E2E Order test error:', err)
  } finally {
    await browser.close()
  }
}

runE2EOrderTest().catch(console.error)
