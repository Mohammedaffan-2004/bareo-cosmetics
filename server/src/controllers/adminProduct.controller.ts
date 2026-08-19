import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { productService } from '../services/product/product.service.js'
import { cloudinaryService } from '../services/cloudinary.service.js'

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response) => {
  const result = await productService.getProductsAdmin(req.query)

  res.status(200).json({
    data: result,
    message: 'Admin products retrieved',
    status: 200,
  })
}

export const getAdminProductById = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const product = await productService.getProductBySlug(id)
    res.status(200).json({ data: product, message: 'Product details retrieved', status: 200 })
  } catch (error: any) {
    const statusCode = error.statusCode || 404
    res.status(statusCode).json({ data: null, message: error.message, status: statusCode })
  }
}

export const createAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await productService.createProductAdmin(req.body)
    res.status(201).json({
      data: product,
      message: 'Product created successfully',
      status: 201,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    res.status(statusCode).json({ data: null, message: error.message, status: statusCode })
  }
}

export const updateAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = await productService.updateProductAdmin(id, req.body)
    res.status(200).json({
      data: updated,
      message: 'Product updated successfully',
      status: 200,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    res.status(statusCode).json({ data: null, message: error.message, status: statusCode })
  }
}

export const toggleProductStatusAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const existing = await productService.getProductBySlug(id)
    const nextStatus = existing.status === 'active' ? 'inactive' : 'active'
    const updated = await productService.updateProductAdmin(id, { status: nextStatus })
    res.status(200).json({
      data: updated,
      message: `Product status changed to ${nextStatus}`,
      status: 200,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 404
    res.status(statusCode).json({ data: null, message: error.message, status: statusCode })
  }
}

export const deleteAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    await productService.deleteProductAdmin(id)
    res.status(200).json({
      data: { id },
      message: 'Product deleted successfully',
      status: 200,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 404
    res.status(statusCode).json({ data: null, message: error.message, status: statusCode })
  }
}

export const uploadProductImageAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ data: null, message: 'No image file uploaded', status: 400 })
    }

    const uploaded = await cloudinaryService.uploadImage(req.file.buffer, req.file.originalname)
    res.status(200).json({
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId,
      },
      message: 'Product image uploaded successfully',
      status: 200,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({ data: null, message: error.message || 'Image upload failed', status: statusCode })
  }
}

export const deleteProductImageAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { publicId } = req.body
    if (!publicId) {
      return res.status(400).json({ data: null, message: 'Image publicId is required', status: 400 })
    }

    const deleted = await cloudinaryService.deleteImage(publicId)
    res.status(200).json({
      data: { success: deleted, publicId },
      message: 'Product image deleted successfully',
      status: 200,
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({ data: null, message: error.message || 'Image deletion failed', status: statusCode })
  }
}

