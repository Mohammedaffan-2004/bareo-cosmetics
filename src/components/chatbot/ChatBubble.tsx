import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import { cn } from '@/utils'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  text?: string
  children?: React.ReactNode
  typing?: boolean
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

export function ChatBubble({ role, text, children, typing }: ChatBubbleProps) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex items-end gap-2', isUser && 'flex-row-reverse')}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-accent/25 text-primary'
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        className={cn(
          'max-w-[80%] space-y-2 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border border-border bg-card text-foreground'
        )}
      >
        {typing ? (
          <TypingDots />
        ) : (
          <>
            {text && <p>{text}</p>}
            {children}
          </>
        )}
      </div>
    </motion.div>
  )
}
