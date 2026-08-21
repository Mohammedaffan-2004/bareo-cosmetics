import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  { label: 'AI Skin Assessment ✦', to: '/skin-analysis', isAi: true },
  { label: 'Journal', to: '/blog' },
]

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
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
      <div className="bg-[#172126] text-white flex h-[34px] items-center justify-center px-4 overflow-hidden border-b border-white/10 select-none">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-[12px] font-medium tracking-[0.05em] text-[#DCE6E9] whitespace-nowrap overflow-x-auto no-scrollbar py-1">
          <Sparkles className="size-3 text-[#167C86] shrink-0" />
          <span>
            <strong className="font-semibold text-white">Free Express Shipping</strong> on orders above ₹499
          </span>
          <span className="text-[#7A8A91] font-normal px-0.5 sm:px-1">•</span>
          <span>
            Dermatologist Formulated from ₹199
          </span>
          <span className="text-[#7A8A91] font-normal px-0.5 sm:px-1">•</span>
          <span className="text-white">
            100% Clean &amp; Cruelty-Free
          </span>
        </div>
      </div>

      {/* SECTION 2: Bareo Sticky Navigation */}
      <div className={cn('border-b border-[#DCE6E9] bg-white/95 backdrop-blur-md transition-shadow', scrolled && 'shadow-2xs')}>
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#172126] hover:bg-[#F6FAFB] lg:hidden cursor-pointer"
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
                    link.isAi && (isActive ? 'bg-[#EDF6F8] text-[#167C86] font-semibold border border-[#167C86]/30' : 'text-[#167C86] hover:bg-[#EDF6F8] font-medium'),
                    !link.isAi && (isActive ? 'bg-[#F6FAFB] text-[#172126] font-semibold border border-[#DCE6E9]' : 'text-[#52636B] hover:bg-[#F6FAFB] hover:text-[#172126]')
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
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#172126] transition-colors hover:bg-[#F6FAFB] cursor-pointer"
              aria-label="Toggle search drawer"
              aria-expanded={searchOpen}
            >
              <Search className="size-5" />
            </button>

            <Link
              to="/wishlist"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#172126] transition-colors hover:bg-[#F6FAFB]"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#172126] text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => dispatch(setDrawerOpen(true))}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#172126] transition-colors hover:bg-[#F6FAFB] cursor-pointer"
              aria-label={`Open shopping cart (${cartCount} items)`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#172126] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 cursor-pointer ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#167C86]"
                    aria-label="User profile menu"
                  >
                    <Avatar className="size-9 ring-2 ring-[#DCE6E9]">
                      <AvatarFallback className="bg-[#172126] text-white font-serif font-bold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[260px] sm:w-[270px] rounded-[18px] border border-[#DCE6E9] bg-white p-1.5 shadow-[0_12px_30px_rgba(23,33,38,0.08)] animate-in fade-in-0 slide-in-from-top-1 duration-150"
                >
                  {/* IDENTITY HEADER */}
                  <DropdownMenuLabel className="px-3.5 py-3 font-normal">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#167C86]">
                        BAREO MEMBER
                      </p>
                      <p className="text-sm font-bold text-[#172126] tracking-tight leading-none">
                        {user.name || 'Bareo Customer'}
                      </p>
                      <p className="text-xs text-[#52636B] font-light truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-[#DCE6E9] my-1" />

                  {/* MENU ITEMS */}
                  <div className="space-y-0.5 py-0.5">
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors duration-150',
                        location.pathname === '/profile'
                          ? 'bg-[#FAF7F2] text-[#172126] font-semibold [&_svg]:text-[#167C86]'
                          : 'text-[#172126] hover:bg-[#FAF7F2] hover:text-[#172126] [&_svg]:text-[#52636B] hover:[&_svg]:text-[#167C86]'
                      )}
                    >
                      <User className="size-[17px] shrink-0" />
                      <span>My Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/orders')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors duration-150',
                        location.pathname.startsWith('/orders')
                          ? 'bg-[#FAF7F2] text-[#172126] font-semibold [&_svg]:text-[#167C86]'
                          : 'text-[#172126] hover:bg-[#FAF7F2] hover:text-[#172126] [&_svg]:text-[#52636B] hover:[&_svg]:text-[#167C86]'
                      )}
                    >
                      <Package className="size-[17px] shrink-0" />
                      <span>My Orders</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/consultations')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors duration-150',
                        location.pathname.startsWith('/consultations')
                          ? 'bg-[#FAF7F2] text-[#172126] font-semibold [&_svg]:text-[#167C86]'
                          : 'text-[#172126] hover:bg-[#FAF7F2] hover:text-[#172126] [&_svg]:text-[#52636B] hover:[&_svg]:text-[#167C86]'
                      )}
                    >
                      <BookHeart className="size-[17px] shrink-0" />
                      <span>My Consultations</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/wishlist')}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors duration-150',
                        location.pathname === '/wishlist'
                          ? 'bg-[#FAF7F2] text-[#172126] font-semibold [&_svg]:text-[#167C86]'
                          : 'text-[#172126] hover:bg-[#FAF7F2] hover:text-[#172126] [&_svg]:text-[#52636B] hover:[&_svg]:text-[#167C86]'
                      )}
                    >
                      <Heart className="size-[17px] shrink-0" />
                      <span>My Wishlist</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-[#DCE6E9] my-1" />

                  {/* LOGOUT */}
                  <DropdownMenuItem
                    onClick={() => {
                      dispatch(logout())
                      toast.success('Logged out', 'See you soon!')
                      navigate('/')
                    }}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#52636B] hover:bg-rose-50/70 hover:text-rose-700 focus:bg-rose-50/70 focus:text-rose-700 [&_svg]:text-[#7A8A91] hover:[&_svg]:text-rose-700 cursor-pointer transition-colors duration-150"
                  >
                    <LogOut className="size-[17px] shrink-0" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#F6FAFB] border border-[#DCE6E9] text-[#172126] transition-colors hover:bg-[#172126] hover:text-white"
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
              className="overflow-hidden border-t border-[#DCE6E9]"
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
            <div className="flex items-center justify-between border-b border-[#DCE6E9] p-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#172126] hover:bg-[#F6FAFB] cursor-pointer"
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
                      link.isAi && (isActive ? 'bg-[#EDF6F8] text-[#167C86] font-semibold border border-[#167C86]/30' : 'text-[#167C86] bg-[#EDF6F8] font-semibold'),
                      !link.isAi && (isActive ? 'bg-[#F6FAFB] font-semibold text-[#172126] border border-[#DCE6E9]' : 'text-[#52636B] hover:bg-[#F6FAFB] hover:text-[#172126]')
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
                className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#172126] px-4 py-3 text-sm font-semibold text-white shadow-2xs hover:bg-[#253239] transition-colors cursor-pointer"
              >
                <Sparkles className="size-4 text-[#167C86]" /> Start Dermal Assessment
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

