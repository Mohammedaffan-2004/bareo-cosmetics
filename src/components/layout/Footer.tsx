import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export function Footer() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubscribed(true)
    toast.success('Subscribed!', 'Thank you for subscribing to Bareo updates.')
    setEmail('')
  }

  return (
    <footer className="bg-[#FAF7F2] text-[#111111] border-t border-[#E5E7EB]">
      {/* 1. OPERATIONAL & SECURITY GUARANTEE ROW */}
      <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-5">
        <div className="container-page grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#059669] shadow-2xs">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#111111]">Encrypted Checkout</h4>
              <p className="text-[11px] text-[#6B7280] leading-snug">PCI-DSS Compliant & COD available</p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#059669] shadow-2xs">
              <Truck className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#111111]">Express Dispatch</h4>
              <p className="text-[11px] text-[#6B7280] leading-snug">Orders ship within 24-48 business hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#059669] shadow-2xs">
              <RotateCcw className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#111111]">Hassle-Free Returns</h4>
              <p className="text-[11px] text-[#6B7280] leading-snug">7-day easy return & exchange policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION CONTAINER */}
      <div className="container-page py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* BRAND & NEWSLETTER TOP ROW */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start border-b border-[#E5E7EB] pb-8 sm:pb-10">
          {/* Brand Info */}
          <div className="space-y-3 lg:col-span-6">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.12em] text-[#111111] sm:text-3xl uppercase">
                BAREO
              </span>
            </Link>
            <p className="font-serif italic text-sm text-[#4B5563]">
              Science for Everyday Skin.
            </p>
            <p className="max-w-md text-xs leading-relaxed text-[#6B7280] font-normal">
              Dermatologist-formulated active skincare, hair care, body care, and baby care designed for everyday skin health starting from ₹199.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-3 lg:col-span-6">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Join The Bareo Journal
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Subscribe for clinical active releases, formulation guides, and skincare tips.
            </p>

            {subscribed ? (
              <div className="rounded-xl border border-[#059669]/20 bg-[#ECFDF5] p-3 text-xs text-[#047857] font-medium flex items-center gap-2">
                <Check className="size-4 text-[#059669]" /> Subscribed successfully! Welcome to Bareo.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] min-h-[44px] shadow-2xs"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors min-h-[44px] shadow-2xs shrink-0"
                >
                  Subscribe <ArrowRight className="size-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4-COLUMN FOOTER LINKS */}
        <div className="grid gap-6 md:gap-10 grid-cols-2 md:grid-cols-4">
          {/* COLUMN 1: SHOP NAVIGATION */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">Shop</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop?category=skincare" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Skincare
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hair-care" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=body-care" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Body Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=baby-care" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Baby Care
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  All Formulations
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: CUSTOMER HELP */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">Customer Support</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/orders" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link to="/account/addresses" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link to="/account/payments" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link to="/account/settings" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: DISCOVER & AI SCIENCE */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">Science & AI</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/skin-analysis" className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold transition-colors min-h-[32px] inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> AI Skin Assessment
                </Link>
              </li>
              <li>
                <Link to="/skin-analysis/chat" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  AI Consultation Assistant
                </Link>
              </li>
              <li>
                <Link to="/consultations" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  My Consultations
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-[#6B7280] hover:text-[#111111] transition-colors min-h-[32px] inline-flex items-center">
                  The Bareo Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: TRUST & SOCIAL */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">Connect</h3>
            <p className="text-xs text-[#6B7280]">
              Follow Bareo for daily skincare education and dermatologist insights.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: Instagram, label: 'Bareo Instagram' },
                { icon: Twitter, label: 'Bareo Twitter' },
                { icon: Youtube, label: 'Bareo YouTube' },
                { icon: Linkedin, label: 'Bareo LinkedIn' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#111111] shadow-2xs transition-colors hover:bg-[#111111] hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 sm:flex-row text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} Bareo Cosmetics Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <span>Science for Everyday Skin</span>
            <span>•</span>
            <span>Made in India</span>
          </div>

          {/* Verified Payment Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#111111]">
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">UPI</span>
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">Visa</span>
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">Mastercard</span>
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">RuPay</span>
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">NetBanking</span>
            <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 shadow-2xs">COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

