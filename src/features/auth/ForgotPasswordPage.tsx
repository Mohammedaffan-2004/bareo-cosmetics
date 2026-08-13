import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/authService'
import { AppInput } from '@/components/common/AppInput'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      await authService().forgotPassword(data.email)
      setSent(data.email)
      toast.success('Reset link sent', 'Check your inbox for verification code')
      setTimeout(() => navigate('/verify-otp', { state: { email: data.email } }), 1400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Heading */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight">
          Reset your password.
        </h1>
        <p className="text-xs text-[#6B7280] font-light leading-relaxed">
          Enter the email address associated with your Bareo account.
        </p>
      </div>

      {sent && (
        <div className="rounded-xl border border-[#059669]/30 bg-[#ECFDF5] px-4 py-3 text-xs font-semibold text-[#047857] flex items-center gap-2.5">
          <MailCheck className="size-4 shrink-0 text-[#047857]" />
          <span>Reset code sent to <strong>{sent}</strong>. Redirecting to verification…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AppInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all shadow-2xs mt-2"
          loading={loading}
        >
          Send reset link
        </Button>
      </form>

      <p className="text-center text-xs text-[#6B7280] font-light pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-[#111111] hover:underline">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </p>
    </div>
  )
}
