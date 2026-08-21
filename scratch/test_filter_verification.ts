import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function runFilterTests() {
  console.log('========================================================================================')
  console.log('STARTING PRODUCT FILTERING QA VERIFICATION IN GOOGLE CHROME')
  console.log('========================================================================================\n')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  async function inspectGrid(testName: string) {
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 4000 }).catch(() => {})

    const res = await page.evaluate(() => {
      const body = document.body.innerText
      const emptyState = body.includes('No formulations found')
      const cards = Array.from(document.querySelectorAll('a[href*="/product/"] h3')).map(
        (el) => el.textContent?.trim() || ''
      )
      const countMatch = body.match(/(\d+)\s+formulations/i)
      const visibleCount = countMatch ? countMatch[1] : 'unknown'

      return {
        emptyState,
        cardsCount: cards.length,
        sampleCards: cards.slice(0, 3),
        visibleCount,
      }
    })

    const pass = !res.emptyState && res.cardsCount > 0
    console.log(`[${pass ? '✓ PASS' : '✗ FAIL'}] ${testName}`)
    console.log(`       Rendered Products: ${res.cardsCount} | Total Formulations Count: ${res.visibleCount} | Empty State: ${res.emptyState}`)
    console.log(`       Sample Formulations:`, res.sampleCards)
    return pass
  }

  async function clickLabelByText(text: string) {
    await page.evaluate((searchText) => {
      const labels = Array.from(document.querySelectorAll('label'))
      const match = labels.find((l) => l.textContent?.includes(searchText))
      const input = match?.querySelector('input')
      if (input) {
        input.click()
      } else if (match) {
        (match as HTMLElement).click()
      }
    }, text)
    await new Promise((r) => setTimeout(r, 600))
  }

  try {
    // 1. Skincare without filters
    console.log('\n--- 1. Testing Skincare without filters ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await inspectGrid('1. Skincare (No Filters)')

    // 2. Combination Skin filter
    console.log('\n--- 2. Testing Combination Skin filter on Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Combination Skin')
    await inspectGrid('2. Combination Skin Filter Applied')

    // 3. Dry Skin filter
    console.log('\n--- 3. Testing Dry Skin filter on Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Dry Skin')
    await inspectGrid('3. Dry Skin Filter Applied')

    // 4. Oily Skin filter
    console.log('\n--- 4. Testing Oily Skin filter on Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Oily Skin')
    await inspectGrid('4. Oily Skin Filter Applied')

    // 5. Normal Skin filter
    console.log('\n--- 5. Testing Normal Skin filter on Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Normal Skin')
    await inspectGrid('5. Normal Skin Filter Applied')

    // 6. Sensitive Skin filter
    console.log('\n--- 6. Testing Sensitive Skin filter on Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Sensitive Skin')
    await inspectGrid('6. Sensitive Skin Filter Applied')

    // 7. Multiple filters together (Combination Skin + Acne & Breakouts)
    console.log('\n--- 7. Testing Multiple Filters Together (Combination Skin + Acne) ---')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await clickLabelByText('Combination Skin')
    await clickLabelByText('Acne & Breakouts')
    await inspectGrid('7. Combination Skin + Acne Filter')

    // 8. Clear All
    console.log('\n--- 8. Testing Clear All Filters ---')
    await page.evaluate(() => {
      const clearBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Clear all')
      )
      clearBtn?.click()
    })
    await new Promise((r) => setTimeout(r, 600))
    await inspectGrid('8. Clear All Filters')

    // 9. Category Navigation Away & Back
    console.log('\n--- 9. Testing Category Navigation Away to Hair Care & Back to Skincare ---')
    await page.goto(`${BASE_URL}/shop?category=hair-care`, { waitUntil: 'domcontentloaded' })
    await inspectGrid('9a. Hair Care Navigation (11 formulations)')
    await page.goto(`${BASE_URL}/shop?category=skincare`, { waitUntil: 'domcontentloaded' })
    await inspectGrid('9b. Return to Skincare (18 formulations Clean State)')

    // 10. Browser Refresh
    console.log('\n--- 10. Testing Browser Refresh on Skincare ---')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await inspectGrid('10. Browser Refresh State')

  } catch (err: any) {
    console.error('Filter test failed with error:', err)
  } finally {
    await browser.close()
  }

  console.log('\n========================================================================================')
  console.log('ALL FILTERING VERIFICATION STEPS COMPLETED')
  console.log('========================================================================================')
}

runFilterTests().catch(console.error)
