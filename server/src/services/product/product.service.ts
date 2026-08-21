import { Product } from '../../models/Product.model.js'
import { Category } from '../../models/Category.model.js'
import { isValidObjectId } from '../../utils/validation.js'

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const SYNONYM_MAP: Record<string, string[]> = {
  moisturizer: ['cream', 'lotion', 'hydrat', 'barrier', 'gel', 'moisture'],
  moisturiser: ['cream', 'lotion', 'hydrat', 'barrier', 'gel', 'moisture'],
  cleanser: ['wash', 'cleanse', 'cleansing', 'face wash', 'foam'],
  facewash: ['wash', 'cleanse', 'cleansing', 'face wash', 'foam'],
  sunscreen: ['spf', 'sun', 'shield', 'sunblock', 'uv', 'fluid'],
  sunblock: ['spf', 'sun', 'shield', 'sunblock', 'uv', 'fluid'],
  serum: ['serum', 'concentrate', 'treatment', 'drop', 'essence', 'ampoule'],
  shampoo: ['shampoo', 'scalp', 'hair wash'],
  hair: ['hair', 'scalp', 'shampoo'],
  baby: ['baby', 'baby-care', 'infant', 'diaper', 'tear-free'],
  body: ['body', 'scrub', 'body wash', 'body-care'],
  acne: ['acne', 'pimple', 'blemish', 'salicylic', 'cica', 'clarifying'],
  pigmentation: ['pigment', 'brighten', 'vitamin c', 'dark spot', 'niacinamide', 'glow'],
}

export class ProductService {
  /**
   * Format raw Mongoose product document into consistent API payload structure.
   */
  private formatProduct(p: any) {
    return {
      ...p,
      id: p._id?.toString() || p.id,
      isNew: p.isNewProduct ?? p.isNew ?? true,
      skinTypes: Array.isArray(p.skinTypes) ? p.skinTypes : JSON.parse(p.skinTypes || '[]'),
      concerns: Array.isArray(p.concerns) ? p.concerns : JSON.parse(p.concerns || '[]'),
      benefits: Array.isArray(p.benefits) ? p.benefits : JSON.parse(p.benefits || '[]'),
      usage: Array.isArray(p.usage) ? p.usage : JSON.parse(p.usage || '[]'),
      keyFacts: Array.isArray(p.keyFacts) ? p.keyFacts : JSON.parse(p.keyFacts || '[]'),
      tags: Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'),
      images: (p.images || []).map((img: any, idx: number) =>
        typeof img === 'string'
          ? { id: `img-${idx}`, url: img, alt: p.name, type: idx === 0 ? 'primary' : 'gallery' }
          : {
              id: img._id?.toString() || img.id || `img-${idx}`,
              url: img.url,
              alt: img.alt || p.name,
              type: img.type || (idx === 0 ? 'primary' : 'gallery'),
              publicId: img.publicId,
            }
      ),
    }
  }

  /** Fetch catalog products with filtering, searching, sorting, and pagination. */
  async getProducts(params: any) {
    const {
      category,
      brand,
      skinType,
      concern,
      search,
      minPrice,
      maxPrice,
      sort = 'popular',
      page = '1',
      limit = '12',
    } = params

    const pageNum = parseInt(page as string, 10) || 1
    const limitNum = parseInt(limit as string, 10) || 12
    const skip = (pageNum - 1) * limitNum

    const conditions: any[] = [{ status: { $in: ['active', 'out-of-stock'] } }]

    if (category && category !== 'all' && category !== 'all-products') {
      conditions.push({
        $or: [{ categorySlug: category as string }, { categoryId: category as string }],
      })
    }

    if (brand && brand !== 'all') {
      const safeBrand = escapeRegex(brand as string)
      conditions.push({ brand: new RegExp(`^${safeBrand}$`, 'i') })
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.$gte = parseFloat(minPrice as string)
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice as string)
      conditions.push({ offerPrice: priceFilter })
    }

