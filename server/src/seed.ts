import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import dns from 'dns'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { User } from './models/User.model.js'
import { Category } from './models/Category.model.js'
import { Product } from './models/Product.model.js'
import { Coupon } from './models/Coupon.model.js'
import { Offer } from './models/Offer.model.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Fix for Windows Node.js SRV DNS lookup issues (querySrv EBADNAME)
try {
  dns.setDefaultResultOrder('ipv4first')
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // Ignore DNS override errors if restricted
}

const MONGODB_URI =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/lumina_skin'

async function seed() {
  console.log('🌱 Connecting to MongoDB via Mongoose for Full 48-Product Seeding...')
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  })

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Offer.deleteMany({}),
  ])

  console.log('🧹 Cleared existing database collections.')

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  await User.create({
    name: 'Bareo Admin',
    email: 'admin@luminaskin.com',
    password: adminPassword,
    phone: '+91 9876543210',
    role: 'ADMIN',
  })

  await User.create({
    name: 'Bareo Admin',
    email: 'admin@bareo.in',
    password: adminPassword,
    phone: '+91 9876543212',
    role: 'ADMIN',
  })

  await User.create({
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    password: userPassword,
    phone: '+91 9876543211',
    role: 'USER',
  })

  await User.create({
    name: 'Bareo Customer',
    email: 'user@bareo.in',
    password: userPassword,
    phone: '+91 9876543210',
    role: 'USER',
  })

  console.log('👤 Seeded Users (Admin & Customer).')

  // 2. Seed Bareo Categories (4 Categories)
  const categories = await Category.insertMany([
    {
      name: 'Skincare',
      slug: 'skincare',
      image: '/editorial/category/bareo-category-skincare.jpg',
      description: 'Clean, dermatologically formulated skincare products engineered for skin barrier repair and radiance.',
    },
    {
      name: 'Hair Care',
      slug: 'hair-care',
      image: '/editorial/category/bareo-category-haircare.jpg',
      description: 'Scalp-first hair care solutions infused with botanicals and active proteins for hair vitality.',
    },
    {
      name: 'Body Care',
      slug: 'body-care',
      image: '/editorial/category/bareo-category-bodycare.jpg',
      description: 'Nourishing body washes, scrubs, and lotions that restore skin elasticity and deep moisture.',
    },
    {
      name: 'Baby Care',
      slug: 'baby-care',
      image: '/editorial/category/bareo-category-babycare.jpg',
      description: 'Hypoallergenic, ultra-gentle formulas designed for delicate baby skin and scalp.',
    },
  ])

  const categoryMap = new Map<string, any>()
  categories.forEach((cat) => {
    categoryMap.set(cat.slug, cat)
  })

  console.log('📦 Seeded Bareo Product Categories (4 Categories).')

  // 3. Load and Seed All 48 Audited Products from final_48_products.json
  const dataPath = path.resolve(__dirname, 'data/final_48_products.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const productsData: any[] = JSON.parse(rawData)

  const productsToInsert = productsData.map((p) => {
    const cat = categoryMap.get(p.categorySlug) || categories[0]
    return {
      sku: p.sku || `BAR-${p.slug}`,
      slug: p.slug,
      name: p.name,
      brand: p.brand || 'Bareo',
      categoryId: cat._id.toString(),
      categoryName: cat.name,
      categorySlug: cat.slug,
      shortDescription: p.shortDescription || p.description,
      description: p.description,
      images: (p.images || []).map((img: any) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt || p.name,
        type: img.type || 'primary',
      })),
      mrp: p.mrp || 499,
      offerPrice: p.offerPrice || p.mrp || 399,
      discount: p.discount || 0,
      rating: p.rating || 4.8,
      ratingCount: p.ratingCount || 100,
      stock: p.stock ?? 50,
      isBestSeller: !!p.isBestSeller,
      isTrending: !!p.isTrending,
      isDoctorRecommended: !!p.isDoctorRecommended,
      isNewProduct: p.isNewProduct ?? true,
      isAiRecommended: !!p.isAiRecommended,
      skinTypes: p.skinTypes || ['all'],
      concerns: p.concerns || ['barrier-repair'],
      ingredients: p.ingredients || [],
      benefits: p.benefits || ['Dermatologist tested', 'Restores skin barrier'],
      usage: p.usage || ['Apply generously to clean skin/hair daily.'],
      keyFacts: p.keyFacts || ['Clean Actives', 'Barrier Safe'],
      faqs: p.faqs || [{ question: 'Is this suitable for daily use?', answer: 'Yes, formulated for safe daily usage.' }],
      tags: p.tags || [p.categorySlug],
      reviews: [],
      soldCount: p.soldCount || 40,
      status: 'active',
    }
  })

  const insertedProducts = await Product.insertMany(productsToInsert)
  console.log(`✨ Successfully Seeded All ${insertedProducts.length} Bareo Products with Cloudinary & Local Assets!`)

  // 4. Seed Bareo Promotional Offers
  await Offer.insertMany([
    {
      title: 'First Order Privilege',
      subtitle: '20% off across all formulations',
      code: 'BAREO20',
      badge: 'LIMITED TIME',
      background: 'from-[#172126] to-[#253239]',
      discountLabel: '20% OFF',
      type: 'discount',
      image: '/images/bareo-login-editorial.jpg',
    },
    {
      title: 'Complimentary Delivery',
      subtitle: 'On orders exceeding ₹499',
      code: 'FREESHIP',
      badge: 'FREE SHIPPING',
      background: 'from-[#167C86] to-[#0E545C]',
      discountLabel: 'FREE',
      type: 'shipping',
      image: '/images/bareo-login-editorial.jpg',
    },
  ])

  // 5. Seed Bareo Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME10',
      description: '10% off on your initial Bareo order',
      discountType: 'percent',
      value: 10,
      minOrder: 299,
      maxDiscount: 200,
      validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
    },
    {
      code: 'BAREO20',
      description: '20% off for verified skincare members',
      discountType: 'percent',
      value: 20,
      minOrder: 499,
      maxDiscount: 500,
      validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
    },
  ])

  console.log('🏷️ Seeded Bareo Offers & Coupons.')
  console.log('🎉 Full Database Seeding Complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
