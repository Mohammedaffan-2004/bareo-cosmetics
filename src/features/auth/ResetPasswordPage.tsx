import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
import { authService } from '@/services/authService'
import { AppPasswordInput } from '@/components/common/AppPasswordInput'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const email = (location.state as { email?: string } | null)?.email ?? 'you@example.com'
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      await authService().resetPassword(email, data.password)
      setDone(true)
      toast.success('Password updated', 'You can now sign in with your new password')
      setTimeout(() => navigate('/login'), 1400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Heading */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight">
          Create a new password.
        </h1>
        <p className="text-xs text-[#6B7280] font-light leading-relaxed">
          Set a new password for account <strong className="font-mono text-[#111111]">{email}</strong>.
        </p>
      </div>

      {done && (
        <div className="rounded-xl border border-[#059669]/30 bg-[#ECFDF5] px-4 py-3 text-xs font-semibold text-[#047857] flex items-center gap-2">
          <Check className="size-4 shrink-0" />
          <span>Password reset successful! Redirecting to sign in…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AppPasswordInput
          label="New password"
          placeholder="Minimum 8 characters"
          showStrength
          error={errors.password?.message}
          {...register('password')}
        />

        <AppPasswordInput
          label="Confirm password"
          placeholder="Repeat new password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all shadow-2xs mt-2"
          loading={loading}
        >
          Reset password
        </Button>
      </form>
    </div>
  )
}
