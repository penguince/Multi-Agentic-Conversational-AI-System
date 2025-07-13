"use client"

import { useState, useCallback, useEffect } from 'react'
import { Message } from 'ai'

interface ConversationSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface UseConversationChatOptions {
  sessionId?: string
  onSessionChange?: (sessionId: string) => void
}

export function useConversationChat({ sessionId, onSessionChange }: UseConversationChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load conversation sessions
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }, [])

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/conversations/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const sessionMessages: Message[] = data.messages.map((msg: ConversationMessage) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }))
        setMessages(sessionMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('Failed to load conversation history')
    }
  }, [])

  // Create a new conversation session
  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Conversation',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newSessionId = data.session_id
        setCurrentSessionId(newSessionId)
        setMessages([])
        setInput('')
        await loadSessions() // Refresh sessions list
        onSessionChange?.(newSessionId)
        return newSessionId
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create new session:', error)
      setError('Failed to create new conversation')
      return null
    }
  }, [loadSessions, onSessionChange])

  // Switch to a different session
  const switchToSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    await loadMessages(sessionId)
    onSessionChange?.(sessionId)
  }, [loadMessages, onSessionChange])

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // If no session exists, create one
      let sessionId = currentSessionId
      if (!sessionId) {
        sessionId = await createNewSession()
        if (!sessionId) {
          throw new Error('Failed to create conversation session')
        }
      }

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
      }
      setMessages(prev => [...prev, userMessage])
      setInput('')

      // Send to enhanced chat API
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream')
      }

      // Extract session ID from headers
      const sessionIdFromHeader = response.headers.get('X-Session-Id')
      if (sessionIdFromHeader && sessionIdFromHeader !== currentSessionId) {
        setCurrentSessionId(sessionIdFromHeader)
      }

      // Add assistant message to UI
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
      }
      setMessages(prev => [...prev, assistantMessage])

      // Stream the response
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Parse AI SDK streaming format
            const data = line.slice(2)
            if (data) {
              assistantContent += data
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              )
            }
          }
        }
      }

      // Refresh sessions to update message counts
      await loadSessions()

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [currentSessionId, createNewSession, isLoading, loadSessions])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }, [input, sendMessage])

  // Load initial data
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Load messages if sessionId is provided
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      switchToSession(sessionId)
    }
  }, [sessionId, currentSessionId, switchToSession])

  return {
    messages,
    input,
    isLoading,
    error,
    currentSessionId,
    sessions,
    handleInputChange,
    handleSubmit,
    sendMessage,
    createNewSession,
    switchToSession,
    loadSessions,
  }
}
