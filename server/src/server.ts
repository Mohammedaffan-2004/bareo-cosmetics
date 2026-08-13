import './config/env.js'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

// Initialize MongoDB connection via Mongoose
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
  ================================================
  🌿 Lumina Skin Backend API Server (Mongoose MongoDB)
  📡 Running on: http://localhost:${PORT}/api/v1
  🟢 Environment: ${process.env.NODE_ENV || 'development'}
  ================================================
    `)
  })
})
