'use client'

import Image from 'next/image'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  if (role === 'user') {
    return <UserBubble content={content} />
  }
  return <AssistantBubble content={content} isStreaming={isStreaming} />
}

function UserBubble({ content }: { content: string }) {
  // Strip internal [id:...] tags so the raw vehicle ID isn't shown to the user
  const displayText = content.replace(/\s*\[id:[^\]]+\]/g, '')

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-4 py-2.5 bg-primary text-white rounded-2xl rounded-br-sm text-sm leading-relaxed">
        {displayText}
      </div>
    </div>
  )
}

function AssistantBubble({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  return (
    <div className="flex gap-2 items-start">
      <Image
        src="/images/choe-logo.png"
        alt="Choé"
        width={96}
        height={28}
        className="flex-shrink-0 h-7 w-auto rounded-md object-contain"
      />
      <div className="max-w-[85%] px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-line">
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-gray-400 dark:bg-gray-500 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
