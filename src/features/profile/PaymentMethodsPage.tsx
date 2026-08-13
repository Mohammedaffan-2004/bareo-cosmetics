import { useState } from 'react'
import { CreditCard, Plus, Trash2, Smartphone, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils'

interface SavedPayment {
  id: string
  type: 'card' | 'upi' | 'wallet'
  label: string
  detail: string
  isDefault?: boolean
}

const DEFAULT_PAYMENTS: SavedPayment[] = [
  { id: 'p1', type: 'card', label: 'HDFC Bank Credit Card', detail: '•••• 4521 · Visa' },
  { id: 'p2', type: 'upi', label: 'UPI ID', detail: 'aarav@okhdfc' },
  { id: 'p3', type: 'wallet', label: 'Paytm Wallet', detail: '+91 98765 43210' },
]

const ICONS = { card: CreditCard, upi: Smartphone, wallet: Wallet }

export function PaymentMethodsPage() {
  const toast = useToast()
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS)

  const remove = (id: string) => {
    setPayments((p) => p.filter((x) => x.id !== id))
    toast.success('Payment method removed')
  }

  const setDefault = (id: string) => {
    setPayments((p) => p.map((x) => ({ ...x, isDefault: x.id === id })))
    toast.success('Default payment updated')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage cards, UPI and wallets for faster checkout.</p>
        </div>
        <Button onClick={() => toast.info('Add payment method', 'This demo stores methods locally.')}>
          <Plus className="size-4" /> Add Method
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {payments.map((p) => {
          const Icon = ICONS[p.type]
          return (
            <div key={p.id} className={cn('rounded-2xl border bg-card p-5', p.isDefault ? 'border-primary ring-2 ring-primary/15' : 'border-border')}>
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                {p.isDefault && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Default</span>
                )}
              </div>
              <p className="mt-3 font-semibold">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.detail}</p>
              <div className="mt-4 flex gap-2 border-t border-border pt-3">
                {!p.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => setDefault(p.id)}>Set Default</Button>
                )}
                <Button variant="outline" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl bg-secondary p-5 text-sm">
        <p className="font-semibold">Secure payments, always</p>
        <p className="mt-1 text-muted-foreground">
          All payments are processed over a 256-bit encrypted gateway (simulated in this demo). Bareo never stores your full card details.
        </p>
      </div>
    </div>
  )
}
