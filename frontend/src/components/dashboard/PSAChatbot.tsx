'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { QuickActions } from './QuickActions'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'success' | 'error'
}

interface ChatResponse {
  response: string
  status: string
  orchestrator?: string
  error?: string
}

export function PSAChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your PSA Agent assistant. I can help you with project management, resource allocation, and quote generation. What can I help you with today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('disconnected')
      }
    } catch (error) {
      setBackendStatus('disconnected')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Analyzing your request with our specialist agents...',
      role: 'assistant',
      timestamp: new Date(),
      status: 'sending'
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await fetch('/api/v1/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          context: {
            session_id: 'dashboard-chat',
            user_interface: 'web'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChatResponse = await response.json()

      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id)
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            content: data.response || data.error || 'Sorry, I encountered an error processing your request.',
            role: 'assistant',
            timestamp: new Date(),
            status: data.status === 'success' ? 'success' : 'error'
          }
        ]
      })

      setBackendStatus('connected')

    } catch (error) {
      console.error('Chat error:', error)
      setBackendStatus('disconnected')
      
      // Remove loading message and add error response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id)
        return [
          ...filtered,
          {
            id: (Date.now() + 3).toString(),
            content: getErrorMessage(error),
            role: 'assistant',
            timestamp: new Date(),
            status: 'error'
          }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: any) => {
    if (error.message?.includes('404')) {
      return 'Backend API not found. Please make sure the FastAPI backend is running on port 8000.\n\nTo start the backend:\n1. cd backend\n2. poetry run uvicorn app.main:app --reload'
    } else if (error.message?.includes('Failed to fetch')) {
      return 'Cannot connect to the backend. Please check:\n\n1. Backend server is running (poetry run uvicorn app.main:app --reload)\n2. Backend is accessible at http://localhost:8000\n3. CORS is properly configured'
    } else {
      return 'Sorry, I\'m having trouble connecting to the PSA agents. Please check if the backend is running and try again.'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your PSA Agent assistant. I can help you with project management, resource allocation, and quote generation. What can I help you with today?',
        role: 'assistant',
        timestamp: new Date()
      }
    ])
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-600'
      case 'disconnected': return 'text-red-600'
      default: return 'text-slate-500'
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Connected'
      case 'disconnected': return 'Disconnected'
      default: return 'Checking...'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />
      
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">PSA Agent Assistant</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`text-xs ${getStatusColor()}`}>
                ● {getStatusText()}
              </div>
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Ask about project planning, resource allocation, quotes, or capacity analysis
          </p>
          {backendStatus === 'disconnected' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
              <p className="text-sm text-red-800">
                ⚠️ Backend disconnected. Start with: <code className="bg-red-100 px-1 rounded">poetry run uvicorn app.main:app --reload</code>
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.status === 'error'
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : message.status === 'sending'
                      ? 'bg-slate-100 text-slate-600 animate-pulse'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about project planning, resource allocation, quotes..."
                className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 