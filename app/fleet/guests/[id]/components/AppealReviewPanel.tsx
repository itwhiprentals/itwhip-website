// app/fleet/guests/[id]/components/AppealReviewPanel.tsx
'use client'

import { useState } from 'react'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface AppealData {
  id: string
  reason: string
  evidence: any
  status: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  guest: {
    id: string
    name: string
    email: string
    suspensionLevel: string | null
    warningCount: number
  }
  moderation: {
    actionType: string
    suspensionLevel: string | null
    publicReason: string
    internalNotes: string
    takenBy: string
    takenAt: string
  }
}

interface AppealReviewPanelProps {
  appeal: AppealData
  onReviewComplete: () => void
}

export default function AppealReviewPanel({ appeal, onReviewComplete }: AppealReviewPanelProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showDenyDialog, setShowDenyDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [processing, setProcessing] = useState(false)

  const isResolved = appeal.status === 'APPROVED' || appeal.status === 'DENIED'

  const handleApproveClick = () => {
    setShowApproveDialog(true)
  }

  const handleDenyClick = () => {
    setShowDenyDialog(true)
  }

  const handleApprove = async () => {
    if (!reviewerName.trim()) {
      alert('Please enter your name')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(
        `/fleet/api/appeals/${appeal.id}/review?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'APPROVED',
            reviewedBy: reviewerName,
            reviewNotes: reviewNotes || 'Appeal approved. Suspension lifted.'
          })
        }
      )

      if (response.ok) {
        alert('Appeal approved! Guest suspension has been lifted.')
        setShowApproveDialog(false)
        onReviewComplete()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve appeal')
      }
    } catch (error) {
      console.error('Error approving appeal:', error)
      alert('Failed to approve appeal')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!reviewerName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!reviewNotes.trim()) {
      alert('Please provide a reason for denial')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(
        `/fleet/api/appeals/${appeal.id}/review?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'DENIED',
            reviewedBy: reviewerName,
            reviewNotes
          })
        }
      )

      if (response.ok) {
        alert('Appeal denied. Original suspension remains in effect.')
        setShowDenyDialog(false)
        onReviewComplete()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to deny appeal')
      }
    } catch (error) {
      console.error('Error denying appeal:', error)
      alert('Failed to deny appeal')
    } finally {
      setProcessing(false)
    }
  }

  const renderEvidence = () => {
    if (!appeal.evidence || (Array.isArray(appeal.evidence) && appeal.evidence.length === 0)) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No evidence provided
        </p>
      )
    }

    const evidenceArray = Array.isArray(appeal.evidence) ? appeal.evidence : []

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidenceArray.map((item: any, index: number) => {
          const url = typeof item === 'string' ? item : item.url
          const isPdf = url?.toLowerCase().endsWith('.pdf')

          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isPdf ? (
                <div className="flex flex-col items-center">
                  <IoDocumentTextOutline className="w-12 h-12 text-red-600 mb-2" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    PDF Document
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Image {index + 1}
                  </span>
                </div>
              )}
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Appeal Review
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          appeal.status === 'PENDING' 
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : appeal.status === 'UNDER_REVIEW'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : appeal.status === 'APPROVED'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {appeal.status}
        </span>
      </div>

      {/* Guest Info Card */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <IoPersonOutline className="w-4 h-4 mr-2" />
          Guest Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-white">{appeal.guest.name}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{appeal.guest.email}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Current Status</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {appeal.guest.suspensionLevel || 'Active'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Warnings</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {appeal.guest.warningCount}
            </p>
          </div>
        </div>
      </div>

      {/* Original Moderation Action */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
        <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
          <IoAlertCircleOutline className="w-4 h-4 mr-2" />
          Original Moderation Action
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-orange-700 dark:text-orange-300 font-medium">
              {appeal.moderation.actionType}
              {appeal.moderation.suspensionLevel && ` (${appeal.moderation.suspensionLevel})`}
            </p>
          </div>
          <div>
            <p className="text-orange-600 dark:text-orange-400 text-xs">Public Reason:</p>
            <p className="text-orange-800 dark:text-orange-200">
              {appeal.moderation.publicReason}
            </p>
          </div>
          {appeal.moderation.internalNotes && (
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-xs">Internal Notes:</p>
              <p className="text-orange-800 dark:text-orange-200">
                {appeal.moderation.internalNotes}
              </p>
            </div>
          )}
          <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 pt-2">
            <IoCalendarOutline className="w-3 h-3 mr-1" />
            Taken by {appeal.moderation.takenBy} on{' '}
            {new Date(appeal.moderation.takenAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Guest's Appeal */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Guest's Appeal Statement
        </h3>
        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mb-4">
          {appeal.reason}
        </p>

        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <IoImageOutline className="w-4 h-4 mr-2" />
          Supporting Evidence
        </h4>
        {renderEvidence()}

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          <IoCalendarOutline className="w-3 h-3 mr-1" />
          Submitted {new Date(appeal.submittedAt).toLocaleString()}
        </div>
      </div>

      {/* Review Section (if already reviewed) */}
      {isResolved && (
        <div className={`rounded-lg p-4 border ${
          appeal.status === 'APPROVED'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 flex items-center ${
            appeal.status === 'APPROVED'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {appeal.status === 'APPROVED' ? (
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
            ) : (
              <IoCloseCircleOutline className="w-5 h-5 mr-2" />
            )}
            Review Decision
          </h3>
          <div className={`text-sm space-y-2 ${
            appeal.status === 'APPROVED'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            <p>
              <strong>Reviewed by:</strong> {appeal.reviewedBy}
            </p>
            <p>
              <strong>Date:</strong> {appeal.reviewedAt && new Date(appeal.reviewedAt).toLocaleString()}
            </p>
            {appeal.reviewNotes && (
              <div>
                <strong>Notes:</strong>
                <p className="mt-1">{appeal.reviewNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isResolved && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleApproveClick}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
            Approve Appeal
          </button>
          <button
            onClick={handleDenyClick}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <IoCloseCircleOutline className="w-5 h-5 mr-2" />
            Deny Appeal
          </button>
        </div>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Approve Appeal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will clear the guest's suspension and restore full access to their account.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name (Reviewer) *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add any notes about your decision..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing || !reviewerName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Dialog */}
      {showDenyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Deny Appeal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The guest's suspension will remain in effect. Please provide a clear explanation for the denial.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name (Reviewer) *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Denial *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Explain why this appeal is being denied..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDenyDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={processing || !reviewerName.trim() || !reviewNotes.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Confirm Denial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}