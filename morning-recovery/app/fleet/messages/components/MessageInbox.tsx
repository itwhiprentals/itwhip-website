// app/fleet/messages/components/MessageInbox.tsx
'use client'

import { formatDistanceToNow } from 'date-fns'
import { 
  IoCarSportOutline, 
  IoChatbubbleEllipsesOutline, 
  IoBusinessOutline, 
  IoMailOutline,
  IoWarningOutline
} from 'react-icons/io5'

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

interface MessageInboxProps {
  messages: Message[]
  selectedMessage: Message | null
  onSelectMessage: (message: Message) => void
}

export default function MessageInbox({ messages, selectedMessage, onSelectMessage }: MessageInboxProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': 
        return <IoCarSportOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
      case 'contact': 
        return <IoChatbubbleEllipsesOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      case 'inquiry': 
        return <IoBusinessOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
      default: 
        return <IoMailOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
    }
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      booking: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      contact: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      inquiry: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    }
    return styles[type as keyof typeof styles] || styles.booking
  }

  // Safe timestamp formatter with fallback
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Invalid timestamp:', timestamp, error)
      return 'Recently'
    }
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <IoMailOutline className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No messages found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Desktop Only */}
      <div className="hidden sm:block px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Inbox ({messages.length})
        </h3>
      </div>

      {/* Message List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
        {messages.map((message) => {
          const isSelected = selectedMessage?.id === message.id
          const timeAgo = formatTimestamp(message.timestamp)

          return (
            <button
              key={message.id}
              onClick={() => onSelectMessage(message)}
              className={`
                w-full text-left px-4 py-3 sm:py-4 transition-colors relative
                ${isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                }
                ${!message.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
              `}
            >
              {/* Unread Indicator */}
              {!message.isRead && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}

              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(message.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${!message.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>
                          {message.sender || message.guestName || 'Unknown'}
                        </div>
                        {message.bookingCode && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {message.bookingCode}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {timeAgo.replace('about ', '').replace(' ago', '')}
                      </div>
                    </div>

                    {/* Subject & Preview */}
                    <div className={`text-xs mb-1 truncate ${!message.isRead ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {message.preview}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadge(message.type)}`}>
                        {message.type}
                      </span>
                      {message.isUrgent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-1">
                          <IoWarningOutline className="w-3 h-3" />
                          <span>Urgent</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getTypeIcon(message.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Sender & Time */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className={`text-sm ${!message.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white truncate`}>
                        {message.sender || message.guestName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {timeAgo}
                      </div>
                    </div>

                    {/* Booking Code */}
                    {message.bookingCode && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {message.bookingCode} {message.carInfo && `• ${message.carInfo}`}
                      </div>
                    )}

                    {/* Subject */}
                    <div className={`text-sm mb-1 truncate ${!message.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {message.subject}
                    </div>

                    {/* Preview */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {message.preview}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadge(message.type)}`}>
                        {message.type}
                      </span>
                      {message.category !== 'general' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {message.category}
                        </span>
                      )}
                      {message.isUrgent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                          <IoWarningOutline className="w-3 h-3" />
                          <span>Urgent</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}