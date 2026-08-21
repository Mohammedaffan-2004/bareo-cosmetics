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
    <div className="space-y-5 sm:space-y-6">
      {/* Editorial Heading */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
          ACCOUNT RECOVERY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">
          Reset your password.
        </h1>
        <p className="text-xs text-[#52636B] font-light leading-relaxed">
          Enter the email address associated with your Bareo account.
        </p>
      </div>

      {sent && (
        <div className="rounded-xl border border-[#167C86]/30 bg-[#EDF6F8] px-4 py-3 text-xs font-semibold text-[#167C86] flex items-center gap-2.5">
          <MailCheck className="size-4 shrink-0 text-[#167C86]" />
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
          className="h-12 w-full rounded-xl bg-[#172126] text-white text-xs sm:text-sm font-semibold hover:bg-[#253239] transition-all shadow-2xs mt-2 border border-[#172126]"
          loading={loading}
        >
          Send Reset Link →
        </Button>
      </form>

      <p className="text-center text-xs text-[#52636B] font-light pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-[#172126] hover:text-[#167C86] hover:underline">
          <ArrowLeft className="size-3.5 text-[#167C86]" /> Back to sign in
        </Link>
      </p>
    </div>
  )
}
