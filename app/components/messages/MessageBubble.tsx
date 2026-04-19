// Shared message bubble — used by guest MessagesPanel + host MessagesSection
// Theme: 'green' (guest app) or 'orange' (host/partner app)

'use client'

import {
  IoTimeOutline,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'

interface MessageBubbleMessage {
  id: string
  message: string
  senderType: string
  senderName?: string
  createdAt: string
  isRead?: boolean
  hasAttachment?: boolean
  attachmentUrl?: string
  attachmentName?: string
  isUrgent?: boolean
}

interface MessageBubbleProps {
  message: MessageBubbleMessage
  isSelf: boolean
  roleLabel: string
  theme: 'green' | 'orange'
}

// Format time as 3:45 PM
function formatMessageTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Turn [label](url) markdown and bare URLs in message text into clickable links
function renderMessageWithLinks(text: string, isSelf: boolean, theme: 'green' | 'orange') {
  const linkColor = isSelf
    ? 'text-white underline font-semibold'
    : theme === 'green' ? 'text-blue-300 underline hover:text-blue-200 font-semibold' : 'text-orange-300 underline hover:text-orange-200 font-semibold'
  const combined = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s]+)/g
  const out: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIdx = 0
  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) out.push(<span key={keyIdx++}>{text.slice(lastIndex, match.index)}</span>)
    if (match[1]) {
      const inner = match[1].match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)!
      out.push(<a key={keyIdx++} href={inner[2]} target="_blank" rel="noopener noreferrer" className={linkColor}>{inner[1]}</a>)
    } else if (match[2]) {
      out.push(<a key={keyIdx++} href={match[2]} target="_blank" rel="noopener noreferrer" className={linkColor}>{match[2]}</a>)
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) out.push(<span key={keyIdx++}>{text.slice(lastIndex)}</span>)
  return out
}

// Bubble colors per theme
const bubbleStyles = {
  green: {
    self: 'bg-green-600 text-white rounded-br-md',
    other: 'bg-gray-800 dark:bg-gray-700 text-white rounded-bl-md shadow-sm',
    attachSelf: 'text-green-100 hover:text-white',
    attachOther: 'text-blue-300 hover:text-blue-200',
  },
  orange: {
    self: 'bg-orange-500 text-white rounded-br-md',
    other: 'bg-gray-800 dark:bg-gray-700 text-white rounded-bl-md shadow-sm',
    attachSelf: 'text-orange-100 hover:text-white',
    attachOther: 'text-orange-300 hover:text-orange-200',
  },
}

export function MessageBubble({ message, isSelf, roleLabel, theme }: MessageBubbleProps) {
  const styles = bubbleStyles[theme]

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        {/* Bubble */}
        <div className={`px-4 py-2 rounded-2xl ${isSelf ? styles.self : styles.other}`}>
          {message.isUrgent && !isSelf && (
            <div className="flex items-center gap-1 text-red-500 text-xs mb-1">
              <IoAlertCircleOutline className="w-3 h-3" />
              Urgent
            </div>
          )}
          <p className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">{renderMessageWithLinks(message.message, isSelf, theme)}</p>
          {message.attachmentUrl && (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-[11px] mt-1 underline ${isSelf ? styles.attachSelf : styles.attachOther} transition-colors`}
            >
              {message.attachmentName || 'View attachment'}
            </a>
          )}
        </div>

        {/* Info line: Name (Role) · time · read receipt */}
        <div className={`flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 dark:text-gray-500 ${isSelf ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
          {message.senderName && (
            <span className="font-medium">
              {message.senderName.split(' ')[0]}{roleLabel ? ` (${roleLabel})` : ''}
            </span>
          )}
          <span>·</span>
          <IoTimeOutline className="w-3 h-3" />
          <span>{formatMessageTime(message.createdAt)}</span>
          {isSelf && !message.isRead && (
            <IoCheckmarkDoneOutline className="w-3 h-3 text-gray-400" />
          )}
          {isSelf && message.isRead && (
            <IoCheckmarkDoneOutline className="w-3 h-3 text-blue-500" />
          )}
        </div>
      </div>
    </div>
  )
}
