// app/(guest)/rentals/dashboard/bookings/[id]/components/MessagesPanel.tsx

import React, { useRef, useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Message } from '../types'
import { Send, Paperclip } from './Icons'
import { MessageBubble, DateSeparator } from '@/app/components/messages'

interface MessagesPanelProps {
  bookingId: string
  messages: Message[]
  loading: boolean
  sending: boolean
  error: string | null
  onSendMessage: (message: string) => Promise<void>
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  uploadingFile: boolean
  readOnly?: boolean
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({
  bookingId,
  messages,
  loading,
  sending,
  error,
  onSendMessage,
  onFileUpload,
  uploadingFile,
  readOnly = false
}) => {
  const t = useTranslations('BookingDetail')
  const locale = useLocale()
  const [newMessage, setNewMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll within the messages container (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    await onSendMessage(newMessage)
    setNewMessage('')
    setShowQuickActions(false)
  }

  const handleQuickAction = async (action: string) => {
    await onSendMessage(action)
    setShowQuickActions(false)
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Title row — inside the card */}
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('messages')}</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {messages.length !== 1 ? t('messageCount', { count: messages.length }) : t('messageCountSingular', { count: messages.length })}
        </span>
      </div>

      <div ref={messagesContainerRef} className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-[320px] lg:h-[450px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">{t('noMessagesYet')}</p>
            <p className="text-xs mt-1">{t('startConversation')}</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {messages.map((msg, idx) => {
              const isGuest = msg.senderType === 'guest' || msg.senderType === 'renter'
              const isSystem = msg.senderType === 'SYSTEM' || msg.senderType === 'system'
              const showDate = idx === 0 ||
                new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString()
              const roleLabel = isSystem ? '' : (isGuest ? t('guest') : t('host'))

              return (
                <React.Fragment key={msg.id}>
                  {showDate && <DateSeparator date={msg.createdAt} locale={locale} />}
                  <MessageBubble message={msg} isSelf={isGuest} roleLabel={roleLabel} theme="green" />
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {showQuickActions && messages.length === 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">{t('quickMessages')}</p>
              <div className="flex flex-wrap gap-1.5">
                {[t('quickThankYou'), t('quickPickupTime'), t('quickDocsUploaded'), t('quickPickupLocation'), t('quickExtendRental')].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    disabled={sending}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                id="message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={t('typeMessage')}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                disabled={sending}
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title={t('attachFile')}
            >
              <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            className="hidden"
            accept="image/*,.pdf"
            disabled={uploadingFile}
          />
        </div>
      )}
    </div>
  )
}
