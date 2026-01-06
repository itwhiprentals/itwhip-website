// app/fleet/messages/components/ConversationView.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ReplyBox, BookingContextCard } from './index'
import AttachmentDisplay, { Attachment } from './AttachmentDisplay'
import { IoWarningOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { UploadResult } from '@/lib/cloudinary-upload'
import Link from 'next/link'

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

interface Reply {
  id: string
  senderType: string
  senderName: string
  senderEmail: string
  message: string
  timestamp: string
  attachments?: Attachment[]
}

interface BookingDetails {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  numberOfDays: number
  status: string
  tripStatus?: string
  pickupLocation?: string
  pickupType?: string
  deliveryAddress?: string
  car: {
    id: string
    make: string
    model: string
    year: number
    color?: string
    carType?: string
    transmission?: string
    seats?: number
    photos?: { url: string }[]
  }
  renter?: {
    name?: string
    email?: string
  }
  guestName?: string
  guestEmail?: string
  host?: {
    name?: string
  }
}

interface ConversationViewProps {
  message: Message | null
  onSendReply: (messageId: string, reply: string, attachments?: UploadResult[], senderType?: string) => Promise<void>
  onRefresh: () => void
}

export default function ConversationView({ message, onSendReply, onRefresh }: ConversationViewProps) {
  const [sending, setSending] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(false)
  const [replyAsType, setReplyAsType] = useState<'support' | 'host' | 'admin'>('support')
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch replies when message changes
  useEffect(() => {
    if (message) {
      fetchReplies()
      // Reset reply type when switching messages
      setReplyAsType('support')
      
      // Fetch booking details if this is a booking message
      if (message.type === 'booking' && message.bookingId) {
        fetchBookingDetails(message.bookingId)
      } else {
        setBookingDetails(null)
      }
    } else {
      setReplies([])
      setBookingDetails(null)
    }
  }, [message?.id])

  // Auto-scroll to bottom when replies change
  useEffect(() => {
    scrollToBottom()
  }, [replies])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchReplies = async () => {
    if (!message) return

    setLoading(true)
    try {
      // Fetch the full message with replies
      const response = await fetch(`/fleet/api/messages/${message.id}?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.message?.replies) {
          setReplies(Array.isArray(data.message.replies) ? data.message.replies : [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error)
      setReplies([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingDetails = async (bookingId: string) => {
    setLoadingBooking(true)
    try {
      const response = await fetch(`/fleet/api/bookings/${bookingId}?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.booking) {
          setBookingDetails(data.booking)
        }
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error)
      setBookingDetails(null)
    } finally {
      setLoadingBooking(false)
    }
  }

  const handleSendReply = async (reply: string, attachments?: UploadResult[]) => {
    if (!message) return
    
    setSending(true)
    try {
      // Pass the selected sender type
      await onSendReply(message.id, reply, attachments, replyAsType)
      // Refresh to get the new reply
      await fetchReplies()
      onRefresh()
    } finally {
      setSending(false)
    }
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          label: 'Admin'
        }
      case 'support':
        return {
          bg: 'bg-purple-600',
          text: 'text-white',
          label: 'Support'
        }
      case 'host':
      case 'admin_as_host':
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          label: 'Host'
        }
      default:
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          label: 'Guest'
        }
    }
  }

  const getReplyAsOptions = () => {
    if (message?.type === 'booking') {
      return [
        { value: 'support', label: '💬 Support (ItWhip Support Team)', description: 'Reply as ItWhip support team' },
        { value: 'host', label: '🚗 Host (Impersonate Car Owner)', description: 'Pretend to be the host' },
        { value: 'admin', label: '👔 Admin (Official ItWhip)', description: 'Official admin response' }
      ]
    } else if (message?.type === 'inquiry') {
      return [
        { value: 'support', label: '💬 Support (ItWhip Support Team)', description: 'Reply as support' },
        { value: 'admin', label: '👔 Admin (Official ItWhip)', description: 'Official admin response' }
      ]
    } else {
      // Contact messages - only support
      return [
        { value: 'support', label: '💬 Support (ItWhip Support Team)', description: 'Reply as support' }
      ]
    }
  }

  const handleViewFullBooking = () => {
    if (message?.bookingId) {
      window.open(`/fleet/bookings/${message.bookingId}`, '_blank')
    }
  }

  if (!message) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center h-full flex items-center justify-center">
        <div>
          <IoChatbubbleEllipsesOutline className="w-20 h-20 sm:w-24 sm:h-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a message
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose a conversation from the inbox to view and reply
          </p>
        </div>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'contact': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      case 'inquiry': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const hasReplies = replies.length > 0
  const replyAsOptions = getReplyAsOptions()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="sm:hidden">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                {message.sender || message.guestName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {message.senderEmail}
              </p>
              {message.bookingCode && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.bookingCode}
                </p>
              )}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {message.sender || message.guestName}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(message.type)}`}>
                  {message.type}
                </span>
                {message.isUrgent && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                    <IoWarningOutline className="w-3 h-3" />
                    <span>Urgent</span>
                  </span>
                )}
                {hasReplies && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {message.senderEmail}
              </p>
              {message.bookingCode && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{message.bookingCode}</span>
                  {message.carInfo && (
                    <>
                      <span>•</span>
                      <span>{message.carInfo}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefresh()
                fetchReplies()
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {message.bookingId && (
              <Link
                href={`/fleet/bookings/${message.bookingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Booking</span>
              </Link>
            )}
          </div>
        </div>

        <div className="sm:hidden flex items-center gap-2 mt-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(message.type)}`}>
            {message.type}
          </span>
          {message.category !== 'general' && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {message.category}
            </span>
          )}
          {message.isUrgent && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
              <IoWarningOutline className="w-3 h-3" />
              <span>Urgent</span>
            </span>
          )}
          {hasReplies && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
              {replies.length}
            </span>
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Original Message */}
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full ${getSenderBadge('guest').bg} ${getSenderBadge('guest').text} flex items-center justify-center text-xs font-semibold`}>
                    {(message.sender || message.guestName || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {message.sender || message.guestName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {message.subject}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.preview}
                  </p>
                </div>
              </div>
            </div>

            {/* Replies */}
            {replies.map((reply) => {
              const isAdmin = reply.senderType === 'admin' || reply.senderType === 'support'
              const isHost = reply.senderType === 'host' || reply.senderType === 'admin_as_host'
              const badge = getSenderBadge(reply.senderType)
              
              return (
                <div key={reply.id} className={`flex ${(isAdmin || isHost) ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    <div className={`flex items-center gap-2 mb-2 ${(isAdmin || isHost) ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-xs font-semibold`}>
                        {reply.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className={(isAdmin || isHost) ? 'text-right' : ''}>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          {reply.senderName}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(reply.timestamp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      (isAdmin || isHost)
                        ? `${badge.bg} rounded-tr-none`
                        : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'
                    }`}>
                      <p className={`text-sm whitespace-pre-wrap ${
                        (isAdmin || isHost)
                          ? 'text-white' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {reply.message}
                      </p>
                      
                      {/* Display Attachments */}
                      {reply.attachments && reply.attachments.length > 0 && (
                        <AttachmentDisplay 
                          attachments={reply.attachments}
                          compact={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply Box with Booking Context and "Reply As" Selection */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {/* Booking Context Card (only for booking messages) */}
        {message.type === 'booking' && bookingDetails && (
          <BookingContextCard
            booking={bookingDetails}
            loading={loadingBooking}
            onViewDetails={handleViewFullBooking}
          />
        )}

        {/* Reply As Dropdown (only for booking/inquiry messages) */}
        {replyAsOptions.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reply as:
            </label>
            <select
              value={replyAsType}
              onChange={(e) => setReplyAsType(e.target.value as any)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {replyAsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {replyAsOptions.find(o => o.value === replyAsType)?.description}
            </p>
          </div>
        )}

        <ReplyBox onSendReply={handleSendReply} sending={sending} />
      </div>
    </div>
  )
}