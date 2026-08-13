import { Router } from 'express'
import { StoreSettings } from '../models/StoreSettings.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { success } from '../utils/response.js'

const router = Router()

router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    let settings: any = await StoreSettings.findOne().lean()
    if (!settings) {
      const doc = await StoreSettings.create({
        storeName: 'Bareo Cosmetics',
        supportEmail: 'care@bareo.in',
        supportPhone: '+91 1800 300 3000',
        freeShippingThreshold: 499,
        gstRate: 18,
        lowStockThreshold: 20,
        maintenanceMode: false,
        aiAssistantEnabled: true,
      })
      settings = doc.toObject()
    }

    return success(
      res,
      {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        freeShippingThreshold: settings.freeShippingThreshold,
        gstRate: settings.gstRate,
        lowStockThreshold: settings.lowStockThreshold,
        maintenanceMode: settings.maintenanceMode,
        aiAssistantEnabled: settings.aiAssistantEnabled,
      },
      'Public store settings retrieved'
    )
  })
)

export default router
