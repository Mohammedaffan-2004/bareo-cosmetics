import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'

dotenv.config()

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

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`🍃 MongoDB Connected via Mongoose: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`⚠️ Mongoose Connection Warning: Unable to connect to database. Operating in resilient fallback mode.`, error)
  }
}

export default connectDB
