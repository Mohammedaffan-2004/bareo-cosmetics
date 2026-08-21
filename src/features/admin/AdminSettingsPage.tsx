import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Calculator,
  ToggleLeft,
  PackageSearch,
  ChevronRight,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { setActiveStoreSettings } from '@/services/storeSettingsStore'
import { Button } from '@/components/ui/button'
import { AppInput } from '@/components/common/AppInput'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import type { StoreSettingsPayload } from '@/types'

// ─── Navigation rail sections ─────────────────────────────────────────────────
type SectionId = 'identity' | 'commerce' | 'storefront' | 'inventory' | 'administration'

interface NavItem {
  id: SectionId
  label: string
  sublabel: string
  group: string
  icon: React.ReactNode
  number: string
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'identity',
    label: 'Store Identity',
    sublabel: 'Brand & communication',
    group: 'GENERAL',
    icon: <Store className="size-3.5" />,
    number: '01',
  },
  {
    id: 'commerce',
    label: 'Commerce Rules',
    sublabel: 'Checkout parameters',
    group: 'GENERAL',
    icon: <Calculator className="size-3.5" />,
    number: '02',
  },
  {
    id: 'storefront',
    label: 'Storefront Control',
    sublabel: 'Experience switches',
    group: 'STOREFRONT',
    icon: <ToggleLeft className="size-3.5" />,
    number: '03',
  },
  {
    id: 'inventory',
    label: 'Inventory Intelligence',
    sublabel: 'Stock monitoring',
    group: 'STOREFRONT',
    icon: <PackageSearch className="size-3.5" />,
    number: '04',
  },
  {
    id: 'administration',
    label: 'Administration',
    sublabel: 'Access & security',
    group: 'SYSTEM',
    icon: <ShieldCheck className="size-3.5" />,
    number: '05',
  },
]

