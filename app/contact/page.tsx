'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Send, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Bienvenido a DocuFleet 👋 Soy tu asistente de onboarding. ¿Cómo puedo ayudarte hoy?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showEscalation, setShowEscalation] = useState(false)
  const [conversationSummary, setConversationSummary] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userName,
          userEmail,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${data.error}. Por favor intenta de nuevo.`,
          },
        ])
        setIsLoading(false)
        return
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ])

      // Check if should escalate
      if (data.shouldEscalate) {
        setShowEscalation(true)
        buildSummary(newMessages)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo más tarde.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const buildSummary = (conversation: Message[]) => {
    let summary = `Conversación de Contacto - DocuFleet\n`
    summary += `Nombre: ${userName || 'No proporcionado'}\n`
    summary += `Email: ${userEmail || 'No proporcionado'}\n`
    summary += `\nConversación:\n`

    conversation.forEach((msg) => {
      summary += `${msg.role === 'user' ? 'Usuario' : 'Agente'}: ${msg.content}\n\n`
    })

    setConversationSummary(summary)
  }

  const sendViaWhatsApp = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+56912345678'
    const text = encodeURIComponent(conversationSummary)
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`
    window.open(url, '_blank')
  }

  const sendViaEmail = () => {
    const mailtoLink = `mailto:${userEmail}?subject=Resumen de tu conversación con DocuFleet&body=${encodeURIComponent(conversationSummary)}`
    window.location.href = mailtoLink
  }

  if (showEscalation) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange mx-auto mb-4'>
              <Truck className='h-8 w-8 text-white' />
            </div>
            <h1 className='text-3xl font-black text-foreground mb-4'>¡Perfecto!</h1>
            <p className='text-muted-foreground text-lg'>
              Un agente de DocuFleet te contactará en breve vía WhatsApp para continuar la conversación.
            </p>
          </div>

          <Card className='glass-dark border-slate-700/50 mb-6'>
            <CardHeader>
              <CardTitle className='text-foreground'>Enviar Resumen de Conversación</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <pre className='bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 overflow-auto max-h-64 text-pretty'>
                {conversationSummary}
              </pre>

              <div className='flex flex-col sm:flex-row gap-3'>
                <Button onClick={sendViaWhatsApp} className='btn-orange flex items-center gap-2'>
                  <MessageCircle className='w-4 h-4' />
                  Enviar por WhatsApp
                </Button>
                {userEmail && (
                  <Button onClick={sendViaEmail} variant='outline' className='border-slate-700'>
                    Enviar por Email
                  </Button>
                )}
              </div>

              <p className='text-xs text-muted-foreground'>
                Número de contacto: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
              </p>
            </CardContent>
          </Card>

          <div className='text-center'>
            <p className='text-muted-foreground mb-4'>¿Quieres hacer otra consulta?</p>
            <Button asChild className='btn-orange'>
              <Link href='/'>Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange mx-auto mb-4'>
            <Truck className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-3xl font-black text-foreground mb-2'>Contacto</h1>
          <p className='text-muted-foreground'>
            Habla con nuestro asistente inteligente sobre DocuFleet
          </p>
        </div>

        {/* User Info Form */}
        {!userName && (
          <Card className='glass-dark border-slate-700/50 mb-6'>
            <CardContent className='pt-6 space-y-4'>
              <div>
                <label className='text-sm font-semibold text-foreground block mb-2'>Tu nombre</label>
                <Input
                  placeholder='Juan Pérez'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className='bg-slate-800/50 border-slate-700 text-foreground'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-foreground block mb-2'>Tu email</label>
                <Input
                  type='email'
                  placeholder='juan@example.com'
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className='bg-slate-800/50 border-slate-700 text-foreground'
                />
              </div>
              {(userName || userEmail) && (
                <Button
                  onClick={() => {
                    if (!userName) setUserName('Visitante')
                    if (!userEmail) setUserEmail('no-proporcionado@docufleet.com')
                  }}
                  className='w-full btn-orange'
                >
                  Continuar a Chat
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat */}
        {(userName || userEmail) && (
          <Card className='glass-dark border-slate-700/50 flex flex-col h-[600px]'>
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-orange-500/20 text-orange-100 rounded-br-none'
                        : 'bg-slate-800/50 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className='text-sm'>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-slate-800/50 text-slate-100 p-3 rounded-lg rounded-bl-none'>
                    <div className='flex gap-2'>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'></div>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-100'></div>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-200'></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className='border-t border-slate-700/50 p-4'>
              <form onSubmit={sendMessage} className='flex gap-2'>
                <Input
                  placeholder='Escribe tu mensaje...'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className='bg-slate-800/50 border-slate-700 text-foreground'
                />
                <Button
                  type='submit'
                  disabled={isLoading || !input.trim()}
                  className='btn-orange'
                >
                  <Send className='w-4 h-4' />
                </Button>
              </form>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            ¿Prefieres contacto directo?{' '}
            <a href={`tel:${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className='text-orange-500 hover:text-orange-400 font-semibold'>
              Llamar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
