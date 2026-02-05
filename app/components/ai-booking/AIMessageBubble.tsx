'use client'

import Image from 'next/image'

interface AIMessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function AIMessageBubble({ role, content, isStreaming }: AIMessageBubbleProps) {
  if (role === 'user') {
    return <UserBubble content={content} />
  }
  return <AssistantBubble content={content} isStreaming={isStreaming} />
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-4 py-2.5 bg-primary text-white rounded-2xl rounded-br-sm text-sm leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function AssistantBubble({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  return (
    <div className="flex gap-2">
      <Image src="/images/choe-logo.png" alt="Choé" width={28} height={28} className="flex-shrink-0 w-7 h-7 rounded-md" />
      <div className="max-w-[85%] px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-line">
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-gray-400 dark:bg-gray-500 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
