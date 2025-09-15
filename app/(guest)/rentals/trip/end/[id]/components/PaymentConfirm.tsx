// app/(guest)/rentals/trip/end/[id]/components/PaymentConfirm.tsx

'use client'

import { useState } from 'react'
import { formatCharge } from '@/app/lib/trip/calculations'
import { 
  IoWalletOutline, 
  IoDocumentTextOutline, 
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoReceiptOutline,
  IoScaleOutline
} from 'react-icons/io5'

interface PaymentConfirmProps {
  booking: any
  data: any
  charges: any
  depositAmount?: number
  onTermsAcceptance?: (accepted: boolean) => void
  onSubmit?: () => void
  submitting?: boolean
}

export function PaymentConfirm({ 
  booking, 
  data, 
  charges, 
  depositAmount = 500,
  onTermsAcceptance,
  onSubmit,
  submitting = false
}: PaymentConfirmProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [processingMethod, setProcessingMethod] = useState<'immediate' | 'hold'>('hold')

  const totalCharges = charges?.total || 0
  const hasDisputes = data.disputes && data.disputes.length > 0
  const hasDamage = data.damageReported
  
  // Calculate deposit impact
  const depositBalance = depositAmount - totalCharges
  const additionalChargeNeeded = totalCharges > depositAmount ? totalCharges - depositAmount : 0
  const depositToBeReleased = depositBalance > 0 ? depositBalance : 0

  // If there are disputes, charges should be held
  const chargeMethod = hasDisputes ? 'hold' : processingMethod

  // Calculate tax (Arizona TPT 5.6%)
  const taxRate = 0.056
  const baseTripCost = booking.totalAmount / (1 + taxRate) // Back-calculate base from total
  const tripTax = booking.totalAmount - baseTripCost

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Complete Your Trip</h3>
        <p className="text-sm text-gray-600 mt-1">
          Review final charges and deposit settlement
        </p>
      </div>

      {/* Trip Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Trip Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicle</span>
            <span className="font-medium">
              {booking.car.year} {booking.car.make} {booking.car.model}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Miles</span>
            <span className="font-medium">
              {data.odometer - booking.startMileage} miles
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fuel Return</span>
            <span className="font-medium">{data.fuelLevel}</span>
          </div>
          {hasDamage && (
            <div className="flex justify-between text-amber-600">
              <span>Damage Reported</span>
              <span className="font-medium">Under Review</span>
            </div>
          )}
        </div>
      </div>

      {/* Complete Payment Breakdown */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start mb-3">
          <IoReceiptOutline className="w-5 h-5 text-gray-700 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-3">Payment & Receipt Summary</h4>
            
            <div className="space-y-3">
              {/* Initial Payment Section */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Initial Booking (Paid)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rental ({booking.nights} days)</span>
                    <span>${baseTripCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arizona TPT Tax (5.6%)</span>
                    <span>${tripTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Paid at Booking</span>
                    <span className="text-green-700">${booking.totalAmount.toFixed(2)} ✓</span>
                  </div>
                </div>
              </div>

              {/* Security Deposit Section */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Security Deposit Settlement</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit Hold</span>
                    <span className="font-medium">${depositAmount.toFixed(2)}</span>
                  </div>
                  {totalCharges > 0 && (
                    <>
                      <div className="flex justify-between text-red-600">
                        <span>Trip-End Charges</span>
                        <span>-${totalCharges.toFixed(2)}</span>
                      </div>
                      <div className="pt-1 border-t">
                        {depositToBeReleased > 0 ? (
                          <div className="flex justify-between font-medium">
                            <span>To Be Released</span>
                            <span className="text-green-600">${depositToBeReleased.toFixed(2)}</span>
                          </div>
                        ) : additionalChargeNeeded > 0 ? (
                          <div className="flex justify-between font-medium">
                            <span>Additional Due</span>
                            <span className="text-red-600">${additionalChargeNeeded.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between font-medium">
                            <span>Fully Applied</span>
                            <span>$0.00</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {totalCharges === 0 && (
                    <div className="flex justify-between font-medium pt-1 border-t">
                      <span>Full Release</span>
                      <span className="text-green-600">${depositAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Total */}
              <div className="bg-gray-900 text-white rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Trip Cost</span>
                  <span className="text-lg font-bold">
                    ${(booking.totalAmount + totalCharges).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Get Your Deposit Back */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-gray-700 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">Deposit Return Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                <div>
                  <span className="font-medium">Return on Time</span>
                  <p className="text-gray-600">Avoid $50/hour late fees</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                <div>
                  <span className="font-medium">Same Fuel Level</span>
                  <p className="text-gray-600">Avoid $9/gallon + $25 fee</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                <div>
                  <span className="font-medium">Stay Within Miles</span>
                  <p className="text-gray-600">Avoid $0.45/mile overage</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                <div>
                  <span className="font-medium">No Damage</span>
                  <p className="text-gray-600">Normal wear accepted</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                <div>
                  <span className="font-medium">Follow Rules</span>
                  <p className="text-gray-600">No smoking ($250 fee)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charges Breakdown (if any) */}
      {totalCharges > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Trip-End Charges Detail</h4>
          <div className="space-y-2">
            {charges.breakdown.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{formatCharge(item.amount)}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between font-medium">
                <span>Total Charges</span>
                <span>{formatCharge(totalCharges)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disputes Notice */}
      {hasDisputes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <IoAlertCircleOutline className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-900">Disputes Under Review</h4>
              <p className="text-sm text-amber-800 mt-1">
                Per A.R.S. §33-1321(D), disputed charges held pending resolution.
              </p>
              <ul className="mt-2 space-y-1">
                {data.disputes.map((dispute: string, index: number) => (
                  <li key={index} className="text-xs text-amber-700">
                    • {dispute}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h4>
        <div className="flex items-center">
          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
            <svg className="w-6 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">•••• •••• •••• {booking.last4 || '4242'}</p>
            <p className="text-xs text-gray-500">Same card used for deposit hold</p>
          </div>
        </div>
      </div>

      {/* Processing Options */}
      {!hasDisputes && totalCharges > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Charge Processing</p>
          <label className="flex items-start p-3 border rounded-lg cursor-pointer border-gray-300 hover:border-gray-400">
            <input
              type="radio"
              checked={processingMethod === 'hold'}
              onChange={() => setProcessingMethod('hold')}
              className="mt-0.5 mr-3"
            />
            <div>
              <p className="text-sm font-medium">24-Hour Review (Recommended)</p>
              <p className="text-xs text-gray-500">Review charges before processing</p>
            </div>
          </label>
          <label className="flex items-start p-3 border rounded-lg cursor-pointer border-gray-300 hover:border-gray-400">
            <input
              type="radio"
              checked={processingMethod === 'immediate'}
              onChange={() => setProcessingMethod('immediate')}
              className="mt-0.5 mr-3"
            />
            <div>
              <p className="text-sm font-medium">Process Immediately</p>
              <p className="text-xs text-gray-500">Faster deposit release</p>
            </div>
          </label>
        </div>
      )}

      {/* Arizona Legal Compliance */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <IoScaleOutline className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Legal Compliance</h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <p className="font-medium text-gray-700">A.R.S. §33-1321</p>
                <ul className="space-y-0.5 mt-1">
                  <li>• 7-14 day release</li>
                  <li>• Itemized statement</li>
                  <li>• 48-hour disputes</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700">Your Rights</p>
                <ul className="space-y-0.5 mt-1">
                  <li>• Normal wear exempt</li>
                  <li>• Email receipt</li>
                  <li>• Photo evidence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked)
              onTermsAcceptance?.(e.target.checked)
            }}
            className="mt-0.5 mr-3"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              I confirm the vehicle has been returned. My ${depositAmount} deposit will be settled per 
              A.R.S. §33-1321. I'll receive an itemized statement within 14 days and have 48 hours to dispute charges.
            </p>
          </div>
        </label>
      </div>

      {/* Single Action Button */}
      <div className="pt-4">
        <button
          onClick={() => onSubmit?.()}
          disabled={!acceptedTerms || submitting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            acceptedTerms && !submitting
              ? 'bg-gray-900 hover:bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Processing...' : hasDisputes ? 'Complete Trip & Submit Disputes' : 'Complete Trip'}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Receipt emailed immediately • Deposit released in 7-14 business days
        </p>
      </div>
    </div>
  )
}