"use client"
import { useState, useEffect, useCallback } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, Loader2, History, AlertCircle } from "lucide-react"
import { ConversationSidebar } from "@/components/conversation-sidebar"

interface ConversationSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat/enhanced",
    body: {
      sessionId: currentSessionId,
    },
    onResponse: async (response) => {
      // Extract session ID from response headers
      const sessionId = response.headers.get('X-Session-Id')
      if (sessionId && sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId)
        await loadSessions()
      }
    },
    onFinish: async () => {
      // Refresh sessions after message is complete
      await loadSessions()
    },
    onError: (error) => {
      console.error('Chat error:', error)
      setError('Failed to send message. Please try again.')
    }
  })

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
        const sessionMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }))
        setMessages(sessionMessages)
        setCurrentSessionId(sessionId)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('Failed to load conversation history')
    }
  }, [setMessages])

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
        setError(null)
        await loadSessions()
        return newSessionId
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create new session:', error)
      setError('Failed to create new conversation')
      return null
    }
  }, [loadSessions, setMessages])

  // Switch to a different session
  const switchToSession = useCallback(async (sessionId: string) => {
    await loadMessages(sessionId)
  }, [loadMessages])

  // Load initial data
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversation History Sidebar */}
      <div className={`transition-all duration-300 ${showHistory ? 'w-80' : 'w-0'} overflow-hidden`}>
        {showHistory && (
          <ConversationSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={switchToSession}
            onNewSession={createNewSession}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant Chat
                {currentSessionId && (
                  <span className="text-sm font-normal text-muted-foreground">
                    • Session Active
                  </span>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {error && (
              <div className="mx-4 mt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm">Ask questions about properties, market analysis, or business needs</p>
                    <div className="mt-4 text-xs space-y-1">
                      <p>• "Show me properties on Broadway"</p>
                      <p>• "What's the average rent in our portfolio?"</p>
                      <p>• "Find properties managed by Jack Sparrow"</p>
                    </div>
                    {!currentSessionId && (
                      <div className="mt-6">
                        <Button onClick={createNewSession} variant="outline" size="sm">
                          Start New Conversation
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about properties, market analysis, or business insights..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
