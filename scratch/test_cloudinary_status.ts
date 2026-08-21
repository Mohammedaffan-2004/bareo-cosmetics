const urls = [
  "https://res.cloudinary.com/j9yeiuld/image/upload/v1787049566/bareo/products/bareo-scalp-reset-anti-dandruff-shampoo.png",
  "https://res.cloudinary.com/j9yeiuld/image/upload/v1787049572/bareo/products/bareo-anti-frizz-gloss-leave-in-hair-serum.png",
  "https://res.cloudinary.com/j9yeiuld/image/upload/v1787049572/bareo/products/bareo-argan-oil-silk-peptide-hydrating-conditioner.png"
]

async function testCloudinary() {
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' })
      console.log(`URL: ${u} -> HTTP ${res.status} ${res.statusText}`)
    } catch (e: any) {
      console.log(`URL: ${u} -> Error: ${e.message}`)
    }
  }
}

testCloudinary()
