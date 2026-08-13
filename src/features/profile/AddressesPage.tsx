import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Trash2, Star, Pencil } from 'lucide-react'
import { addressService } from '@/services/addressService'
import { useToast } from '@/hooks/useToast'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { STATES } from '@/features/checkout/constants'

const schema = z.object({
  fullName: z.string().min(3, 'Enter full name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number'),
  email: z.string().email('Enter a valid email'),
  line1: z.string().min(5, 'Enter address'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'Enter city'),
  state: z.string().min(2, 'Select state'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid pincode'),
  label: z.enum(['home', 'work', 'other']),
})

type FormValues = z.infer<typeof schema>

export function AddressesPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => addressService().getAddresses() })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'home' },
  })

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      editingId ? addressService().updateAddress(editingId, values) : addressService().addAddress(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success(editingId ? 'Address updated' : 'Address added')
      setOpen(false)
      setEditingId(null)
      reset({ label: 'home' })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => addressService().deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address removed')
    },
  })

  const makeDefault = useMutation({
    mutationFn: (id: string) => addressService().setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated')
    },
  })

  const openAdd = () => {
    setEditingId(null)
    reset({ fullName: '', phone: '', email: '', line1: '', landmark: '', city: '', state: '', pincode: '', label: 'home' })
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const addr = addresses?.find((a) => a.id === id)
    if (!addr) return
    setEditingId(id)
    reset({
      fullName: addr.fullName,
      phone: addr.phone.replace(/\D/g, '').slice(-10),
      email: addr.email,
      line1: addr.line1,
      landmark: addr.landmark ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      label: (addr.label === 'home' || addr.label === 'work' ? addr.label : 'other') as 'home' | 'work' | 'other',
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground">Manage your delivery addresses.</p>
        </div>
        <Button onClick={openAdd}><Plus className="size-4" /> Add Address</Button>
      </div>

      {addresses?.length === 0 ? (
        <EmptyState icon={<MapPin className="size-10" />} title="No addresses yet" description="Add an address to speed up checkout." action={<Button onClick={openAdd}>Add Address</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses?.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                  {addr.label ?? 'other'}
                </span>
                {addr.isDefault && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Star className="size-3.5 fill-primary text-primary" /> Default
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold">{addr.fullName}</p>
              <p className="text-sm text-muted-foreground">{addr.line1}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              <div className="mt-4 flex gap-2 border-t border-border pt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(addr.id ?? '')}><Pencil className="size-3.5" /> Edit</Button>
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => makeDefault.mutate(addr.id ?? '')}><Star className="size-3.5" /> Set Default</Button>
                )}
                <Button variant="outline" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={() => remove.mutate(addr.id ?? '')}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Address' : 'Add Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
            <AppInput label="Full name *" placeholder="Aarav Malhotra" error={errors.fullName?.message} {...register('fullName')} />
            <AppInput label="Mobile *" inputMode="numeric" placeholder="98765 43210" error={errors.phone?.message} {...register('phone')} />
            <AppInput label="Email *" type="email" className="sm:col-span-2" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <AppInput label="Address (house no, street) *" className="sm:col-span-2" placeholder="204, Palm Residency, MG Road" error={errors.line1?.message} {...register('line1')} />
            <AppInput label="Landmark" placeholder="Near Metro Pillar 42" {...register('landmark')} />
            <AppInput label="City *" placeholder="Bengaluru" error={errors.city?.message} {...register('city')} />
            <AppSelect
              label="State *"
              options={STATES.map((s) => ({ value: s, label: s }))}
              value={watch('state')}
              onValueChange={(v) => setValue('state', v)}
              error={errors.state?.message}
            />
            <AppInput label="Pincode *" inputMode="numeric" placeholder="560001" error={errors.pincode?.message} {...register('pincode')} />
            <AppSelect
              label="Label"
              options={[
                { value: 'home', label: 'Home' },
                { value: 'work', label: 'Work' },
                { value: 'other', label: 'Other' },
              ]}
              value={watch('label')}
              onValueChange={(v) => setValue('label', v as FormValues['label'])}
            />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={save.isPending}>{editingId ? 'Update' : 'Save'} Address</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
