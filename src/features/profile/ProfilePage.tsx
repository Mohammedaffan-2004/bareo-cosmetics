import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Sparkles,
  ShieldCheck,
  Package,
  Heart,
  Award,
  TrendingUp,
  MapPin,
  Lock,
  Settings,
  LogOut,
  Trash2,
  Plus,
  Check,
  Laptop,
  Smartphone,
  Bell,
  Key,
  Edit3,
  AlertTriangle,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { addressService } from '@/services/addressService'
import { orderService } from '@/services/orderService'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { AppModal } from '@/components/common/AppModal'
import { formatINR, formatDate, cn } from '@/utils'
import type { ShippingAddress } from '@/types'

const SKIN_CONCERNS_LIST = [
  'Acne & Breakouts',
  'Pigmentation & Spots',
  'Sensitivity & Redness',
  'Dryness & Dehydration',
  'Oiliness & Sebum',
  'Dark Circles',
]

/**
 * Master Bareo Profile Page — "MY BAREO — PERSONAL SKINCARE COMMAND CENTER"
 * Editorial, clinical, calm, and conversion-focused skincare account center.
 */
export function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const user = useAppSelector((s) => s.auth.user)
  const wishlistCount = useAppSelector((s) => s.wishlist.products.length)

  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'security' | 'preferences'>('personal')
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    fullName: user?.name || 'Aarav Malhotra',
    email: user?.email || 'aarav@bareo.in',
    phone: user?.phone || '+91 98765 43210',
    gender: user?.gender || 'male',
    birthday: '1996-08-14',
    skinType: user?.skinType || 'combination',
    selectedConcerns: ['Acne & Breakouts', 'Sensitivity & Redness', 'Pigmentation & Spots'],
  })
  const [savingPersonal, setSavingPersonal] = useState(false)

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [updatingPass, setUpdatingPass] = useState(false)

  // Preferences State
  const [notifications, setNotifications] = useState({ orders: true, advice: true, offers: false })
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('en')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Address Form State
  const [addrForm, setAddrForm] = useState({
    fullName: user?.name || '',
    phone: '9876543210',
    line1: '',
    line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    landmark: '',
    label: 'home' as 'home' | 'work' | 'other',
    isDefault: false,
  })

  // Queries
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: () => orderService().getOrders() })
  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService().getAddresses(),
  })

  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: (input: Omit<ShippingAddress, 'id'>) => addressService().addAddress(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address saved', 'New shipping address added successfully.')
      setIsAddressModalOpen(false)
      resetAddrForm()
    },
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressService().deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.info('Address removed')
    },
  })

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => addressService().setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated')
    },
  })

  const resetAddrForm = () => {
    setAddrForm({
      fullName: user?.name || '',
      phone: '9876543210',
      line1: '',
      line2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      landmark: '',
      label: 'home',
      isDefault: false,
    })
  }

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPersonal(true)
    setTimeout(() => {
      setSavingPersonal(false)
      setIsEditingPersonal(false)
      toast.success('Profile updated', 'Personal information and skin profile saved.')
    }, 600)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      toast.error('Missing password fields', 'Please complete all password fields.')
      return
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Passwords do not match', 'Please verify your new password.')
      return
    }
    setUpdatingPass(true)
    setTimeout(() => {
      setUpdatingPass(false)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
      toast.success('Password updated', 'Your account credentials have been changed.')
    }, 600)
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addrForm.fullName || !addrForm.phone || !addrForm.line1 || !addrForm.city || !addrForm.pincode) {
      toast.error('Missing required fields', 'Please complete all required fields (*).')
      return
    }
    addAddressMutation.mutate({
      fullName: addrForm.fullName || user?.name || 'Aarav Malhotra',
      phone: `+91 ${addrForm.phone}`,
      email: user?.email || 'aarav@bareo.in',
      line1: addrForm.line1,
      line2: addrForm.line2,
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pincode,
      landmark: addrForm.landmark,
      isDefault: addrForm.isDefault,
      label: addrForm.label,
    })
  }

  const toggleConcern = (concern: string) => {
    setPersonalForm((prev) => {
      const exists = prev.selectedConcerns.includes(concern)
      const next = exists ? prev.selectedConcerns.filter((c) => c !== concern) : [...prev.selectedConcerns, concern]
      return { ...prev, selectedConcerns: next }
    })
  }

  const initials = (user?.name || 'Aarav Malhotra')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  const orderCount = orders?.length || 2
  const aiConsultationCount = 2

  return (
    <div className="container-page py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* 1. EDITORIAL PROFILE HEADER */}
      <section className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6 sm:p-10 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#111111] text-white font-serif text-2xl sm:text-3xl font-bold shadow-sm ring-4 ring-white">
                {initials}
              </div>
            </div>

            {/* Profile Credentials & Hierarchy */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#111111] tracking-tight">
                  {user?.name || 'Aarav Malhotra'}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] border border-[#059669]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#047857]">
                  <ShieldCheck className="size-3 text-[#047857]" /> Verified Member
                </span>
              </div>

              <p className="text-xs text-[#6B7280] font-light flex flex-wrap items-center gap-2">
                <span>{user?.email || 'aarav@bareo.in'}</span>
                <span className="text-[#9CA3AF]">•</span>
                <span>Member since {user?.joinedAt ? formatDate(user.joinedAt) : 'Aug 2026'}</span>
              </p>

              <div className="pt-1 flex flex-wrap gap-2.5 text-xs text-[#374151]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#111111]">
                  <Award className="size-3.5 text-amber-500" /> Bareo Gold Member · 1,250 Glow Points
                </span>
                <span className="text-[#9CA3AF]">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#374151]">
                  <Sparkles className="size-3.5 text-[#7C3AED]" /> Combination · Sensitive Skin
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setActiveTab('personal')
              setIsEditingPersonal(true)
            }}
            variant="outline"
            className="rounded-xl border-[#E5E7EB] bg-white text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-2xs self-start md:self-center"
          >
            <Edit3 className="size-3.5 mr-1.5" /> Edit Profile
          </Button>
        </div>
      </section>

      {/* 2. MY BAREO — PRIMARY COMMAND CENTER OVERVIEW */}
      <section className="space-y-4">
        <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-normal text-[#111111]">MY BAREO</h2>
          <span className="text-xs text-[#6B7280] font-light">Account Activity & Overview</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* My Orders */}
          <Link
            to="/orders"
            className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-[#111111]/30 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">My Orders</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
                <Package className="size-4" />
              </div>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#111111]">{orderCount}</p>
              <p className="text-xs text-[#6B7280] font-light mt-1 flex items-center gap-1">
                <span>View order history</span>
                <ChevronRight className="size-3.5 text-[#9CA3AF] group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>

          {/* Saved Items */}
          <Link
            to="/wishlist"
            className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-[#111111]/30 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Saved Items</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
                <Heart className="size-4" />
              </div>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#111111]">{wishlistCount}</p>
              <p className="text-xs text-[#6B7280] font-light mt-1 flex items-center gap-1">
                <span>View wishlist</span>
                <ChevronRight className="size-3.5 text-[#9CA3AF] group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>

          {/* AI Consultations */}
          <Link
            to="/consultations"
            className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-[#7C3AED]/40 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED]">AI Consultations</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                <Sparkles className="size-4" />
              </div>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#111111]">{aiConsultationCount}</p>
              <p className="text-xs text-[#6B7280] font-light mt-1 flex items-center gap-1">
                <span>View skin analysis</span>
                <ChevronRight className="size-3.5 text-[#9CA3AF] group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. LOYALTY & LIFETIME SAVINGS STRIP */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Glow Points Loyalty Block */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-1.5">
              <Award className="size-4 text-amber-500" /> BAREO GOLD
            </span>
            <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#059669]/20">
              ₹125 store credit value
            </span>
          </div>

          <div>
            <p className="font-serif text-3xl font-bold text-[#111111]">1,250</p>
            <p className="text-xs font-semibold text-[#6B7280] tracking-wider uppercase mt-0.5">GLOW POINTS</p>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-light">Earn 10 points per ₹100 spent</span>
            <Link to="/shop" className="font-semibold text-[#111111] hover:underline flex items-center gap-1">
              Redeem rewards →
            </Link>
          </div>
        </div>

        {/* Lifetime Savings Block */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-1.5">
              <TrendingUp className="size-4 text-[#047857]" /> YOU'VE SAVED
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              TOTAL BENEFIT
            </span>
          </div>

          <div>
            <p className="font-serif text-3xl font-bold text-[#111111]">{formatINR(1480)}</p>
            <p className="text-xs text-[#6B7280] font-light mt-0.5">with Bareo offers &amp; formulation combos</p>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] text-xs text-[#047857] font-medium flex items-center gap-1.5">
            <Check className="size-3.5" /> Applied automatically at checkout
          </div>
        </div>
      </section>

      {/* 4. PROMINENT SKIN PROFILE SECTION */}
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-normal text-[#111111]">YOUR SKIN PROFILE</h2>
            <p className="text-xs text-[#6B7280] font-light">
              Your active skin traits help Bareo personalize formulation recommendations and AI skin diagnosis.
            </p>
          </div>
          <Button
            onClick={() => {
              setActiveTab('personal')
              setIsEditingPersonal(true)
            }}
            variant="outline"
            className="rounded-xl border-[#E5E7EB] text-xs font-semibold shrink-0"
          >
            <Edit3 className="size-3.5 mr-1.5" /> View / Edit Skin Profile
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Skin Type</span>
            <p className="font-serif text-base font-medium text-[#111111] capitalize">
              {personalForm.skinType} Skin
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Primary Concerns</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {personalForm.selectedConcerns.map((c) => (
                <span key={c} className="rounded-full bg-white border border-[#E5E7EB] px-2.5 py-0.5 text-[11px] font-medium text-[#111111]">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Formulation Preferences</span>
            <p className="text-xs text-[#374151] font-medium pt-1">
              Dermatologist Tested · Sulphate-Free · Fragrance-Free
            </p>
          </div>
        </div>
      </section>

      {/* 5. DEDICATED AI SKIN JOURNEY */}
      <section className="rounded-3xl border border-[#7C3AED]/30 bg-[#F5F3FF] p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
            <Sparkles className="size-4" /> YOUR AI SKIN JOURNEY
          </div>
          <Link
            to="/skin-analysis"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
          >
            Start New AI Assessment <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1 max-w-xl">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#111111]">
              Personalized Skincare Intelligence
            </h3>
            <p className="text-xs text-[#4B5563] font-light leading-relaxed">
              2 AI consultation reports saved in your diagnostic profile. Retake the assessment anytime to track skin score progression over time.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/consultations')}
            className="rounded-xl border-[#7C3AED]/30 bg-white text-xs font-semibold text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white shrink-0"
          >
            View Skin Analysis Reports →
          </Button>
        </div>
      </section>

      {/* 6. ACCOUNT MANAGEMENT TABS (HORIZONTAL NAVIGATION RAIL) */}
      <section className="space-y-6 pt-2">
        <div className="border-b border-[#E5E7EB] overflow-x-auto no-scrollbar flex gap-4">
          {[
            { key: 'personal', label: 'Personal Information', icon: User },
            { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { key: 'security', label: 'Security & Devices', icon: Lock },
            { key: 'preferences', label: 'Preferences & Account', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all shrink-0',
                  isActive
                    ? 'border-[#111111] text-[#111111] font-bold'
                    : 'border-transparent text-[#6B7280] hover:text-[#111111]'
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: Personal Information */}
        {activeTab === 'personal' && (
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-[#111111]">Personal Information</h2>
                <p className="text-xs text-[#6B7280] font-light mt-0.5">Manage your personal identity credentials.</p>
              </div>
              {!isEditingPersonal && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingPersonal(true)}
                  className="rounded-xl border-[#E5E7EB] text-xs font-semibold"
                >
                  <Edit3 className="size-3.5 mr-1.5" /> Edit Details
                </Button>
              )}
            </div>

            {!isEditingPersonal ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Full Name</span>
                  <p className="text-sm font-semibold text-[#111111]">{personalForm.fullName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Email Address</span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#111111]">{personalForm.email}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified ✓
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Mobile Phone</span>
                  <p className="text-sm font-semibold text-[#111111]">{personalForm.phone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Gender</span>
                  <p className="text-sm font-semibold text-[#111111] capitalize">{personalForm.gender}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Date of Birth</span>
                  <p className="text-sm font-semibold text-[#111111]">14 August 1996</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSavePersonal} className="space-y-6 pt-2">
                <div className="grid gap-6 sm:grid-cols-2">
                  <AppInput
                    label="Full Name *"
                    value={personalForm.fullName}
                    onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111111]">Email Address</label>
                    <div className="relative">
                      <AppInput
                        value={personalForm.email}
                        disabled
                        className="bg-[#FAF7F2] pr-20 text-[#6B7280]"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified ✓
                      </span>
                    </div>
                  </div>

                  <AppInput
                    label="Mobile Phone *"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  />

                  <AppSelect
                    label="Gender"
                    value={personalForm.gender}
                    onValueChange={(v) => setPersonalForm({ ...personalForm, gender: v as any })}
                    options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not', label: 'Prefer not to say' },
                    ]}
                  />

                  <AppInput
                    label="Date of Birth"
                    type="date"
                    value={personalForm.birthday}
                    onChange={(e) => setPersonalForm({ ...personalForm, birthday: e.target.value })}
                  />

                  <AppSelect
                    label="Skin Type *"
                    value={personalForm.skinType}
                    onValueChange={(v) => setPersonalForm({ ...personalForm, skinType: v as any })}
                    options={[
                      { value: 'dry', label: 'Dry' },
                      { value: 'oily', label: 'Oily' },
                      { value: 'combination', label: 'Combination' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'sensitive', label: 'Sensitive' },
                    ]}
                  />
                </div>

                {/* Skin Concerns Selector */}
                <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                  <label className="text-xs font-semibold text-[#111111]">Primary Skin Concerns</label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_CONCERNS_LIST.map((concern) => {
                      const isSelected = personalForm.selectedConcerns.includes(concern)
                      return (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => toggleConcern(concern)}
                          className={cn(
                            'rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200',
                            isSelected
                              ? 'border-[#111111] bg-[#111111] text-white shadow-2xs'
                              : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-slate-300 hover:text-[#111111]'
                          )}
                        >
                          {isSelected ? `✓ ${concern}` : `+ ${concern}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E7EB]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingPersonal(false)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={savingPersonal}
                    className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-6 h-11 hover:bg-black"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-[#111111]">Saved Shipping Addresses</h2>
                <p className="text-xs text-[#6B7280] font-light mt-0.5">Manage delivery addresses for seamless checkout.</p>
              </div>
              <Button
                onClick={() => {
                  resetAddrForm()
                  setIsAddressModalOpen(true)
                }}
                className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-4 h-10 hover:bg-black"
              >
                <Plus className="size-4 mr-1.5" /> Add New Address
              </Button>
            </div>

            {loadingAddresses ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-40 rounded-2xl bg-[#FAF7F2] animate-pulse" />
                <div className="h-40 rounded-2xl bg-[#FAF7F2] animate-pulse" />
              </div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#6B7280]">
                No saved addresses found. Add a new address above for quick checkout.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      'relative flex flex-col justify-between rounded-2xl border p-5 transition-all space-y-4',
                      addr.isDefault ? 'border-[#111111] bg-[#FAF7F2] shadow-2xs' : 'border-[#E5E7EB] bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-white border border-[#E5E7EB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#111111]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Default Address
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm text-[#111111]">{addr.fullName}</h3>
                      <p className="text-xs text-[#6B7280] font-light leading-relaxed">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}, {addr.state} — <strong className="font-mono text-[#111111]">{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-[#6B7280] font-light">Phone: {addr.phone}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                          className="font-semibold text-[#111111] hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <div className="flex items-center gap-3 ml-auto">
                        <button
                          type="button"
                          onClick={() => deleteAddressMutation.mutate(addr.id)}
                          className="text-rose-600 hover:underline text-xs flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Security & Devices */}
        {activeTab === 'security' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Password Change Form */}
            <form onSubmit={handleUpdatePassword} className="lg:col-span-7 rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
              <div>
                <h2 className="font-serif text-xl font-normal text-[#111111]">Account Security</h2>
                <p className="text-xs text-[#6B7280] font-light mt-0.5">Update your password and authentication settings.</p>
              </div>

              {/* Field group container with clean spacing */}
              <div className="space-y-5">
                <AppInput
                  label="Current Password *"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="••••••••"
                />

                <AppInput
                  label="New Password *"
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  placeholder="At least 8 characters"
                />

                <AppInput
                  label="Confirm New Password *"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                />
              </div>

              {/* 2FA Toggle Card with clear breathing room */}
              <div className="mt-8 mb-6 rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                    <Key className="size-3.5 text-emerald-600" /> Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-[11px] text-[#6B7280] font-light">Require a security code on new device sign-ins.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled)
                    toast.info(twoFactorEnabled ? '2FA Disabled' : '2FA Enabled')
                  }}
                  className={cn(
                    'h-6 w-11 rounded-full transition-colors relative p-0.5 shrink-0',
                    twoFactorEnabled ? 'bg-[#111111]' : 'bg-[#D1D5DB]'
                  )}
                >
                  <span className={cn('block size-5 rounded-full bg-white transition-transform', twoFactorEnabled ? 'translate-x-5' : 'translate-x-0')} />
                </button>
              </div>

              <Button type="submit" loading={updatingPass} className="w-full h-11 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black">
                Update Password
              </Button>
            </form>

            {/* Active Devices & Session Log */}
            <div className="lg:col-span-5 rounded-3xl border border-[#E5E7EB] bg-white p-6 space-y-5 shadow-2xs">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#111111]">Active Devices &amp; Sessions</h3>
                <p className="text-xs text-[#6B7280] font-light mt-0.5">Logged-in devices accessing your account.</p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Current Device */}
                <div className="rounded-2xl border border-[#111111] bg-[#FAF7F2] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-[#111111]">
                      <Laptop className="size-4 text-[#111111]" /> MacBook Pro 16" (macOS)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Now
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">Chrome 128 • Bengaluru, IN</p>
                </div>

                {/* Secondary Devices */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-[#111111]">
                      <Smartphone className="size-4 text-[#6B7280]" /> iPhone 15 Pro (iOS)
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">2 hours ago</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">Bareo Mobile App • Bengaluru, IN</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => toast.success('Signed out of all secondary sessions')}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Sign out of all other devices
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Preferences & Danger Zone */}
        {activeTab === 'preferences' && (
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-8 shadow-2xs">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#111111]">Account Preferences &amp; Settings</h2>
              <p className="text-xs text-[#6B7280] font-light mt-0.5">Customize your communications, language, and account state.</p>
            </div>

            {/* Notifications */}
            <div className="space-y-4 pt-2 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <Bell className="size-4 text-[#111111]" /> Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer rounded-2xl border border-[#E5E7EB] p-4 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]">
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Order &amp; Shipping Status</p>
                    <p className="text-[11px] text-[#6B7280] font-light">Real-time dispatch, tracking and delivery updates via Email &amp; SMS.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orders}
                    onChange={(e) => setNotifications({ ...notifications, orders: e.target.checked })}
                    className="size-4 accent-[#111111]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer rounded-2xl border border-[#E5E7EB] p-4 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]">
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Personalized Skincare Advice</p>
                    <p className="text-[11px] text-[#6B7280] font-light">AI routine tips, seasonal skincare advice, and ingredient breakdowns.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.advice}
                    onChange={(e) => setNotifications({ ...notifications, advice: e.target.checked })}
                    className="size-4 accent-[#111111]"
                  />
                </label>
              </div>
            </div>

            {/* Language & Theme */}
            <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-[#E5E7EB]">
              <AppSelect
                label="Language"
                value={language}
                onValueChange={setLanguage}
                options={[
                  { value: 'en', label: 'English (International)' },
                  { value: 'hi', label: 'Hindi (हिन्दी)' },
                ]}
              />

              <AppSelect
                label="Theme Preference"
                value={themeMode}
                onValueChange={(v) => setThemeMode(v as any)}
                options={[
                  { value: 'light', label: 'Light Mode (Default Bareo Warm)' },
                  { value: 'dark', label: 'Dark Mode' },
                  { value: 'system', label: 'System Preference' },
                ]}
              />
            </div>

            {/* Danger Zone */}
            <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="size-5" />
                <h3 className="font-semibold text-sm">Danger Zone</h3>
              </div>

              <p className="text-xs text-rose-600 font-light leading-relaxed">
                Logging out will terminate your session on this browser. Deleting your account will permanently remove your purchase history, AI skin profiles, and reward points.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch(logout())
                    toast.success('Logged out successfully')
                    navigate('/')
                  }}
                  className="rounded-xl border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <LogOut className="size-3.5 mr-1.5" /> Logout of Bareo
                </Button>

                <Button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(true)}
                  className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  <Trash2 className="size-3.5 mr-1.5" /> Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 7. RECENT ACTIVITY TIMELINE */}
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl font-normal text-[#111111]">RECENT ACTIVITY</h3>
          <span className="text-xs text-[#6B7280] font-light flex items-center gap-1">
            <Clock className="size-3.5" /> Real Account History
          </span>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-3.5 text-xs">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#7C3AED]/20 shrink-0 mt-0.5">
              <Sparkles className="size-3.5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#111111]">Completed AI Dermal Skin Assessment</p>
                <span className="text-[11px] text-[#9CA3AF]">2 days ago</span>
              </div>
              <p className="text-[#6B7280] font-light">Analyzed erythema and barrier sensitivity profile.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 text-xs pt-2 border-t border-[#E5E7EB]">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857] border border-[#059669]/20 shrink-0 mt-0.5">
              <Package className="size-3.5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#111111]">Delivered Order #BAR-8942</p>
                <span className="text-[11px] text-[#9CA3AF]">1 week ago</span>
              </div>
              <p className="text-[#6B7280] font-light">Bareo Cica Calming Serum delivered to Bengaluru.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add Address Modal */}
      <AppModal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Shipping Address"
      >
        <form onSubmit={handleAddressSubmit} className="space-y-5 pt-2">
          <AppInput
            label="Full Name *"
            value={addrForm.fullName}
            onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
            placeholder="Aarav Malhotra"
          />

          <AppInput
            label="Mobile Number *"
            value={addrForm.phone}
            onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
            placeholder="98765 43210"
          />

          <AppInput
            label="Address Line 1 (House, Building) *"
            value={addrForm.line1}
            onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
            placeholder="204 Palm Residency, MG Road"
          />

          <AppInput
            label="Area / Landmark"
            value={addrForm.landmark}
            onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
            placeholder="Near Metro Pillar 42"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label="City *"
              value={addrForm.city}
              onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
              placeholder="Bengaluru"
            />

            <AppInput
              label="Pincode *"
              value={addrForm.pincode}
              onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
              placeholder="560001"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-[#111111] block">Label</label>
            <div className="flex items-center gap-4 sm:gap-6">
              {(['home', 'work', 'other'] as const).map((l) => (
                <label key={l} className="flex items-center gap-2 text-xs text-[#111111] uppercase font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    checked={addrForm.label === l}
                    onChange={() => setAddrForm({ ...addrForm, label: l })}
                    className="accent-[#111111] size-4"
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-[#374151] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={addrForm.isDefault}
                onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                className="size-4 accent-[#111111] rounded"
              />
              Make this my default shipping address
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddressModalOpen(false)}
              className="text-xs font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addAddressMutation.isPending}
              className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-5 h-10 hover:bg-black"
            >
              Save Address
            </Button>
          </div>
        </form>
      </AppModal>

      {/* Delete Account Modal */}
      <AppModal
        open={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Bareo Account?"
      >
        <div className="space-y-4 pt-2 text-xs text-[#6B7280]">
          <p className="leading-relaxed">
            Are you sure you want to delete your account? This action is permanent and cannot be undone. All saved order history, address books, and reward points will be permanently deleted.
          </p>
          <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => setIsDeleteAccountModalOpen(false)} className="text-xs font-semibold">
              Keep Account
            </Button>
            <Button
              type="button"
              onClick={() => {
                dispatch(logout())
                toast.info('Account deletion request submitted')
                navigate('/')
              }}
              className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
