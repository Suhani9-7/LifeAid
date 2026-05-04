import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Minus, RotateCcw, Send, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { ChatMessage, QuickAction } from '../lib/chatbot.types'
import { useChatbot } from '../hooks/useChatbot'

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'How to donate?', message: 'How do I donate to a medical case?' },
  { label: 'Find urgent cases', message: 'Where can I find urgent medical cases?' },
  { label: 'Verify a doctor', message: 'How can I verify if a doctor is verified on LifeAid?' },
  { label: 'Payment methods', message: 'What payment methods are supported for donations?' },
  { label: 'Contact support', message: 'How can I contact LifeAid support team?' },
]

export default function ChatbotWidget() {
  const { state, sendMessage, clearChat, toggleChat, minimizeChat } = useChatbot()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Focus input when chat opens
  useEffect(() => {
    if (state.isOpen && !state.isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [state.isOpen, state.isMinimized])

  const handleSend = () => {
    if (!input.trim() || state.isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (message: string) => {
    sendMessage(message)
  }

  // Minimized floating button
  if (!state.isOpen || state.isMinimized) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open chat support"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Need Help?</span>
      </button>
    )
  }

  // Full chat interface
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">LifeAid Assistant</h3>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={minimizeChat}
            className="h-8 w-8 text-white hover:bg-white/20"
            aria-label="Minimize chat"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="h-8 w-8 text-white hover:bg-white/20"
            aria-label="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            className="h-8 w-8 text-white hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {state.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {state.isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <TypingDots />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions (show only if few messages) */}
        {state.messages.length <= 1 && !state.isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground px-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.slice(0, 3).map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full"
                  onClick={() => handleQuickAction(action.message)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {state.error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive">{state.error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            disabled={state.isLoading}
            className="flex-1"
            aria-label="Type your message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || state.isLoading}
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Powered by AI • 
          <a href="/support" className="underline hover:text-primary">
            Full support page
          </a>
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-white border border-border rounded-tl-none shadow-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser ? 'text-white/70' : 'text-muted-foreground'
          }`}
        >
          {timeStr}
          {message.status === 'error' && ' • Failed'}
        </p>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  )
}
