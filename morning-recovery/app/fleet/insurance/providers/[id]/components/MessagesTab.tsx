// app/fleet/insurance/providers/[id]/components/MessagesTab.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoChatbubbleOutline,
  IoSendOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoTimeOutline,
  IoAttachOutline,
  IoCheckmarkDoneOutline,
  IoMailOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface Message {
  id: string
  senderId: string
  senderType: 'FLEET' | 'PROVIDER'
  senderName: string
  message: string
  createdAt: string
  read: boolean
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface MessagesTabProps {
  providerId: string
  providerName: string
}

export default function MessagesTab({ providerId, providerName }: MessagesTabProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [providerId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/fleet/insurance/providers/${providerId}/messages?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load messages')
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError('Network error while loading messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      setError(null)
      
      const response = await fetch(`/api/fleet/insurance/providers/${providerId}/messages?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          senderType: 'FLEET',
          senderName: 'Fleet Admin' // TODO: Get from auth context
        })
      })

      if (response.ok) {
        setNewMessage('')
        textareaRef.current?.focus()
        await fetchMessages()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Network error while sending message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                Error
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <IoMailOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Provider Communication Channel
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Use this channel to communicate directly with {providerName}. Messages are logged for compliance and audit purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-col" style={{ height: '600px' }}>
        
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <IoBusinessOutline className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{providerName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Insurance Provider</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <IoChatbubbleOutline className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Messages Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Start a conversation with {providerName} by sending a message below.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isFleet = message.senderType === 'FLEET'
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFleet ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${isFleet ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isFleet 
                          ? 'bg-blue-600' 
                          : 'bg-purple-600'
                      }`}>
                        {isFleet ? (
                          <IoPersonOutline className="w-5 h-5 text-white" />
                        ) : (
                          <IoBusinessOutline className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 ${
                          isFleet
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            isFleet ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {message.senderName}
                          </p>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message}
                          </p>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center space-x-2 text-xs p-2 rounded transition-colors ${
                                    isFleet
                                      ? 'bg-blue-700 hover:bg-blue-800'
                                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  }`}
                                >
                                  <IoAttachOutline className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{attachment.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Read Status */}
                        <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                          isFleet ? 'justify-end' : 'justify-start'
                        }`}>
                          <IoTimeOutline className="w-3 h-3" />
                          <span>{formatTimestamp(message.createdAt)}</span>
                          {isFleet && message.read && (
                            <IoCheckmarkDoneOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${providerName}...`}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={sending}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium h-[82px] transition-colors"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <IoSendOutline className="w-5 h-5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Message Guidelines */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Communication Guidelines
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>All messages are logged and auditable for compliance purposes</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Response time from provider may vary (typically 24-48 hours)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>For urgent matters, use the provider's contact phone or email</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Include claim references when discussing specific claims</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Maintain professional communication at all times</span>
          </li>
        </ul>
      </div>

    </div>
  )
}