import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles, RotateCcw, ScanFace } from 'lucide-react'
import type { ChatMessage } from '@/types'
import { aiService } from '@/services/aiService'
import { useAppSelector } from '@/store/hooks'
import { ChatBubble } from '@/components/chatbot/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getActiveStoreSettings } from '@/services/storeSettingsStore'

const SUGGESTIONS = [
  'How do I fix acne?',
  'Help with pigmentation',
  'What sunscreen is best?',
  'My skin feels dry and flaky',
]

export function AiChatPage() {
  const settings = getActiveStoreSettings()
  if (settings.aiAssistantEnabled === false) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4 text-center space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-8 space-y-3">
          <Sparkles className="size-8 text-amber-700 mx-auto" />
          <h2 className="font-serif text-xl font-normal text-amber-900">AI Skin Assistant Maintenance</h2>
          <p className="text-xs text-amber-800 font-light leading-relaxed">
            The AI Skin Assistant is currently undergoing scheduled refinement. Please check back shortly or browse our formulation recommendations in the shop.
          </p>
          <Button asChild variant="outline" className="rounded-xl border-amber-300 text-xs">
            <Link to="/shop">Explore Formulations →</Link>
          </Button>
        </div>
      </div>
    )
  }

  const consultations = useAppSelector((s) => s.ai.consultations)
  const latest = consultations[0]

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: latest
        ? `Hi again! Based on your analysis from ${latest.report.skinScore} skin score, I can help with follow-up questions. What would you like to know?`
        : 'Hi, I\'m the Bareo skin assistant. Ask me anything about skincare — concerns, ingredients, SPF, routines.',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    aiService()
      .getChatHistory()
      .then((history) => {
        if (history && history.length > 0) {
          setMessages(history)
        }
      })
      .catch((err) => {
        console.warn('Failed to load chat history:', err)
      })
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: trimmed, timestamp: new Date().toISOString() }])
    setInput('')
    setTyping(true)
    try {
      const reply = await aiService().chatReply(trimmed)
      setMessages((m) => [...m, reply])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'I am having trouble connecting to the Bareo skin service right now. Please try asking again or explore recommended products.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto flex h-[calc(100vh-240px)] min-h-[560px] max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Bareo Skin Assistant</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> Online · replies in seconds
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/skin-analysis"><ScanFace className="size-4" /> Full Analysis</Link>
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} text={msg.text}>
              {msg.products && (
                <div className="grid gap-2 pt-1 sm:grid-cols-3">
                  {msg.products.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="rounded-lg border border-border p-2 transition-colors hover:border-primary/40">
                      <img src={p.images[0].url} alt="" className="h-14 w-full rounded-md object-cover" />
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{p.name}</p>
                      <p className="mt-0.5 text-xs font-bold text-primary">₹{p.offerPrice}</p>
                    </Link>
                  ))}
                </div>
              )}
            </ChatBubble>
          ))}
          {typing && <ChatBubble role="assistant" typing />}
          {messages.length <= 1 && !typing && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your skin…"
              rows={1}
              className="min-h-11 max-h-32 flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
            />
            <Button type="submit" size="icon" className="size-11 shrink-0" disabled={!input.trim() || typing}>
              <Send className="size-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI assistant may make mistakes — always patch-test new products. <RotateCcw className="inline size-3" /> Not medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
