// app/admin/messages/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MessageCenter from './MessageCenter'
import { IoArrowBackOutline, IoRefreshOutline, IoSettingsOutline } from 'react-icons/io5'

export default function AdminMessagesPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <IoArrowBackOutline className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Message Center
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                title="Refresh messages"
              >
                <IoRefreshOutline className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                title="Settings"
              >
                <IoSettingsOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Center Component */}
      <MessageCenter key={refreshKey} embedded={false} />
    </div>
  )
}