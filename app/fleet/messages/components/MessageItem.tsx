// app/fleet/messages/components/MessageItem.tsx
'use client'

import { formatDistanceToNow } from 'date-fns'

interface MessageItemProps {
  id: string
  sender: string
  senderType: 'guest' | 'host' | 'admin' | 'support'
  message: string
  timestamp: string
  isRead: boolean
  attachmentUrl?: string
  attachmentName?: string
}

export default function MessageItem({
  sender,
  senderType,
  message,
  timestamp,
  isRead,
  attachmentUrl,
  attachmentName
}: MessageItemProps) {
  const isAdmin = senderType === 'admin' || senderType === 'support'
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true })

  const getSenderColor = () => {
    switch (senderType) {
      case 'admin':
      case 'support':
        return 'bg-blue-600 text-white'
      case 'host':
        return 'bg-purple-600 text-white'
      case 'guest':
        return 'bg-green-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getSenderIcon = () => {
    switch (senderType) {
      case 'admin':
      case 'support':
        return '🛡️'
      case 'host':
        return '🏠'
      case 'guest':
        return '👤'
      default:
        return '💬'
    }
  }

  return (
    <div className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'} mb-4 sm:mb-6`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isAdmin ? 'order-last' : ''}`}>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getSenderColor()} flex items-center justify-center text-sm sm:text-base font-semibold`}>
          <span className="text-lg sm:text-xl">{getSenderIcon()}</span>
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender Name & Time */}
        <div className={`flex items-baseline gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className={`text-xs sm:text-sm font-semibold ${isAdmin ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
            {sender}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeAgo}
          </span>
          {!isRead && !isAdmin && (
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`
            max-w-full sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-lg break-words
            ${isAdmin
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
            }
          `}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap">{message}</p>

          {/* Attachment */}
          {attachmentUrl && (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                mt-2 flex items-center gap-2 p-2 rounded border transition-colors
                ${isAdmin
                  ? 'bg-blue-700 border-blue-500 hover:bg-blue-800'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }
              `}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-xs sm:text-sm truncate">{attachmentName || 'Attachment'}</span>
            </a>
          )}
        </div>

        {/* Read Receipt - For Admin Messages */}
        {isAdmin && isRead && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Read</span>
          </div>
        )}
      </div>
    </div>
  )
}