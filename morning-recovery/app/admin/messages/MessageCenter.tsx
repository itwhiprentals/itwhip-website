// app/admin/messages/MessageCenter.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  IoMailOutline, 
  IoMailOpenOutline,
  IoCarSportOutline,
  IoChatbubbleOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoSendOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoFilterOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoHelpCircleOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoAttachOutline,
  IoWarningOutline
} from 'react-icons/io5'

// Types
interface Message {
  id: string
  type: 'booking' | 'contact' | 'inquiry'
  bookingId?: string
  bookingCode?: string
  carInfo?: string
  senderName: string
  senderEmail: string
  senderType: string
  subject: string
  message: string
  isRead: boolean
  isUrgent: boolean
  hasAttachment: boolean
  attachmentUrl?: string
  category?: string
  createdAt: string
  phone?: string
  metadata?: any
}

interface MessageCounts {
  total: number
  unreadRental: number
  unreadContact: number
  newInquiries: number
  urgent: number
}

export default function MessageCenter({ embedded = false }: { embedded?: boolean }) {
  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [counts, setCounts] = useState<MessageCounts>({
    total: 0,
    unreadRental: 0,
    unreadContact: 0,
    newInquiries: 0,
    urgent: 0
  })

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'booking' | 'contact' | 'inquiry'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'urgent'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Reply state
  const [showReply, setShowReply] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [senderType, setSenderType] = useState<'admin' | 'support' | 'admin_as_host'>('admin')
  const [sending, setSending] = useState(false)

  // Refs
  const messageListRef = useRef<HTMLDivElement>(null)

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        type: filterType,
        status: filterStatus,
        search: searchTerm,
        limit: '100'
      })

      const response = await fetch(`/api/admin/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setCounts(data.counts || {})
        
        // Apply client-side filtering
        applyFilters(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Apply filters
  const applyFilters = (messageList: Message[]) => {
    let filtered = [...messageList]

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType)
    }

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(m => !m.isRead)
    } else if (filterStatus === 'urgent') {
      filtered = filtered.filter(m => m.isUrgent)
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(m => 
        m.senderName.toLowerCase().includes(search) ||
        m.senderEmail.toLowerCase().includes(search) ||
        m.subject.toLowerCase().includes(search) ||
        m.message.toLowerCase().includes(search) ||
        m.bookingCode?.toLowerCase().includes(search)
      )
    }

    setFilteredMessages(filtered)
  }

  // Mark as read
  const markAsRead = async (message: Message) => {
    if (message.isRead) return

    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          type: message.type,
          action: 'mark_read'
        })
      })

      if (response.ok) {
        // Update local state
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, isRead: true } : m
        ))
        setFilteredMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, isRead: true } : m
        ))
        
        // Update counts
        if (message.type === 'booking') {
          setCounts(prev => ({ ...prev, unreadRental: Math.max(0, prev.unreadRental - 1) }))
        } else if (message.type === 'contact') {
          setCounts(prev => ({ ...prev, unreadContact: Math.max(0, prev.unreadContact - 1) }))
        } else if (message.type === 'inquiry') {
          setCounts(prev => ({ ...prev, newInquiries: Math.max(0, prev.newInquiries - 1) }))
        }
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Send reply
  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: selectedMessage.type,
          bookingId: selectedMessage.bookingId,
          recipientEmail: selectedMessage.senderEmail,
          message: replyMessage,
          senderType,
          category: 'general'
        })
      })

      if (response.ok) {
        // Reset reply form
        setReplyMessage('')
        setShowReply(false)
        
        // Show success message
        alert('Reply sent successfully!')
        
        // Refresh messages
        fetchMessages()
      } else {
        alert('Failed to send reply')
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
      alert('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  // Effects
  useEffect(() => {
    fetchMessages()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters(messages)
  }, [filterType, filterStatus, searchTerm, messages])

  // Get icon for message type
  const getMessageIcon = (type: string) => {
    switch(type) {
      case 'booking': return <IoCarSportOutline className="w-5 h-5" />
      case 'contact': return <IoMailOutline className="w-5 h-5" />
      case 'inquiry': return <IoPeopleOutline className="w-5 h-5" />
      default: return <IoChatbubbleOutline className="w-5 h-5" />
    }
  }

  // Get badge color
  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'booking': return 'bg-blue-100 text-blue-800'
      case 'contact': return 'bg-green-100 text-green-800'
      case 'inquiry': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Format time ago
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900`}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        
        {/* Header */}
        {!embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Message Center</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage all rental bookings, contact forms, and host inquiries
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.total}</p>
              </div>
              <IoChatbubbleOutline className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setFilterType('booking'); setFilterStatus('unread') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{counts.unreadRental}</p>
              </div>
              <IoCarSportOutline className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setFilterType('contact'); setFilterStatus('unread') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Contact</p>
                <p className="text-2xl font-bold text-green-600">{counts.unreadContact}</p>
              </div>
              <IoMailOutline className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setFilterType('inquiry'); setFilterStatus('unread') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Inquiries</p>
                <p className="text-2xl font-bold text-purple-600">{counts.newInquiries}</p>
              </div>
              <IoPeopleOutline className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus('urgent')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{counts.urgent}</p>
              </div>
              <IoAlertCircleOutline className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="contact">Contact</option>
              <option value="inquiry">Inquiries</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="urgent">Urgent</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={fetchMessages}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Messages List and Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Messages ({filteredMessages.length})
              </h2>
            </div>
            
            <div 
              ref={messageListRef}
              className="max-h-[600px] overflow-y-auto"
            >
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <IoMailOutline className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages found</p>
                </div>
              ) : (
                filteredMessages.map(message => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      markAsRead(message)
                    }}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${!message.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getBadgeColor(message.type)}`}>
                        {getMessageIcon(message.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${
                            !message.isRead ? 'font-bold' : ''
                          }`}>
                            {message.senderName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(message.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {message.subject}
                        </p>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                          {message.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {message.isUrgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <IoWarningOutline className="w-3 h-3 mr-1" />
                              Urgent
                            </span>
                          )}
                          {message.hasAttachment && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              <IoAttachOutline className="w-3 h-3 mr-1" />
                              Attachment
                            </span>
                          )}
                          {message.bookingCode && (
                            <span className="text-xs text-gray-500">
                              #{message.bookingCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Message Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedMessage.subject}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>From: {selectedMessage.senderName}</span>
                        <span>•</span>
                        <span>{selectedMessage.senderEmail}</span>
                        {selectedMessage.phone && (
                          <>
                            <span>•</span>
                            <span>{selectedMessage.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getBadgeColor(selectedMessage.type)}`}>
                          {selectedMessage.type}
                        </span>
                        {selectedMessage.carInfo && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedMessage.carInfo}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IoCloseOutline className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  {selectedMessage.attachmentUrl && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <a
                        href={selectedMessage.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <IoAttachOutline className="w-5 h-5 mr-2" />
                        View Attachment
                      </a>
                    </div>
                  )}
                  
                  {selectedMessage.metadata?.vehicleInfo && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vehicle Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Make:</span>
                          <span className="ml-2">{selectedMessage.metadata.vehicleInfo.make}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Model:</span>
                          <span className="ml-2">{selectedMessage.metadata.vehicleInfo.model}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Year:</span>
                          <span className="ml-2">{selectedMessage.metadata.vehicleInfo.year}</span>
                        </div>
                        {selectedMessage.metadata.vehicleInfo.mileage && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                            <span className="ml-2">{selectedMessage.metadata.vehicleInfo.mileage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                  {!showReply ? (
                    <button
                      onClick={() => setShowReply(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reply to Message
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reply as:
                        </label>
                        <select
                          value={senderType}
                          onChange={(e) => setSenderType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        >
                          <option value="admin">ItWhip Admin (Official)</option>
                          <option value="support">ItWhip Support (Friendly)</option>
                          <option value="admin_as_host">As Host (Pretend to be host)</option>
                        </select>
                      </div>
                      
                      <div>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={sendReply}
                          disabled={sending || !replyMessage.trim()}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {sending ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setShowReply(false)
                            setReplyMessage('')
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <IoMailOutline className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}