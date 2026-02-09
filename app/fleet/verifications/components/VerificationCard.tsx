// app/fleet/verifications/components/VerificationCard.tsx
'use client'

import { useState } from 'react'
import {
  IoCarOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoArrowForwardOutline,
} from 'react-icons/io5'
import type { Verification } from '../types'
import AIBadge from './AIBadge'
import DocDots from './DocDots'
import DocPreview from './DocPreview'
import AIAnalysisPanel from './AIAnalysisPanel'
import StripeIdentityPanel from './StripeIdentityPanel'
import VerificationStatusBanner from './VerificationStatusBanner'

interface VerificationCardProps {
  v: Verification
  expanded: boolean
  onToggle: () => void
  onApprove: () => void
  onReject: (notes?: string) => void
  actionLoading: boolean
  formatDate: (d: string) => string
  formatTimeAgo: (d: string | null) => string
}

export default function VerificationCard({
  v, expanded, onToggle, onApprove, onReject, actionLoading, formatDate, formatTimeAgo,
}: VerificationCardProps) {
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const isReviewed = v.verificationStatus === 'APPROVED' || v.verificationStatus === 'REJECTED'

  const borderColor =
    v.aiRecommendation === 'REJECT' ? 'border-red-300 dark:border-red-700' :
    v.aiRecommendation === 'REVIEW' ? 'border-yellow-300 dark:border-yellow-700' :
    'border-gray-200 dark:border-gray-700'

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${borderColor}`}>
        {/* Main row — clickable header */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          onClick={onToggle}
        >
          {/* Car photo */}
          {v.car.photoUrl ? (
            <img src={v.car.photoUrl} alt="" className="w-14 h-10 object-cover rounded flex-shrink-0" />
          ) : (
            <div className="w-14 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
              <IoCarOutline className="text-gray-400" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 dark:text-white text-sm">{v.bookingCode}</span>
              <AIBadge aiScore={v.aiScore} aiRecommendation={v.aiRecommendation} />
              {v.stripeVerified && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                  Stripe
                </span>
              )}
              <DocDots hasLicenseFront={v.hasLicenseFront} hasLicenseBack={v.hasLicenseBack} hasInsurance={v.hasInsurance} />
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <IoPersonOutline className="w-3.5 h-3.5" />
                {v.guestName || v.guestEmail}
              </span>
              <span>{v.car.year} {v.car.make} {v.car.model}</span>
              <span>{formatDate(v.startDate)} - {formatDate(v.endDate)}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="text-right flex-shrink-0">
            {isReviewed ? (
              <StatusBadge status={v.verificationStatus} />
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <IoTimeOutline />
                {formatTimeAgo(v.documentsSubmittedAt)}
              </div>
            )}
          </div>

          <IoArrowForwardOutline className={`text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Combined status banner */}
            <VerificationStatusBanner
              aiScore={v.aiScore}
              aiPassed={v.aiPassed}
              stripeVerified={v.stripeVerified}
              stripeStatus={v.stripe?.status || null}
              hasAccount={v.stripe !== null}
            />

            {/* Document photos */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Documents</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DocPreview label="DL Front" url={v.licensePhotoUrl} onView={setLightboxUrl} />
                <DocPreview label="DL Back" url={v.licenseBackPhotoUrl} onView={setLightboxUrl} />
                <DocPreview label="Insurance" url={v.insurancePhotoUrl} onView={setLightboxUrl} />
                <DocPreview label="Selfie" url={null} onView={setLightboxUrl} />
              </div>
            </div>

            {/* Claude AI panel */}
            {v.aiScore !== null && (
              <AIAnalysisPanel
                bookingId={v.id}
                aiScore={v.aiScore}
                aiPassed={v.aiPassed}
                aiCriticalFlags={v.aiCriticalFlags}
                aiInfoFlags={v.aiInfoFlags}
                aiExtractedName={v.aiExtractedName}
                aiNameMatch={v.aiNameMatch}
                aiModel={v.aiModel}
                aiAt={v.aiAt}
                formatTimeAgo={formatTimeAgo}
              />
            )}

            {/* Stripe Identity panel */}
            <StripeIdentityPanel
              stripe={v.stripe}
              guestName={v.guestName}
              formatTimeAgo={formatTimeAgo}
            />

            {/* Guest details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <DetailItem label="Guest" value={v.guestName || '—'} />
              <DetailItem label="Email" value={v.guestEmail || '—'} />
              <DetailItem label="License State" value={v.licenseState || '—'} />
              <DetailItem label="Host" value={v.hostName} />
            </div>

            {/* Actions */}
            {!isReviewed && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoCheckmarkCircle />
                  )}
                  Approve
                </button>
                {!showRejectInput ? (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <IoCloseCircle />
                    Reject
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Rejection reason..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => { onReject(rejectNotes); setShowRejectInput(false) }}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Review notes if already reviewed */}
            {isReviewed && v.verificationNotes && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Notes:</span> {v.verificationNotes}
                {v.reviewedBy && <> &middot; by {v.reviewedBy}</>}
                {v.reviewedAt && <> &middot; {formatTimeAgo(v.reviewedAt)}</>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Document"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

// Small helper — avoids repeating detail item markup
function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'APPROVED'
  const colorClass = isApproved
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {isApproved ? 'Approved' : 'Rejected'}
    </span>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500 dark:text-gray-400 block">{label}</span>
      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  )
}