    if (search && (search as string).trim()) {
      const rawSearch = (search as string).trim()
      const searchTerms = rawSearch.toLowerCase().split(/\s+/).filter(Boolean)
      const searchOrs: any[] = []

      // 1. Exact string search
      const safeExact = escapeRegex(rawSearch)
      const exactRegex = new RegExp(safeExact, 'i')
      searchOrs.push(
        { name: exactRegex },
        { shortDescription: exactRegex },
        { description: exactRegex },
        { brand: exactRegex },
        { categoryName: exactRegex },
        { categorySlug: exactRegex },
        { tags: exactRegex }
      )

      // 2. Term-by-term and synonym search
      for (const term of searchTerms) {
        const safeTerm = escapeRegex(term)
        const termRegex = new RegExp(safeTerm, 'i')
        searchOrs.push(
          { name: termRegex },
          { shortDescription: termRegex },
          { categoryName: termRegex },
          { tags: termRegex }
        )

        const synonyms = SYNONYM_MAP[term]
        if (synonyms && synonyms.length > 0) {
          for (const syn of synonyms) {
            const synRegex = new RegExp(escapeRegex(syn), 'i')
            searchOrs.push(
              { name: synRegex },
              { shortDescription: synRegex },
              { categoryName: synRegex },
              { tags: synRegex }
            )
          }
        }
      }

      conditions.push({ $or: searchOrs })
    }

    if (skinType) {
      const types = (skinType as string)
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
      if (types.length > 0) {
        // A product matches if skinTypes includes the specific skin type OR 'all'
        conditions.push({
          skinTypes: { $in: [...types, 'all', 'all-skin-types'] },
        })
      }
    }

