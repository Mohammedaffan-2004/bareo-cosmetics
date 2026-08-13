import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  TicketPercent,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Power,
  Search,
  AlertCircle,
  RefreshCw,
  Tag,
  Copy,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { AppModal } from '@/components/common/AppModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatINR, formatDate, cn } from '@/utils'
import type { Coupon } from '@/types'

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'disabled', label: 'Disabled' },
]

function getCouponStatusBadge(coupon: Coupon) {
  const isExpired = coupon.validTill && new Date(coupon.validTill) < new Date()
  const isActive = coupon.active !== false

  if (!isActive) {
    return {
      label: 'Disabled',
      className: 'bg-rose-50 text-rose-900 border-rose-200/80',
      dot: 'bg-rose-500',
    }
  }

  if (isExpired) {
    return {
      label: 'Expired',
      className: 'bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB]',
      dot: 'bg-[#9CA3AF]',
    }
  }

  return {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    dot: 'bg-emerald-600',
  }
}

export function AdminOffersPage() {
  const toast = useToast()
  const qc = useQueryClient()

  const [open, setOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State with Real Expiry Date
  const defaultValidTill = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'flat',
    value: '10',
    minOrder: '0',
    maxDiscount: '',
    validTill: defaultValidTill,
    active: true,
  })

  // Live Query
  const {
    data: coupons,
    isLoading: loadingCoupons,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService().getCoupons(),
  })

  // Operational KPI & Tab Counts Computation
  const { kpis, counts } = useMemo(() => {
    if (!coupons) {
      return {
        kpis: { total: 0, active: 0, expiringSoon: 0, disabled: 0 },
        counts: { all: 0, active: 0, expired: 0, disabled: 0 },
      }
    }

    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 86400000)

    const total = coupons.length
    let active = 0
    let expiringSoon = 0
    let disabled = 0
    let expired = 0

    coupons.forEach((c) => {
      const isAct = c.active !== false
      const expDate = c.validTill ? new Date(c.validTill) : null
      const isExp = expDate ? expDate < now : false

      if (!isAct) {
        disabled++
      } else if (isExp) {
        expired++
      } else {
        active++
        if (expDate && expDate <= sevenDaysLater) {
          expiringSoon++
        }
      }
    })

    return {
      kpis: { total, active, expiringSoon, disabled },
      counts: { all: total, active, expired, disabled },
    }
  }, [coupons])

  // Filtered List
  const filteredCoupons = (coupons ?? []).filter((c) => {
    const isAct = c.active !== false
    const expDate = c.validTill ? new Date(c.validTill) : null
    const isExp = expDate ? expDate < new Date() : false

    let matchesFilter = true
    if (statusFilter === 'active') matchesFilter = isAct && !isExp
    else if (statusFilter === 'expired') matchesFilter = isExp && isAct
    else if (statusFilter === 'disabled') matchesFilter = !isAct

    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q || c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const validTillIso = data.validTill
        ? new Date(`${data.validTill}T23:59:59.999Z`).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString()

      return adminService().createCoupon({
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
        discountType: data.discountType,
        value: Number(data.value) || 0,
        minOrder: Number(data.minOrder) || 0,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
        validTill: validTillIso,
        active: data.active,
      })
    },
    onSuccess: (newCoupon) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon created', `${newCoupon.code} is active and ready for checkout.`)
      closeModal()
    },
    onError: (err: any) => {
      toast.error('Failed to create coupon', err.message || 'Validation error or duplicate code.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Coupon> }) =>
      adminService().updateCoupon(id, updates),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon updated', `${updated.code} settings saved successfully.`)
      closeModal()
    },
    onError: (err: any) => {
      toast.error('Update failed', err.message || 'Could not update coupon.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService().deleteCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.info('Coupon deleted', 'Promotional code removed from system.')
      setDeletingId(null)
    },
    onError: (err: any) => {
      toast.error('Delete failed', err.message || 'Could not delete coupon.')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService().updateCoupon(id, { active }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success(
        variables.active ? 'Coupon enabled' : 'Coupon disabled',
        `Coupon status updated successfully.`
      )
    },
    onError: (err: any) => {
      toast.error('Status update failed', err.message || 'Server error occurred.')
    },
  })

  const handleOpenCreate = () => {
    setEditingCoupon(null)
    setForm({
      code: '',
      description: '',
      discountType: 'percent',
      value: '10',
      minOrder: '0',
      maxDiscount: '',
      validTill: defaultValidTill,
      active: true,
    })
    setOpen(true)
  }

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c)
    const formattedValidTill = c.validTill
      ? new Date(c.validTill).toISOString().split('T')[0]
      : defaultValidTill

    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      value: String(c.value),
      minOrder: String(c.minOrder || 0),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      validTill: formattedValidTill,
      active: c.active !== false,
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditingCoupon(null)
    setForm({
      code: '',
      description: '',
      discountType: 'percent',
      value: '10',
      minOrder: '0',
      maxDiscount: '',
      validTill: defaultValidTill,
      active: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.code.trim()) {
      toast.error('Code required', 'Please enter a valid coupon code.')
      return
    }

    const val = Number(form.value)
    if (isNaN(val) || val <= 0) {
      toast.error('Invalid discount value', 'Discount value must be greater than 0.')
      return
    }

    if (form.discountType === 'percent' && val > 100) {
      toast.error('Invalid percentage', 'Percentage discount cannot exceed 100%.')
      return
    }

    const minOrd = Number(form.minOrder) || 0
    if (minOrd < 0) {
      toast.error('Invalid minimum order', 'Minimum order amount cannot be negative.')
      return
    }

    const validTillIso = form.validTill
      ? new Date(`${form.validTill}T23:59:59.999Z`).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString()

    if (editingCoupon) {
      updateMutation.mutate({
        id: editingCoupon.id,
        updates: {
          code: form.code.trim().toUpperCase(),
          description: form.description.trim(),
          discountType: form.discountType,
          value: val,
          minOrder: minOrd,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
          validTill: validTillIso,
          active: form.active,
        },
      })
    } else {
      createMutation.mutate(form)
    }
  }

  // Live Customer Preview Computations
  const previewDiscountText =
    form.discountType === 'percent'
      ? `${form.value || 0}% OFF`
      : `${formatINR(Number(form.value) || 0)} FLAT OFF`

  const previewCode = form.code.trim().toUpperCase() || 'PROMO20'

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase block">
            PROMOTIONS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-0.5">
            Offers & Coupons
          </h1>
          <p className="text-xs text-[#6B7280] font-light mt-1">
            Create and manage customer promotions, discount codes and storefront incentives.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-4 h-10 hover:bg-black shadow-2xs self-start sm:self-auto"
        >
          <Plus className="size-4 mr-1.5" /> Create Coupon
        </Button>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            TOTAL COUPONS
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {kpis.total}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Configured promo codes</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            ACTIVE COUPONS
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {kpis.active}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Ready for customer checkout</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            EXPIRING SOON
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {kpis.expiringSoon}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Expiring within 7 days</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
            DISABLED
          </span>
          <p className="font-mono text-2xl font-bold text-[#111111]">
            {kpis.disabled}
          </p>
          <p className="text-[11px] text-[#6B7280] font-light">Deactivated campaigns</p>
        </div>
      </div>

      {/* 3. STATUS FILTER TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#E5E7EB]">
          {FILTER_TABS.map((tab) => {
            const count = (counts as any)[tab.key] ?? 0
            const isActive = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'shrink-0 flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-xs transition-all duration-200 min-h-[40px]',
                  isActive
                    ? 'border-[#111111] bg-white font-semibold text-[#111111]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111111]'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-mono font-medium',
                    isActive ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] text-[#6B7280] border border-[#E5E7EB]'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promo code or description..."
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-xs text-[#111111] placeholder-[#9CA3AF] outline-none focus:border-[#111111] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. COUPONS TABLE / STATES */}
      {loadingCoupons ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-[#FAFAFA]" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">Failed to load promotions</p>
          <p className="text-xs text-rose-700">{(error as Error)?.message || 'Server error occurred'}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Retry Request
          </Button>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center space-y-3">
          <TicketPercent className="size-8 text-[#9CA3AF] mx-auto" />
          <p className="font-serif text-base font-semibold text-[#111111]">No coupons found</p>
          <p className="text-xs text-[#6B7280]">
            No promotional codes match your current filter parameters.
          </p>
          {(search || statusFilter !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
              className="rounded-xl border-[#E5E7EB] text-xs text-[#111111]"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAF7F2] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3.5">Coupon</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Minimum Order</th>
                  <th className="px-4 py-3.5">Validity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredCoupons.map((coupon) => {
                  const badge = getCouponStatusBadge(coupon)
                  const discountLabel =
                    coupon.discountType === 'percent'
                      ? `${coupon.value}% OFF`
                      : `${formatINR(coupon.value)} FLAT OFF`

                  return (
                    <tr key={coupon.id} className="transition-colors hover:bg-[#FAF7F2]/40">
                      {/* COUPON CODE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#111111] bg-[#FAF7F2] border border-[#E5E7EB] px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code)
                              toast.success('Copied to clipboard', coupon.code)
                            }}
                            className="text-[#9CA3AF] hover:text-[#111111] transition-colors p-1"
                            title="Copy Coupon Code"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#6B7280] font-light mt-1 line-clamp-1">
                          {coupon.description || 'Promotional discount code'}
                        </p>
                      </td>

                      {/* DISCOUNT */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#111111] block">
                          {discountLabel}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">
                          {coupon.maxDiscount ? `Cap: ${formatINR(coupon.maxDiscount)}` : 'No max cap'}
                        </span>
                      </td>

                      {/* MIN ORDER */}
                      <td className="px-4 py-4 font-mono font-medium text-[#111111]">
                        {formatINR(coupon.minOrder || 0)}
                      </td>

                      {/* VALIDITY */}
                      <td className="px-4 py-4 text-[11px] text-[#6B7280] whitespace-nowrap">
                        {coupon.validTill ? `Expires ${formatDate(coupon.validTill)}` : 'No Expiry'}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                            badge.className
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full', badge.dot)} />
                          {badge.label}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: coupon.id,
                                active: coupon.active === false,
                              })
                            }
                            className="h-8 px-2.5 text-xs text-[#6B7280] hover:text-[#111111]"
                          >
                            <Power className="size-3.5 mr-1" />
                            {coupon.active === false ? 'Enable' : 'Disable'}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(coupon)}
                            className="h-8 px-2.5 text-xs font-semibold text-[#111111] hover:bg-[#FAF7F2]"
                          >
                            <Edit3 className="size-3.5 mr-1" /> Edit
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(coupon.id)}
                            className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-900"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CREATE / EDIT COUPON BUILDER DIALOG WITH LIVE CUSTOMER PREVIEW */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-[#E5E7EB] pb-4">
            <DialogTitle className="font-serif text-2xl font-normal text-[#111111]">
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Promo Code'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px] pt-4 items-start">
            {/* FORM COLUMN */}
            <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
              {/* Section 1: Identity */}
              <div className="space-y-3">
                <AppInput
                  label="Coupon Code *"
                  placeholder="e.g. GLOW20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-10 rounded-xl uppercase font-mono font-bold text-xs"
                />

                <AppInput
                  label="Description *"
                  placeholder="e.g. 20% off on all orders above ₹499"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              {/* Section 2: Discount */}
              <div className="space-y-3 border-t border-[#E5E7EB] pt-3">
                <AppSelect
                  label="Discount Type *"
                  value={form.discountType}
                  onValueChange={(v) => setForm({ ...form, discountType: v as any })}
                  options={[
                    { value: 'percent', label: 'Percentage (%)' },
                    { value: 'flat', label: 'Flat Amount (₹)' },
                  ]}
                  className="text-xs"
                />

                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    label={form.discountType === 'percent' ? 'Percentage (%) *' : 'Flat Amount (₹) *'}
                    type="number"
                    placeholder={form.discountType === 'percent' ? '20' : '150'}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="h-10 rounded-xl text-xs"
                  />

                  <AppInput
                    label="Max Cap (₹, Optional)"
                    type="number"
                    placeholder="No cap"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Section 3: Eligibility & Expiry */}
              <div className="space-y-3 border-t border-[#E5E7EB] pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    label="Min Order Amount (₹)"
                    type="number"
                    placeholder="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    className="h-10 rounded-xl text-xs"
                  />

                  <div>
                    <label className="text-xs font-semibold text-[#111111] block mb-1.5">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={form.validTill}
                      onChange={(e) => setForm({ ...form, validTill: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111] outline-none focus:border-[#111111] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Status */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111111] font-semibold">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="size-4 accent-[#111111]"
                  />
                  Activate promo code immediately upon creation
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E7EB]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-6 h-10 hover:bg-black"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingCoupon
                    ? 'Save Changes'
                    : 'Create Coupon'}
                </Button>
              </div>
            </form>

            {/* LIVE CUSTOMER CHECKOUT PREVIEW PANEL */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/80 p-4 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                CUSTOMER VIEW (CHECKOUT PREVIEW)
              </span>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[#6B7280]">
                  <span>Have a promo code?</span>
                  <Tag className="size-3.5 text-[#111111]" />
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="flex-1 h-8 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 text-[11px] font-mono font-bold text-[#111111] flex items-center">
                    {previewCode}
                  </div>
                  <div className="h-8 rounded-lg bg-[#111111] text-white text-[11px] font-semibold px-3 flex items-center">
                    Apply
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] space-y-1 text-[11px]">
                  <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <CheckCircle2 className="size-3" />
                    <span>{previewDiscountText}</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] font-light">
                    Minimum order: {formatINR(Number(form.minOrder) || 0)}
                  </p>
                  {form.maxDiscount && (
                    <p className="text-[10px] text-[#6B7280] font-light">
                      Maximum saving: {formatINR(Number(form.maxDiscount))}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[#9CA3AF] font-light leading-snug">
                Visual preview of how customer carts apply this code at checkout.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <AppModal
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Promo Code?"
      >
        <div className="space-y-4 pt-2 text-xs text-[#6B7280]">
          <p>
            Are you sure you want to delete this coupon? Customers will no longer be able to apply it at checkout.
          </p>
          <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Coupon'}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}

