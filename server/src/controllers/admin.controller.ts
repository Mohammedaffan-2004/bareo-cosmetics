import { Response } from 'express'
import { Order } from '../models/Order.model.js'
import { Product } from '../models/Product.model.js'
import { User } from '../models/User.model.js'
import { Coupon } from '../models/Coupon.model.js'
import { StoreSettings } from '../models/StoreSettings.model.js'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { isValidObjectId } from '../utils/validation.js'
import { couponService } from '../services/coupon/coupon.service.js'
import { success, created, badRequest, notFound } from '../utils/response.js'

function parseDateRange(query: any) {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  let startDate = new Date(now)
  startDate.setHours(0, 0, 0, 0)

  const range = (query.range || '30d').toLowerCase()

  if (query.startDate && query.endDate) {
    const s = new Date(`${query.startDate}T00:00:00.000Z`)
    const e = new Date(`${query.endDate}T23:59:59.999Z`)
    return {
      startDate: isNaN(s.getTime()) ? startDate : s,
      endDate: isNaN(e.getTime()) ? endDate : e,
      rangeKey: 'custom',
      label: `${query.startDate} to ${query.endDate}`,
    }
  }

  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      return { startDate, endDate, rangeKey: 'today', label: 'Today' }
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      const yesterdayEnd = new Date(startDate)
      yesterdayEnd.setHours(23, 59, 59, 999)
      return { startDate, endDate: yesterdayEnd, rangeKey: 'yesterday', label: 'Yesterday' }
    case '7d':
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
      return { startDate, endDate, rangeKey: '7d', label: 'Last 7 days' }
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate, endDate, rangeKey: 'this_month', label: 'This month' }
    case 'previous_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { startDate, endDate: prevMonthEnd, rangeKey: 'previous_month', label: 'Previous month' }
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1)
      return { startDate, endDate, rangeKey: 'this_year', label: 'This year' }
    case '30d':
    default:
      startDate.setDate(startDate.getDate() - 29)
      startDate.setHours(0, 0, 0, 0)
      return { startDate, endDate, rangeKey: '30d', label: 'Last 30 days' }
  }
}

