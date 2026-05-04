import { useState } from 'react'
import { Search, MessageCircle, HelpCircle, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { sendChatMessage } from '../lib/api'

const faqs = [
  {
    question: 'How do I donate to a case?',
    answer: 'Browse verified requests, click "Donate Now," and complete the checkout form.'
  },
  {
    question: 'How can I track my donation history?',
    answer: 'Open your donor dashboard and view donation history under the History tab.'
  },
  {
    question: 'Where can I find urgent medical requests?',
    answer: 'Use the verified requests page and filter by urgency or location.'
  }
]

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

export default function ChatbotSupport() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Hello! How can I assist you with donations, cases, or account setup today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userMessage)
      setMessages(prev => [...prev, { role: 'bot', content: response.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Support & FAQ Assistant</h1>
          <p className="text-muted-foreground mt-2">Get help with common questions or use the chatbot assistant.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Ask the assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-96 overflow-y-auto space-y-4 p-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-4 ${
                          msg.role === 'user'
                            ? 'bg-primary/10 border-primary/20 ml-8'
                            : 'bg-white border-border mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {msg.role === 'bot' ? (
                            <MessageCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold">You</span>
                            </div>
                          )}
                          <p className="font-semibold">{msg.role === 'bot' ? 'Support Bot' : 'You'}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="rounded-2xl border border-border bg-white p-4 mr-8">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          <p className="font-semibold">Support Bot</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your question here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['How do I find urgent cases?', 'How do I verify a doctor?', 'What payment methods are supported?'].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setInput(q)
                      }}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {q}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Frequently asked questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-border bg-white p-4">
                  <p className="font-semibold">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
