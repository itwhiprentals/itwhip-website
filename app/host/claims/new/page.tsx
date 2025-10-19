// app/host/claims/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoReceiptOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoWarningOutline
} from 'react-icons/io5'

export default function ClaimTypeSelectionPage() {
  const router = useRouter()
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

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
      setIsApproved(data.profile?.approvalStatus === 'APPROVED')
    } catch (err) {
      console.error('Error checking host status:', err)
      setIsApproved(false)
    } finally {
      setLoading(false)
    }
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
              Only approved hosts can file new claims. Complete your account verification to unlock this feature.
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

  // Approved - show claim type selection
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Back button */}
        <Link
          href="/host/claims"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 group"
        >
          <IoArrowBackOutline className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Claims</span>
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            File New Claim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose the type of claim you'd like to file
          </p>
        </div>

        {/* Claim Type Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insurance Claim Card */}
          <Link
            href="/host/claims/new/insurance"
            className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Insurance Claim
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              File claims for incidents during the rental period covered by insurance
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Covers:
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoAlertCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                  <span>Accidents & Collisions</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoAlertCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                  <span>Theft & Vandalism</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoAlertCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>Weather Damage</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoAlertCircleOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-500" />
                  <span>Mechanical Issues</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Processing time</span>
                <span className="font-medium text-gray-900 dark:text-white">24-48 hours</span>
              </div>
            </div>
          </Link>

          {/* After Trip Charges Card */}
          <Link
            href="/host/claims/new/trip-charges"
            className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoReceiptOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              After Trip Charges
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              File claims for additional charges discovered after trip completion
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Covers:
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span>Excess Mileage</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-500" />
                  <span>Fuel Charges</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                  <span>Cleaning Fees</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                  <span>Late Return Fees</span>
                </li>
                <li className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                  <span>Additional Damage</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Guest dispute window</span>
                <span className="font-medium text-gray-900 dark:text-white">48 hours</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <IoAlertCircleOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Which claim type should I choose?
              </h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Insurance Claims:</strong> Use for incidents that occurred during the rental period and require insurance coverage (accidents, theft, major damage).
                </p>
                <p>
                  <strong>After Trip Charges:</strong> Use for additional charges discovered after the trip ended (mileage overages, cleaning, minor damage, fuel).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}