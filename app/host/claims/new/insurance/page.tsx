// app/host/claims/new/insurance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ClaimForm from '../../components/ClaimForm'
import {
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

export default function InsuranceClaimPage() {
  const router = useRouter()
  const [hostId, setHostId] = useState<string | null>(null)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch host info on mount
  useEffect(() => {
    checkHostStatus()
  }, [])

  const checkHostStatus = async () => {
    try {
      const response = await fetch('/api/host/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch host info')
      }

      const data = await response.json()
      setHostId(data.profile?.id || null)
      setIsApproved(data.profile?.approvalStatus === 'APPROVED')
    } catch (err) {
      console.error('Error checking host status:', err)
      setIsApproved(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (claimId: string) => {
    // Navigate to the new claim details page
    router.push(`/host/claims/${claimId}`)
  }

  const handleCancel = () => {
    router.push('/host/claims')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not approved state
  if (isApproved === false) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
            <IoWarningOutline className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Account Approval Required
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Only approved hosts can file new insurance claims. Complete your account verification to unlock this feature.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/host/profile"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Complete Verification
              </Link>
              <Link
                href="/host/claims"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                View Existing Claims
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Approved - show form
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pt-20">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full overflow-x-hidden">
        {/* Back button */}
        <Link
          href="/host/claims/new"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 group"
        >
          <IoArrowBackOutline className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Claim Types</span>
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                File Insurance Claim
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Submit a claim for incidents during the rental period covered by insurance
              </p>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {/* What you'll need */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    What You'll Need
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Booking information</li>
                    <li>• Incident description</li>
                    <li>• Estimated repair costs</li>
                    <li>• Photos of damage (optional)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Processing time */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                    What Happens Next
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• Review within 24-48 hours</li>
                    <li>• Email updates on status</li>
                    <li>• Payout if approved</li>
                    <li>• Dispute option if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim form - NO WRAPPER */}
        <ClaimForm
          hostId={hostId || ''}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* Help section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <IoDocumentTextOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Need Help?
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Contact our support team at{' '}
                <a 
                  href="mailto:info@itwhip.com" 
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  info@itwhip.com
                </a>
                {' '}or call{' '}
                <a 
                  href="tel:+1-800-555-0123" 
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  1-800-555-0123
                </a>
                {' '}for assistance with filing an insurance claim.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}