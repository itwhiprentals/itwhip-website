'use client'

import { useState } from 'react'
import { ChatViewStreaming, ChatView } from '@/app/components/ai'

export default function TestStreamingClient() {
  const [mode, setMode] = useState<'streaming' | 'legacy'>('streaming')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setMode('streaming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'streaming'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Streaming (New)
        </button>
        <button
          onClick={() => setMode('legacy')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'legacy'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Legacy
        </button>
      </div>

      {/* Chat View */}
      <div className="pt-16 h-screen">
        {mode === 'streaming' ? (
          <ChatViewStreaming
            onNavigateToBooking={(id, start, end) => {
              console.log('Navigate to booking:', { id, start, end })
              alert(`Would navigate to booking: ${id}`)
            }}
            onNavigateToLogin={() => {
              console.log('Navigate to login')
              alert('Would navigate to login')
            }}
            onClassicSearch={() => {
              console.log('Classic search')
              setMode('legacy')
            }}
          />
        ) : (
          <ChatView
            onNavigateToBooking={(id, start, end) => {
              console.log('Navigate to booking:', { id, start, end })
              alert(`Would navigate to booking: ${id}`)
            }}
            onNavigateToLogin={() => {
              console.log('Navigate to login')
              alert('Would navigate to login')
            }}
            onClassicSearch={() => {
              console.log('Classic search')
              setMode('streaming')
            }}
          />
        )}
      </div>
    </div>
  )
}
