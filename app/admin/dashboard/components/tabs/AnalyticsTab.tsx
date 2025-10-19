// app/admin/dashboard/components/tabs/AnalyticsTab.tsx
'use client'

import { IoConstructOutline } from 'react-icons/io5'

export default function AnalyticsTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <IoConstructOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Analytics Management
      </h3>
      <p className="text-gray-600 dark:text-gray-400">This section is under construction</p>
    </div>
  )
}