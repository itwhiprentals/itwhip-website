// app/sys-2847/fleet/components.tsx
'use client'

import { useState } from 'react'
import { CarStatus } from './types'

// Status Badge Component
export function StatusBadge({ status }: { status: CarStatus }) {
  const colors = {
    AVAILABLE: 'bg-green-500',
    BOOKED: 'bg-blue-500',
    MAINTENANCE: 'bg-yellow-500',
    PENDING_INSPECTION: 'bg-orange-500',
    UNLISTED: 'bg-gray-500',
    RETIRED: 'bg-red-500'
  }

  return (
    <span className={`px-2 py-1 text-xs rounded-full text-white ${colors[status]}`}>
      {status}
    </span>
  )
}

// Quick Stats Card
export function StatCard({ 
  title, 
  value, 
  color = 'blue' 
}: { 
  title: string
  value: string | number
  color?: string 
}) {
  // Dynamic color classes for both light and dark mode
  const textColors = {
    white: 'text-gray-900 dark:text-white',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${textColors[color as keyof typeof textColors] || textColors.blue}`}>
        {value}
      </div>
    </div>
  )
}

// Loading Spinner
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
    </div>
  )
}

// Empty State
export function EmptyState({ 
  message = 'No cars found',
  actionText = 'Add First Car',
  onAction
}: {
  message?: string
  actionText?: string
  onAction?: () => void
}) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-600 dark:text-gray-400 mb-4">{message}</div>
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

// Section Header
export function SectionHeader({ 
  title, 
  description 
}: { 
  title: string
  description?: string 
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
  )
}

// Alert Component
export function Alert({ 
  type = 'info',
  message 
}: { 
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string 
}) {
  const colors = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300'
  }

  return (
    <div className={`p-3 rounded border ${colors[type]} text-sm mb-4`}>
      {message}
    </div>
  )
}