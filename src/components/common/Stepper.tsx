import { Check } from 'lucide-react'
import { cn } from '@/utils'

export interface StepperStep {
  key: string
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  current?: number
  currentStep?: number
  onStepClick?: (index: number) => void
  className?: string
}

/**
 * Bareo Stepper — Clean, quiet luxury progress indicator.
 * Communicates completed (emerald check), current (obsidian badge), and upcoming (muted) steps.
 */
export function Stepper({ steps, current, currentStep, onStepClick, className }: StepperProps) {
  const activeIdx = typeof current === 'number' ? current : currentStep ?? 0

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Header Info: Step X of Y */}
      <div className="flex items-center justify-between text-xs text-[#7A8A91]">
        <div className="flex items-center gap-2 font-medium text-[#172126]">
          <span className="font-serif font-semibold text-xs uppercase tracking-wider text-[#172126]">
            Step {Math.min(activeIdx + 1, steps.length)} of {steps.length}
          </span>
          <span className="text-[#DCE6E9]">·</span>
          <span className="font-serif font-normal text-[#167C86]">{steps[activeIdx]?.label || ''}</span>
        </div>
      </div>

      {/* Stepper Progress Indicator Bar */}
      <ol className="flex w-full items-center">
        {steps.map((step, i) => {
          const done = i < activeIdx
          const active = i === activeIdx

          return (
            <li key={step.key} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!onStepClick || i > activeIdx}
                onClick={() => onStepClick?.(i)}
                className={cn(
                  'flex items-center gap-2.5 min-h-[44px] outline-none transition-colors',
                  onStepClick && i <= activeIdx ? 'cursor-pointer' : 'cursor-default'
                )}
                aria-label={`Step ${i + 1}: ${step.label} (${done ? 'Completed' : active ? 'Current' : 'Upcoming'})`}
              >
                {/* Step Number / Check Circle */}
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
                    done && 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/40 shadow-2xs',
                    active && 'bg-[#172126] text-white font-bold ring-4 ring-[#172126]/10',
                    !done && !active && 'border border-[#DCE6E9] bg-white text-[#7A8A91]'
                  )}
                >
                  {done ? <Check className="size-3.5 stroke-[2.5] text-[#167C86]" /> : `0${i + 1}`}
                </span>

                {/* Step Label */}
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block transition-colors',
                    active ? 'font-semibold text-[#172126]' : done ? 'text-[#52636B]' : 'text-[#7A8A91]'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-[#DCE6E9] overflow-hidden sm:mx-3">
                  <div
                    className={cn(
                      'h-full bg-[#167C86] transition-all duration-300 ease-out',
                      i < activeIdx ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
