import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Wand2,
  Info,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { productService } from '@/services/productService'
import { useToast } from '@/hooks/useToast'
import { Stepper } from '@/components/common/Stepper'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { AppModal } from '@/components/common/AppModal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { SmartImage } from '@/components/common/SmartImage'
import { CONCERNS, SKIN_TYPES } from '@/features/ai/consultationQuestions'
import { cn, formatINR } from '@/utils'
import type { Concern, Product, SkinType } from '@/types'

const STEPS = [
  { key: 'basics', label: 'Basics & Pricing' },
  { key: 'content', label: 'Product Content' },
  { key: 'details', label: 'Actives & Target' },
  { key: 'publish', label: 'Media & Publish' },
]

const DEFAULT_CATEGORIES = [
  { slug: 'serum', name: 'Serum & Treatments', id: 'c3' },
  { slug: 'face-wash', name: 'Face Wash & Cleansers', id: 'c1' },
  { slug: 'toner', name: 'Toners & Essence', id: 'c2' },
  { slug: 'moisturizer', name: 'Moisturizer & Hydration', id: 'c4' },
  { slug: 'sunscreen', name: 'Sun Protection (SPF)', id: 'c5' },
  { slug: 'body-wash', name: 'Body Care & Wash', id: 'c6' },
  { slug: 'baby-care', name: 'Baby Care', id: 'c7' },
]

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()

  // Dynamic Categories Query
  const { data: fetchedCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => productService().getCategories(),
  })

  const categories = useMemo(() => {
    if (fetchedCategories && fetchedCategories.length > 0) {
      return fetchedCategories.map((c) => ({
        slug: c.slug,
        name: c.name,
        id: c.id,
      }))
    }
    return DEFAULT_CATEGORIES
  }, [fetchedCategories])

  // Existing Product Query (for Edit mode)
  const { data: existing, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productService().getProductById(id ?? ''),
    enabled: isEdit,
  })

  const [step, setStep] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form State Architecture
  const [form, setForm] = useState(() => ({
    name: '',
    brand: 'Bareo',
    sku: '',
    categoryId: 'c3',
    categorySlug: 'serum',
    categoryName: 'Serum & Treatments',
    mrp: '',
    offerPrice: '',
    stock: '50',
    status: 'active' as 'active' | 'inactive' | 'out-of-stock',
    shortDescription: '',
    description: '',
    benefits: ['Supports skin barrier health and elasticity', 'Lightweight non-sticky daily formulation'] as string[],
    usage: ['Apply 2-3 drops to cleansed face and neck morning & night.', 'Follow with Bareo hydration cream.'] as string[],
    keyFacts: ['Dermatologically formulated in India', '100% Clean, vegan & cruelty-free active science'] as string[],
    ingredients: [
      { name: 'Niacinamide', concentration: '10%', description: 'Supports barrier repair and texture refinement.' },
      { name: 'Centella Asiatica', concentration: '5%', description: 'Soothes and calms visible skin redness.' },
    ] as { name: string; concentration: string; description: string }[],
    tags: [] as string[],
    skinTypes: ['combination', 'sensitive', 'dry'] as string[],
    concerns: ['redness', 'dehydration', 'barrier-damage'] as string[],
    images: [{ url: '/images/products/bareo-cica-serum.png', alt: '' }] as { url: string; alt?: string }[],
    isBestSeller: false,
    isTrending: false,
    isDoctorRecommended: true,
    isAiRecommended: true,
  }))

  const set = (patch: Partial<typeof form>) => {
    setIsDirty(true)
    setForm((f) => ({ ...f, ...patch }))
  }

  // Pre-fill Edit Mode
  useEffect(() => {
    if (!existing) return
    setForm({
      name: existing.name ?? '',
      brand: existing.brand ?? 'Bareo',
      sku: existing.sku ?? `BAR-${(existing.categorySlug || 'FORM').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: existing.categoryId ?? 'c3',
      categorySlug: existing.categorySlug ?? 'serum',
      categoryName: existing.categoryName ?? 'Serum & Treatments',
      mrp: String(existing.mrp ?? ''),
      offerPrice: String(existing.offerPrice ?? ''),
      stock: String(existing.stock ?? 50),
      status: (existing.status as any) ?? 'active',
      shortDescription: existing.shortDescription ?? '',
      description: existing.description ?? '',
      benefits: existing.benefits && existing.benefits.length > 0 ? existing.benefits : ['Supports skin barrier health'],
      usage: existing.usage && existing.usage.length > 0 ? existing.usage : ['Apply 2-3 drops to clean skin.'],
      keyFacts: existing.keyFacts && existing.keyFacts.length > 0 ? existing.keyFacts : ['Dermatologist tested'],
      ingredients:
        Array.isArray(existing.ingredients) && existing.ingredients.length > 0
          ? existing.ingredients.map((ing) => ({
              name: typeof ing === 'string' ? ing : ing.name,
              concentration: typeof ing === 'object' && ing.concentration ? ing.concentration : 'Active',
              description: typeof ing === 'object' && ing.description ? ing.description : ing.name || '',
            }))
          : [{ name: 'Niacinamide', concentration: '10%', description: 'Skin barrier support' }],
      tags: existing.tags ?? [],
      skinTypes: existing.skinTypes ?? [],
      concerns: existing.concerns ?? [],
      images:
        Array.isArray(existing.images) && existing.images.length > 0
          ? existing.images.map((img: any) => ({
              url: typeof img === 'string' ? img : img.url || '/images/products/bareo-cica-serum.png',
              alt: typeof img === 'object' ? img.alt || existing.name : existing.name,
            }))
          : [{ url: '/images/products/bareo-cica-serum.png', alt: existing.name }],
      isBestSeller: !!existing.isBestSeller,
      isTrending: !!existing.isTrending,
      isDoctorRecommended: !!existing.isDoctorRecommended,
      isAiRecommended: !!existing.isAiRecommended,
    })
    setIsDirty(false)
  }, [existing])

  // Automatic Discount Calculation
  const computedDiscount = useMemo(() => {
    const mrp = Number(form.mrp)
    const offer = Number(form.offerPrice)
    if (mrp > 0 && offer > 0 && mrp >= offer) {
      return Math.round(((mrp - offer) / mrp) * 100)
    }
    return 0
  }, [form.mrp, form.offerPrice])

  // SKU Generator Handler
  const handleGenerateSku = () => {
    const catCode = (form.categorySlug || 'serum').substring(0, 3).toUpperCase()
    const randNum = Math.floor(100 + Math.random() * 900)
    const generatedSku = `BAR-${catCode}-${randNum}`
    set({ sku: generatedSku })
    if (errors.sku) setErrors((e) => ({ ...e, sku: '' }))
  }

  // Save Mutation
  const save = useMutation({
    mutationFn: async () => {
      const payload: Partial<Product> = {
        name: form.name.trim(),
        brand: form.brand.trim() || 'Bareo',
        sku: form.sku.trim() || `BAR-FORM-${Math.floor(100 + Math.random() * 900)}`,
        categoryId: form.categoryId,
        categorySlug: form.categorySlug,
        categoryName: form.categoryName,
        mrp: Number(form.mrp) || Number(form.offerPrice) || 0,
        offerPrice: Number(form.offerPrice) || 0,
        discount: computedDiscount,
        stock: Number(form.stock) || 0,
        status: form.status,
        shortDescription: form.shortDescription.trim() || form.name.trim(),
        description: form.description.trim() || form.name.trim(),
        benefits: form.benefits.map((b) => b.trim()).filter(Boolean),
        usage: form.usage.map((u) => u.trim()).filter(Boolean),
        keyFacts: form.keyFacts.map((k) => k.trim()).filter(Boolean),
        ingredients: form.ingredients.map((ing) => ({
          name: ing.name.trim(),
          concentration: ing.concentration.trim(),
          description: ing.description.trim() || ing.name.trim(),
        })),
        tags: form.tags,
        skinTypes: form.skinTypes as SkinType[],
        concerns: form.concerns as Concern[],
        isBestSeller: form.isBestSeller,
        isTrending: form.isTrending,
        isDoctorRecommended: form.isDoctorRecommended,
        isAiRecommended: form.isAiRecommended,
        images: form.images.length > 0 ? form.images : [{ url: '/images/products/bareo-cica-serum.png', alt: form.name }],
      }

      if (isEdit && id) {
        return adminService().updateProduct(id, payload)
      } else {
        return adminService().createProduct(payload as any)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(isEdit ? 'Formulation updated' : 'Formulation created', 'Live storefront catalog synchronized.')
      setIsDirty(false)
      navigate('/admin/products')
    },
    onError: (err) => {
      toast.error('Save failed', (err as Error).message || 'Unable to save formulation')
    },
  })

  // Explicit Step Validation Rules
  const validateStep = (targetStep: number): boolean => {
    const errs: Record<string, string> = {}

    if (targetStep === 0) {
      if (!form.name.trim()) errs.name = 'Product name is required'
      if (!form.sku.trim()) errs.sku = 'SKU identifier is required'
      if (!form.offerPrice || Number(form.offerPrice) <= 0) errs.offerPrice = 'Enter a valid selling price (> 0)'
      if (form.mrp && Number(form.mrp) > 0 && Number(form.offerPrice) > Number(form.mrp)) {
        errs.offerPrice = 'Selling price cannot exceed MRP'
      }
      if (!form.stock || Number(form.stock) < 0) errs.stock = 'Stock cannot be negative'
    }

    if (targetStep === 1) {
      if (!form.shortDescription.trim()) errs.shortDescription = 'Short description is required'
      if (!form.description.trim()) errs.description = 'Full product description is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(STEPS.length - 1, s + 1))
    } else {
      toast.error('Validation notice', 'Please complete all required fields on this step.')
    }
  }

  const handleCancelNavigation = () => {
    if (isDirty) {
      setShowDiscardModal(true)
    } else {
      navigate('/admin/products')
    }
  }

  if (isEdit && isLoadingExisting) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-10">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-[450px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* CONTEXT LABEL & EDITORIAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelNavigation}
            className="flex size-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#111111] hover:bg-[#FAFAFA] transition-colors shadow-2xs shrink-0"
            aria-label="Back to Product Catalogue"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] block">
              PRODUCT CATALOGUE / FORMULATION
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-0.5">
              {isEdit ? 'Edit Formulation' : 'Create New Formulation'}
            </h1>
            <p className="text-xs text-[#6B7280] font-light mt-0.5">
              {isEdit
                ? 'Update product information, pricing, inventory, and storefront visibility.'
                : 'Build and publish a new Bareo formulation to the storefront.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelNavigation}
            className="rounded-xl border-[#E5E7EB] text-xs font-semibold text-[#374151]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => save.mutate()}
            loading={save.isPending}
            className="rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all shadow-2xs"
          >
            {isEdit ? 'Save Changes' : 'Publish Formulation'}
          </Button>
        </div>
      </div>

      {/* REFINED HORIZONTAL STEPPER */}
      <Stepper steps={STEPS} current={step} onStepClick={(s) => s < step && setStep(s)} />

      {/* 2-COLUMN RESPONSIVE COMPOSITION (~68% Left / ~32% Right) */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        {/* LEFT COLUMN: FOCUSED EDITING SURFACE */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs space-y-8">
          {/* STEP 1: BASICS & PRICING */}
          {step === 0 && (
            <div className="space-y-6">
              {/* SECTION A: FORMULATION IDENTITY */}
              <div className="space-y-4">
                <div className="border-b border-[#F3F4F6] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">SECTION A — FORMULATION IDENTITY</h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-[#111111]">Product Name</Label>
                    <span className="text-[10px] font-medium text-rose-600">Required</span>
                  </div>
                  <AppInput
                    value={form.name}
                    onChange={(e) => {
                      set({ name: e.target.value })
                      if (errors.name) setErrors((err) => ({ ...err, name: '' }))
                    }}
                    placeholder="e.g. Bareo Cica & Niacinamide Calming Serum"
                    error={errors.name}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AppInput
                    label="Brand Name"
                    value={form.brand}
                    onChange={(e) => set({ brand: e.target.value })}
                    placeholder="Bareo"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-[#111111]">SKU Identifier</Label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[11px] font-semibold text-[#7C3AED] hover:underline inline-flex items-center gap-1"
                      >
                        <Wand2 className="size-3" /> Auto-generate
                      </button>
                    </div>
                    <AppInput
                      value={form.sku}
                      onChange={(e) => {
                        set({ sku: e.target.value })
                        if (errors.sku) setErrors((err) => ({ ...err, sku: '' }))
                      }}
                      placeholder="e.g. BAR-SER-001"
                      error={errors.sku}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AppSelect
                    label="Category *"
                    value={form.categorySlug}
                    options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                    onValueChange={(val) => {
                      const found = categories.find((c) => c.slug === val)
                      set({
                        categorySlug: val,
                        categoryName: found?.name || val,
                        categoryId: found?.id || 'c3',
                      })
                    }}
                  />

                  <AppSelect
                    label="Storefront Status *"
                    value={form.status}
                    options={[
                      { value: 'active', label: '● Live (Visible on Storefront)' },
                      { value: 'inactive', label: '● Hidden (Draft / Hidden)' },
                      { value: 'out-of-stock', label: '● Out of Stock' },
                    ]}
                    onValueChange={(val) => set({ status: val as any })}
                  />
                </div>
              </div>

              {/* SECTION B: COMMERCIALS & PRICING */}
              <div className="space-y-4 pt-4 border-t border-[#F3F4F6]">
                <div className="border-b border-[#F3F4F6] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">SECTION B — COMMERCIALS</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="MRP (₹)"
                    type="number"
                    value={form.mrp}
                    onChange={(e) => set({ mrp: e.target.value })}
                    placeholder="999"
                  />

                  <AppInput
                    label="Selling Price (₹) *"
                    type="number"
                    value={form.offerPrice}
                    onChange={(e) => {
                      set({ offerPrice: e.target.value })
                      if (errors.offerPrice) setErrors((err) => ({ ...err, offerPrice: '' }))
                    }}
                    placeholder="699"
                    error={errors.offerPrice}
                  />

                  <AppInput
                    label="Stock Units *"
                    type="number"
                    value={form.stock}
                    onChange={(e) => {
                      set({ stock: e.target.value })
                      if (errors.stock) setErrors((err) => ({ ...err, stock: '' }))
                    }}
                    placeholder="50"
                    error={errors.stock}
                  />
                </div>

                {/* PREMIUM CUSTOMER DISCOUNT INFORMATION STRIP */}
                {computedDiscount > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/80 px-4 py-3 text-xs text-emerald-900">
                    <div>
                      <span className="font-semibold block text-[#111111]">Customer Discount</span>
                      <span className="text-[11px] text-emerald-700 font-light">Automatically calculated from MRP and selling price.</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-sm">{computedDiscount}% OFF</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PRODUCT CONTENT */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#F3F4F6] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">PRODUCT STORY</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-[#111111]">Short Description</Label>
                    <span className="text-[10px] font-medium text-rose-600">Required</span>
                  </div>
                  <Textarea
                    rows={2}
                    value={form.shortDescription}
                    onChange={(e) => {
                      set({ shortDescription: e.target.value })
                      if (errors.shortDescription) setErrors((err) => ({ ...err, shortDescription: '' }))
                    }}
                    placeholder="Brief summary of dermal benefits (e.g. 10% Niacinamide & 5% Centella for barrier calming)"
                    className="rounded-xl border-[#E5E7EB] text-xs focus:border-[#111111]"
                  />
                  {errors.shortDescription && <p className="text-xs text-rose-600 font-medium mt-1">{errors.shortDescription}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-[#111111]">Full Formulation Science Description</Label>
                    <span className="text-[10px] font-medium text-rose-600">Required</span>
                  </div>
                  <Textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => {
                      set({ description: e.target.value })
                      if (errors.description) setErrors((err) => ({ ...err, description: '' }))
                    }}
                    placeholder="Detailed breakdown of formulation science, clinical active ingredients, and dermal barrier restoration..."
                    className="rounded-xl border-[#E5E7EB] text-xs focus:border-[#111111]"
                  />
                  {errors.description && <p className="text-xs text-rose-600 font-medium mt-1">{errors.description}</p>}
                </div>

                {/* NUMBERED KEY BENEFITS */}
                <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">KEY BENEFITS</h3>
                    <button
                      type="button"
                      onClick={() => set({ benefits: [...form.benefits, ''] })}
                      className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="size-3.5" /> Add benefit
                    </button>
                  </div>

                  {form.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#9CA3AF] w-6 text-right shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const updated = [...form.benefits]
                          updated[idx] = e.target.value
                          set({ benefits: updated })
                        }}
                        placeholder={`Benefit ${String(idx + 1).padStart(2, '0')}`}
                        className="h-10 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
                      />
                      <button
                        type="button"
                        onClick={() => set({ benefits: form.benefits.filter((_, i) => i !== idx) })}
                        className="flex size-9 items-center justify-center rounded-xl text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* NUMBERED HOW TO USE STEPS */}
                <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">HOW TO USE</h3>
                    <button
                      type="button"
                      onClick={() => set({ usage: [...form.usage, ''] })}
                      className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="size-3.5" /> Add step
                    </button>
                  </div>

                  {form.usage.map((u, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#9CA3AF] w-6 text-right shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        value={u}
                        onChange={(e) => {
                          const updated = [...form.usage]
                          updated[idx] = e.target.value
                          set({ usage: updated })
                        }}
                        placeholder={`Step ${String(idx + 1).padStart(2, '0')}`}
                        className="h-10 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
                      />
                      <button
                        type="button"
                        onClick={() => set({ usage: form.usage.filter((_, i) => i !== idx) })}
                        className="flex size-9 items-center justify-center rounded-xl text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACTIVES & TARGET */}
          {step === 2 && (
            <div className="space-y-6">
              {/* STRUCTURED ACTIVE INGREDIENTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">ACTIVE INGREDIENTS</h3>
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        ingredients: [
                          ...form.ingredients,
                          { name: '', concentration: '', description: '' },
                        ],
                      })
                    }
                    className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="size-3.5" /> Add Ingredient
                  </button>
                </div>

                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]/60 p-3.5 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => {
                          const updated = [...form.ingredients]
                          updated[idx].name = e.target.value
                          set({ ingredients: updated })
                        }}
                        placeholder="Ingredient (e.g. Niacinamide)"
                        className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111]"
                      />
                      <input
                        type="text"
                        value={ing.concentration}
                        onChange={(e) => {
                          const updated = [...form.ingredients]
                          updated[idx].concentration = e.target.value
                          set({ ingredients: updated })
                        }}
                        placeholder="Concentration (e.g. 10%)"
                        className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ing.description}
                        onChange={(e) => {
                          const updated = [...form.ingredients]
                          updated[idx].description = e.target.value
                          set({ ingredients: updated })
                        }}
                        placeholder="Dermal description (e.g. Supports barrier repair...)"
                        className="h-9 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111]"
                      />
                      <button
                        type="button"
                        onClick={() => set({ ingredients: form.ingredients.filter((_, i) => i !== idx) })}
                        className="flex size-9 items-center justify-center rounded-lg text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUITABLE FOR SKIN TYPES */}
              <div className="space-y-2.5 pt-4 border-t border-[#F3F4F6]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">SUITABLE FOR</h3>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPES.map((t) => {
                    const active = form.skinTypes.includes(t.value)
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          set({
                            skinTypes: active
                              ? form.skinTypes.filter((x) => x !== t.value)
                              : [...form.skinTypes, t.value],
                          })
                        }
                        className={cn(
                          'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border',
                          active
                            ? 'bg-[#111111] text-white border-[#111111] shadow-2xs'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#FAFAFA]'
                        )}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TARGET CONCERNS */}
              <div className="space-y-2.5 pt-4 border-t border-[#F3F4F6]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">TARGET CONCERNS</h3>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map((c) => {
                    const active = form.concerns.includes(c.value)
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          set({
                            concerns: active
                              ? form.concerns.filter((x) => x !== c.value)
                              : [...form.concerns, c.value],
                          })
                        }
                        className={cn(
                          'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border',
                          active
                            ? 'bg-[#111111] text-white border-[#111111] shadow-2xs'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#FAFAFA]'
                        )}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STOREFRONT SIGNALS & BADGES */}
              <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">STOREFRONT SIGNALS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3">
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">Bestseller</p>
                      <p className="text-[11px] text-[#6B7280]">Featured on home bestsellers rail</p>
                    </div>
                    <Switch checked={form.isBestSeller} onCheckedChange={(c) => set({ isBestSeller: c })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3">
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">Trending</p>
                      <p className="text-[11px] text-[#6B7280]">Show on trending carousel</p>
                    </div>
                    <Switch checked={form.isTrending} onCheckedChange={(c) => set({ isTrending: c })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3">
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">Doctor Recommended</p>
                      <p className="text-[11px] text-[#6B7280]">Add clinical recommendation seal</p>
                    </div>
                    <Switch checked={form.isDoctorRecommended} onCheckedChange={(c) => set({ isDoctorRecommended: c })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-3">
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">AI Diagnostic Match</p>
                      <p className="text-[11px] text-[#6B7280]">Include in AI skin diagnostic engine</p>
                    </div>
                    <Switch checked={form.isAiRecommended} onCheckedChange={(c) => set({ isAiRecommended: c })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MEDIA & PUBLISH */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border-b border-[#F3F4F6] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">MEDIA &amp; STOREFRONT ASSETS</h3>
                </div>

                {/* PRIMARY IMAGE BLOCK */}
                <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">PRIMARY IMAGE</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Storefront Cover
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <SmartImage
                      src={form.images[0]?.url || '/images/products/bareo-cica-serum.png'}
                      alt="Primary Cover"
                      className="size-16 rounded-xl object-contain bg-white border border-[#E5E7EB] p-1.5 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] font-semibold text-[#6B7280]">Image URL</Label>
                      <input
                        type="text"
                        value={form.images[0]?.url || ''}
                        onChange={(e) => {
                          const updated = [...form.images]
                          if (updated[0]) updated[0].url = e.target.value
                          else updated[0] = { url: e.target.value, alt: form.name }
                          set({ images: updated })
                        }}
                        placeholder="https://... or /images/products/bareo-cica-serum.png"
                        className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECONDARY IMAGES LIST */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">SECONDARY IMAGES</h3>
                    <button
                      type="button"
                      onClick={() => set({ images: [...form.images, { url: '/images/products/bareo-cica-serum.png', alt: form.name }] })}
                      className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="size-3.5" /> Add image
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.images.slice(1).map((img, idx) => {
                      const realIdx = idx + 1
                      return (
                        <div key={realIdx} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
                          <SmartImage
                            src={img.url}
                            alt={`Secondary #${realIdx}`}
                            className="size-10 rounded-lg object-contain bg-[#FAFAFA] border border-[#E5E7EB] p-1 shrink-0"
                          />
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const updated = [...form.images]
                              updated[realIdx].url = e.target.value
                              set({ images: updated })
                            }}
                            placeholder="Image URL"
                            className="h-9 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs text-[#111111]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...form.images]
                              const [moved] = updated.splice(realIdx, 1)
                              updated.unshift(moved)
                              set({ images: updated })
                            }}
                            className="text-[11px] font-semibold text-[#7C3AED] hover:underline shrink-0"
                          >
                            Set primary
                          </button>
                          <button
                            type="button"
                            onClick={() => set({ images: form.images.filter((_, i) => i !== realIdx) })}
                            className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:text-rose-600 transition-colors shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* FORMULATION SUMMARY REVIEW */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 space-y-4">
                <h3 className="font-serif text-base font-normal text-[#111111]">FORMULATION SUMMARY</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#9CA3AF] block font-light">Product Title &amp; SKU</span>
                    <span className="font-semibold text-[#111111]">{form.name || 'Untitled'}</span>
                    <span className="text-[#6B7280] block">SKU: {form.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block font-light">Selling Price</span>
                    <span className="font-semibold text-[#111111]">{formatINR(Number(form.offerPrice) || 0)}</span>
                    {computedDiscount > 0 && <span className="text-emerald-700 font-bold block">{computedDiscount}% OFF</span>}
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block font-light">Category &amp; Inventory</span>
                    <span className="font-semibold text-[#111111]">{form.categoryName}</span>
                    <span className="text-[#6B7280] block">{form.stock} units in stock</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block font-light">Storefront Status</span>
                    <span className="font-semibold capitalize text-[#111111]">{form.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STICKY BOTTOM ACTION FOOTER BAR */}
          <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl border-[#E5E7EB] text-xs font-semibold text-[#374151]"
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  set({ status: 'inactive' })
                  save.mutate()
                }}
                loading={save.isPending}
                className="rounded-xl border-[#E5E7EB] text-xs font-semibold text-[#374151]"
              >
                Save Draft
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all shadow-2xs"
                >
                  Next Step <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => save.mutate()}
                  loading={save.isPending}
                  className="rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all shadow-2xs"
                >
                  {isEdit ? 'Save Changes' : 'Publish Formulation'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE STOREFRONT PREVIEW PANEL (~32% Desktop) */}
        <aside className="sticky top-24 hidden lg:block space-y-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" /> LIVE STOREFRONT PREVIEW
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">Customer View</span>
            </div>

            {/* REALISTIC STOREFRONT CARD PREVIEW STAGE */}
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]/60 p-4 space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-[#E5E7EB] p-2 flex items-center justify-center">
                <SmartImage
                  src={
                    (typeof form.images[0]?.url === 'string' ? form.images[0].url : (form.images[0] as any)) ||
                    '/images/products/bareo-cica-serum.png'
                  }
                  alt={form.name || 'Preview'}
                  className="h-full w-full object-contain"
                />
                {computedDiscount > 0 && (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-[#111111] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    {computedDiscount}% OFF
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  {form.brand || 'BAREO'}
                </p>
                <h4 className="font-serif text-sm font-semibold text-[#111111] line-clamp-1">
                  {form.name || 'Bareo Active Formulation'}
                </h4>
                <p className="text-[11px] text-[#6B7280] font-light line-clamp-2 leading-relaxed">
                  {form.shortDescription || 'Dermatologically formulated active skincare designed for everyday barrier health.'}
                </p>
              </div>

              <div className="flex items-baseline justify-between pt-2.5 border-t border-[#E5E7EB]">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-base font-bold text-[#111111]">
                    {formatINR(Number(form.offerPrice) || 299)}
                  </span>
                  {Number(form.mrp) > Number(form.offerPrice) && (
                    <span className="text-[10px] text-[#9CA3AF] line-through">
                      {formatINR(Number(form.mrp))}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {form.status === 'active' ? '● Live' : '● Hidden'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#6B7280] font-light bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E7EB]">
              <Info className="size-4 text-[#111111] shrink-0" />
              <span>Preview updates in real-time as formulation parameters are modified.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* DISCARD UNSAVED CHANGES MODAL */}
      <AppModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="Discard unsaved changes?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-[#6B7280] leading-relaxed">
            You have unsaved changes in this formulation profile. If you discard, all typed parameters will be lost.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDiscardModal(false)}
              className="rounded-xl border-[#E5E7EB] text-xs font-semibold"
            >
              Keep Editing
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDiscardModal(false)
                setIsDirty(false)
                navigate('/admin/products')
              }}
              className="rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
