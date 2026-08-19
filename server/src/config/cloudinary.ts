import { v2 as cloudinary } from 'cloudinary'
import './env.js'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryUrl = process.env.CLOUDINARY_URL

export function isCloudinaryConfigured(): boolean {
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    return true
  }
  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== 'your_cloudinary_cloud_name' &&
    apiKey !== 'your_cloudinary_api_key'
  )
}

if (isCloudinaryConfigured()) {
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    process.env.CLOUDINARY_URL = cloudinaryUrl
    cloudinary.config(true)
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
  }
}

export { cloudinary }