export const getAnalyticsSummary = async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate, rangeKey, label } = parseDateRange(req.query)

  // 1. Overview Dashboard global metrics (when range param is default/overview or requested)
  const validPaidOrdersGlobal = await Order.find(
    { status: { $ne: 'cancelled' }, paymentStatus: 'paid' },
    'total'
  ).lean()

  const [
    validOrdersCountGlobal,
    totalProducts,
    totalCustomers,
    awaitingFulfillmentCount,
    lowStockCount,
    activeCouponsCount,
    lowStockProducts,
    rawRecentOrders,
    rawRecentUsers,
  ] = await Promise.all([
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Product.countDocuments(),
    User.countDocuments({ role: 'USER' }),
    Order.countDocuments({ status: 'confirmed' }),
    Product.countDocuments({ stock: { $gt: 0, $lt: 20 } }),
    Coupon.countDocuments({ active: true }),
    Product.find({ stock: { $gt: 0, $lt: 20 } }).select('name stock images categoryId offerPrice').limit(6).lean(),
    Order.find().sort({ placedAt: -1 }).limit(6).lean(),
    User.find({ role: 'USER' }).sort({ joinedAt: -1 }).limit(5).lean(),
  ])

  const totalRevenueGlobal = validPaidOrdersGlobal.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
  const averageOrderValueGlobal = validOrdersCountGlobal > 0 ? Math.round(totalRevenueGlobal / validOrdersCountGlobal) : 0

  // 2. Date-Range Specific Aggregation Metrics for Analytics Page
  const [
    rangePaidOrders,
    rangeValidOrdersCount,
    rangeNewCustomersCount,
    dailyOrderAgg,
    statusAgg,
    topProductsAgg,
    customerAgg,
    couponAgg,
  ] = await Promise.all([
    Order.find(
      {
        status: { $ne: 'cancelled' },
        paymentStatus: 'paid',
        placedAt: { $gte: startDate, $lte: endDate },
      },
      'total'
    ).lean(),
    Order.countDocuments({
      status: { $ne: 'cancelled' },
      placedAt: { $gte: startDate, $lte: endDate },
    }),
    User.countDocuments({
      role: 'USER',
      joinedAt: { $gte: startDate, $lte: endDate },
    }),
    Order.aggregate([
      {
        $match: {
          placedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } },
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'cancelled'] }, { $eq: ['$paymentStatus', 'paid'] }] },
                '$total',
                0,
              ],
            },
          },
          validOrders: {
            $sum: {
              $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { placedAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          placedAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          productId: { $first: '$items.productId' },
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    User.aggregate([
      {
        $match: {
          role: 'USER',
          joinedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$joinedAt' } },
          customers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          couponCode: { $ne: null },
          status: { $ne: 'cancelled' },
          placedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$couponCode',
          count: { $sum: 1 },
          discountTotal: { $sum: '$couponDiscount' },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ])

  const rangeRevenue = rangePaidOrders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
  const rangeAov = rangeValidOrdersCount > 0 ? Math.round(rangeRevenue / rangeValidOrdersCount) : 0

  // Format Daily Revenue & Order Trends
  const revenueTrend = dailyOrderAgg.map((d: any) => ({
    date: d._id,
    revenue: d.totalRevenue,
  }))

  const orderTrend = dailyOrderAgg.map((d: any) => ({
    date: d._id,
    orders: d.validOrders,
    cancelled: d.cancelledOrders,
  }))

  const customerTrend = customerAgg.map((c: any) => ({
    date: c._id,
    customers: c.customers,
  }))

  const orderStatus = statusAgg.map((s: any) => ({
    status: s._id,
    count: s.count,
  }))

  const topProducts = topProductsAgg.map((p: any) => ({
    productId: p.productId || p._id,
    name: p.name || p._id,
    unitsSold: p.unitsSold,
    revenue: p.revenue,
  }))

  const couponOrdersCount = couponAgg.reduce((acc: number, curr: any) => acc + curr.count, 0)
  const couponDiscountTotal = couponAgg.reduce((acc: number, curr: any) => acc + (curr.discountTotal || 0), 0)

  // Format Overview Dashboard structures
  const recentOrderUserIds = rawRecentOrders.map((o: any) => o.userId).filter(Boolean)
  const orderUsers = await User.find(
    { _id: { $in: recentOrderUserIds.filter(isValidObjectId) } },
    'name email'
  ).lean()

  const formattedRecentOrders = rawRecentOrders.map((o: any) => {
    const u: any = orderUsers.find((usr: any) => usr._id.toString() === o.userId)
    return {
      id: o._id.toString(),
      orderId: o.orderId,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      placedAt: o.placedAt ? new Date(o.placedAt).toISOString() : new Date().toISOString(),
      customerName: u ? u.name : 'Guest Customer',
      customerEmail: u ? u.email : '',
    }
  })

  const recentUserIds = rawRecentUsers.map((u: any) => u._id.toString())
  const userOrdersList = await Order.find({ userId: { $in: recentUserIds } }).lean()

  const formattedRecentCustomers = rawRecentUsers.map((cust: any) => {
    const custId = cust._id.toString()
    const custOrders = userOrdersList.filter((o: any) => o.userId === custId)
    const ltv = custOrders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)

    return {
      id: custId,
      name: cust.name,
      email: cust.email,
      phone: cust.phone || 'N/A',
      joinedAt: cust.joinedAt ? new Date(cust.joinedAt).toISOString() : new Date().toISOString(),
      ordersCount: custOrders.length,
      lifetimeValue: ltv,
    }
  })

  const formattedLowStock = lowStockProducts.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    stock: p.stock ?? 0,
    offerPrice: p.offerPrice,
    images: p.images || [],
  }))

  return success(
    res,
    {
      // Range Info
      range: {
        key: rangeKey,
        label,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },

      // Overview Dashboard global metrics
      summary: {
        revenue: totalRevenueGlobal,
        orders: validOrdersCountGlobal,
        products: totalProducts,
        customers: totalCustomers,
        averageOrderValue: averageOrderValueGlobal,

        // Range specific overview summary
        rangeRevenue,
        rangeOrders: rangeValidOrdersCount,
        rangeAov,
        newCustomers: rangeNewCustomersCount,
      },

      // Action Center for Overview
      attention: {
        awaitingFulfillment: awaitingFulfillmentCount,
        lowStock: lowStockCount,
        activeCoupons: activeCouponsCount,
      },

      // Analytics Page Aggregated Collections
      revenueTrend,
      orderTrend,
      orderStatus,
      topProducts,
      customerTrend,
      promotions: {
        couponOrders: couponOrdersCount,
        totalDiscount: couponDiscountTotal,
        topCoupons: couponAgg.map((c: any) => ({ code: c._id, count: c.count })),
      },

      // Tables
      lowStock: formattedLowStock,
      recentOrders: formattedRecentOrders,
      recentCustomers: formattedRecentCustomers,
    },
    'Analytics and overview data retrieved'
  )
}

