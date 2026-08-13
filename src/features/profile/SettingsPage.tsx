import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, User } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { authService } from '@/services/authService'
import { useToast } from '@/hooks/useToast'
import { AppInput } from '@/components/common/AppInput'
import { AppSelect } from '@/components/common/AppSelect'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const profileSchema = z.object({
  name: z.string().min(3, 'Enter at least 3 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number').or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  skinType: z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const SKIN_TYPES = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Sensitive' },
]

export function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user)
  const toast = useToast()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      gender: user?.gender ?? 'male',
      skinType: user?.skinType ?? 'normal',
    },
  })

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    offers: true,
    newsletters: false,
    aiRecommendations: true,
  })

  const [saving, setSaving] = useState(false)
  const saveProfile = async (values: ProfileForm) => {
    setSaving(true)
    try {
      await authService().updateProfile(values as never)
      toast.success('Profile updated', 'Your changes have been saved.')
    } catch (err) {
      toast.error('Update failed', (err as { message?: string }).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <User className="size-5 text-primary" /> Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account is {user?.email}.</p>
        <form onSubmit={handleSubmit(saveProfile)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <AppInput label="Full name" error={errors.name?.message} {...register('name')} />
          <AppInput label="Mobile number" inputMode="numeric" placeholder="98765 43210" error={errors.phone?.message} {...register('phone')} />
          <AppSelect
            label="Gender"
            value={watch('gender') ?? ''}
            onValueChange={(v) => setValue('gender', v as ProfileForm['gender'])}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <AppSelect
            label="Skin type"
            value={watch('skinType') ?? ''}
            onValueChange={(v) => setValue('skinType', v as ProfileForm['skinType'])}
            options={SKIN_TYPES}
          />
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Bell className="size-5 text-primary" /> Notifications
        </h2>
        <div className="mt-4 divide-y divide-border">
          {(
            [
              ['orderUpdates', 'Order updates', 'SMS & email for order status changes'],
              ['offers', 'Offers & deals', 'Flash sales and exclusive coupons'],
              ['aiRecommendations', 'AI recommendations', 'Personalised product picks from your analysis'],
              ['newsletters', 'Newsletter', 'Weekly skincare tips and blog roundups'],
            ] as const
          ).map(([key, label, sub]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <Switch
                checked={notifications[key]}
                onCheckedChange={(checked) => {
                  setNotifications((n) => ({ ...n, [key]: checked }))
                  toast.success('Preference updated')
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Danger zone.</p>
        <Separator className="my-4" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => toast.info('Not available', 'Deactivation is disabled in this demo.')}>
            Deactivate Account
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => toast.info('Not available', 'Deletion is disabled in this demo.')}>
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
