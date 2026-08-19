import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import { Readable } from 'stream'

export interface CloudinaryUploadResult {
  url: string
  publicId: string
}

export class CloudinaryService {
  /**
   * Uploads an image file buffer to Cloudinary under the bareo/products folder.
   */
  async uploadImage(fileBuffer: Buffer, originalFilename?: string): Promise<CloudinaryUploadResult> {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        'Cloudinary is not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      )
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bareo/products',
          resource_type: 'image',
          transformation: [
            {
              width: 800,
              height: 800,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error(error?.message || 'Failed to upload image to Cloudinary'))
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      )

      const bufferStream = new Readable()
      bufferStream.push(fileBuffer)
      bufferStream.push(null)
      bufferStream.pipe(uploadStream)
    })
  }

  /**
   * Deletes an image from Cloudinary by its public_id.
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary credentials not configured on server.')
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok' || result.result === 'not found'
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete image from Cloudinary')
    }
  }
}

export const cloudinaryService = new CloudinaryService()
