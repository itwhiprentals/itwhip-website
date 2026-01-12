// app/partner/messages/page.tsx
// Partner Messages - Conversation threads with guests

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  IoChatbubblesOutline,
  IoSearchOutline,
  IoSendOutline,
  IoPersonOutline,
  IoCarOutline,
  IoTimeOutline,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoEllipseSharp
} from 'react-icons/io5'

interface Message {
  id: string
  senderId: string
  senderType: string
  senderName: string
  message: string
  category: string
  isRead: boolean
  isUrgent: boolean
  hasAttachment: boolean
  attachmentUrl: string | null
  attachmentName: string | null
  createdAt: string
  replyToId: string | null
}

interface Conversation {
  bookingId: string
  bookingCode: string
  vehicleName: string
  vehiclePhoto: string | null
  guestName: string
  guestEmail: string | null
  guestPhoto: string | null
  messages: Message[]
  unreadCount: number
  hasUrgent: boolean
  lastMessageAt: string
}

interface Stats {
  total: number
  unread: number
  urgent: number
  totalMessages: number
}

export default function PartnerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, urgent: 0, totalMessages: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [filter])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/partner/messages?filter=${filter}`)
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations)
        setStats(data.stats)

        // Update selected conversation if it exists
        if (selectedConversation) {
          const updated = data.conversations.find(
            (c: Conversation) => c.bookingId === selectedConversation.bookingId
          )
          if (updated) {
            setSelectedConversation(updated)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)

    // Mark as read if there are unread messages
    if (conversation.unreadCount > 0) {
      try {
        await fetch(`/api/partner/messages/${conversation.bookingId}/read`, {
          method: 'POST'
        })
        // Update local state
        setConversations(prev =>
          prev.map(c =>
            c.bookingId === conversation.bookingId
              ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
              : c
          )
        )
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - conversation.unreadCount) }))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/partner/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedConversation.bookingId,
          message: newMessage.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Add message to conversation
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, data.message],
          lastMessageAt: data.message.createdAt
        }
        setSelectedConversation(updatedConversation)
        setConversations(prev =>
          prev.map(c =>
            c.bookingId === selectedConversation.bookingId ? updatedConversation : c
          )
        )
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.guestName.toLowerCase().includes(query) ||
      c.bookingCode.toLowerCase().includes(query) ||
      c.vehicleName.toLowerCase().includes(query) ||
      c.guestEmail?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IoChatbubblesOutline className="w-7 h-7" />
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stats.total} conversations · {stats.unread} unread
            </p>
          </div>

          <button
            onClick={() => fetchMessages()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoRefreshOutline className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full sm:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ${
          selectedConversation ? 'hidden sm:flex' : 'flex'
        }`}>
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: `Unread (${stats.unread})` },
                { key: 'urgent', label: `Urgent (${stats.urgent})` }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filter === key
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <IoChatbubblesOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all' ? 'No conversations yet' : `No ${filter} messages`}
                </p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <button
                  key={conversation.bookingId}
                  onClick={() => selectConversation(conversation)}
                  className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
                    selectedConversation?.bookingId === conversation.bookingId
                      ? 'bg-orange-50 dark:bg-orange-900/10'
                      : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.guestPhoto ? (
                        <Image
                          src={conversation.guestPhoto}
                          alt=""
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <IoPersonOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`font-medium truncate ${
                            conversation.unreadCount > 0
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {conversation.guestName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conversation.vehicleName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                          {conversation.hasUrgent && (
                            <IoAlertCircleOutline className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>

                      {/* Last message preview */}
                      {conversation.messages.length > 0 && (
                        <p className={`text-sm mt-1 line-clamp-1 ${
                          conversation.unreadCount > 0
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {conversation.messages[conversation.messages.length - 1].senderType === 'host' && (
                            <span className="text-gray-400 dark:text-gray-500">You: </span>
                          )}
                          {conversation.messages[conversation.messages.length - 1].message}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${
          selectedConversation ? 'flex' : 'hidden sm:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="sm:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <IoChevronBackOutline className="w-6 h-6" />
                  </button>

                  {selectedConversation.guestPhoto ? (
                    <Image
                      src={selectedConversation.guestPhoto}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <IoPersonOutline className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedConversation.guestName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <IoCarOutline className="w-4 h-4" />
                      {selectedConversation.vehicleName}
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      #{selectedConversation.bookingCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg, index) => {
                  const isHost = msg.senderType === 'host' || msg.senderType === 'admin_as_host'
                  const showDate = index === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                    new Date(selectedConversation.messages[index - 1].createdAt).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                            {new Date(msg.createdAt).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isHost ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isHost
                                ? 'bg-orange-500 text-white rounded-br-md'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                            }`}
                          >
                            {msg.isUrgent && !isHost && (
                              <div className="flex items-center gap-1 text-red-500 text-xs mb-1">
                                <IoAlertCircleOutline className="w-3 h-3" />
                                Urgent
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            {msg.hasAttachment && msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 text-sm underline block ${
                                  isHost ? 'text-orange-100' : 'text-orange-600 dark:text-orange-400'
                                }`}
                              >
                                {msg.attachmentName || 'View Attachment'}
                              </a>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                            isHost ? 'justify-end' : 'justify-start'
                          }`}>
                            <IoTimeOutline className="w-3 h-3" />
                            {formatMessageTime(msg.createdAt)}
                            {isHost && msg.isRead && (
                              <IoCheckmarkDoneOutline className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IoSendOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <IoChatbubblesOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
