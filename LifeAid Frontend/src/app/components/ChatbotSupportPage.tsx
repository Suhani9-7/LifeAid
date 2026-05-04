import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, RotateCcw, X, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import type { ChatMessage, QuickAction, FAQItem } from '../lib/chatbot.types'
import { useChatbot } from '../hooks/useChatbot'

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'How to donate?', message: 'How do I donate to a medical case?' },
  { label: 'Find urgent cases', message: 'Where can I find urgent medical cases?' },
  { label: 'Verify a doctor', message: 'How can I verify if a doctor is verified on LifeAid?' },
  { label: 'Payment methods', message: 'What payment methods are supported for donations?' },
  { label: 'Contact support', message: 'How can I contact LifeAid support team?' },
]

const FAQS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I donate to a case?',
    answer: 'Browse verified requests on the Verified Requests page, click on a case, and click "Donate Now" to complete the checkout form using Razorpay.',
    category: 'Donations',
    order: 1,
  },
  {
    id: '2',
    question: 'How can I track my donation history?',
    answer: 'Open your donor dashboard and view your donation history under the History tab. You can see all your past donations with dates and amounts.',
    category: 'Donations',
    order: 2,
  },
  {
    id: '3',
    question: 'Where can I find urgent medical requests?',
    answer: 'Use the Verified Requests page and filter by urgency (High/Critical) or location to find cases that need immediate support.',
    category: 'Cases',
    order: 3,
  },
  {
    id: '4',
    question: 'How do I create a help request as a patient?',
    answer: 'Log in as a patient, go to your dashboard, fill out the medical request form with your diagnosis, required amount, and upload medical documents for verification.',
    category: 'Patients',
    order: 4,
  },
  {
    id: '5',
    question: 'How does the doctor verification process work?',
    answer: 'Doctors review submitted medical requests, verify the medical documents, and either approve or reject the request. Only verified requests are shown to donors.',
    category: 'Doctors',
    order: 5,
  },
  {
    id: '6',
    question: 'What payment methods are supported?',
    answer: 'We use Razorpay payment gateway which supports UPI, credit/debit cards, net banking, and digital wallets for seamless donations.',
    category: 'Payments',
    order: 6,
  },
]

export default function ChatbotSupportPage() {
  const { state, sendMessage, clearChat } = useChatbot()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showFAQ, setShowFAQ] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-lg">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Support Center</h1>
              <p className="text-muted-foreground">Get help from our AI assistant or browse frequently asked questions</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Chat Interface */}
          <Card className="border-2">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>LifeAid AI Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {state.messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}

                    {state.isLoading && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                        <div className="rounded-2xl rounded-tl-none bg-white border px-4 py-3">
                          <TypingDots />
                        </div>
                      </div>
                    )}

                    {state.messages.length <= 1 && !state.isLoading && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_ACTIONS.map((action) => (
                            <Button
                              key={action.label}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAction(action.message)}
                              className="rounded-full"
                            >
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {state.error && (
                  <div className="mx-6 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive">{state.error}</p>
                  </div>
                )}

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question here..."
                      disabled={state.isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || state.isLoading}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI responses are generated automatically. For urgent medical emergencies, please call emergency services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {FAQS.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{faq.question}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {faq.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 mt-2 h-auto"
                        onClick={() => handleQuickAction(faq.question)}
                      >
                        Ask AI about this →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find what you're looking for? Contact our support team directly.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:support@lifeaid.org">
                      Email: support@lifeaid.org
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="tel:+911234567890">
                      Helpline: +91 12345 67890
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
            : 'bg-white border rounded-tl-none shadow-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser ? 'text-white/70' : 'text-muted-foreground'
          }`}
        >
          {timeStr}
          {message.status === 'error' && ' • Failed to send'}
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
