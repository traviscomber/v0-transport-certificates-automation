'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageCircle, Send, Phone } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy el asistente de DocuFleet. Me gustaría conocerte primero para brindarte la mejor atención posible.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userInfoCollected, setUserInfoCollected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          userInfo: userInfoCollected ? { name: userName, email: userEmail } : null,
        }),
      })

      const data = await response.json()
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Perdona, ocurrió un error. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalateToHuman = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+56912345678'
    const conversationSummary = messages
      .map((m) => `${m.type === 'user' ? 'Tú' : 'Agente'}: ${m.content}`)
      .join('\n')

    const message = `Hola, me gustaría hablar con un agente.\n\nResumen de conversación:\n${conversationSummary}`
    const encoded = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encoded}`
    window.open(whatsappUrl, '_blank')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          1
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[600px] rounded-2xl shadow-2xl bg-slate-900 border border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">DocuFleet Chat</h3>
          <p className="text-orange-100 text-xs">Respuestas instantáneas 24/7</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-orange-700 p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Info Collection or Chat Input */}
      {!userInfoCollected ? (
        <div className="border-t border-slate-700 p-4 space-y-3 bg-slate-900">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nombre completo</label>
            <input
              type="text"
              placeholder="Juan Pérez"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Correo electrónico</label>
            <input
              type="email"
              placeholder="juan@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button
            onClick={() => setUserInfoCollected(true)}
            disabled={!userName || !userEmail || !userEmail.includes('@')}
            className="w-full btn-orange"
          >
            Continuar al chat
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-4 bg-slate-900 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 bg-slate-700 text-white placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Escalation Button */}
          <button
            type="button"
            onClick={handleEscalateToHuman}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm transition-colors border border-slate-600"
          >
            <Phone className="w-4 h-4" />
            Hablar con un agente
          </button>
        </form>
      )}
    </div>
  )
}