export function AdminSettingsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  // ── Active nav section ──────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<SectionId>('identity')

  // ── Form State ──────────────────────────────────────────────────────────────
  const [formState, setFormState] = useState<StoreSettingsPayload>({
    storeName: 'Bareo Cosmetics',
    supportEmail: 'care@bareo.in',
    supportPhone: '+91 1800 300 3000',
    freeShippingThreshold: 499,
    gstRate: 18,
    lowStockThreshold: 20,
    maintenanceMode: false,
    aiAssistantEnabled: true,
  })

  const [savedData, setSavedData] = useState<StoreSettingsPayload | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false)

  // ── 1. Fetch Live Settings from MongoDB ─────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = useQuery<StoreSettingsPayload>({
    queryKey: ['admin-settings'],
    queryFn: () => adminService().getSettings(),
  })

  // Sync state when data arrives
  useEffect(() => {
    if (data) {
      setFormState(data)
      setSavedData(data)
      setActiveStoreSettings(data)
    }
  }, [data])

  // ── 2. Mutation to Save Settings ────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<StoreSettingsPayload>) =>
      adminService().updateSettings(payload),
    onSuccess: (updated) => {
      setFormState(updated)
      setSavedData(updated)
      setActiveStoreSettings(updated)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] })
      toast.success('Settings saved', 'Store configuration updated successfully in MongoDB.')
    },
    onError: (err: Error) => {
      toast.error('Save failed', err.message || 'Failed to update store settings.')
    },
  })

  // ── Dirty State ─────────────────────────────────────────────────────────────
  const isDirty =
    savedData !== null &&
    (formState.storeName !== savedData.storeName ||
      formState.supportEmail !== savedData.supportEmail ||
      formState.supportPhone !== savedData.supportPhone ||
      formState.freeShippingThreshold !== savedData.freeShippingThreshold ||
      formState.gstRate !== savedData.gstRate ||
      formState.lowStockThreshold !== savedData.lowStockThreshold ||
      formState.maintenanceMode !== savedData.maintenanceMode ||
      formState.aiAssistantEnabled !== savedData.aiAssistantEnabled)

  // ── Client-side Validation ──────────────────────────────────────────────────
  const validateForm = (): boolean => {
    setValidationError(null)
    if (!formState.storeName.trim()) {
      setValidationError('Store name is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formState.supportEmail.trim())) {
      setValidationError('Valid support email address is required')
      return false
    }
    if (!formState.supportPhone.trim()) {
      setValidationError('Support phone is required')
      return false
    }
    if (isNaN(formState.freeShippingThreshold) || formState.freeShippingThreshold < 0) {
      setValidationError('Free shipping threshold must be 0 or greater')
      return false
    }
    if (isNaN(formState.gstRate) || formState.gstRate < 0 || formState.gstRate > 100) {
      setValidationError('GST rate must be between 0% and 100%')
      return false
    }
    if (isNaN(formState.lowStockThreshold) || formState.lowStockThreshold < 0) {
      setValidationError('Low stock threshold must be 0 or greater')
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return
    saveMutation.mutate(formState)
  }

  const handleDiscard = () => {
    if (savedData) {
      setFormState(savedData)
      setValidationError(null)
    }
  }

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked && !formState.maintenanceMode) {
      setShowMaintenanceModal(true)
    } else {
      setFormState((prev) => ({ ...prev, maintenanceMode: checked }))
    }
  }

  const confirmEnableMaintenance = () => {
    setFormState((prev) => ({ ...prev, maintenanceMode: true }))
    setShowMaintenanceModal(false)
  }

  // ── LOADING STATE ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex gap-8 max-w-[1280px] mx-auto">
        <div className="w-[220px] shrink-0 space-y-3">
          <Skeleton className="h-5 w-20 bg-[#EDF6F8]" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-[#EDF6F8]" />
          ))}
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-72 bg-[#EDF6F8]" />
          <Skeleton className="h-64 rounded-2xl bg-[#EDF6F8]" />
          <Skeleton className="h-48 rounded-2xl bg-[#EDF6F8]" />
        </div>
      </div>
    )
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="rounded-2xl border p-12 text-center space-y-4 max-w-lg mx-auto my-12"
        style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
      >
        <AlertCircle className="size-8 mx-auto" style={{ color: '#167C86' }} />
        <div>
          <p className="font-serif text-lg font-normal" style={{ color: '#172126' }}>
            Unable to load configuration
          </p>
          <p className="text-xs font-light mt-1" style={{ color: '#52636B' }}>
            {(error as Error)?.message || 'Failed to connect to backend configuration server.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl text-xs px-5 h-10"
          style={{ background: '#172126', color: '#fff' }}
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
        </Button>
      </div>
    )
  }

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  const groups = ['GENERAL', 'STOREFRONT', 'SYSTEM']

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id)
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="pb-28">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase block mb-1"
            style={{ color: '#167C86' }}
          >
            CONTROL ROOM
          </span>
          <h1
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight"
            style={{ color: '#172126' }}
          >
            Store Configuration
          </h1>
          <p className="text-xs font-light mt-1.5 max-w-md" style={{ color: '#52636B' }}>
            Manage storefront identity, commerce rules, customer experience and administrative controls.
          </p>
        </div>

        {/* System Status Pill */}
        <div className="shrink-0 mt-1">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
            style={{ background: '#EDF6F8', borderColor: '#DCE6E9' }}
          >
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ background: '#167C86' }}
            />
            <div className="text-right">
              <span
                className="text-[9px] font-semibold tracking-widest uppercase block leading-none"
                style={{ color: '#7A8A91' }}
              >
                SYSTEM STATUS
              </span>
              <span
                className="text-[11px] font-semibold leading-tight block mt-0.5"
                style={{ color: '#167C86' }}
              >
                OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VALIDATION ERROR ──────────────────────────────────────────────── */}
      {validationError && (
        <div
          className="rounded-xl border px-4 py-3 text-xs flex items-center gap-2 mb-6"
          style={{
            borderColor: '#fca5a5',
            background: '#fff5f5',
            color: '#991b1b',
          }}
        >
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex gap-8 items-start max-w-[1280px]">

        {/* ── LEFT: NAVIGATION RAIL ──────────────────────────────────────── */}
        <aside
          className="w-[220px] shrink-0 sticky top-6 hidden lg:block"
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9', background: '#fff' }}
          >
            {groups.map((group) => {
              const items = NAV_ITEMS.filter((n) => n.group === group)
              return (
                <div key={group}>
                  <div
                    className="px-4 pt-4 pb-1.5 text-[9px] font-semibold tracking-widest uppercase"
                    style={{ color: '#7A8A91' }}
                  >
                    {group}
                  </div>
                  {items.map((item) => {
                    const isActive = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 relative transition-all group"
                        style={{
                          background: isActive ? '#FAF7F2' : 'transparent',
                        }}
                      >
                        {/* Teal left indicator */}
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full transition-all"
                          style={{
                            height: isActive ? '60%' : '0%',
                            background: '#167C86',
                          }}
                        />
                        {/* Icon */}
                        <span
                          style={{
                            color: isActive ? '#167C86' : '#7A8A91',
                          }}
                          className="shrink-0 transition-colors group-hover:text-[#167C86]"
                        >
                          {item.icon}
                        </span>
                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[11px] font-medium block leading-tight truncate"
                            style={{
                              color: isActive ? '#172126' : '#52636B',
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <ChevronRight
                            className="size-3 shrink-0"
                            style={{ color: '#167C86' }}
                          />
                        )}
                      </button>
                    )
                  })}
                  {group !== 'SYSTEM' && (
                    <div
                      className="mx-3 my-1.5 border-t"
                      style={{ borderColor: '#DCE6E9' }}
                    />
                  )}
                </div>
              )
            })}
            <div className="h-3" />
          </div>
        </aside>

        {/* ── MOBILE NAV ─────────────────────────────────────────────────── */}
        <div className="lg:hidden w-full mb-4">
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full border px-3 h-8 text-[11px] font-medium transition-all"
                  style={{
                    borderColor: isActive ? '#172126' : '#DCE6E9',
                    background: isActive ? '#172126' : '#fff',
                    color: isActive ? '#fff' : '#52636B',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: SETTINGS WORKSPACE ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════
              01 — STORE IDENTITY
          ═══════════════════════════════════════════════════════════════ */}
          <section id="section-identity" className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9' }}
          >
            {/* Section header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#DCE6E9', background: '#fff' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  01
                </span>
                <div>
                  <h2
                    className="font-serif text-base font-normal leading-tight"
                    style={{ color: '#172126' }}
                  >
                    Store Identity
                  </h2>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    Brand & customer communication
                  </p>
                </div>
              </div>
              <Store className="size-4 shrink-0" style={{ color: '#DCE6E9' }} />
            </div>

            {/* Body */}
            <div className="p-6 bg-white">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Inputs */}
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 content-start">
                  <AppInput
                    label="Store Name"
                    value={formState.storeName}
                    onChange={(e) => setFormState((s) => ({ ...s, storeName: e.target.value }))}
                  />
                  <AppInput
                    label="Support Email"
                    type="email"
                    value={formState.supportEmail}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, supportEmail: e.target.value }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <AppInput
                      label="Support Phone"
                      value={formState.supportPhone}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, supportPhone: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Brand preview panel */}
                <div
                  className="rounded-xl border flex flex-col items-center justify-center py-7 px-4 text-center"
                  style={{ background: '#FAF7F2', borderColor: '#DCE6E9' }}
                >
                  <div
                    className="size-10 rounded-full flex items-center justify-center mb-3 font-mono text-base font-bold"
                    style={{ background: '#172126', color: '#FAF7F2' }}
                  >
                    B
                  </div>
                  <p
                    className="font-mono text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: '#172126' }}
                  >
                    {formState.storeName || 'BAREO'}
                  </p>
                  <div
                    className="w-8 my-2 border-t"
                    style={{ borderColor: '#DCE6E9' }}
                  />
                  <p
                    className="text-[10px] font-light"
                    style={{ color: '#7A8A91' }}
                  >
                    {formState.supportEmail || 'care@bareo.in'}
                  </p>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    {formState.supportPhone || '+91 1800 300 3000'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              02 — COMMERCE RULES
          ═══════════════════════════════════════════════════════════════ */}
          <section
            id="section-commerce"
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  02
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className="font-serif text-base font-normal leading-tight"
                      style={{ color: '#172126' }}
                    >
                      Commerce Rules
                    </h2>
                    {data && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                        style={{
                          borderColor: '#DCE6E9',
                          background: '#EDF6F8',
                          color: '#167C86',
                        }}
                      >
                        <CheckCircle2 className="size-2.5" /> Checkout Engine Connected
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    Checkout calculation parameters
                  </p>
                </div>
              </div>
              <Calculator className="size-4 shrink-0" style={{ color: '#DCE6E9' }} />
            </div>

            {/* Body */}
            <div className="p-6" style={{ background: '#FAF7F2' }}>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Free Shipping */}
                <div
                  className="rounded-xl border bg-white p-4 space-y-3"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <div>
                    <span
                      className="text-[9px] font-semibold tracking-widest uppercase block"
                      style={{ color: '#7A8A91' }}
                    >
                      FREE SHIPPING
                    </span>
                    <p
                      className="font-mono text-2xl font-semibold mt-1"
                      style={{ color: '#172126' }}
                    >
                      ₹{formState.freeShippingThreshold.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <AppInput
                    label="Threshold (₹)"
                    type="number"
                    min="0"
                    value={String(formState.freeShippingThreshold)}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        freeShippingThreshold: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-[10px] font-light" style={{ color: '#7A8A91' }}>
                    Orders above this threshold qualify for free delivery.
                  </p>
                </div>

                {/* GST Rate */}
                <div
                  className="rounded-xl border bg-white p-4 space-y-3"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <div>
                    <span
                      className="text-[9px] font-semibold tracking-widest uppercase block"
                      style={{ color: '#7A8A91' }}
                    >
                      GST RATE
                    </span>
                    <p
                      className="font-mono text-2xl font-semibold mt-1"
                      style={{ color: '#172126' }}
                    >
                      {formState.gstRate}%
                    </p>
                  </div>
                  <AppInput
                    label="Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={String(formState.gstRate)}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, gstRate: Number(e.target.value) }))
                    }
                  />
                  <p className="text-[10px] font-light" style={{ color: '#7A8A91' }}>
                    Applied during checkout calculation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              03 — STOREFRONT CONTROL
          ═══════════════════════════════════════════════════════════════ */}
          <section
            id="section-storefront"
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#DCE6E9', background: '#fff' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  03
                </span>
                <div>
                  <h2
                    className="font-serif text-base font-normal leading-tight"
                    style={{ color: '#172126' }}
                  >
                    Storefront Control
                  </h2>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    Customer experience switches
                  </p>
                </div>
              </div>
              <ToggleLeft className="size-4 shrink-0" style={{ color: '#DCE6E9' }} />
            </div>

            {/* Control rows */}
            <div className="bg-white divide-y" style={{ borderColor: '#DCE6E9' }}>

              {/* AI SKIN ASSISTANT */}
              <div className="px-6 py-5 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-semibold tracking-widest uppercase"
                      style={{ color: '#172126' }}
                    >
                      AI SKIN ASSISTANT
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: formState.aiAssistantEnabled ? '#EDF6F8' : '#F3F4F6',
                        color: formState.aiAssistantEnabled ? '#167C86' : '#7A8A91',
                      }}
                    >
                      {formState.aiAssistantEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] font-light" style={{ color: '#52636B' }}>
                    Interactive skin consultations and dermal Q&A for customers.
                  </p>
                </div>
                <Switch
                  checked={formState.aiAssistantEnabled}
                  onCheckedChange={(c) =>
                    setFormState((s) => ({ ...s, aiAssistantEnabled: c }))
                  }
                  className="shrink-0"
                  style={
                    {
                      '--switch-checked-bg': '#172126',
                    } as React.CSSProperties
                  }
                />
              </div>

              {/* MAINTENANCE MODE */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: '#172126' }}
                      >
                        MAINTENANCE MODE
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                        style={{
                          background: formState.maintenanceMode ? '#FEF3C7' : '#F3F4F6',
                          color: formState.maintenanceMode ? '#92400E' : '#7A8A91',
                        }}
                      >
                        {formState.maintenanceMode ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] font-light" style={{ color: '#52636B' }}>
                      Temporarily restrict customer storefront access.
                    </p>
                  </div>
                  <Switch
                    checked={formState.maintenanceMode}
                    onCheckedChange={handleMaintenanceToggle}
                    className="shrink-0"
                  />
                </div>

                {/* Warning strip — only when enabled */}
                {formState.maintenanceMode && (
                  <div
                    className="flex items-center gap-2 rounded-lg border px-3.5 py-2.5"
                    style={{
                      borderColor: '#F59E0B',
                      background: '#FFFBEB',
                    }}
                  >
                    <AlertTriangle className="size-3.5 shrink-0" style={{ color: '#92400E' }} />
                    <span
                      className="text-[10px] font-semibold tracking-wide uppercase"
                      style={{ color: '#92400E' }}
                    >
                      STOREFRONT ACCESS RESTRICTED
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              04 — INVENTORY INTELLIGENCE
          ═══════════════════════════════════════════════════════════════ */}
          <section
            id="section-inventory"
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#DCE6E9', background: '#fff' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  04
                </span>
                <div>
                  <h2
                    className="font-serif text-base font-normal leading-tight"
                    style={{ color: '#172126' }}
                  >
                    Inventory Intelligence
                  </h2>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    Stock monitoring threshold
                  </p>
                </div>
              </div>
              <PackageSearch className="size-4 shrink-0" style={{ color: '#DCE6E9' }} />
            </div>

            {/* Body */}
            <div className="p-6 bg-white">
              <div className="grid gap-6 sm:grid-cols-2 items-start">
                {/* Input */}
                <div className="space-y-3">
                  <div>
                    <span
                      className="text-[9px] font-semibold tracking-widest uppercase block mb-1"
                      style={{ color: '#7A8A91' }}
                    >
                      LOW STOCK THRESHOLD
                    </span>
                    <p
                      className="font-mono text-2xl font-semibold"
                      style={{ color: '#172126' }}
                    >
                      {formState.lowStockThreshold}{' '}
                      <span
                        className="font-sans text-sm font-light"
                        style={{ color: '#7A8A91' }}
                      >
                        units
                      </span>
                    </p>
                  </div>
                  <AppInput
                    label="Warning Threshold (units)"
                    type="number"
                    min="0"
                    value={String(formState.lowStockThreshold)}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        lowStockThreshold: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-[10px] font-light" style={{ color: '#7A8A91' }}>
                    Products below this level surface operational stock alerts across executive consoles.
                  </p>
                </div>

                {/* Visual threshold bar */}
                <div
                  className="rounded-xl border p-5 space-y-3"
                  style={{ background: '#FAF7F2', borderColor: '#DCE6E9' }}
                >
                  <span
                    className="text-[9px] font-semibold tracking-widest uppercase block"
                    style={{ color: '#7A8A91' }}
                  >
                    THRESHOLD VISUALISER
                  </span>
                  <div className="relative">
                    <div
                      className="h-1.5 rounded-full w-full"
                      style={{ background: '#DCE6E9' }}
                    >
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (formState.lowStockThreshold / 100) * 100)}%`,
                          background: '#167C86',
                        }}
                      />
                    </div>
                    <div
                      className="absolute -top-0.5 size-2.5 rounded-full border-2 border-white -translate-x-1/2 shadow"
                      style={{
                        left: `${Math.min(100, (formState.lowStockThreshold / 100) * 100)}%`,
                        background: '#167C86',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px]" style={{ color: '#7A8A91' }}>
                    <span>0</span>
                    <span className="font-semibold" style={{ color: '#167C86' }}>
                      {formState.lowStockThreshold}
                    </span>
                    <span>100+</span>
                  </div>
                  <p className="text-[10px] font-light" style={{ color: '#7A8A91' }}>
                    Alert zone activates below threshold marker.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              05 — ADMINISTRATION
          ═══════════════════════════════════════════════════════════════ */}
          <section
            id="section-administration"
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: '#DCE6E9' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#DCE6E9', background: '#FAF7F2' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] font-semibold"
                  style={{ color: '#167C86' }}
                >
                  05
                </span>
                <div>
                  <h2
                    className="font-serif text-base font-normal leading-tight"
                    style={{ color: '#172126' }}
                  >
                    Administration
                  </h2>
                  <p
                    className="text-[10px] font-light mt-0.5"
                    style={{ color: '#7A8A91' }}
                  >
                    Access & security
                  </p>
                </div>
              </div>
              <ShieldCheck className="size-4 shrink-0" style={{ color: '#DCE6E9' }} />
            </div>

            {/* Body */}
            <div className="p-6" style={{ background: '#FAF7F2' }}>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Admin Account */}
                <div
                  className="rounded-xl border bg-white p-4 space-y-1.5"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <span
                    className="text-[9px] font-semibold tracking-widest uppercase block"
                    style={{ color: '#7A8A91' }}
                  >
                    ADMIN ACCOUNT
                  </span>
                  <p
                    className="text-xs font-medium font-mono truncate"
                    style={{ color: '#172126' }}
                  >
                    admin@luminaskin.com
                  </p>
                </div>

                {/* Access Role */}
                <div
                  className="rounded-xl border bg-white p-4 space-y-1.5"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <span
                    className="text-[9px] font-semibold tracking-widest uppercase block"
                    style={{ color: '#7A8A91' }}
                  >
                    ACCESS ROLE
                  </span>
                  <p
                    className="font-mono text-xs font-bold tracking-wider"
                    style={{ color: '#172126' }}
                  >
                    ADMIN
                  </p>
                </div>

                {/* Session */}
                <div
                  className="rounded-xl border bg-white p-4 space-y-1.5"
                  style={{ borderColor: '#DCE6E9' }}
                >
                  <span
                    className="text-[9px] font-semibold tracking-widest uppercase block"
                    style={{ color: '#7A8A91' }}
                  >
                    SESSION
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ background: '#167C86' }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#167C86' }}
                    >
                      AUTHENTICATED
                    </span>
                  </div>
                </div>
              </div>

              {/* System Connections */}
              {data && (
                <div className="mt-4">
                  <div
                    className="rounded-xl border bg-white overflow-hidden"
                    style={{ borderColor: '#DCE6E9' }}
                  >
                    <div
                      className="px-4 py-2.5 border-b"
                      style={{ borderColor: '#DCE6E9' }}
                    >
                      <span
                        className="text-[9px] font-semibold tracking-widest uppercase"
                        style={{ color: '#7A8A91' }}
                      >
                        SYSTEM CONNECTIONS
                      </span>
                    </div>
                    <div className="divide-y" style={{ borderColor: '#DCE6E9' }}>
                      {[
                        { label: 'Checkout Engine', status: 'Connected' },
                        { label: 'Authentication', status: 'Active' },
                      ].map((conn) => (
                        <div
                          key={conn.label}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <span
                            className="text-[11px] font-light"
                            style={{ color: '#52636B' }}
                          >
                            {conn.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 rounded-full shrink-0"
                              style={{ background: '#167C86' }}
                            />
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: '#167C86' }}
                            >
                              {conn.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ── FLOATING DIRTY-STATE ACTION BAR ─────────────────────────────────── */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div
            className="flex items-center justify-between rounded-2xl border px-5 py-3 shadow-xl"
            style={{
              background: '#172126',
              borderColor: '#2a3940',
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span
                className="size-2 rounded-full animate-pulse"
                style={{ background: '#F59E0B' }}
              />
              <span className="font-medium" style={{ color: '#FAF7F2' }}>
                Unsaved changes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscard}
                className="text-xs h-8 px-3 rounded-lg"
                style={{ color: '#7A8A91' }}
              >
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="text-xs font-semibold h-8 px-4 rounded-lg transition-colors"
                style={{ background: '#FAF7F2', color: '#172126' }}
              >
                {saveMutation.isPending ? (
                  <RefreshCw className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <Save className="size-3.5 mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAINTENANCE MODE CONFIRMATION MODAL ─────────────────────────────── */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl border"
            style={{ background: '#fff', borderColor: '#DCE6E9' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#FEF3C7' }}
              >
                <AlertTriangle className="size-5" style={{ color: '#92400E' }} />
              </div>
              <div>
                <h3
                  className="font-serif text-base font-normal"
                  style={{ color: '#172126' }}
                >
                  Enable Maintenance Mode?
                </h3>
                <p
                  className="text-[11px] font-light mt-1 leading-relaxed"
                  style={{ color: '#52636B' }}
                >
                  The storefront will become unavailable to customer accounts.
                  Admin operations will remain accessible.
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5"
              style={{ borderColor: '#F59E0B', background: '#FFFBEB' }}
            >
              <AlertTriangle className="size-3.5 shrink-0" style={{ color: '#92400E' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: '#92400E' }}
              >
                THIS ACTION RESTRICTS PUBLIC STOREFRONT ACCESS
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMaintenanceModal(false)}
                className="rounded-xl text-xs h-9"
                style={{ borderColor: '#DCE6E9', color: '#52636B' }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmEnableMaintenance}
                className="rounded-xl text-xs h-9 font-semibold"
                style={{ background: '#92400E', color: '#fff' }}
              >
                Enable Maintenance Mode
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
