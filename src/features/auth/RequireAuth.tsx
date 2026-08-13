import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface RequireAuthProps {
  children: React.ReactNode
  admin?: boolean
}

export function RequireAuth({ children, admin }: RequireAuthProps) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={admin ? '/admin/login' : '/login'}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Admin routes: Require role === 'ADMIN'
  if (admin && user?.role !== 'ADMIN') {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Storefront user-protected routes: Admins redirect to /admin deck
  if (!admin && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}