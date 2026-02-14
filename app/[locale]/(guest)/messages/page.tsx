// app/(guest)/messages/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

// ========== ICONS ==========
const MessageSquare = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const Send = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const RefreshCw = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const ArrowLeft = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Car = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l1-1h3l2-2h6l2 2h3l1 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5l2-1zm0 0l-2-5.5A1 1 0 014 6h3.5l2 4H5zm14 0l2-5.5A1 1 0 0020 6h-3.5l-2 4H19z" />
  </svg>
)

// ========== TYPES ==========
interface Message {
  id: string
  bookingId: string
  senderType: string
  senderName: string
  senderEmail: string
  message: string
  category: string
  isRead: boolean
  isUrgent: boolean
  hasAttachment: boolean
  attachmentUrl?: string
  attachmentName?: string
  createdAt: string
  metadata?: any
}

interface Conversation {
  bookingId: string
  bookingCode: string
  car: {
    make: string
    model: string
    year: number
    color?: string
    photo?: string
  }
  startDate: string
  endDate: string
  status: string
  tripStatus?: string
  messages: Message[]
  unreadCount: number
  lastMessage: {
    text: string
    senderType: string
    senderName: string
    createdAt: string
  } | null
  messageCount: number
}

// ========== MAIN COMPONENT ==========
export default function GuestMessagesPage() {
  const t = useTranslations('GuestMessages')
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [totalUnread, setTotalUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom()
    }
  }, [selectedConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/guest/messages')
      const data = await response.json()

      if (response.ok && data.success) {
        setConversations(data.conversations || [])
        setTotalUnread(data.totalUnread || 0)

        // Auto-select first conversation on desktop
        if (data.conversations?.length > 0 && !selectedConversation && window.innerWidth >= 1024) {
          setSelectedConversation(data.conversations[0])
        }
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else {
        setError(data.error || t('failedToLoad'))
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await fetch('/api/guest/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedConversation.bookingId,
          reply: replyText
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setReplyText('')
        await fetchMessages()

        // Re-select the conversation to show updated messages
        const updated = conversations.find(c => c.bookingId === selectedConversation.bookingId)
        if (updated) {
          setSelectedConversation(updated)
        }
      } else {
        alert(data.error || t('failedToSend'))
      }
    } catch (err) {
      console.error('Failed to send reply:', err)
      alert(t('failedToSend'))
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return { bg: 'bg-red-600', text: 'text-white', label: t('admin') }
      case 'support':
        return { bg: 'bg-purple-600', text: 'text-white', label: t('support') }
      case 'host':
      case 'admin_as_host':
        return { bg: 'bg-blue-600', text: 'text-white', label: t('host') }
      default:
        return { bg: 'bg-green-600', text: 'text-white', label: t('you') }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loadingMessages')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('unableToLoad')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchMessages}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('messagesTitle')}</h1>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('noMessagesYet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('noMessagesDesc')}
            </p>
            <button
              onClick={() => router.push('/rentals/search')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Car className="w-5 h-5" />
              <span>{t('findACar')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main messages interface
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('messagesTitle')}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('conversationsCount', { count: conversations.length })}
                {totalUnread > 0 && (
                  <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">
                    • {t('unreadCount', { count: totalUnread })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Conversations List */}
          <div className={`space-y-3 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            {conversations.map((conversation) => (
              <button
                key={conversation.bookingId}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedConversation?.bookingId === conversation.bookingId
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Car Photo */}
                  {conversation.car.photo ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={conversation.car.photo}
                        alt={`${conversation.car.make} ${conversation.car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.bookingCode}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {conversation.car.year} {conversation.car.make} {conversation.car.model}
                    </p>

                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.senderType === 'guest' ? `${t('you')}: ` : `${conversation.lastMessage.senderName}: `}
                        {conversation.lastMessage.text}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(conversation.lastMessage.createdAt), 'MMM d, h:mm a')}
                        </span>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Conversation Thread */}
          {selectedConversation ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-200px)] lg:sticky lg:top-24">
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                    {selectedConversation.bookingCode}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {selectedConversation.car.year} {selectedConversation.car.make} {selectedConversation.car.model}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedConversation.status)}`}>
                  {selectedConversation.status}
                </span>
              </div>

              {/* Messages - REVERSED ORDER (Oldest first, newest last) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.slice().reverse().map((message) => {
                  const isYou = message.senderType === 'guest' || message.senderType === 'renter'
                  const badge = getSenderBadge(message.senderType)

                  return (
                    <div key={message.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isYou ? 'text-right' : 'text-left'}`}>
                          {isYou ? t('you') : message.senderName} • {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          isYou
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : `${badge.bg} rounded-bl-none`
                        }`}>
                          <p className="text-sm whitespace-pre-wrap text-white">
                            {message.message}
                          </p>

                          {message.hasAttachment && message.attachmentUrl && (
                            <Link
                              href={message.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs mt-2 text-white/90 hover:text-white underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>{message.attachmentName || t('viewAttachment')}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('typeMessage')}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('sendInstructions')}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('selectConversation')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}