// app/(guest)/rentals/components/modals/CancellationPolicyModal.tsx

'use client'

import { useState, useRef } from 'react'

// Icon Components
const XCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Calendar = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DollarSign = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldCheck = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Download = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
)

const DocumentText = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

interface CancellationPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CancellationPolicyModal({ 
  isOpen, 
  onClose 
}: CancellationPolicyModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [refundCalculator, setRefundCalculator] = useState({
    tripTotal: 500,
    hoursBeforePickup: 72,
    includesProtection: true
  })
  const contentRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const threshold = 50
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold
    if (isNearBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert('PDF download will be implemented')
  }

  const calculateRefund = () => {
    const { tripTotal, hoursBeforePickup } = refundCalculator
    let refundPercentage = 0
    let serviceFeeRefund = 0
    let protectionRefund = 0
    
    // Updated refund tiers with Trip Protection
    if (hoursBeforePickup >= 72) {
      refundPercentage = 100
      if (hoursBeforePickup >= 168) { // 7 days
        serviceFeeRefund = tripTotal * 0.10 // Full service fee refund
      }
      // Trip Protection portion (embedded in service fee)
      protectionRefund = 0 // Already included in service fee
    } else if (hoursBeforePickup >= 24) {
      refundPercentage = 75
    } else if (hoursBeforePickup >= 12) {
      refundPercentage = 50
    } else {
      refundPercentage = 0
    }
    
    const refundAmount = (tripTotal * refundPercentage) / 100
    return {
      percentage: refundPercentage,
      amount: refundAmount,
      serviceFee: serviceFeeRefund,
      protection: protectionRefund,
      total: refundAmount + serviceFeeRefund
    }
  }

  if (!isOpen) return null

  const refund = calculateRefund()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cancellation & Refund Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Trip Protection Notice */}
        <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-xs text-green-800 dark:text-green-200">
              <strong>Trip Protection Active Until Pickup:</strong> Your Trip Protection coverage remains active until your scheduled 
              pickup time, even if you cancel. This ensures you're protected if plans change.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Quick Reference Timeline */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Cancellation Timeline</h3>
              
              <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 dark:from-green-900/20 dark:via-yellow-900/20 dark:to-red-900/20 rounded-lg p-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="relative">
                    {/* Timeline Bar */}
                    <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="absolute top-8 left-0 w-1/4 h-2 bg-green-500 rounded-l-full"></div>
                    <div className="absolute top-8 left-1/4 w-1/4 h-2 bg-blue-500"></div>
                    <div className="absolute top-8 left-2/4 w-1/4 h-2 bg-yellow-500"></div>
                    <div className="absolute top-8 left-3/4 w-1/4 h-2 bg-red-500 rounded-r-full"></div>
                    
                    {/* Timeline Points */}
                    <div className="relative flex justify-between">
                      <div className="text-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mb-2"></div>
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">72+ hours</p>
                        <p className="text-xs text-green-600 dark:text-green-400">100% refund</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mb-2"></div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">24-72 hours</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">75% refund</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mb-2"></div>
                        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">12-24 hours</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">50% refund</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mb-2"></div>
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">&lt; 12 hours</p>
                        <p className="text-xs text-red-600 dark:text-red-400">No refund</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Calculator */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                Refund Calculator
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Trip Total ($)
                    </label>
                    <input
                      type="number"
                      value={refundCalculator.tripTotal}
                      onChange={(e) => setRefundCalculator({
                        ...refundCalculator,
                        tripTotal: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      step="50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Hours Before Pickup
                    </label>
                    <input
                      type="number"
                      value={refundCalculator.hoursBeforePickup}
                      onChange={(e) => setRefundCalculator({
                        ...refundCalculator,
                        hoursBeforePickup: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Refund Percentage:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{refund.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trip Refund:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${refund.amount.toFixed(2)}</span>
                    </div>
                    {refund.serviceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Service Fee Refund:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${refund.serviceFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trip Protection:</span>
                      <span className="text-xs text-green-600 dark:text-green-400">Included (non-refundable)</span>
                    </div>
                    <div className="border-t dark:border-gray-600 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total Refund:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">${refund.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Note: Trip Protection is embedded in our service and remains active until pickup time, providing peace of mind even after cancellation.
                </p>
              </div>
            </section>

            {/* Guest Cancellation Policy */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Guest Cancellation Policy</h3>
              
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">72+ Hours Before Pickup</h4>
                      <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                        <li>• 100% refund of rental cost</li>
                        <li>• Full service fee refund if 7+ days before</li>
                        <li>• Security deposit never charged</li>
                        <li>• Trip Protection coverage continues until pickup time</li>
                        <li>• No impact on your rental history</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">24-72 Hours Before Pickup</h4>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• 75% refund of rental cost</li>
                        <li>• Service fee non-refundable</li>
                        <li>• Trip Protection remains active</li>
                        <li>• Host may offer reschedule option</li>
                        <li>• Priority rebooking assistance available</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">12-24 Hours Before Pickup</h4>
                      <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                        <li>• 50% refund of rental cost</li>
                        <li>• Service fee and Trip Protection non-refundable</li>
                        <li>• May request host consideration for emergency</li>
                        <li>• Support team can mediate special circumstances</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Less Than 12 Hours Before Pickup</h4>
                      <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                        <li>• No refund of rental cost</li>
                        <li>• All fees non-refundable</li>
                        <li>• May affect future instant booking privileges</li>
                        <li>• Exceptions only for documented emergencies</li>
                        <li>• Host receives full payout minus platform fee</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Host Cancellation Policy */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Host Cancellation Policy</h3>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">When Host Cancels</h4>
                    <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• Guest receives 100% refund including all fees</li>
                      <li>• Trip Protection fee fully refunded</li>
                      <li>• ItWhip provides $50 travel credit for inconvenience</li>
                      <li>• Priority assistance finding alternative vehicle</li>
                      <li>• We may cover price difference for comparable car</li>
                      <li>• Host faces penalties and possible suspension</li>
                      <li>• Affects host's Super Host status eligibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Trip Protection & Cancellation */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Trip Protection & Cancellations</h3>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">How Trip Protection Works with Cancellations</h4>
                    <div className="text-xs text-green-800 dark:text-green-200 space-y-2">
                      <p>
                        <strong>Coverage Continues:</strong> Even after you cancel, Trip Protection remains active until your 
                        original pickup time. This means if you change your mind or rebook, you're still covered.
                      </p>
                      <p>
                        <strong>No Separate Charge:</strong> Trip Protection is included in every rental at no additional cost. 
                        It's part of our platform service, not a separate insurance product you need to cancel.
                      </p>
                      <p>
                        <strong>Protection Benefits:</strong> If something happens to prevent your trip (covered emergency, 
                        natural disaster, etc.), Trip Protection may provide additional refund consideration beyond standard policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Circumstances */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Special Circumstances</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Covered by Trip Protection</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Full refunds may be provided for:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Death or serious illness (documentation required)</li>
                    <li>• Natural disasters affecting area</li>
                    <li>• Government travel restrictions</li>
                    <li>• Vehicle mechanical failure (host's fault)</li>
                    <li>• Jury duty or court subpoena</li>
                    <li>• Military deployment</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Not Covered - No Refund</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    No refunds provided for:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• No-show without cancellation</li>
                    <li>• Failed verification at pickup</li>
                    <li>• Invalid or suspended license</li>
                    <li>• DUI/DWI discovered</li>
                    <li>• False information provided</li>
                    <li>• Credit card declined at pickup</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Documentation Required:</strong> For special circumstance refunds, you must provide documentation 
                  within 14 days of cancellation. Our Trip Protection team reviews each case individually.
                </p>
              </div>
            </section>

            {/* How to Cancel */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">How to Cancel Your Booking</h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Open the ItWhip app or website and log in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Go to "My Trips" in your dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Select the booking you want to cancel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Click "Modify or Cancel Booking"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">5.</span>
                    <span>Review refund amount and confirm cancellation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">6.</span>
                    <span>Receive instant confirmation with refund timeline</span>
                  </li>
                </ol>
                
                <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <strong>Pro Tip:</strong> Before cancelling, message your host about rescheduling. Many hosts prefer 
                    to modify dates rather than lose the booking entirely.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Processing */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Refund Processing</h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Processing Timeline</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Credit/Debit Cards: 5-10 business days</li>
                      <li>• PayPal: 3-5 business days</li>
                      <li>• Apple Pay/Google Pay: 3-5 business days</li>
                      <li>• ItWhip credit: Instant (can use immediately)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Important Notes</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Refunds go to original payment method</li>
                      <li>• Bank processing times may vary</li>
                      <li>• Arizona Transaction Privilege Tax refunded per state law</li>
                      <li>• Security deposits are never charged if cancelled</li>
                      <li>• Trip Protection ensures coverage until pickup time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Frequently Asked Questions</h3>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: What happens to my Trip Protection if I cancel?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Trip Protection remains active until your original pickup time. It's included in every rental and 
                    continues to cover you for any qualifying events, even after cancellation. There's no separate charge 
                    or refund for Trip Protection as it's embedded in our service.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: Can I modify my booking instead of cancelling?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Yes! Contact the host through messages to request date changes. Many hosts are flexible and prefer 
                    modification over cancellation. Changes may incur price differences but avoid cancellation penalties.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: What if I need to cancel due to COVID-19 or illness?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Our Trip Protection covers documented illness, including COVID-19. Provide a doctor's note or test 
                    result within 14 days for full refund consideration, regardless of cancellation timing.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Q: Do hosts get penalized when I cancel?
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    A: Hosts receive compensation based on our cancellation timeline. For late cancellations, hosts get 
                    partial payment to cover their lost opportunity. Our Trip Protection helps ensure both parties are 
                    treated fairly.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Support */}
            <section className="mb-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Need Help with Cancellation?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  Our support team is available 24/7 to assist with cancellations and special circumstances
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Phone:</strong> 1-855-703-0806 (Priority for same-day trips)
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Email:</strong> info@itwhip.com
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>In-App:</strong> Chat with support directly
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <strong>Response Time:</strong> Under 10 minutes for urgent cancellations
                  </p>
                </div>
              </div>
            </section>

            {/* Policy Links */}
            <div className="border-t dark:border-gray-600 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                This policy works in conjunction with our comprehensive Trip Protection
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a href="/protection/coverage-details" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Trip Protection Details
                </a>
                <a href="/terms" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Terms of Service
                </a>
                <a href="/protection/claims" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Claims Process
                </a>
                <a href="/host/cancellation" className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-center">
                  Host Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownload}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
              >
                <DocumentText className="w-4 h-4 mr-1" />
                Print
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}