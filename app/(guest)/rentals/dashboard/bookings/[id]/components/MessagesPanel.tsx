// app/(guest)/rentals/dashboard/bookings/[id]/components/MessagesPanel.tsx

import React, { useRef, useState, useEffect } from 'react'
import { Message } from '../types'
import { Send, Paperclip, User } from './Icons'
import { getTimeAgo, formatTime } from '../utils/helpers'
import { QUICK_ACTION_MESSAGES } from '../constants'

interface MessagesPanelProps {
  bookingId: string
  messages: Message[]
  loading: boolean
  sending: boolean
  error: string | null
  onSendMessage: (message: string) => Promise<void>
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  uploadingFile: boolean
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({
  bookingId,
  messages,
  loading,
  sending,
  error,
  onSendMessage,
  onFileUpload,
  uploadingFile
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const renderMessage = (msg: Message, idx: number) => {
    const isGuest = msg.senderType === 'guest' || msg.senderType === 'renter'
    const showDate = idx === 0 || 
      new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString()
    const isAdmin = msg.senderType?.includes('admin')
    const isHost = msg.senderType?.includes('host')
    const isSupport = msg.senderType?.includes('support')
    
    return (
      <div key={msg.id}>
        {showDate && (
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
              {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
        
        <div className={`flex items-start gap-1.5 ${isGuest ? 'justify-end' : 'justify-start'}`}>
          {!isGuest && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              {isHost ? (
                <span className="text-[10px] font-bold text-gray-600">H</span>
              ) : isAdmin ? (
                <span className="text-[10px] font-bold text-gray-600">A</span>
              ) : isSupport ? (
                <span className="text-[10px] font-bold text-gray-600">S</span>
              ) : (
                <User className="w-3 h-3 text-gray-500" />
              )}
            </div>
          )}
          
          <div className={`max-w-[75%] lg:max-w-[60%]`}>
            {!isGuest && msg.senderName && (
              <p className="text-[10px] font-medium text-gray-500 mb-0.5 ml-2">
                {msg.senderName}
              </p>
            )}
            <div className={`inline-block rounded-2xl px-3 py-1.5 ${
              isGuest 
                ? 'bg-green-600 text-white' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <p className={`text-sm leading-relaxed ${isGuest ? 'text-white' : 'text-gray-700'}`}>
                {msg.message}
              </p>
              {msg.attachmentUrl && (
                <a
                  href={msg.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[11px] mt-1 ${
                    isGuest ? 'text-green-100 hover:text-white' : 'text-blue-600 hover:text-blue-700'
                  } transition-colors`}
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="underline">{msg.attachmentName || 'View attachment'}</span>
                </a>
              )}
            </div>
            <p className={`text-[10px] text-gray-400 mt-0.5 ${isGuest ? 'text-right mr-2' : 'ml-2'}`}>
              {formatTime(msg.createdAt)}
              {isGuest && !msg.isRead && (
                <span className="ml-1">✓</span>
              )}
              {isGuest && msg.isRead && (
                <span className="ml-1 text-blue-500">✓✓</span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <span className="text-xs text-gray-500">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="border border-gray-200 rounded-lg bg-gray-50 h-[400px] lg:h-[450px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start a conversation with your host</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {showQuickActions && messages.length === 0 && (
        <div className="mt-2 px-1">
          <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Quick messages</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTION_MESSAGES.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={sending}
                className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700 disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 mt-3">
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
            placeholder="Type a message..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            disabled={sending}
          />
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4 text-gray-500" />
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
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
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
  )
}