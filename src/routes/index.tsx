import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/layouts/Layout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Loader } from '@/components/common/Loader'
import { HomePage } from '@/features/home/HomePage'
import { RequireAuth } from '@/features/auth/RequireAuth'

// Lazy loaded feature routes for code-splitting & optimal bundle size
const ShopPage = lazy(() => import('@/features/products/ShopPage').then((m) => ({ default: m.ShopPage })))
const ProductDetailPage = lazy(() => import('@/features/products/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const CartPage = lazy(() => import('@/features/cart/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/features/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const OrderSuccessPage = lazy(() => import('@/features/checkout/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })))
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderTrackingPage = lazy(() => import('@/features/orders/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })))
const WishlistPage = lazy(() => import('@/features/wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage })))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const ProfileLayout = lazy(() => import('@/features/profile/ProfileLayout').then((m) => ({ default: m.ProfileLayout })))
const AddressesPage = lazy(() => import('@/features/profile/AddressesPage').then((m) => ({ default: m.AddressesPage })))
const PaymentMethodsPage = lazy(() => import('@/features/profile/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })))
const SettingsPage = lazy(() => import('@/features/profile/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const ConsultationsPage = lazy(() => import('@/features/ai/ConsultationsPage').then((m) => ({ default: m.ConsultationsPage })))
const SkinAnalysisPage = lazy(() => import('@/features/ai/SkinAnalysisPage').then((m) => ({ default: m.SkinAnalysisPage })))
const AiChatPage = lazy(() => import('@/features/ai/AiChatPage').then((m) => ({ default: m.AiChatPage })))
const BlogPage = lazy(() => import('@/features/home/BlogPage').then((m) => ({ default: m.BlogPage })))
const BlogPostDetailPage = lazy(() => import('@/features/home/BlogPostDetailPage').then((m) => ({ default: m.BlogPostDetailPage })))

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const VerifyOtpPage = lazy(() => import('@/features/auth/VerifyOtpPage').then((m) => ({ default: m.VerifyOtpPage })))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))

const AdminLoginPage = lazy(() => import('@/features/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminProductsPage = lazy(() => import('@/features/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })))
const AdminProductFormPage = lazy(() => import('@/features/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })))
const AdminOrdersPage = lazy(() => import('@/features/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })))
const AdminOrderDetailPage = lazy(() => import('@/features/admin/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })))
const AdminCustomersPage = lazy(() => import('@/features/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })))
const AdminCustomerDetailPage = lazy(() => import('@/features/admin/AdminCustomerDetailPage').then((m) => ({ default: m.AdminCustomerDetailPage })))
const AdminOffersPage = lazy(() => import('@/features/admin/AdminOffersPage').then((m) => ({ default: m.AdminOffersPage })))
const AdminAnalyticsPage = lazy(() => import('@/features/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })))
const AdminSettingsPage = lazy(() => import('@/features/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))

const NotFoundPage = lazy(() => import('@/features/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader label="Loading Bareo..." />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <Suspense fallback={<PageLoader />}><ShopPage /></Suspense> },
      { path: 'product/:slug', element: <Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense> },
      { path: 'wishlist', element: <Suspense fallback={<PageLoader />}><WishlistPage /></Suspense> },
      { path: 'cart', element: <Suspense fallback={<PageLoader />}><CartPage /></Suspense> },
      { path: 'checkout', element: <RequireAuth><Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense></RequireAuth> },
      { path: 'order-success', element: <Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense> },
      { path: 'orders', element: <RequireAuth><Suspense fallback={<PageLoader />}><OrdersPage /></Suspense></RequireAuth> },
      { path: 'orders/:orderId', element: <RequireAuth><Suspense fallback={<PageLoader />}><OrderTrackingPage /></Suspense></RequireAuth> },
      { path: 'consultations', element: <RequireAuth><Suspense fallback={<PageLoader />}><ConsultationsPage /></Suspense></RequireAuth> },
      { path: 'skin-analysis', element: <Suspense fallback={<PageLoader />}><SkinAnalysisPage /></Suspense> },
      { path: 'skin-analysis/chat', element: <Suspense fallback={<PageLoader />}><AiChatPage /></Suspense> },
      { path: 'blog', element: <Suspense fallback={<PageLoader />}><BlogPage /></Suspense> },
      { path: 'blog/:slug', element: <Suspense fallback={<PageLoader />}><BlogPostDetailPage /></Suspense> },
      { path: 'journal', element: <Navigate to="/blog" replace /> },
      { path: 'profile', element: <RequireAuth><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></RequireAuth> },
      {
        path: 'account',
        element: <RequireAuth><Suspense fallback={<PageLoader />}><ProfileLayout /></Suspense></RequireAuth>,
        children: [
          { index: true, element: <Navigate to="/profile" replace /> },
          { path: 'overview', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
          { path: 'addresses', element: <Suspense fallback={<PageLoader />}><AddressesPage /></Suspense> },
          { path: 'payments', element: <Suspense fallback={<PageLoader />}><PaymentMethodsPage /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
      { path: 'forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense> },
      { path: 'verify-otp', element: <Suspense fallback={<PageLoader />}><VerifyOtpPage /></Suspense> },
      { path: 'reset-password', element: <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense> },
    ],
  },
  {
    path: '/admin/login',
    element: <Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>,
  },
  {
    path: '/admin',
    element: <RequireAuth admin><AdminLayout /></RequireAuth>,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
      { path: 'products', element: <Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense> },
      { path: 'products/new', element: <Suspense fallback={<PageLoader />}><AdminProductFormPage /></Suspense> },
      { path: 'products/:id', element: <Suspense fallback={<PageLoader />}><AdminProductFormPage /></Suspense> },
      { path: 'orders', element: <Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense> },
      { path: 'orders/:orderId', element: <Suspense fallback={<PageLoader />}><AdminOrderDetailPage /></Suspense> },
      { path: 'customers', element: <Suspense fallback={<PageLoader />}><AdminCustomersPage /></Suspense> },
      { path: 'customers/:id', element: <Suspense fallback={<PageLoader />}><AdminCustomerDetailPage /></Suspense> },
      { path: 'offers', element: <Suspense fallback={<PageLoader />}><AdminOffersPage /></Suspense> },
      { path: 'analytics', element: <Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense> },
    ],
  },
  { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
])
