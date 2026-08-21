import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
  Sparkles,
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
  const queryClient = useQueryClient()

  useEffect(() => {
    document.title = 'Bareo Admin — Executive Deck'
  }, [])

  const handleLogout = () => {
    try {
      queryClient.clear()
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
      {/* Brand Header Block (60px Height with #DCE6E9 Divider) */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#DCE6E9] px-5">
        <Link to="/admin" className="flex items-center gap-2.5 outline-hidden group">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[#172126] text-white font-serif text-sm font-bold border border-[#172126]">
            B
          </span>
          <div className="flex flex-col justify-center">
            <span className="font-serif text-[14px] font-bold tracking-[0.14em] text-[#172126] uppercase leading-none">
              BAREO
            </span>
            <span className="text-[8.5px] font-bold tracking-[0.14em] text-[#167C86] uppercase mt-1 leading-none">
              EXECUTIVE DECK
            </span>
          </div>
        </Link>
        <button
          type="button"
          className="rounded-lg p-1 text-[#52636B] hover:bg-[#FAF7F2] hover:text-[#172126] lg:hidden transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Grouped Sidebar Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7A8A91] mb-1.5">
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
                      'relative flex items-center gap-2.5 h-9 rounded-lg px-3 text-[12.5px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#FAF7F2] text-[#172126] font-semibold'
                        : 'text-[#52636B] hover:bg-[#FAF7F2]/60 hover:text-[#172126]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#167C86] rounded-r-full" />
                      )}
                      <Icon className={cn('size-[16px] shrink-0', isActive ? 'text-[#167C86]' : 'text-[#7A8A91]')} />
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
    <div className="flex min-h-screen bg-[#FAF7F2]/40">
      {/* Desktop Fixed Left Sidebar (220px Width) */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-[#DCE6E9] bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Modal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-[#172126]/30 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[220px] bg-white shadow-xl animate-content-in">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Top Bar (60px Height, #DCE6E9 Border) */}
        <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-[#DCE6E9] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 text-[#52636B] hover:bg-[#FAF7F2] hover:text-[#172126] lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[13px] font-bold text-[#172126]">
                  BAREO EXECUTIVE DECK
                </span>
                <span className="h-3 w-px bg-[#DCE6E9]" />
                <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase flex items-center gap-1">
                  <Sparkles className="size-3 text-[#167C86]" /> FORMULATION / OPERATIONS
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Executive Access Indicator Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#DCE6E9] bg-[#FAF7F2] px-3 py-1 text-[11px] font-medium text-[#52636B]">
              <span className="size-1.5 rounded-full bg-[#167C86]" /> Executive Access
            </div>

            {/* Quiet Sign Out Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#52636B] hover:bg-[#FAF7F2] hover:text-[#172126] transition-colors cursor-pointer"
              aria-label="End Admin Session"
            >
              <LogOut className="size-3.5 text-[#7A8A91]" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Stage */}
        <main className="flex-1 p-5 sm:p-8 space-y-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
