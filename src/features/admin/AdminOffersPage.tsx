import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  TicketPercent,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Power,
  Search,
  AlertCircle,
  RefreshCw,
  Tag,
  Copy,
  Zap,
  Clock,
  Ban,
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
      className: 'bg-[#FAF7F2] text-[#52636B] border-[#DCE6E9]',
      dot: 'bg-[#7A8A91]',
    }
  }

  if (isExpired) {
    return {
      label: 'Expired',
      className: 'bg-rose-50 text-rose-900 border-rose-200/80',
      dot: 'bg-rose-500',
    }
  }

  return {
    label: 'Active',
    className: 'bg-[#EDF6F8] text-[#167C86] border-[#167C86]/30',
    dot: 'bg-[#167C86]',
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
      toast.success('Promotion Created', `${newCoupon.code} is active and ready for storefront checkout.`)
      closeModal()
    },
    onError: (err: any) => {
      toast.error('Failed to create promotion', err.message || 'Validation error or duplicate code.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Coupon> }) =>
      adminService().updateCoupon(id, updates),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Promotion Updated', `${updated.code} governance settings saved successfully.`)
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
      toast.info('Promotion Deleted', 'Promotional code removed from campaign system.')
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
        variables.active ? 'Promotion Enabled' : 'Promotion Deactivated',
        `Campaign status updated successfully.`
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
      discountType: (c.discountType === 'percentage' ? 'percent' : c.discountType) as 'percent' | 'flat',
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
    <div className="space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
            PROMOTIONS &amp; COMMERCIALS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] tracking-tight">
            Promotions &amp; Commercials
          </h1>
          <p className="text-xs text-[#52636B] font-light">
            Commercial governance, discount incentives and storefront promotional controls.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-4 h-10 hover:bg-[#172126]/90 shadow-2xs self-start sm:self-auto border border-[#172126]"
        >
          <Plus className="size-4 mr-1.5" /> Create Promotion
        </Button>
      </div>

      {/* 2. OPERATIONAL KPI METRIC CARDS WITH RESTRAINED CONTEXT ICONS */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 sm:p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
              TOTAL PROMOTIONS
            </span>
            <Tag className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {kpis.total}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Configured promotional codes</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 sm:p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
              ACTIVE CAMPAIGNS
            </span>
            <Zap className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {kpis.active}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Currently available at checkout</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 sm:p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">EXPIRING SOON</span>
            <Clock className="size-4 text-[#167C86]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {kpis.expiringSoon}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Ending within 7 days</p>
        </div>

        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 sm:p-5 space-y-1.5 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
              DEACTIVATED
            </span>
            <Ban className="size-4 text-[#7A8A91]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#172126]">
            {kpis.disabled}
          </p>
          <p className="text-[11px] text-[#52636B] font-light">Currently unavailable</p>
        </div>
      </div>

      {/* 3. SEGMENTED OPERATIONAL FILTER PILLS & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#DCE6E9] bg-white p-3 shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A8A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promotion code or description..."
            className="h-10 w-full rounded-xl border border-[#DCE6E9] bg-[#FAF7F2]/40 pl-10 pr-4 text-xs text-[#172126] placeholder-[#7A8A91] outline-none focus:bg-white focus:border-[#167C86] transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TABS.map((tab) => {
            const count = (counts as any)[tab.key] ?? 0
            const isActive = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border flex items-center gap-1.5',
                  isActive
                    ? 'bg-[#172126] text-white border-[#172126] shadow-2xs'
                    : 'bg-white text-[#52636B] border-[#DCE6E9] hover:bg-[#FAF7F2] hover:text-[#172126]'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.2 text-[10px] font-mono font-medium',
                    isActive ? 'bg-[#167C86] text-white' : 'bg-[#FAF7F2] text-[#7A8A91] border border-[#DCE6E9]'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. PROMOTION REGISTER TABLE & COMPACT BALANCED EMPTY STATE */}
      {loadingCoupons ? (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-3 shadow-2xs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-[#DCE6E9] last:border-0">
              <Skeleton className="h-6 w-32 rounded-lg bg-[#FAF7F2]" />
              <Skeleton className="h-5 w-24 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-5 w-20 rounded-md bg-[#FAF7F2]" />
              <Skeleton className="h-5 w-28 rounded-md bg-[#FAF7F2]" />
            </div>
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
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-7 sm:p-8 text-center space-y-2.5 max-w-2xl mx-auto shadow-2xs my-4">
          <TicketPercent className="size-7 text-[#167C86] mx-auto" />
          <p className="font-serif text-base font-normal text-[#172126]">
            {coupons && coupons.length === 0 ? 'No promotional codes configured yet.' : 'No promotions match this view'}
          </p>
          <p className="text-xs text-[#52636B] font-light leading-relaxed max-w-md mx-auto">
            {coupons && coupons.length === 0
              ? 'Create your first promotional code to introduce a controlled customer incentive at storefront checkout.'
              : 'No promotional codes match your active search or selected segment filter. Try resetting search filters.'}
          </p>
          <div className="pt-1">
            {coupons && coupons.length === 0 ? (
              <Button
                type="button"
                onClick={handleOpenCreate}
                className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-4 h-9 hover:bg-[#172126]/90 shadow-2xs border border-[#172126]"
              >
                <Plus className="size-4 mr-1.5" /> Create Promotion
              </Button>
            ) : (
              (search || statusFilter !== 'all') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('all')
                  }}
                  className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2]"
                >
                  Reset Search Filters
                </Button>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-[0_4px_12px_rgba(23,33,38,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE6E9] bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-[#7A8A91]">
                  <th className="px-5 py-3.5">Promotion</th>
                  <th className="px-4 py-3.5">Offer</th>
                  <th className="px-4 py-3.5">Minimum Order</th>
                  <th className="px-4 py-3.5">Validity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6E9]">
                {filteredCoupons.map((coupon) => {
                  const badge = getCouponStatusBadge(coupon)
                  const discountLabel =
                    coupon.discountType === 'percent'
                      ? `${coupon.value}% OFF`
                      : `${formatINR(coupon.value)} FLAT OFF`

                  const expDate = coupon.validTill ? new Date(coupon.validTill) : null
                  const now = new Date()
                  const isExpiringSoon = expDate ? expDate > now && expDate.getTime() <= now.getTime() + 7 * 86400000 : false

                  return (
                    <tr key={coupon.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                      {/* PROMOTION CODE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#172126] bg-[#FAF7F2] border border-[#DCE6E9] px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code)
                              toast.success('Copied to clipboard', coupon.code)
                            }}
                            className="text-[#7A8A91] hover:text-[#167C86] transition-colors p-1"
                            title="Copy Coupon Code"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#52636B] font-light mt-1 line-clamp-1">
                          {coupon.description || 'Promotional discount incentive'}
                        </p>
                      </td>

                      {/* OFFER VALUE */}
                      <td className="px-4 py-4">
                        <span className="font-serif font-bold text-sm text-[#172126] block">
                          {discountLabel}
                        </span>
                        <span className="text-[10px] text-[#7A8A91] font-light">
                          {coupon.maxDiscount ? `Max saving: ${formatINR(coupon.maxDiscount)}` : 'No max discount cap'}
                        </span>
                      </td>

                      {/* MINIMUM ORDER */}
                      <td className="px-4 py-4 font-mono font-semibold text-[#172126]">
                        {coupon.minOrder ? `${formatINR(coupon.minOrder)} min` : 'No minimum'}
                      </td>

                      {/* VALIDITY */}
                      <td className="px-4 py-4 text-[11px] text-[#7A8A91] whitespace-nowrap font-light space-y-1">
                        <p>{coupon.validTill ? `Until ${formatDate(coupon.validTill)}` : 'No expiry date'}</p>
                        {isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.2 rounded-full">
                            EXPIRING SOON
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            badge.className
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full', badge.dot)} />
                          {badge.label}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                            className="h-8 px-2.5 text-xs text-[#52636B] hover:text-[#172126] hover:bg-[#FAF7F2]"
                          >
                            <Power className="size-3.5 mr-1" />
                            {coupon.active === false ? 'Enable' : 'Disable'}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(coupon)}
                            className="h-8 px-2.5 text-xs font-semibold text-[#172126] hover:bg-[#FAF7F2] hover:text-[#167C86]"
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

      {/* 5. CREATE / EDIT PROMOTION BUILDER DIALOG WITH REFINED SECTION HIERARCHY */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-[#DCE6E9] pb-4">
            <span className="text-[10px] font-bold tracking-widest text-[#167C86] uppercase block">
              PROMOTION BUILDER
            </span>
            <DialogTitle className="font-serif text-2xl font-normal text-[#172126] mt-0.5">
              {editingCoupon ? `Edit Promotion: ${editingCoupon.code}` : 'Create Promotion'}
            </DialogTitle>
            <p className="text-xs text-[#52636B] font-light">
              Configure a controlled customer incentive for storefront checkout.
            </p>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px] pt-4 items-start">
            {/* FORM COLUMN */}
            <form onSubmit={handleSubmit} className="space-y-5 min-w-0">
              {/* SECTION A: PROMOTION IDENTITY */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                    SECTION A
                  </span>
                  <h4 className="text-xs font-bold text-[#172126] uppercase tracking-wider mt-0.5">
                    PROMOTION IDENTITY
                  </h4>
                </div>
                <AppInput
                  label="Coupon Code *"
                  placeholder="e.g. GLOW20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-10 rounded-xl uppercase font-mono font-bold text-xs border-[#DCE6E9] focus:border-[#167C86]"
                />

                <AppInput
                  label="Description *"
                  placeholder="e.g. 20% off on all orders above ₹499"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="h-10 rounded-xl text-xs border-[#DCE6E9] focus:border-[#167C86]"
                />
              </div>

              {/* SECTION B: DISCOUNT STRUCTURE */}
              <div className="space-y-3 border-t border-[#DCE6E9] pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                    SECTION B
                  </span>
                  <h4 className="text-xs font-bold text-[#172126] uppercase tracking-wider mt-0.5">
                    DISCOUNT STRUCTURE
                  </h4>
                </div>
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
                    className="h-10 rounded-xl text-xs border-[#DCE6E9] focus:border-[#167C86]"
                  />

                  {form.discountType === 'percent' && (
                    <AppInput
                      label="Max Cap (₹, Optional)"
                      type="number"
                      placeholder="No max cap"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      className="h-10 rounded-xl text-xs border-[#DCE6E9] focus:border-[#167C86]"
                    />
                  )}
                </div>
              </div>

              {/* SECTION C: ELIGIBILITY & VALIDITY */}
              <div className="space-y-3 border-t border-[#DCE6E9] pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                    SECTION C
                  </span>
                  <h4 className="text-xs font-bold text-[#172126] uppercase tracking-wider mt-0.5">
                    ELIGIBILITY &amp; VALIDITY
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    label="Min Order Amount (₹)"
                    type="number"
                    placeholder="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    className="h-10 rounded-xl text-xs border-[#DCE6E9] focus:border-[#167C86]"
                  />

                  <div>
                    <label className="text-xs font-semibold text-[#172126] block mb-1.5">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={form.validTill}
                      onChange={(e) => setForm({ ...form, validTill: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[#DCE6E9] bg-white px-3 text-xs text-[#172126] outline-none focus:border-[#167C86] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: ACTIVATION */}
              <div className="space-y-2 border-t border-[#DCE6E9] pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                  SECTION D
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#172126] font-semibold">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="size-4 accent-[#167C86]"
                  />
                  Activate promo code immediately upon creation
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-[#DCE6E9]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
                  className="rounded-xl text-xs font-semibold text-[#52636B] hover:text-[#172126] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-6 h-10 hover:bg-[#172126]/90 border border-[#172126]"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingCoupon
                    ? 'Save Promotion'
                    : 'Create Promotion'}
                </Button>
              </div>
            </form>

            {/* LIVE CUSTOMER CHECKOUT PREVIEW PANEL */}
            <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C86] block">
                LIVE CHECKOUT PREVIEW
              </span>

              <div className="rounded-xl border border-[#DCE6E9] bg-white p-3 space-y-2.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[#52636B]">
                  <span className="font-medium">Have a promo code?</span>
                  <Tag className="size-3.5 text-[#167C86]" />
                </div>

                <div className="flex gap-2 pt-0.5">
                  <div className="flex-1 h-8 rounded-lg border border-[#DCE6E9] bg-[#FAF7F2] px-2.5 text-[11px] font-mono font-bold text-[#172126] flex items-center">
                    {previewCode}
                  </div>
                  <div className="h-8 rounded-lg bg-[#172126] text-white text-[11px] font-semibold px-3 flex items-center">
                    Apply
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DCE6E9] space-y-1 text-[11px]">
                  <div className="flex items-center gap-1 text-[#167C86] font-semibold">
                    <CheckCircle2 className="size-3 text-[#167C86]" />
                    <span>{previewDiscountText}</span>
                  </div>
                  <p className="text-[10px] text-[#7A8A91] font-light">
                    Minimum order: {formatINR(Number(form.minOrder) || 0)}
                  </p>
                  {form.maxDiscount && (
                    <p className="text-[10px] text-[#7A8A91] font-light">
                      Maximum saving: {formatINR(Number(form.maxDiscount))}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[#7A8A91] font-light leading-snug">
                Visual preview of how customer carts calculate this code at storefront checkout.
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
        <div className="space-y-4 pt-2 text-xs text-[#52636B]">
          <p>
            Are you sure you want to delete this promotional code? Customers will no longer be able to apply it at checkout.
          </p>
          <div className="pt-4 flex justify-end gap-2 border-t border-[#DCE6E9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="text-xs rounded-xl border-[#DCE6E9] text-[#172126]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Promotion'}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
