export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  errorMessage?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatbotState {
  isOpen: boolean
  isMinimized: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sessionId: string | null
}

export interface QuickAction {
  label: string
  message: string
  icon?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  order: number
}

export interface ChatbotConfig {
  primaryColor: string
  secondaryColor: string
  position: 'bottom-right' | 'bottom-left'
  welcomeMessage: string
  offlineMessage: string
  quickActions: QuickAction[]
  maxRetries: number
  typingSpeed: number
}

export interface ChatLog {
  id: string
  session_id: string
  user_identifier: string | null
  message: string
  response: string
  timestamp: string
  duration_ms: number
  status: 'success' | 'error' | 'rate_limited'
  error_message: string | null
  ip_address: string | null
  user_agent: string | null
}

export interface ChatbotAnalytics {
  total_conversations: number
  total_messages: number
  avg_duration_ms: number
  success_rate: number
  top_questions: Array<{ question: string; count: number }>
  conversations_by_day: Array<{ date: string; count: number }>
  error_rate: number
}
