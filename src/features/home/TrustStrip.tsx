import { ShieldCheck, Leaf, Truck, RotateCcw } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Dermatologist Formulated',
    subtitle: 'Clinical active protocols',
  },
  {
    icon: Leaf,
    title: '100% Clean Actives',
    subtitle: 'Fragrance & paraben free',
  },
  {
    icon: Truck,
    title: 'Free Express Shipping',
    subtitle: 'On orders above ₹499',
  },
  {
    icon: RotateCcw,
    title: '7-Day Easy Returns',
    subtitle: 'Hassle-free refund policy',
  },
]

export function TrustStrip() {
  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-6" aria-label="Trust Guarantees">
      <div className="container-page grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3 justify-center sm:justify-start min-h-[44px]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#059669] shadow-2xs">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-semibold text-[#111111] leading-tight">{title}</h4>
              <p className="text-[11px] font-normal text-[#6B7280] leading-snug">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
