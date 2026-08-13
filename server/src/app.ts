import './config/env.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import healthRouter from './routes/health.router.js'
import authRouter from './routes/auth.router.js'
import productRouter from './routes/product.router.js'
import cartRouter from './routes/cart.router.js'
import checkoutRouter from './routes/checkout.router.js'
import orderRouter from './routes/order.router.js'
import aiRouter from './routes/ai.router.js'
import recommendationRouter from './routes/recommendation.router.js'
import adminRouter from './routes/admin.router.js'
import adminProductRouter from './routes/adminProduct.router.js'
import settingsRouter from './routes/settings.router.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'

const app = express()

// Core Middlewares
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Root Route Info
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: '🌿 Lumina Skin API v1 Server',
    status: 200,
    endpoints: {
      health: 'GET /api/v1/health',
      auth: 'POST /api/v1/auth/login, POST /api/v1/auth/register',
      products: 'GET /api/v1/products, GET /api/v1/categories',
      cart: 'GET /api/v1/cart, POST /api/v1/cart/items',
      checkout: 'POST /api/v1/checkout/validate-coupon, POST /api/v1/checkout/create-payment-intent',
      orders: 'GET /api/v1/orders, POST /api/v1/orders',
      ai: 'POST /api/v1/ai/consultation, POST /api/v1/ai/chat, GET /api/v1/ai/recommendations, GET /api/v1/ai/compatibility/:productId',
      admin: 'GET /api/v1/admin/analytics, GET /api/v1/admin/orders, CRUD /api/v1/admin/products',
    },
  })
})

// API Routes
app.use('/api/v1', healthRouter)
app.use('/api/v1', settingsRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1', productRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/checkout', checkoutRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/ai', recommendationRouter)
app.use('/api/v1/admin/products', adminProductRouter)
app.use('/api/v1/admin', adminRouter)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
