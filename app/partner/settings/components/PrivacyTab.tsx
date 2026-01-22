// app/partner/settings/components/PrivacyTab.tsx
'use client'

import {
  IoDownloadOutline,
  IoWarningOutline,
  IoTrashOutline
} from 'react-icons/io5'

interface PrivacyTabProps {
  userStatus: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED' | undefined
  deletionScheduledFor: string | null | undefined
  onExportData: () => Promise<void>
  onCancelDeletion: () => Promise<void>
  onShowDeleteModal: () => void
  isExporting: boolean
  isCancellingDeletion: boolean
  exportError: string
}

export function PrivacyTab({
  userStatus,
  deletionScheduledFor,
  onExportData,
  onCancelDeletion,
  onShowDeleteModal,
  isExporting,
  isCancellingDeletion,
  exportError
}: PrivacyTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Privacy</h2>

      {/* Download My Data */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IoDownloadOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Download My Data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Get a copy of your partner profile, fleet data, bookings, and earnings
              </p>
            </div>
          </div>
          <button
            onClick={onExportData}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <IoDownloadOutline className="w-4 h-4" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
        {exportError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-3">{exportError}</p>
        )}
      </div>

      {/* Pending Deletion Warning */}
      {userStatus === 'PENDING_DELETION' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Account Scheduled for Deletion
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Your account will be permanently deleted on{' '}
                <strong>
                  {deletionScheduledFor
                    ? new Date(deletionScheduledFor).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '30 days from request'}
                </strong>
              </p>
              <button
                onClick={onCancelDeletion}
                disabled={isCancellingDeletion}
                className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCancellingDeletion ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Deletion</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {userStatus !== 'PENDING_DELETION' && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-3">
            <IoWarningOutline className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Danger Zone
            </h3>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Delete Account
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Permanently delete your partner account, fleet listings, and all associated data. This action cannot be undone after the 30-day grace period.
                </p>
              </div>
              <button
                onClick={onShowDeleteModal}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
              >
                <IoTrashOutline className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
