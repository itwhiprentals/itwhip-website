// app/fleet/monitoring/components/QuickActionsCard.tsx
// Quick actions for monitoring dashboard

'use client'

import { useState } from 'react'
import {
  IoFlashOutline,
  IoNotificationsOutline,
  IoDownloadOutline,
  IoSettingsOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoTrashOutline,
  IoListOutline
} from 'react-icons/io5'
import AlertSettingsModal from './AlertSettingsModal'

interface Props {
  onTestAlert?: () => Promise<void>
  onRefresh?: () => void
  onClearResolved?: () => Promise<void>
}

export default function QuickActionsCard({ onTestAlert, onRefresh, onClearResolved }: Props) {
  const [testingAlert, setTestingAlert] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)
  const [clearingResolved, setClearingResolved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleTestAlert = async () => {
    if (!onTestAlert) return
    setTestingAlert(true)
    setTestSuccess(false)
    try {
      await onTestAlert()
      setTestSuccess(true)
      setTimeout(() => setTestSuccess(false), 3000)
    } finally {
      setTestingAlert(false)
    }
  }

  const handleClearResolved = async () => {
    if (!onClearResolved) return
    setClearingResolved(true)
    try {
      await onClearResolved()
    } finally {
      setClearingResolved(false)
    }
  }

  const actions = [
    {
      id: 'test-alert',
      label: testSuccess ? 'Alert Created!' : 'Test Alert',
      icon: testSuccess ? IoCheckmarkCircleOutline : IoNotificationsOutline,
      color: testSuccess ? 'text-green-500' : 'text-orange-500',
      bgColor: testSuccess ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-orange-500/10 hover:bg-orange-500/20',
      onClick: handleTestAlert,
      loading: testingAlert,
      description: 'Create a test alert'
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: IoRefreshOutline,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      onClick: onRefresh,
      description: 'Reload all metrics'
    },
    {
      id: 'export',
      label: 'Export Logs',
      icon: IoDownloadOutline,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      onClick: () => {
        // Download security events as JSON
        const link = document.createElement('a')
        link.href = '/api/fleet/monitoring?range=7d'
        link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`
        link.click()
      },
      description: 'Download 7-day logs'
    },
    {
      id: 'settings',
      label: 'Alert Settings',
      icon: IoSettingsOutline,
      color: 'text-gray-600 dark:text-gray-300',
      bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
      onClick: () => setSettingsOpen(true),
      description: 'Configure notifications'
    },
    {
      id: 'clear-resolved',
      label: 'Clear Resolved',
      icon: IoTrashOutline,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20',
      onClick: handleClearResolved,
      loading: clearingResolved,
      description: 'Delete resolved alerts'
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: IoListOutline,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      onClick: () => {
        // Scroll to security events section
        document.getElementById('security-events')?.scrollIntoView({ behavior: 'smooth' })
      },
      description: 'View security events'
    }
  ]

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <IoFlashOutline className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>

        {/* Actions Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {actions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.loading}
                className={`p-3 rounded-lg ${action.bgColor} transition-colors text-left disabled:opacity-50`}
              >
                <Icon className={`w-5 h-5 ${action.color} mb-2 ${action.loading ? 'animate-spin' : ''}`} />
                <p className={`text-sm font-medium ${action.color}`}>
                  {action.loading ? 'Processing...' : action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Status Info */}
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Alerts powered by your existing infrastructure</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              System Active
            </span>
          </div>
        </div>
      </div>

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
