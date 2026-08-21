import { useState, useMemo } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { formatINR, cn } from '@/utils'
import { getCatalog } from '@/services/productStore'

export interface ShopFilters {
  concern: string[]
  skinType: string[]
  productType?: string[]
  ingredient?: string[]
  price: [number, number]
  minRating: number
  inStockOnly: boolean
}

interface FiltersPanelProps {
  category?: string
  filters: ShopFilters
  priceBounds: [number, number]
  onChange: (next: Partial<ShopFilters>) => void
  onReset: () => void
  resultCount?: number
  className?: string
}

interface FilterOption {
  value: string
  label: string
  count: number
}

// Contextually & Semantically Audited Filter Taxonomies
const CATEGORY_CONFIGS: Record<
  string,
  {
    primaryConcernTitle: string
    concerns: FilterOption[]
    secondaryTitle: string
    secondaryOptions: FilterOption[]
    productTypes: FilterOption[]
    ingredients: FilterOption[]
  }
> = {
  skincare: {
    primaryConcernTitle: 'Skin Concern',
    concerns: [
      { value: 'acne', label: 'Acne & Breakouts', count: 18 },
      { value: 'dryness', label: 'Dryness & Dehydration', count: 12 },
      { value: 'oiliness', label: 'Oiliness & Sebum', count: 14 },
      { value: 'pigmentation', label: 'Pigmentation & Dark Spots', count: 10 },
      { value: 'sensitivity', label: 'Redness & Sensitivity', count: 9 },
    ],
    secondaryTitle: 'Skin Type',
    secondaryOptions: [
      { value: 'dry', label: 'Dry Skin', count: 19 },
      { value: 'oily', label: 'Oily Skin', count: 22 },
      { value: 'combination', label: 'Combination Skin', count: 24 },
      { value: 'normal', label: 'Normal Skin', count: 28 },
      { value: 'sensitive', label: 'Sensitive Skin', count: 14 },
    ],
    productTypes: [
      { value: 'cleanser', label: 'Cleanser & Face Wash', count: 8 },
      { value: 'serum', label: 'Active Serum', count: 12 },
      { value: 'moisturizer', label: 'Moisturizer & Cream', count: 10 },
      { value: 'sunscreen', label: 'Sunscreen & SPF 50', count: 6 },
      { value: 'treatment', label: 'Exfoliant & Treatment', count: 7 },
      { value: 'toner', label: 'Toner & Essence', count: 5 },
    ],
    ingredients: [
      { value: 'niacinamide', label: 'Niacinamide (5%)', count: 12 },
      { value: 'hyaluronic-acid', label: 'Hyaluronic Acid', count: 15 },
      { value: 'centella', label: 'Centella Asiatica', count: 8 },
      { value: 'salicylic-acid', label: 'Salicylic Acid (BHA)', count: 7 },
      { value: 'vitamin-c', label: 'Vitamin C', count: 9 },
      { value: 'retinol', label: 'Retinaldehyde', count: 6 },
    ],
  },
  'hair-care': {
    primaryConcernTitle: 'Hair Concern',
    concerns: [
      { value: 'hair-fall', label: 'Hair Fall & Loss', count: 8 },
      { value: 'dandruff', label: 'Dandruff & Flaking', count: 6 },
      { value: 'frizz', label: 'Frizz & Heat Damage', count: 7 },
      { value: 'thinning', label: 'Hair Thinning', count: 5 },
      { value: 'dry-scalp', label: 'Dry Scalp Irritation', count: 9 },
    ],
    secondaryTitle: 'Hair & Scalp Type',
    secondaryOptions: [
      { value: 'oily-scalp', label: 'Oily Scalp', count: 10 },
      { value: 'dry-scalp', label: 'Dry Scalp', count: 8 },
      { value: 'normal-scalp', label: 'Normal Scalp', count: 15 },
      { value: 'curly', label: 'Curly & Textured Hair', count: 14 },
    ],
    productTypes: [
      { value: 'shampoo', label: 'Cleansing Shampoo', count: 7 },
      { value: 'conditioner', label: 'Nourishing Conditioner', count: 6 },
      { value: 'hair-serum', label: 'Scalp Serum', count: 5 },
      { value: 'scalp-treatment', label: 'Scalp Exfoliant', count: 4 },
    ],
    ingredients: [
      { value: 'biotin', label: 'Biotin & Peptides', count: 6 },
      { value: 'argan-oil', label: 'Argan Oil', count: 8 },
      { value: 'rosemary', label: 'Rosemary Extract', count: 5 },
      { value: 'tea-tree', label: 'Tea Tree Oil', count: 4 },
    ],
  },
  'body-care': {
    primaryConcernTitle: 'Body Concern',
    concerns: [
      { value: 'body-dryness', label: 'Dehydrated Body Skin', count: 11 },
      { value: 'kp', label: 'Keratosis Pilaris', count: 5 },
      { value: 'body-acne', label: 'Back & Chest Acne', count: 6 },
      { value: 'rough-skin', label: 'Elbow & Heel Roughness', count: 8 },
    ],
    secondaryTitle: 'Body Skin Type',
    secondaryOptions: [
      { value: 'dry', label: 'Very Dry Body Skin', count: 14 },
      { value: 'normal', label: 'Normal Body Skin', count: 18 },
      { value: 'sensitive', label: 'Sensitive Body Skin', count: 10 },
    ],
    productTypes: [
      { value: 'lotion', label: 'Hydrating Body Lotion', count: 8 },
      { value: 'cream', label: 'Barrier Cream', count: 9 },
      { value: 'body-wash', label: 'Soothing Body Wash', count: 7 },
      { value: 'body-butter', label: 'Intensive Butter', count: 5 },
    ],
    ingredients: [
      { value: 'ceramides', label: 'Triple Ceramides', count: 10 },
      { value: 'lactic-acid', label: 'Lactic Acid (AHA)', count: 6 },
      { value: 'shea-butter', label: 'Shea Butter', count: 7 },
      { value: 'niacinamide', label: 'Niacinamide', count: 8 },
    ],
  },
  'baby-care': {
    primaryConcernTitle: 'Baby Concern',
    concerns: [
      { value: 'diaper-rash', label: 'Diaper Rash & Redness', count: 4 },
      { value: 'sensitive-skin', label: 'Infant Skin Sensitivity', count: 8 },
      { value: 'cradle-cap', label: 'Cradle Cap Flaking', count: 3 },
      { value: 'dryness', label: 'Infant Dryness', count: 6 },
    ],
    secondaryTitle: 'Age Group',
    secondaryOptions: [
      { value: 'newborn', label: 'Newborn (0–6 Months)', count: 6 },
      { value: 'baby', label: 'Baby (6–24 Months)', count: 8 },
      { value: 'toddler', label: 'Toddler (2+ Years)', count: 10 },
    ],
    productTypes: [
      { value: 'baby-wash', label: 'Tear-Free Baby Wash', count: 5 },
      { value: 'baby-lotion', label: 'Gentle Baby Lotion', count: 6 },
      { value: 'rash-cream', label: 'Zinc Rash Cream', count: 3 },
    ],
    ingredients: [
      { value: 'chamomile', label: 'Organic Chamomile', count: 5 },
      { value: 'oat-milk', label: 'Colloidal Oat Milk', count: 7 },
      { value: 'calendula', label: 'Calendula Extract', count: 4 },
      { value: 'aloe', label: 'Pure Aloe Vera', count: 6 },
    ],
  },
}

