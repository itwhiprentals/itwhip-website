// app/host/profile/components/tabs/DocumentsTab.tsx
'use client'

import { IoDocumentTextOutline, IoWarningOutline, IoBanOutline } from 'react-icons/io5'
import DocumentUploadSection from '@/app/host/components/DocumentUploadSection'

interface HostProfile {
  id: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  documentStatuses?: {
    governmentId?: 'pending' | 'approved' | 'rejected'
    driversLicense?: 'pending' | 'approved' | 'rejected'
    insurance?: 'pending' | 'approved' | 'rejected'
  }
}

interface DocumentsTabProps {
  profile: HostProfile
  isApproved: boolean
  isSuspended: boolean
  onDocumentUpdate: () => void
}

export default function DocumentsTab({
  profile,
  isApproved,
  isSuspended,
  onDocumentUpdate
}: DocumentsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pending Banner - Not approved and not suspended */}
      {!isApproved && !isSuspended && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                Document Verification Required
              </p>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                Upload all required documents to complete your verification. Our team typically reviews documents within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approved Banner - Keep documents updated */}
      {isApproved && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
              Keep your documents up to date. Expired documents may result in booking restrictions.
            </div>
          </div>
        </div>
      )}

      {/* Suspended Banner - Uploads disabled */}
      {isSuspended && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-red-800 dark:text-red-300">
              Document uploads are disabled while your account is suspended.
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Section - Existing component */}
      <DocumentUploadSection 
        hostId={profile.id}
        documentStatuses={profile.documentStatuses || {}}
        onDocumentUpdate={onDocumentUpdate}
      />
    </div>
  )
}