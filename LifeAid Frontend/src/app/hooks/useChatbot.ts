import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatMessage, ChatbotState, QuickAction, FAQItem } from '../lib/chatbot.types'
import { sendChatMessage } from '../lib/api'

const STORAGE_KEY = 'lifeaid_chatbot_session'
const MAX_MESSAGES = 100
const RATE_LIMIT_DURATION = 60000 // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10

export function useChatbot(sessionId?: string | null) {
  const [state, setState] = useState<ChatbotState>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return {
            ...parsed,
            messages: parsed.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })),
            isOpen: false,
            isMinimized: true,
            isLoading: false,
            error: null,
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return createInitialState()
  })

  const messageCountRef = useRef<{ count: number; resetTime: number }>({
    count: 0,
    resetTime: Date.now() + RATE_LIMIT_DURATION,
  })

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        messages: state.messages.slice(-MAX_MESSAGES),
        sessionId: state.sessionId,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    }
  }, [state.messages, state.sessionId])

  const checkRateLimit = useCallback(() => {
    const now = Date.now()
    if (now > messageCountRef.current.resetTime) {
      messageCountRef.current = {
        count: 0,
        resetTime: now + RATE_LIMIT_DURATION,
      }
    }
    if (messageCountRef.current.count >= MAX_MESSAGES_PER_WINDOW) {
      return false
    }
    messageCountRef.current.count++
    return true
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return

    // Check rate limit
    if (!checkRateLimit()) {
      setState(prev => ({
        ...prev,
        error: 'Too many messages. Please wait a moment before trying again.',
      }))
      return
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent',
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))

    try {
      const response = await sendChatMessage(content.trim(), state.sessionId)
      
      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: response.reply,
        timestamp: new Date(),
        status: 'sent',
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      
      const errorBotMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: getErrorMessage(errorMessage),
        timestamp: new Date(),
        status: 'error',
        errorMessage,
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorBotMessage],
        isLoading: false,
        error: errorMessage,
      }))
    }
  }, [state.isLoading, checkRateLimit])

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [createWelcomeMessage()],
      error: null,
    }))
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: prev.isOpen ? true : false,
    }))
  }, [])

  const minimizeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: true,
      isOpen: false,
    }))
  }, [])

  const maximizeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: false,
      isOpen: true,
    }))
  }, [])

  return {
    state,
    sendMessage,
    clearChat,
    toggleChat,
    minimizeChat,
    maximizeChat,
  }
}

function createInitialState(): ChatbotState {
  return {
    isOpen: false,
    isMinimized: true,
    messages: [createWelcomeMessage()],
    isLoading: false,
    error: null,
    sessionId: generateId(),
  }
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: generateId(),
    role: 'bot',
    content: "Hello! I'm the LifeAid Assistant. How can I help you today?",
    timestamp: new Date(),
    status: 'sent',
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getErrorMessage(error: string): string {
  if (error.includes('API Key') || error.includes('offline')) {
    return "I'm currently offline for maintenance. Please contact support at support@lifeaid.org or call our helpline."
  }
  if (error.includes('rate limit') || error.includes('Too many')) {
    return "You're sending messages too quickly. Please wait a moment and try again."
  }
  if (error.includes('Network') || error.includes('fetch')) {
    return "I'm having trouble connecting. Please check your internet connection and try again."
  }
  return "I encountered an error processing your message. Please try again or contact support@lifeaid.org."
}
