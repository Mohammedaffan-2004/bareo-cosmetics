import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUp,
  Check,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export function Footer() {
  const toast = useToast()
  const footerRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollTop(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubscribed(true)
    toast.success('Subscribed!', 'Thank you for joining the Bareo Journal.')
    setEmail('')
  }

  return (
    <footer ref={footerRef} className="bg-[#F5F8F8] text-[#172126] border-t border-[#DCE6E9] relative">
      {/* OPERATIONAL & SECURITY GUARANTEE ROW */}
      <div className="border-b border-[#DCE6E9] bg-white py-4 sm:py-5">
        <div className="container-page grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF6F8] border border-[#DCE6E9] text-[#167C86] shadow-2xs">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#172126]">Encrypted Checkout</h4>
              <p className="text-[11px] text-[#52636B] leading-snug">PCI-DSS Compliant & COD available</p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF6F8] border border-[#DCE6E9] text-[#167C86] shadow-2xs">
              <Truck className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#172126]">Express Dispatch</h4>
              <p className="text-[11px] text-[#52636B] leading-snug">Orders ship within 24-48 business hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF6F8] border border-[#DCE6E9] text-[#167C86] shadow-2xs">
              <RotateCcw className="size-4" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold text-[#172126]">Hassle-Free Returns</h4>
              <p className="text-[11px] text-[#52636B] leading-snug">7-day easy return & exchange policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 1 — BAREO EDITORIAL / NEWSLETTER INTRO */}
      <div className="border-b border-[#DCE6E9] py-10 sm:py-12 bg-[#F5F8F8]">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* LEFT COLUMN: EDITORIAL STATEMENT */}
            <div className="lg:col-span-6 space-y-3.5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#167C86] block">
                BAREO / SCIENCE FOR EVERYDAY SKIN
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#172126] tracking-tight leading-[1.15]">
                Science for <br />
                Everyday Skin.
              </h2>
              <p className="text-xs sm:text-sm text-[#52636B] font-light leading-relaxed max-w-md">
                Dermatologist-formulated skincare, hair care, body care and baby care designed around what everyday skin actually needs.
              </p>
            </div>

            {/* RIGHT COLUMN: NEWSLETTER SUBSCRIBE */}
            <div className="lg:col-span-6 space-y-3.5 rounded-2xl border border-[#DCE6E9] bg-white p-6 sm:p-7 shadow-2xs text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                  JOIN THE BAREO JOURNAL
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#172126]">
                  Clinical knowledge, made everyday.
                </h3>
                <p className="text-xs text-[#52636B] font-light leading-relaxed">
                  Receive formulation insights, skincare education and new BAREO releases — thoughtfully, never noisily.
                </p>
              </div>

              {subscribed ? (
                <div className="rounded-xl border border-[#167C86]/30 bg-[#EDF6F8] p-3 text-xs text-[#167C86] font-semibold flex items-center gap-2">
                  <Check className="size-4 text-[#167C86]" /> Subscribed successfully! Welcome to Bareo.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 rounded-xl border border-[#DCE6E9] bg-[#F5F8F8] px-4 py-2.5 text-xs text-[#172126] placeholder-[#7A8A91] focus:border-[#172126] focus:outline-none focus:ring-1 focus:ring-[#172126] min-h-[44px]"
                    aria-label="Email address for newsletter"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#172126] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#167C86] transition-all duration-200 min-h-[44px] shrink-0 cursor-pointer border border-[#172126]"
                  >
                    Subscribe <ArrowRight className="size-3.5 text-white" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 2 — NAVIGATION (4 COLUMNS) */}
      <div className="container-page py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-left">
          {/* COLUMN 1: SHOP */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172126]">SHOP</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop?category=skincare" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hair-care" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=body-care" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Body Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=baby-care" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Baby Care
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: CUSTOMER CARE */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172126]">CUSTOMER CARE</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/orders" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link to="/account/addresses" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link to="/account/payments" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SCIENCE & AI */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172126]">SCIENCE & AI</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/skin-analysis" className="text-[#167C86] font-semibold hover:text-[#172126] transition-colors inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> AI Skin Assessment
                </Link>
              </li>
              <li>
                <Link to="/skin-analysis" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  AI Consultation Assistant
                </Link>
              </li>
              <li>
                <Link to="/consultations" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  My Consultations
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  The BAREO Journal
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Ingredients
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Our Formulations
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: ABOUT BAREO */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172126]">ABOUT BAREO</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/blog" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  About BAREO
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Our Science
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Dermatologist Formulated
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Clean & Cruelty-Free
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-[#52636B] hover:text-[#167C86] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* LAYER 3 — BRAND / SOCIAL / TRUST STRIP */}
        <div className="border-t border-[#DCE6E9] mt-10 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* LEFT: BRAND LOGO & MOTTO */}
          <div className="space-y-0.5 text-center md:text-left">
            <Link to="/" className="inline-block">
              <span className="font-serif text-xl font-bold tracking-[0.14em] text-[#172126] uppercase">
                BAREO
              </span>
            </Link>
            <p className="text-xs text-[#52636B] font-light">Science for Everyday Skin.</p>
          </div>

          {/* CENTER: SIMPLE CIRCULAR OUTLINE SOCIAL ICONS */}
          <div className="flex items-center justify-center gap-2.5">
            {[
              { icon: Instagram, label: 'Bareo Instagram' },
              { icon: Youtube, label: 'Bareo YouTube' },
              { icon: Linkedin, label: 'Bareo LinkedIn' },
              { icon: Twitter, label: 'Bareo X' },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-[#DCE6E9] bg-white text-[#172126] transition-all duration-200 hover:border-[#172126] hover:bg-[#172126] hover:text-white cursor-pointer"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          {/* RIGHT: SECURE CHECKOUT PAYMENT BADGES */}
          <div className="space-y-1 text-center md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">
              SECURE CHECKOUT
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 text-[10px] font-bold text-[#172126]">
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">UPI</span>
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">Visa</span>
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">Mastercard</span>
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">RuPay</span>
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">NetBanking</span>
              <span className="rounded-md border border-[#DCE6E9] bg-white px-2 py-0.5 shadow-2xs">COD</span>
            </div>
          </div>
        </div>

        {/* LAYER 4 — FINAL EDITORIAL CLOSING STATEMENT */}
        <div className="border-t border-[#DCE6E9] mt-8 pt-8 text-center space-y-2.5">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#172126] tracking-tight leading-snug">
            Better skincare. Better decisions.{' '}
            <span className="text-[#167C86] block sm:inline">Better everyday skin.</span>
          </h2>
          <p className="text-xs text-[#52636B] font-light tracking-wide uppercase">
            Science for Everyday Skin.
          </p>
        </div>

        {/* FINAL LEGAL ROW */}
        <div className="border-t border-[#DCE6E9] mt-6 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A8A91]">
          <p>© {new Date().getFullYear()} Bareo Cosmetics Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <span>Science for Everyday Skin</span>
            <span>•</span>
            <span>Made in India</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#172126] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-[#172126] transition-colors">
              Terms
            </Link>
            <Link to="/shipping" className="hover:text-[#172126] transition-colors">
              Shipping
            </Link>
          </div>
        </div>
      </div>

      {/* FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            title="Back to top"
            aria-label="Back to top"
            className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex h-[42px] w-[42px] sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#172126] text-white border border-[#DCE6E9] shadow-md hover:bg-[#167C86] hover:scale-[1.04] transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#167C86]"
          >
            <ArrowUp className="size-4 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