    if (concern) {
      const concernsList = (concern as string)
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean)
      if (concernsList.length > 0) {
        conditions.push({
          concerns: { $in: concernsList },
        })
      }
    }

    const query = conditions.length > 1 ? { $and: conditions } : conditions[0]

    let sortOptions: any = { soldCount: -1 }
    if (sort === 'price-asc') sortOptions = { offerPrice: 1 }
    if (sort === 'price-desc') sortOptions = { offerPrice: -1 }
    if (sort === 'rating') sortOptions = { rating: -1 }
    if (sort === 'newest') sortOptions = { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ])

    const formattedProducts = products.map((p) => this.formatProduct(p))

    return {
      items: formattedProducts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /** Fetch product details by slug or ObjectId. */
  async getProductBySlug(slug: string) {
    const product: any = await Product.findOne({
      $or: [{ slug }, { _id: isValidObjectId(slug) ? slug : undefined }],
    }).lean()

    if (!product) {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    return this.formatProduct(product)
  }

  /** Fetch categories with aggregated product counts. */
  async getCategories() {
    const [categories, counts] = await Promise.all([
      Category.find().lean(),
      Product.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$categorySlug', '$categoryId'] },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    const countMap = new Map<string, number>()
    counts.forEach((c: any) => {
      if (c._id) {
        countMap.set(c._id.toString(), c.count)
      }
    })

    return categories.map((c: any) => {
      const idStr = c._id?.toString() || c.id
      const count = (countMap.get(c.slug) || 0) + (countMap.get(idStr) || 0)
      return {
        id: idStr,
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: c.description || undefined,
        productCount: count,
      }
    })
  }

  /** Fetch featured active products. */
  async getFeaturedProducts() {
    const products = await Product.find({ status: 'active' }).limit(8).lean()
    return products.map((p) => this.formatProduct(p))
  }

  /** Stock validation helper. */
  async validateProductStock(productId: string, requestedQuantity: number) {
    const product: any = await Product.findById(productId).lean()
    if (!product) {
      return { available: false, message: 'Product not found', stock: 0 }
    }
    const isAvailable = product.stock >= requestedQuantity
    return {
      available: isAvailable,
      stock: product.stock,
      message: isAvailable ? 'Stock available' : `Only ${product.stock} items remaining in stock`,
    }
  }

  /** Admin Catalog CRUD Operations */
  async getProductsAdmin(queryParams: any) {
    const { category, search, page = '1', limit = '10' } = queryParams
    const pageNum = parseInt(page as string, 10) || 1
    const limitNum = parseInt(limit as string, 10) || 10
    const skip = (pageNum - 1) * limitNum

    const query: any = {}
    if (category && category !== 'all') {
      query.$or = [{ categorySlug: category }, { categoryId: category }]
    }
    if (search) {
      const safeSearch = escapeRegex(search)
      query.$or = [
        { name: new RegExp(safeSearch, 'i') },
        { brand: new RegExp(safeSearch, 'i') },
        { sku: new RegExp(safeSearch, 'i') },
      ]
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ])

    return {
      items: products.map((p) => this.formatProduct(p)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  async createProductAdmin(data: any) {
    let slug = data.slug
    if (!slug && data.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }
    const existing = await Product.findOne({ slug })
    if (existing) {
      const error: any = new Error(`Product with slug '${slug}' already exists`)
      error.statusCode = 409
      throw error
    }

    let categorySlug = data.categorySlug
    let categoryName = data.categoryName
    if (data.categoryId) {
      const cat: any = await Category.findOne({
        $or: [{ _id: isValidObjectId(data.categoryId) ? data.categoryId : undefined }, { slug: data.categoryId }],
      }).lean()
      if (cat) {
        categorySlug = categorySlug || cat.slug
        categoryName = categoryName || cat.name
      }
    }

    const mrp = Number(data.mrp)
    const offerPrice = Number(data.offerPrice)
    const discount = data.discount !== undefined ? Number(data.discount) : Math.round(((mrp - offerPrice) / mrp) * 100)

    const rawImages = Array.isArray(data.images) ? data.images : [data.images].filter(Boolean)
    const formattedImages = rawImages.map((img: any) =>
      typeof img === 'string'
        ? { url: img, alt: data.name || '' }
        : { url: img?.url || '/images/products/bareo-cica-serum.png', alt: img?.alt || data.name || '' }
    )
    if (formattedImages.length === 0) {
      formattedImages.push({ url: '/images/products/bareo-cica-serum.png', alt: data.name || '' })
    }

    const product = await Product.create({
      ...data,
      slug,
      categorySlug: categorySlug || 'treatments',
      categoryName: categoryName || 'Skincare Treatments',
      mrp,
      offerPrice,
      discount: Math.max(0, discount),
      stock: data.stock !== undefined ? Number(data.stock) : 100,
      images: formattedImages,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    })

    return this.formatProduct(product.toObject())
  }

  async updateProductAdmin(id: string, updates: any) {
    const product = await Product.findById(id)
    if (!product) {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    if (updates.slug && updates.slug !== product.slug) {
      const duplicate = await Product.findOne({ slug: updates.slug, _id: { $ne: id } })
      if (duplicate) {
        const error: any = new Error(`Product slug '${updates.slug}' already exists`)
        error.statusCode = 409
        throw error
      }
    }

    if (updates.images !== undefined) {
      const rawImages = Array.isArray(updates.images) ? updates.images : [updates.images].filter(Boolean)
      updates.images = rawImages.map((img: any) =>
        typeof img === 'string'
          ? { url: img, alt: updates.name || product.name }
          : { url: img?.url || '/images/products/bareo-cica-serum.png', alt: img?.alt || updates.name || product.name }
      )
    }

    Object.assign(product, updates)
    if (updates.mrp !== undefined || updates.offerPrice !== undefined) {
      const mrp = Number(product.mrp)
      const offerPrice = Number(product.offerPrice)
      if (mrp > 0) {
        product.discount = Math.max(0, Math.round(((mrp - offerPrice) / mrp) * 100))
      }
    }

    await product.save()
    return this.formatProduct(product.toObject())
  }

  async deleteProductAdmin(id: string) {
    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    return { success: true }
  }

  /** Add or update customer product review */
  async addReview(
    productIdOrSlug: string,
    userId: string,
    userName: string,
    reviewData: { rating: number; title?: string; comment: string }
  ) {
    const isObjId = isValidObjectId(productIdOrSlug)
    const query = isObjId
      ? { $or: [{ slug: productIdOrSlug }, { _id: productIdOrSlug }] }
      : { $or: [{ slug: productIdOrSlug }, { id: productIdOrSlug }] }

    const product = await Product.findOne(query)

    if (!product) {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    const { rating, title, comment } = reviewData
    const numRating = Number(rating)
    if (!numRating || numRating < 1 || numRating > 5) {
      const error: any = new Error('Rating must be between 1 and 5')
      error.statusCode = 400
      throw error
    }

    if (!comment || !comment.trim()) {
      const error: any = new Error('Review comment is required')
      error.statusCode = 400
      throw error
    }

    const existingReviewIndex = product.reviews.findIndex((r) => r.userId === userId)

    const newReview = {
      userId,
      userName: userName || 'Bareo Customer',
      rating: numRating,
      title: title?.trim() || '',
      comment: comment.trim(),
      date: new Date().toISOString(),
      verified: true,
      helpful: 0,
    }

    if (existingReviewIndex >= 0) {
      product.reviews[existingReviewIndex] = {
        ...product.reviews[existingReviewIndex],
        ...newReview,
      }
    } else {
      product.reviews.unshift(newReview as any)
    }

    product.ratingCount = product.reviews.length
    const totalRatingSum = product.reviews.reduce((sum, r) => sum + r.rating, 0)
    product.rating = parseFloat((totalRatingSum / product.ratingCount).toFixed(1))

    await product.save()

    return this.formatProduct(product.toObject())
  }
}

export const productService = new ProductService()
