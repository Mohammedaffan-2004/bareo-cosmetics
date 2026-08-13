import { Router } from 'express'
import {
  getAnalyticsSummary,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAllCustomersAdmin,
  getCustomerByIdAdmin,
  getCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/admin.controller.js'
import { authGuard, adminGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Admin routes require authGuard + adminGuard
router.use(authGuard, adminGuard)

router.get('/analytics', asyncHandler(getAnalyticsSummary))
router.get('/orders', asyncHandler(getAllOrdersAdmin))
router.put('/orders/:orderId/status', asyncHandler(updateOrderStatusAdmin))
router.get('/customers', asyncHandler(getAllCustomersAdmin))
router.get('/customers/:id', asyncHandler(getCustomerByIdAdmin))

// Coupon Management Routes
router.get('/coupons', asyncHandler(getCouponsAdmin))
router.post('/coupons', asyncHandler(createCouponAdmin))
router.put('/coupons/:id', asyncHandler(updateCouponAdmin))
router.delete('/coupons/:id', asyncHandler(deleteCouponAdmin))

// Settings Management Routes
router.get('/settings', asyncHandler(getAdminSettings))
router.put('/settings', asyncHandler(updateAdminSettings))

export default router
