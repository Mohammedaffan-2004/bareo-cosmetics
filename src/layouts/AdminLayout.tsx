import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TicketPercent,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { useToast } from '@/hooks/useToast'
import { Toaster } from '@/components/common/Toaster'
import { cn } from '@/utils'
import { removeStoredToken } from '@/services/apiClient'

const NAV_GROUPS = [
  {
    title: 'COMMERCE',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      { label: 'Offers & Coupons', href: '/admin/offers', icon: TicketPercent },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

/**
 * Bareo Executive Admin Console Layout — Quiet Luxury Internal Shell.
 * Features fixed 220px sidebar, 60px header top bar, warm ivory hover accents, and obsidian primary typography.
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Bareo Admin — Executive Console'
  }, [])

  const handleLogout = () => {
    try {
      dispatch(logout())
      toast.success('Logged out', 'Admin session terminated')
      navigate('/admin/login', { replace: true })
    } catch {
      removeStoredToken()
      navigate('/admin/login', { replace: true })
    }
  }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header Block (60px Height with #E9E5DF Divider) */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#E9E5DF] px-6">
        <Link to="/admin" className="flex items-center gap-2.5 outline-hidden group">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white font-serif text-sm font-bold border border-[#111111]">
            B
          </span>
          <div className="flex flex-col justify-center">
            <span className="font-serif text-[15px] font-bold tracking-[0.14em] text-[#111111] uppercase leading-none">
              BAREO
            </span>
            <span className="text-[9px] font-semibold tracking-[0.12em] text-[#6F6A63] uppercase mt-1 leading-none">
              EXECUTIVE CONSOLE
            </span>
          </div>
        </Link>
        <button
          type="button"
          className="rounded-lg p-1 text-[#6F6A63] hover:bg-[#F7F4EF] hover:text-[#111111] lg:hidden transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Grouped Sidebar Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A948C] mb-1">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 h-9 rounded-[9px] px-3 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#111111] text-white font-semibold'
                        : 'text-[#6F6A63] hover:bg-[#F7F4EF] hover:text-[#111111]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('size-[17px] shrink-0', isActive ? 'text-white' : 'text-[#9A948C]')} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Desktop Fixed Left Sidebar (220px Width) */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-[#E9E5DF] bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Modal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[220px] bg-white shadow-xl animate-content-in">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Top Bar (60px Height, #E9E5DF Border) */}
        <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-[#E9E5DF] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 text-[#6F6A63] hover:bg-[#F7F4EF] hover:text-[#111111] lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[13px] font-semibold text-[#111111]">
                  Bareo Executive Deck
                </span>
                <span className="inline-flex items-center rounded-full bg-[#111111] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-[0.1em]">
                  V2.4 LIVE
                </span>
              </div>
              <p className="text-[10px] text-[#6F6A63] font-normal leading-none mt-0.5">
                Centralized Store Management Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Executive Access Indicator Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E5E1DB] bg-[#F7F4EF]/60 px-3 py-1 text-[11px] font-medium text-[#6F6A63]">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Executive Access
            </div>

            {/* Quiet Sign Out Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-[9px] px-3 py-1.5 text-[12px] font-medium text-[#6F6A63] hover:bg-[#F7F4EF] hover:text-[#111111] transition-colors"
              aria-label="End Admin Session"
            >
              <LogOut className="size-3.5 text-[#9A948C]" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Stage */}
        <main className="flex-1 p-6 sm:p-8 space-y-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