function FilterAccordionSection({
  title,
  count = 0,
  defaultOpen = true,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[#E5E7EB] py-3.5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#111111] hover:text-[#6B7280] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {count > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </span>
        <ChevronDown className={cn('size-3.5 text-[#6B7280] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-2.5 space-y-0.5">{children}</div>}
    </div>
  )
}

export function FiltersPanel({
  category = 'skincare',
  filters,
  priceBounds,
  onChange,
  onReset,
  className,
}: FiltersPanelProps) {
  const catKey = (category || '').toLowerCase()
  const config =
    CATEGORY_CONFIGS[catKey] ||
    (catKey.includes('hair')
      ? CATEGORY_CONFIGS['hair-care']
      : catKey.includes('body')
      ? CATEGORY_CONFIGS['body-care']
      : catKey.includes('baby')
      ? CATEGORY_CONFIGS['baby-care']
      : CATEGORY_CONFIGS['skincare'])

  const allCatalog = getCatalog()
  const catProducts = useMemo(() => {
    if (!category || category === 'all' || category === 'all-products') return allCatalog
    return allCatalog.filter(
      (p) =>
        (p.categorySlug || '').toLowerCase() === catKey ||
        (p.categoryName || '').toLowerCase() === catKey ||
        (catKey === 'hair-care' && (p.categorySlug === 'haircare' || p.categoryName === 'Hair Care')) ||
        (catKey === 'body-care' && (p.categorySlug === 'bodycare' || p.categoryName === 'Body Care')) ||
        (catKey === 'baby-care' && (p.categorySlug === 'babycare' || p.categoryName === 'Baby Care'))
    )
  }, [allCatalog, category, catKey])

  const getOptionCount = (type: 'concern' | 'skinType' | 'productType' | 'ingredient', value: string, fallbackCount: number): number => {
    if (!catProducts || catProducts.length === 0) return fallbackCount
    const valLower = value.toLowerCase()
    if (type === 'concern') {
      const cnt = catProducts.filter((p) => (p.concerns || []).some((c) => (c || '').toLowerCase() === valLower)).length
      return cnt > 0 ? cnt : fallbackCount
    }
    if (type === 'skinType') {
      const cnt = catProducts.filter((p) =>
        (p.skinTypes || []).some((t) => {
          const l = (t || '').toLowerCase()
          return l === valLower || l === 'all' || l === 'all-skin-types'
        })
      ).length
      return cnt > 0 ? cnt : fallbackCount
    }
    return fallbackCount
  }

  const toggleIn = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const activeCount =
    filters.concern.length +
    filters.skinType.length +
    (filters.productType?.length ?? 0) +
    (filters.ingredient?.length ?? 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.price[0] > priceBounds[0] || filters.price[1] < priceBounds[1] ? 1 : 0)

  return (
    <div className={cn('space-y-1', className)}>
      {/* 1. Panel Top Action Bar */}
      <div className="pb-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="font-serif text-xs font-semibold tracking-widest uppercase text-[#172126]">
          FILTERS
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
          >
            <RotateCcw className="size-3" /> Clear all
          </button>
        )}
      </div>

      {/* 2. Primary Category Concern Section */}
      <FilterAccordionSection title={config.primaryConcernTitle} count={filters.concern.length}>
        <div className="space-y-0.5">
          {config.concerns.map((opt) => {
            const selected = filters.concern.includes(opt.value)
            const count = getOptionCount('concern', opt.value, opt.count)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
                  selected
                    ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
                    : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onChange({ concern: toggleIn(filters.concern, opt.value) })}
                    className="size-4 rounded border-[#D1D5DB] accent-[#111111]"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono ml-auto">{count}</span>
              </label>
            )
          })}
        </div>
      </FilterAccordionSection>

      {/* 3. Secondary Category Feature Section */}
      <FilterAccordionSection title={config.secondaryTitle} count={filters.skinType.length}>
        <div className="space-y-0.5">
          {config.secondaryOptions.map((opt) => {
            const selected = filters.skinType.includes(opt.value)
            const count = getOptionCount('skinType', opt.value, opt.count)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
                  selected
                    ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
                    : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onChange({ skinType: toggleIn(filters.skinType, opt.value) })}
                    className="size-4 rounded border-[#D1D5DB] accent-[#111111]"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono ml-auto">{count}</span>
              </label>
            )
          })}
        </div>
      </FilterAccordionSection>

      {/* 4. Product Type Section */}
      <FilterAccordionSection title="Product Type" count={filters.productType?.length ?? 0} defaultOpen={false}>
        <div className="space-y-0.5">
          {config.productTypes.map((opt) => {
            const currentList = filters.productType ?? []
            const selected = currentList.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
                  selected
                    ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
                    : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onChange({ productType: toggleIn(currentList, opt.value) })}
                    className="size-4 rounded border-[#D1D5DB] accent-[#111111]"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono ml-auto">{opt.count}</span>
              </label>
            )
          })}
        </div>
      </FilterAccordionSection>

      {/* 5. Key Ingredients Section */}
      <FilterAccordionSection title="Key Ingredients" count={filters.ingredient?.length ?? 0} defaultOpen={false}>
        <div className="space-y-0.5">
          {config.ingredients.map((opt) => {
            const currentList = filters.ingredient ?? []
            const selected = currentList.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
                  selected
                    ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
                    : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onChange({ ingredient: toggleIn(currentList, opt.value) })}
                    className="size-4 rounded border-[#D1D5DB] accent-[#111111]"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono ml-auto">{opt.count}</span>
              </label>
            )
          })}
        </div>
      </FilterAccordionSection>

      {/* 6. Price Range Slider */}
      <FilterAccordionSection
        title="Price"
        count={filters.price[0] > priceBounds[0] || filters.price[1] < priceBounds[1] ? 1 : 0}
        defaultOpen={false}
      >
        <div className="px-0.5 py-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#111111]">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] px-3 py-1.5 text-center flex-1">
              <span className="text-[10px] text-[#6B7280] font-normal block leading-tight">Min</span>
              <span className="font-semibold text-xs text-[#111111]">{formatINR(filters.price[0])}</span>
            </div>
            <span className="text-[#9CA3AF] px-2 font-light">–</span>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] px-3 py-1.5 text-center flex-1">
              <span className="text-[10px] text-[#6B7280] font-normal block leading-tight">Max</span>
              <span className="font-semibold text-xs text-[#111111]">{formatINR(filters.price[1])}</span>
            </div>
          </div>

          <div className="pt-2 pb-1">
            <Slider
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={50}
              value={filters.price}
              onValueChange={(v) => onChange({ price: v as [number, number] })}
            />
          </div>
        </div>
      </FilterAccordionSection>

      {/* 7. Rating Accordion */}
      <FilterAccordionSection title="Rating" defaultOpen={false}>
        <div className="space-y-0.5">
          {[0, 4, 4.5].map((r) => {
            const selected = filters.minRating === r
            return (
              <label
                key={r}
                className={cn(
                  'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
                  selected
                    ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
                    : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="minRating"
                    checked={selected}
                    onChange={() => onChange({ minRating: r })}
                    className="size-4 rounded-full border-[#D1D5DB] accent-[#111111]"
                  />
                  <span>{r === 0 ? 'All Ratings' : `${r}★ & above`}</span>
                </div>
              </label>
            )
          })}
        </div>
      </FilterAccordionSection>

      {/* 8. Availability Accordion */}
      <FilterAccordionSection title="Availability" defaultOpen={false}>
        <label
          className={cn(
            'flex items-center justify-between rounded-lg py-1.5 px-2 text-xs transition-colors cursor-pointer text-left',
            filters.inStockOnly
              ? 'bg-[#FAF7F2] text-[#111111] font-semibold'
              : 'text-[#374151] hover:bg-[#FAFAFA] hover:text-[#111111]'
          )}
        >
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onChange({ inStockOnly: e.target.checked })}
              className="size-4 rounded border-[#D1D5DB] accent-[#111111]"
            />
            <span>In Stock Only</span>
          </div>
        </label>
      </FilterAccordionSection>
    </div>
  )
}
