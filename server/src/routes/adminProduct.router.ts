import { Router } from 'express'
import {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  toggleProductStatusAdmin,
  deleteAdminProduct,
} from '../controllers/adminProduct.controller.js'
import { authGuard, adminGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// All admin product routes require authentication + admin role
router.use(authGuard, adminGuard)

router.get('/', asyncHandler(getAdminProducts))
router.get('/:id', asyncHandler(getAdminProductById))
router.post('/', asyncHandler(createAdminProduct))
router.put('/:id', asyncHandler(updateAdminProduct))
router.patch('/:id/status', asyncHandler(toggleProductStatusAdmin))
router.delete('/:id', asyncHandler(deleteAdminProduct))

export default router
