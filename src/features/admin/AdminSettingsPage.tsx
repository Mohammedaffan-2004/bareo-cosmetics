import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  AlertCircle,
  RefreshCw,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { setActiveStoreSettings } from '@/services/storeSettingsStore'
import { Button } from '@/components/ui/button'
import { AppInput } from '@/components/common/AppInput'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import type { StoreSettingsPayload } from '@/types'

export function AdminSettingsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  // Form State
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

  // 1. Fetch Live Settings from MongoDB
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<StoreSettingsPayload>({
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

  // 2. Mutation to Save Settings
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

  // Check Dirty State
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

  // Client-side Validation
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

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-12 w-64 rounded-xl bg-[#FAFAFA]" />
        <Skeleton className="h-64 rounded-2xl bg-[#FAFAFA]" />
        <Skeleton className="h-48 rounded-2xl bg-[#FAFAFA]" />
        <Skeleton className="h-48 rounded-2xl bg-[#FAFAFA]" />
      </div>
    )
  }

  // ERROR STATE
  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="size-10 text-rose-600 mx-auto" />
        <div>
          <p className="font-serif text-lg font-semibold text-rose-900">Unable to load settings</p>
          <p className="text-xs text-rose-700 font-light mt-1">
            {(error as Error)?.message || 'Failed to connect to backend configuration server.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-rose-900 text-white text-xs px-5 h-10 hover:bg-rose-950"
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      {/* 1. HEADER */}
      <div>
        <span className="text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase block">
          SETTINGS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-0.5">
          Store Settings
        </h1>
        <p className="text-xs text-[#6B7280] font-light mt-1">
          Manage store identity, operational parameters, and administrative controls.
        </p>
      </div>

      {validationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. SECTION 1 — STORE IDENTITY */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div>
          <h2 className="font-serif text-lg font-normal text-[#111111]">Store Identity</h2>
          <p className="text-[11px] text-[#6B7280] font-light">
            Customer-facing brand information and support communication channels
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput
            label="Store Name"
            value={formState.storeName}
            onChange={(e) => setFormState((s) => ({ ...s, storeName: e.target.value }))}
          />
          <AppInput
            label="Support Email"
            type="email"
            value={formState.supportEmail}
            onChange={(e) => setFormState((s) => ({ ...s, supportEmail: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <AppInput
              label="Support Phone"
              value={formState.supportPhone}
              onChange={(e) => setFormState((s) => ({ ...s, supportPhone: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* 3. SECTION 2 — COMMERCE RULES */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-normal text-[#111111]">Commerce Rules</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-900">
              <CheckCircle2 className="size-3" /> Checkout Engine Connected
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] font-light mt-0.5">
            Operational rules used directly by the cart and order calculation engine
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <AppInput
              label="Free Shipping Threshold (₹)"
              type="number"
              min="0"
              value={String(formState.freeShippingThreshold)}
              onChange={(e) =>
                setFormState((s) => ({ ...s, freeShippingThreshold: Number(e.target.value) }))
              }
            />
            <p className="text-[10px] text-[#6B7280] font-light mt-1">
              Orders with net subtotal equal to or above this amount receive free shipping.
            </p>
          </div>

          <div>
            <AppInput
              label="Default Tax / GST Rate (%)"
              type="number"
              min="0"
              max="100"
              value={String(formState.gstRate)}
              onChange={(e) =>
                setFormState((s) => ({ ...s, gstRate: Number(e.target.value) }))
              }
            />
            <p className="text-[10px] text-[#6B7280] font-light mt-1">
              Tax percentage applied to order pricing during checkout calculation.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SECTION 3 — STOREFRONT CONTROLS */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div>
          <h2 className="font-serif text-lg font-normal text-[#111111]">Storefront Controls</h2>
          <p className="text-[11px] text-[#6B7280] font-light">
            Manage interactive customer feature availability
          </p>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {/* AI ASSISTANT TOGGLE */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-xs font-semibold text-[#111111]">AI Skin Assistant</p>
              <p className="text-[11px] text-[#6B7280] font-light mt-0.5">
                Enable interactive skin consultations and dermal Q&A assistant for customers.
              </p>
            </div>
            <Switch
              checked={formState.aiAssistantEnabled}
              onCheckedChange={(c) => setFormState((s) => ({ ...s, aiAssistantEnabled: c }))}
            />
          </div>

          {/* MAINTENANCE MODE TOGGLE */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-xs font-semibold text-[#111111]">Maintenance Mode</p>
              <p className="text-[11px] text-[#6B7280] font-light mt-0.5">
                Restrict customer storefront access and display a quiet maintenance notice.
              </p>
            </div>
            <Switch
              checked={formState.maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
            />
          </div>
        </div>
      </div>

      {/* 5. SECTION 4 — INVENTORY ALERTS */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div>
          <h2 className="font-serif text-lg font-normal text-[#111111]">Inventory Alerts</h2>
          <p className="text-[11px] text-[#6B7280] font-light">
            Operational warning thresholds for stock replenishment
          </p>
        </div>
        <div className="max-w-xs">
          <AppInput
            label="Low Stock Warning Threshold (units)"
            type="number"
            min="0"
            value={String(formState.lowStockThreshold)}
            onChange={(e) =>
              setFormState((s) => ({ ...s, lowStockThreshold: Number(e.target.value) }))
            }
          />
          <p className="text-[10px] text-[#6B7280] font-light mt-1">
            Products with stock below this threshold trigger low stock warnings across executive consoles.
          </p>
        </div>
      </div>

      {/* 6. SECTION 5 — ADMINISTRATION */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#111111]" />
          <h2 className="font-serif text-lg font-normal text-[#111111]">Administration</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-0.5">
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase block">ADMIN ACCOUNT</span>
            <span className="font-medium text-[#111111]">admin@luminaskin.com</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-0.5">
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase block">SECURITY ROLE</span>
            <span className="font-mono font-bold text-[#111111]">ADMIN</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-0.5">
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase block">SESSION STATUS</span>
            <span className="font-semibold text-emerald-900 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-600" /> Authenticated
            </span>
          </div>
        </div>
      </div>

      {/* 7. FLOATING DIRTY-STATE ACTION BAR */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-[#111111] text-white px-5 py-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-medium">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscard}
                className="text-xs text-gray-300 hover:text-white hover:bg-white/10 h-8 px-3 rounded-lg"
              >
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-white text-[#111111] text-xs font-semibold hover:bg-gray-100 h-8 px-4 rounded-lg shadow-2xs"
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

      {/* 8. MAINTENANCE MODE CONFIRMATION MODAL */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 space-y-4 shadow-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#111111]">
                Enable Maintenance Mode?
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] font-light leading-relaxed">
              The storefront will become unavailable to customer accounts. Admin operations will remain accessible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMaintenanceModal(false)}
                className="rounded-xl border-[#E5E7EB] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmEnableMaintenance}
                className="rounded-xl bg-amber-700 text-white text-xs hover:bg-amber-800"
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