export const getAllOrdersAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const orders = await Order.find().sort({ placedAt: -1 }).lean()
  const userIds = orders.map((o: any) => o.userId).filter(Boolean)
  const users = await User.find({ _id: { $in: userIds.filter(isValidObjectId) } }, 'name email phone').lean()

  const formatted = orders.map((order: any) => {
    const u: any = users.find((usr: any) => usr._id.toString() === order.userId)
    return {
      ...order,
      id: order._id?.toString() || order.id,
      user: u ? { id: u._id.toString(), name: u.name, email: u.email, phone: u.phone } : undefined,
      placedAt: order.placedAt ? new Date(order.placedAt).toISOString() : new Date().toISOString(),
      timeline: (order.timeline || []).map((t: any) => ({
        status: t.status,
        label: t.label,
        at: t.at ? new Date(t.at).toISOString() : new Date().toISOString(),
        note: t.note || undefined,
      })),
    }
  })

  return success(res, formatted, 'All admin orders retrieved')
}

export const updateOrderStatusAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.orderId as string
  const { status, note } = req.body

  if (!status) {
    return badRequest(res, 'Status is required')
  }

  const order = await Order.findOne({
    $or: [{ _id: isValidObjectId(orderId) ? orderId : undefined }, { orderId }],
  })

  if (!order) {
    return notFound(res, 'Order not found')
  }

  const statusLabels: Record<string, string> = {
    confirmed: 'Order Confirmed',
    packed: 'Packed at Warehouse',
    shipped: 'Shipped via Courier',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered to Customer',
    cancelled: 'Order Cancelled',
  }

  order.status = status
  order.timeline.push({
    status,
    label: statusLabels[status] || status,
    at: new Date(),
    note: note || `Order status updated to ${status}`,
  })

  await order.save()

  return success(
    res,
    {
      ...order.toObject(),
      id: order._id.toString(),
      placedAt: order.placedAt ? order.placedAt.toISOString() : new Date().toISOString(),
    },
    `Order status updated to ${status}`
  )
}

export const getAllCustomersAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const customers = await User.find({ role: 'USER' }).sort({ joinedAt: -1 }).lean()
  const customerIds = customers.map((c: any) => c._id.toString())
  const orders = await Order.find({ userId: { $in: customerIds } }).sort({ placedAt: -1 }).lean()

  const formatted = customers.map((c: any) => {
    const userOrders = orders.filter((o: any) => o.userId === c._id.toString())
    const lifetimeValue = userOrders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
    const lastOrder = userOrders.length > 0 && userOrders[0].placedAt ? new Date(userOrders[0].placedAt).toISOString() : undefined

    return {
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone || 'N/A',
      joinedAt: c.joinedAt ? new Date(c.joinedAt).toISOString() : new Date().toISOString(),
      orders: userOrders.length,
      lifetimeValue,
      status: 'active',
      lastOrder,
      wishlist: 0,
      activity: [
        { date: c.joinedAt ? new Date(c.joinedAt).toISOString() : new Date().toISOString(), action: 'Account registered' },
      ],
    }
  })

  return success(res, formatted, 'Customer directory retrieved')
}

export const getCustomerByIdAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const customerId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : String(id)
  const customer: any = await User.findOne({
    _id: isValidObjectId(customerId) ? customerId : undefined,
    role: 'USER',
  }).lean()

  if (!customer) {
    return notFound(res, 'Customer account not found')
  }

  const userId = customer._id.toString()
  const orders = await Order.find({ userId }).sort({ placedAt: -1 }).lean()

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const lastOrderAt = orders.length > 0 ? orders[0].createdAt : null

  const result = {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    phone: customer.phone || 'N/A',
    joinedAt: customer.createdAt || customer.joinedAt || new Date().toISOString(),
    role: customer.role,
    skinType: customer.skinType || 'Not specified',
    gender: customer.gender || 'Not specified',
    ordersCount: orders.length,
    totalSpent: Math.round(totalSpent),
    lastOrderAt,
    orders: orders.map((o: any) => ({
      id: o._id.toString(),
      orderId: o.orderId,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      gst: o.gst,
      total: o.total,
      status: o.status,
      itemCount: Array.isArray(o.items) ? o.items.length : 0,
      createdAt: o.createdAt,
    })),
  }

  return success(res, result, 'Customer details retrieved')
}

// ------------------------------------------------------------
// Coupon CRUD Handlers
// ------------------------------------------------------------

