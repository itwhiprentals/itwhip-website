// app/partner/bookings/[id]/components/MessagesSection.tsx
// Extracted messages/chat section from booking detail page

'use client'

import React, { RefObject } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoChatbubbleOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoSendOutline,
} from 'react-icons/io5'
import { MessageBubble, DateSeparator } from '@/app/components/messages'

interface MessagesSectionProps {
  bookingMessages: any[]
  newMessage: string
  setNewMessage: (msg: string) => void
  sendingMessage: boolean
  sendBookingMessage: () => void
  messagesContainerRef: RefObject<HTMLDivElement | null>
  expanded: boolean
  onToggle: () => void
  readOnly?: boolean
}

export function MessagesSection({
  bookingMessages,
  newMessage,
  setNewMessage,
  sendingMessage,
  sendBookingMessage,
  messagesContainerRef,
  expanded,
  onToggle,
  readOnly = false,
}: MessagesSectionProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Title row — inside the card */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left p-4"
      >
        <div className="flex items-center gap-2">
          <IoChatbubbleOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdMessages')}</h3>
          {bookingMessages.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {bookingMessages.length}
            </span>
          )}
          {bookingMessages.filter((m: any) => !m.isRead && m.senderType !== 'host').length > 0 && (
            <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {bookingMessages.filter((m: any) => !m.isRead && m.senderType !== 'host').length}
            </span>
          )}
        </div>
        {expanded ? <IoChevronUpOutline className="w-5 h-5 text-gray-400" /> : <IoChevronDownOutline className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <>
          {/* Message Thread */}
          <div ref={messagesContainerRef} className="h-[350px] lg:h-[400px] overflow-y-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {bookingMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
                <IoChatbubbleOutline className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">{t('bdNoMessagesYet')}</p>
                <p className="text-xs mt-1">{t('bdStartConversation')}</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {bookingMessages.map((msg: any, index: number) => {
                  const isHost = msg.senderType === 'host' || msg.senderType === 'admin_as_host'
                  const showDate = index === 0 ||
                    new Date(msg.createdAt).toDateString() !== new Date(bookingMessages[index - 1].createdAt).toDateString()
                  const roleLabel = isHost ? t('bdHost') : t('bdGuest')

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && <DateSeparator date={msg.createdAt} />}
                      <MessageBubble message={msg} isSelf={isHost} roleLabel={roleLabel} theme="orange" />
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </div>

          {/* Message Input — hidden for terminal bookings */}
          {!readOnly && (
            <div className="flex gap-2 px-4 py-2 lg:py-4 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendBookingMessage()
                  }
                }}
                placeholder={t('bdTypeMessage')}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={sendingMessage}
              />
              <button
                onClick={sendBookingMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="p-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <IoSendOutline className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
