import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
  Package,
  LogOut,
  BookHeart,
} from 'lucide-react'
import { Logo } from './Logo'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDrawerOpen } from '@/store/slices/cartSlice'
import { logout } from '@/store/slices/authSlice'
import { useToast } from '@/hooks/useToast'
import { SearchBar } from '@/components/common/SearchBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils'

const NAV_LINKS = [
  { label: 'Skincare', to: '/shop?category=skincare' },
  { label: 'Hair Care', to: '/shop?category=hair-care' },
  { label: 'Body Care', to: '/shop?category=body-care' },
  { label: 'Baby Care', to: '/shop?category=baby-care' },
  { label: 'AI Skin Assessment ✨', to: '/skin-analysis', isAi: true },
  { label: 'Journal', to: '/blog' },
]

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const cartCount = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0))
  const wishlistCount = useAppSelector((s) => s.wishlist.products.length)
  const user = useAppSelector((s) => s.auth.user)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'BA'

  return (
    <header className="sticky top-0 z-50">
      {/* SECTION 1: Announcement Bar */}
      <div className="bg-[#111111] text-white flex h-[34px] items-center justify-center px-4 overflow-hidden border-b border-black/20 select-none">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-[12px] font-medium tracking-[0.05em] text-[#D1D5DB] whitespace-nowrap overflow-x-auto no-scrollbar py-1">
          <Sparkles className="size-3 text-amber-300/90 shrink-0" />
          <span>
            <strong className="font-semibold text-white">Free Express Shipping</strong> on orders above ₹499
          </span>
          <span className="text-[#6B7280] font-normal px-0.5 sm:px-1">•</span>
          <span>
            Dermatologist Formulated from ₹199
          </span>
          <span className="text-[#6B7280] font-normal px-0.5 sm:px-1">•</span>
          <span className="text-[#E5E7EB]">
            100% Clean &amp; Cruelty-Free
          </span>
        </div>
      </div>

      {/* SECTION 2: Bareo Sticky Navigation */}
      <div className={cn('border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md transition-shadow', scrolled && 'shadow-xs')}>
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#111111] hover:bg-[#FAFAFA] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors',
                    link.isAi && 'text-[#7C3AED] hover:bg-[#FAF5FF] font-semibold',
                    !link.isAi && (isActive ? 'bg-[#FAFAFA] text-[#111111] font-semibold' : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]')
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#FAFAFA]"
              aria-label="Toggle search drawer"
              aria-expanded={searchOpen}
            >
              <Search className="size-5" />
            </button>

            <Link
              to="/wishlist"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#FAFAFA]"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => dispatch(setDrawerOpen(true))}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#FAFAFA]"
              aria-label={`Open shopping cart (${cartCount} items)`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="ml-1 flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105" aria-label="User profile menu">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-[#111111] text-white font-semibold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-bold text-[#111111]">{user.name}</p>
                    <p className="text-xs font-normal text-[#6B7280]">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="size-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="size-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/consultations')}>
                    <BookHeart className="size-4" /> My Consultations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="size-4" /> My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      dispatch(logout())
                      toast.success('Logged out', 'See you soon!')
                      navigate('/')
                    }}
                    className="text-[#EF4444] focus:text-[#EF4444]"
                  >
                    <LogOut className="size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
                aria-label="Sign in to your account"
              >
                <User className="size-5" />
              </Link>
            )}
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[#E5E7EB]"
            >
              <div className="container-page py-3">
                <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs lg:hidden"
            aria-hidden="true"
          />
          <motion.aside
            ref={drawerRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-[70] flex h-full w-[82%] max-w-sm flex-col bg-white shadow-lg lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#111111] hover:bg-[#FAFAFA]"
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Mobile links">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors min-h-[44px]',
                      link.isAi && 'text-[#7C3AED] bg-[#FAF5FF] font-semibold',
                      !link.isAi && (isActive ? 'bg-[#FAFAFA] font-semibold text-[#111111]' : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]')
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/skin-analysis')
                }}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-medium text-white shadow-xs hover:bg-[#6D28D9] transition-colors"
              >
                <Sparkles className="size-4" /> Start AI Skin Assessment
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

