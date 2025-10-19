// app/fleet/messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageFilters, MessageInbox, ConversationView } from './components'
import { UploadResult } from '@/lib/cloudinary-upload'

interface Message {
  id: string
  type: 'booking' | 'contact' | 'inquiry'
  bookingId?: string
  bookingCode?: string
  subject: string
  preview: string
  sender: string
  senderEmail: string
  category: string
  isRead: boolean
  isUrgent: boolean
  timestamp: string
  guestName?: string
  carInfo?: string
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const key = searchParams?.get('key')

  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (key) {
      fetchMessages()
    }
  }, [key])

  useEffect(() => {
    applyFilter(activeFilter)
  }, [messages, activeFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/fleet/api/messages?key=${key}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setMessages(data.messages || [])
      } else {
        setError(data.error || 'Failed to load messages')
        console.error('API Error:', data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = (filter: string) => {
    let filtered = [...messages]

    switch (filter) {
      case 'unread':
        filtered = messages.filter(m => !m.isRead)
        break
      case 'booking':
        filtered = messages.filter(m => m.type === 'booking')
        break
      case 'contact':
        filtered = messages.filter(m => m.type === 'contact')
        break
      case 'inquiry':
        filtered = messages.filter(m => m.type === 'inquiry')
        break
      case 'urgent':
        filtered = messages.filter(m => m.isUrgent)
        break
      default:
        // 'all' - no filtering
        break
    }

    setFilteredMessages(filtered)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
    
    // Mark as read
    if (!message.isRead) {
      markAsRead(message.id)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'mark_read' })
      })

      // Update local state
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, isRead: true } : m)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleSendReply = async (
    messageId: string, 
    reply: string, 
    attachments?: UploadResult[]
  ) => {
    try {
      console.log('[MESSAGE PAGE] Sending reply:', { 
        messageId, 
        replyLength: reply?.length,
        attachmentCount: attachments?.length || 0 
      })

      // Validate inputs
      if (!messageId) {
        throw new Error('Message ID is required')
      }
      if (!reply || !reply.trim()) {
        throw new Error('Reply text is required')
      }

      const response = await fetch(`/fleet/api/messages/reply?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messageId, 
          reply: reply.trim(),
          attachments: attachments || []
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('[MESSAGE PAGE] ✅ Reply sent successfully')
        // Refresh messages to show updated status
        fetchMessages()
      } else {
        console.error('[MESSAGE PAGE] ❌ API Error:', data)
        throw new Error(data.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('[MESSAGE PAGE] ❌ Failed to send reply:', error)
      throw error
    }
  }

  const counts = {
    all: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    booking: messages.filter(m => m.type === 'booking').length,
    contact: messages.filter(m => m.type === 'contact').length,
    inquiry: messages.filter(m => m.type === 'inquiry').length,
    urgent: messages.filter(m => m.isUrgent).length
  }

  if (!key) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please access this page with a valid authentication key.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Message Center
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {loading ? 'Loading messages...' : `${counts.all} total messages, ${counts.unread} unread`}
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error Loading Messages</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchMessages}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6">
          <MessageFilters
            filter={activeFilter}
            counts={counts}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inbox */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-160px)]">
            <MessageInbox
              messages={filteredMessages}
              selectedMessage={selectedMessage}
              onSelectMessage={handleSelectMessage}
            />
          </div>

          {/* Conversation View */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-160px)]">
            <ConversationView
              message={selectedMessage}
              onSendReply={handleSendReply}
              onRefresh={fetchMessages}
            />
          </div>
        </div>
      </div>
    </div>
  )
}