export const getCouponsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const formatted = await couponService.getCouponsAdmin()
  return success(res, formatted, 'Coupons retrieved')
}

export const createCouponAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const couponData = await couponService.createCouponAdmin(req.body)
    return created(res, couponData, 'Coupon created successfully')
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    if (statusCode === 404) return notFound(res, error.message)
    return badRequest(res, error.message)
  }
}

export const updateCouponAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = await couponService.updateCouponAdmin(id, req.body)
    return success(res, updated, 'Coupon updated successfully')
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    if (statusCode === 404) return notFound(res, error.message)
    return badRequest(res, error.message)
  }
}

export const deleteCouponAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    await couponService.deleteCouponAdmin(id)
    return success(res, { success: true }, 'Coupon deleted')
  } catch (error: any) {
    const statusCode = error.statusCode || 404
    return notFound(res, error.message)
  }
}

// ------------------------------------------------------------
// Admin Store Settings Handlers
// ------------------------------------------------------------

export const getAdminSettings = async (req: AuthenticatedRequest, res: Response) => {
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
      id: settings._id.toString(),
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      freeShippingThreshold: settings.freeShippingThreshold,
      gstRate: settings.gstRate,
      lowStockThreshold: settings.lowStockThreshold,
      maintenanceMode: settings.maintenanceMode,
      aiAssistantEnabled: settings.aiAssistantEnabled,
      updatedAt: settings.updatedAt,
    },
    'Store settings retrieved'
  )
}

export const updateAdminSettings = async (req: AuthenticatedRequest, res: Response) => {
  const {
    storeName,
    supportEmail,
    supportPhone,
    freeShippingThreshold,
    gstRate,
    lowStockThreshold,
    maintenanceMode,
    aiAssistantEnabled,
  } = req.body

  const updateFields: any = {}

  if (storeName !== undefined) {
    if (typeof storeName !== 'string' || !storeName.trim()) {
      return badRequest(res, 'Store name is required')
    }
    updateFields.storeName = storeName.trim()
  }

  if (supportEmail !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof supportEmail !== 'string' || !emailRegex.test(supportEmail)) {
      return badRequest(res, 'Valid support email is required')
    }
    updateFields.supportEmail = supportEmail.trim().toLowerCase()
  }

  if (supportPhone !== undefined) {
    if (typeof supportPhone !== 'string' || !supportPhone.trim()) {
      return badRequest(res, 'Support phone is required')
    }
    updateFields.supportPhone = supportPhone.trim()
  }

  if (freeShippingThreshold !== undefined) {
    const threshold = Number(freeShippingThreshold)
    if (isNaN(threshold) || threshold < 0) {
      return badRequest(res, 'Free shipping threshold must be a non-negative number')
    }
    updateFields.freeShippingThreshold = threshold
  }

  if (gstRate !== undefined) {
    const gst = Number(gstRate)
    if (isNaN(gst) || gst < 0 || gst > 100) {
      return badRequest(res, 'GST rate must be between 0% and 100%')
    }
    updateFields.gstRate = gst
  }

  if (lowStockThreshold !== undefined) {
    const stockThreshold = Number(lowStockThreshold)
    if (isNaN(stockThreshold) || stockThreshold < 0) {
      return badRequest(res, 'Low stock threshold must be a non-negative number')
    }
    updateFields.lowStockThreshold = stockThreshold
  }

  if (maintenanceMode !== undefined) {
    if (typeof maintenanceMode !== 'boolean') {
      return badRequest(res, 'Maintenance mode must be a boolean value')
    }
    updateFields.maintenanceMode = maintenanceMode
  }

  if (aiAssistantEnabled !== undefined) {
    if (typeof aiAssistantEnabled !== 'boolean') {
      return badRequest(res, 'AI Assistant enabled must be a boolean value')
    }
    updateFields.aiAssistantEnabled = aiAssistantEnabled
  }

  let updated = await StoreSettings.findOneAndUpdate(
    {},
    { $set: updateFields },
    { new: true, upsert: true }
  ).lean()

  return success(
    res,
    {
      id: updated._id.toString(),
      storeName: updated.storeName,
      supportEmail: updated.supportEmail,
      supportPhone: updated.supportPhone,
      freeShippingThreshold: updated.freeShippingThreshold,
      gstRate: updated.gstRate,
      lowStockThreshold: updated.lowStockThreshold,
      maintenanceMode: updated.maintenanceMode,
      aiAssistantEnabled: updated.aiAssistantEnabled,
      updatedAt: updated.updatedAt,
    },
    'Store settings updated successfully'
  )
}
