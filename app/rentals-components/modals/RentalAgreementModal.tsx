// app/(guest)/rentals/components/modals/RentalAgreementModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { 
  IoCloseOutline,
  IoDownloadOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoPrintOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoScaleOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCheckmarkDoneOutline,
  IoCarOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface RentalCarWithDetails {
  id: string
  make: string
  model: string
  year: number
  carType: string
  seats: number
  dailyRate: number
  rating?: number
  totalTrips?: number
  address?: string
  photos?: Array<{
    url: string
    alt?: string
  }>
  host?: {
    name: string
    profilePhoto?: string
    responseTime?: number
  }
}

interface SavedBookingDetails {
  carId: string
  carClass: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  deliveryType: string
  deliveryAddress: string
  insuranceType: string
  addOns: {
    refuelService: boolean
    additionalDriver: boolean
    extraMiles: boolean
    vipConcierge: boolean
  }
  pricing: {
    days: number
    dailyRate: number
    basePrice: number
    insurancePrice: number
    deliveryFee: number
    serviceFee: number
    taxes: number
    total: number
    deposit: number
    breakdown: {
      refuelService: number
      additionalDriver: number
      extraMiles: number
      vipConcierge: number
    }
  }
}

interface GuestDetails {
  name: string
  email: string
  bookingCode: string
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedAt?: Date | string
  approvedBy?: string
}

interface AgreementTracking {
  viewedAt?: Date | string
  agreedAt?: Date | string
  ipAddress?: string
}

interface RentalAgreementModalProps {
  isOpen: boolean
  onClose: () => void
  carDetails?: RentalCarWithDetails
  bookingDetails?: SavedBookingDetails
  guestDetails?: GuestDetails
  context?: 'preview' | 'booking' | 'dashboard'
  agreementTracking?: AgreementTracking
  onAgree?: (accepted: boolean) => void
}

// Helper function to determine vehicle tier and coverage
const getVehicleTierInfo = (carType?: string, dailyRate?: number) => {
  if (!carType || !dailyRate) {
    return {
      tier: 'standard',
      deposit: 500,
      deductible: 500,
      liability: '$750,000',
      commission: '15%',
      minAge: 21,
      creditScore: null
    }
  }

  // Determine tier based on car type and daily rate
  if (carType === 'exotic' || dailyRate > 500) {
    return {
      tier: 'exotic',
      deposit: 2500,
      deductible: 2500,
      liability: '$2,000,000',
      commission: '22%',
      minAge: 30,
      creditScore: 750
    }
  } else if (carType === 'luxury' || carType === 'premium' || dailyRate > 200) {
    return {
      tier: carType === 'premium' || dailyRate > 350 ? 'premium' : 'luxury',
      deposit: carType === 'premium' || dailyRate > 350 ? 1000 : 750,
      deductible: carType === 'premium' || dailyRate > 350 ? 1000 : 750,
      liability: carType === 'premium' || dailyRate > 350 ? '$1,500,000' : '$1,000,000',
      commission: carType === 'premium' || dailyRate > 350 ? '20%' : '18%',
      minAge: carType === 'premium' || dailyRate > 350 ? 30 : 25,
      creditScore: carType === 'premium' || dailyRate > 350 ? 750 : 700
    }
  } else {
    return {
      tier: 'standard',
      deposit: 500,
      deductible: 500,
      liability: '$750,000',
      commission: '15%',
      minAge: 21,
      creditScore: null
    }
  }
}

export default function RentalAgreementModal({ 
  isOpen, 
  onClose,
  carDetails,
  bookingDetails,
  guestDetails,
  context = 'preview',
  agreementTracking,
  onAgree
}: RentalAgreementModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const tierInfo = getVehicleTierInfo(carDetails?.carType, carDetails?.dailyRate)
  const isVerified = guestDetails?.verificationStatus === 'APPROVED'
  const isPending = guestDetails?.verificationStatus === 'PENDING'
  const hostName = carDetails?.host?.name || 'Host'

  useEffect(() => {
    // Track agreement view
    if (isOpen && context === 'booking' && !agreementTracking?.viewedAt) {
      // This would typically call an API to track the view
      console.log('Agreement viewed at:', new Date().toISOString())
    }
  }, [isOpen, context, agreementTracking])

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
    if (!isVerified) {
      alert('PDF download is only available for verified bookings.')
      return
    }
    // This would typically call an API to generate PDF
    alert('PDF generation will be implemented with backend integration')
  }

  const handleAgree = () => {
    setAgreementAccepted(true)
    if (onAgree) {
      onAgree(true)
    }
    // Track agreement acceptance
    console.log('Agreement accepted at:', new Date().toISOString())
  }

  if (!isOpen) return null

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .rental-agreement-content,
          .rental-agreement-content * {
            visibility: visible;
          }
          .rental-agreement-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 no-print">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col relative">
          {/* Watermark for Pending/Preview */}
          {(isPending || context === 'preview') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-10">
              <div className="transform -rotate-45">
                <p className="text-4xl sm:text-6xl font-bold text-gray-900">
                  {context === 'preview' ? 'DRAFT' : 'PENDING VERIFICATION'}
                </p>
              </div>
            </div>
          )}

          {/* Header - Mobile Optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between no-print">
            <div className="flex-1 mr-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Vehicle Rental Agreement</h2>
              {guestDetails && (
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Booking: {guestDetails.bookingCode}
                  {isVerified && <span className="ml-2 text-green-600">✓ Verified</span>}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <IoCloseOutline className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Guest Details Bar - Mobile Optimized */}
          {guestDetails && (
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 border-b border-gray-200 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="text-xs sm:text-sm">
                  <span className="font-medium text-gray-900">Renter:</span> {guestDetails.name}
                  <span className="ml-2 sm:ml-4 text-gray-600 break-all">{guestDetails.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isVerified ? (
                    <span className="flex items-center text-xs sm:text-sm text-green-600">
                      <IoCheckmarkCircleOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Verified {guestDetails.approvedAt && `on ${format(new Date(guestDetails.approvedAt), 'MMM d, yyyy')}`}
                    </span>
                  ) : isPending ? (
                    <span className="flex items-center text-xs sm:text-sm text-gray-500">
                      <IoWarningOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Pending Verification
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Print Header (only shows when printing) */}
          <div className="print-only mb-4">
            <h1 className="text-2xl font-bold text-center">Vehicle Rental Agreement</h1>
            {guestDetails && (
              <div className="text-center mt-2">
                <p>Booking Code: {guestDetails.bookingCode}</p>
                <p>Renter: {guestDetails.name}</p>
                <p>Host: {hostName}</p>
                <p>Agreement Date: {isVerified && guestDetails.approvedAt ? format(new Date(guestDetails.approvedAt), 'MMMM d, yyyy') : 'Pending Verification'}</p>
              </div>
            )}
          </div>

          {/* Scrollable Content - Mobile Optimized */}
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 rental-agreement-content"
          >
            <div className="prose prose-sm max-w-none">
              
              {/* Agreement Parties Section */}
              <div className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rental Agreement Parties</h4>
                <div className="text-xs text-gray-700 space-y-1">
                  <div><span className="font-medium">Vehicle Owner (Host):</span> {hostName}</div>
                  <div><span className="font-medium">Renter (Guest):</span> {guestDetails?.name || '[Guest Name]'}</div>
                  <div><span className="font-medium">Platform Facilitator:</span> ItWhip Technologies, Inc.</div>
                  <div><span className="font-medium">Governing Law:</span> State of Arizona</div>
                  <div><span className="font-medium">Venue:</span> Maricopa County Superior Court</div>
                </div>
              </div>

              {/* Vehicle and Rental Details */}
              {carDetails && bookingDetails && (
                <div className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Vehicle & Rental Period</h4>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><span className="font-medium">Vehicle:</span> {carDetails.year} {carDetails.make} {carDetails.model}</div>
                    <div><span className="font-medium">Category:</span> {carDetails.carType || 'Standard'} ({carDetails.seats} seats)</div>
                    <div><span className="font-medium">Pickup Date:</span> {format(new Date(bookingDetails.startDate), 'MMMM d, yyyy')} at {bookingDetails.startTime}</div>
                    <div><span className="font-medium">Return Date:</span> {format(new Date(bookingDetails.endDate), 'MMMM d, yyyy')} at {bookingDetails.endTime}</div>
                    <div><span className="font-medium">Pickup Location:</span> {bookingDetails.deliveryAddress}</div>
                    <div><span className="font-medium">Total Days:</span> {bookingDetails.pricing.days}</div>
                  </div>
                </div>
              )}

              {/* Arizona Legal Compliance */}
              <div className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50">
                <div className="flex items-start">
                  <IoScaleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Arizona Legal Requirements</h4>
                    <p className="text-[10px] sm:text-xs text-gray-700 mb-2">
                      This agreement complies with all applicable Arizona state laws governing vehicle rentals and peer-to-peer car sharing arrangements. 
                      Both parties acknowledge and agree to the following statutory requirements:
                    </p>
                    <ul className="text-[10px] sm:text-xs text-gray-700 space-y-1">
                      <li>• Driver eligibility verification required per A.R.S. §28-3472</li>
                      <li>• Security deposits handled per A.R.S. §33-1321</li>
                      <li>• Peer-to-peer rental compliance per A.R.S. §28-9601</li>
                      <li>• Insurance requirements per A.R.S. §20-331</li>
                      <li>• Transaction Privilege Tax collection per A.R.S. §42-5061</li>
                      <li>• Marketplace facilitator obligations per A.R.S. §42-5001</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trip Protection Coverage */}
              <div className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Trip Protection Coverage</h4>
                    <p className="text-[10px] sm:text-xs text-gray-700 mb-2">
                      This rental includes comprehensive trip protection coverage. In the event of an accident or damage, 
                      you are protected with the following coverage limits and responsibilities:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900">Liability Coverage</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">{tierInfo.liability} maximum</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900">Your Deductible</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">${tierInfo.deductible}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900">Personal Effects</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">$500 maximum</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900">Loss of Use</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">Covered</p>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-2">
                      Coverage excludes intentional damage, driving under influence, unauthorized use, and commercial activities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-900">Terms and Conditions</h3>
              
              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">1. Driver Eligibility & Requirements</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                  The renter must be at least {tierInfo.minAge} years of age and possess a valid driver's license that has been active for 
                  a minimum of one year. International renters must provide a valid passport and international driving permit if their 
                  license is not in English. The renter agrees to be the sole operator of the vehicle unless additional drivers have been 
                  authorized and added to this agreement with applicable fees paid.
                </p>
                {tierInfo.creditScore && (
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Due to the vehicle category, a minimum credit score of {tierInfo.creditScore} is required for this rental.
                  </p>
                )}
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">2. Authorized Use & Restrictions</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                  The vehicle may only be operated on properly maintained roads and highways. The following uses are strictly prohibited:
                </p>
                <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1 ml-4">
                  <li>• Racing, speed testing, or any type of competition</li>
                  <li>• Towing or pushing any vehicle or trailer</li>
                  <li>• Off-road driving or driving on unpaved surfaces</li>
                  <li>• Commercial use including rideshare or delivery services</li>
                  <li>• Transporting hazardous materials or illegal substances</li>
                  <li>• Driving outside Arizona, Nevada, California, Utah, or New Mexico without written permission</li>
                  <li>• Allowing unauthorized persons to operate the vehicle</li>
                </ul>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">3. Renter Responsibilities</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                  The renter agrees to the following responsibilities during the rental period:
                </p>
                <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1 ml-4">
                  <li>• Return the vehicle with the same fuel level as at pickup</li>
                  <li>• Maintain the vehicle in the same condition as received, accounting for normal wear</li>
                  <li>• Lock the vehicle when unattended and safeguard keys at all times</li>
                  <li>• Report any mechanical issues, warning lights, or damage immediately</li>
                  <li>• Not smoke, vape, or allow smoking/vaping in the vehicle ($250 cleaning fee)</li>
                  <li>• Not transport pets without prior approval ($100 cleaning fee if unauthorized)</li>
                  <li>• Pay all tolls, parking fees, and traffic violations incurred during rental</li>
                  <li>• Not exceed 200 miles per day average (excess at $0.45 per mile)</li>
                </ul>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">4. Accident & Emergency Procedures</h4>
                <div className="border border-gray-200 rounded p-2 sm:p-3 bg-gray-50">
                  <p className="text-[10px] sm:text-xs text-gray-700 font-medium mb-2">In case of accident or emergency:</p>
                  <ol className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1 list-decimal ml-3 sm:ml-4">
                    <li>Ensure safety of all parties and call 911 if medical attention needed</li>
                    <li>Contact local police and obtain report number (required per A.R.S. §28-667)</li>
                    <li>Document scene with photos of all vehicles, damage, and surroundings</li>
                    <li>Exchange information with all parties involved</li>
                    <li>Report to host and ItWhip support immediately via app</li>
                    <li>Do not admit fault or make statements about the accident to anyone except police</li>
                    <li>Obtain witness contact information if available</li>
                  </ol>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-2">
                    <span className="font-medium">24/7 Support:</span> Available through app messaging or emergency line
                  </p>
                </div>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">5. Cancellation Policy</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-[10px] sm:text-xs mb-2">
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="font-semibold">72+ hours</div>
                    <div className="text-[9px] sm:text-[10px]">100% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="font-semibold">24-72 hours</div>
                    <div className="text-[9px] sm:text-[10px]">75% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="font-semibold">12-24 hours</div>
                    <div className="text-[9px] sm:text-[10px]">50% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="font-semibold">&lt;12 hours</div>
                    <div className="text-[9px] sm:text-[10px]">No refund</div>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  Service fees are non-refundable. Taxes refunded per Arizona regulations. No-shows forfeit entire payment.
                </p>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">6. Platform Facilitator Disclosure</h4>
                <div className="bg-gray-50 rounded p-2 sm:p-3 border border-gray-200">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                    <span className="font-medium">Important:</span> This rental agreement is entered into directly between the vehicle owner 
                    ({hostName}) and the renter ({guestDetails?.name || 'Guest'}). ItWhip Technologies, Inc. operates solely as a 
                    marketplace facilitator under Arizona law (A.R.S. §42-5001) and is not a party to this rental contract.
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    The platform provides technology services including payment processing, messaging, and trip coordination. 
                    Any disputes regarding vehicle condition, availability, or rental terms are between host and guest. 
                    The platform's liability is limited to the services it directly provides.
                  </p>
                </div>
              </section>

              {/* Payment Receipt Section - Moved to end */}
              {bookingDetails && (
                <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50 rounded-lg">
                  <div className="flex items-start mb-3">
                    <IoReceiptOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">Payment Summary & Receipt</h3>
                      
                      {/* Charges Breakdown */}
                      <div className="space-y-1.5 mb-3 text-[10px] sm:text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Rate ({bookingDetails.pricing.dailyRate}/day × {bookingDetails.pricing.days} days)</span>
                          <span className="font-medium">${bookingDetails.pricing.basePrice.toFixed(2)}</span>
                        </div>
                        
                        {bookingDetails.pricing.insurancePrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trip Protection Coverage</span>
                            <span className="font-medium">${bookingDetails.pricing.insurancePrice.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {bookingDetails.pricing.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery/Pickup Service</span>
                            <span className="font-medium">${bookingDetails.pricing.deliveryFee.toFixed(2)}</span>
                          </div>
                        )}

                        {/* Add-ons */}
                        {bookingDetails.pricing.breakdown.refuelService > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Prepaid Refuel Service</span>
                            <span className="font-medium">${bookingDetails.pricing.breakdown.refuelService.toFixed(2)}</span>
                          </div>
                        )}
                        {bookingDetails.pricing.breakdown.additionalDriver > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Additional Driver Coverage</span>
                            <span className="font-medium">${bookingDetails.pricing.breakdown.additionalDriver.toFixed(2)}</span>
                          </div>
                        )}
                        {bookingDetails.pricing.breakdown.extraMiles > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unlimited Miles Package</span>
                            <span className="font-medium">${bookingDetails.pricing.breakdown.extraMiles.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Service Fee</span>
                          <span className="font-medium">${bookingDetails.pricing.serviceFee.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between pt-1.5 border-t border-gray-300">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${(bookingDetails.pricing.total - bookingDetails.pricing.taxes).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Arizona TPT Tax (5.6%)</span>
                          <span className="font-medium">${bookingDetails.pricing.taxes.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Total and Deposit */}
                      <div className="space-y-2 pt-2 border-t border-gray-300">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="font-bold text-gray-900">Total Amount Paid</span>
                          <span className="font-bold text-gray-900">${bookingDetails.pricing.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center bg-yellow-50 p-2 rounded border border-yellow-200">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Security Deposit (Authorization Hold)</span>
                            <p className="text-[9px] sm:text-[10px] text-gray-600">Refundable per A.R.S. §33-1321(D)</p>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-gray-900">${tierInfo.deposit.toFixed(2)}</span>
                        </div>

                        <p className="text-[9px] sm:text-[10px] text-gray-500 mt-2">
                          Payment processed on {format(new Date(), 'MMMM d, yyyy')}. This receipt serves as proof of payment for tax purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Deposit Return Process */}
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Security Deposit Return Process</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                      Your ${tierInfo.deposit} security deposit is fully refundable when you meet these conditions:
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">On-Time Return:</span> Return within 30-minute grace period to avoid late fees 
                          ($50 first hour, $25 each additional hour)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">Fuel Level:</span> Match the fuel level at pickup or incur refueling charge 
                          ($5.00/gallon plus $25 service fee)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">Vehicle Condition:</span> Normal wear accepted; damage beyond normal use charged at repair cost
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">Interior Cleanliness:</span> No smoking odor, excessive dirt, stains, or damage 
                          ($250 deep cleaning if required)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">Mileage Allowance:</span> 200 miles per day included; excess charged at $0.45/mile
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700">
                          <span className="font-medium">No Violations:</span> All tolls and citations must be paid; processing fee of $50 per violation
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded p-2 border border-gray-200">
                      <div className="flex items-start">
                        <IoTimeOutline className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs">
                          <p className="font-medium text-gray-900 mb-1">Deposit Release Timeline (Per A.R.S. §33-1321)</p>
                          <ul className="text-gray-700 space-y-0.5">
                            <li>• Post-trip inspection: Completed within 2 hours of return</li>
                            <li>• Damage assessment: Within 24 hours with photo documentation</li>
                            <li>• Charge notification: Within 24-48 hours if deductions apply</li>
                            <li>• Deposit release: 7-14 business days to original payment method</li>
                            <li>• Itemized statement provided for any deductions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Reference Links */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Additional Information</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                  <Link href="/policies/insurance-protection" className="text-blue-600 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    Full Insurance Details
                  </Link>
                  <Link href="/policies/cancellation" className="text-blue-600 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    Cancellation Policy
                  </Link>
                  <Link href="/legal" className="text-blue-600 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    Legal Terms
                  </Link>
                  <Link href="/security" className="text-blue-600 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    Privacy & Security
                  </Link>
                </div>
              </div>

              {/* Agreement Acceptance (for booking context) */}
              {context === 'booking' && !agreementAccepted && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={hasScrolledToBottom}
                      onChange={(e) => e.target.checked && handleAgree()}
                      disabled={!hasScrolledToBottom}
                      className="mt-0.5 sm:mt-1 mr-2 sm:mr-3"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">
                      I have read and agree to all terms and conditions of this rental agreement between {hostName} and myself. 
                      I authorize the ${tierInfo.deposit} security deposit hold and understand it will be released according to 
                      the terms outlined above and Arizona law A.R.S. §33-1321.
                      {!hasScrolledToBottom && (
                        <span className="block text-[10px] sm:text-xs text-gray-500 mt-1">
                          Please scroll to review all terms and conditions
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )}

              {/* Digital Signature Block (for verified bookings) */}
              {isVerified && agreementTracking && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-300">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Electronic Agreement Confirmation</h4>
                  <div className="bg-gray-50 rounded p-2 sm:p-3 text-[10px] sm:text-xs text-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      <div>
                        <span className="font-medium">Renter:</span> {guestDetails?.name}
                      </div>
                      <div>
                        <span className="font-medium">Host:</span> {hostName}
                      </div>
                      <div>
                        <span className="font-medium">Agreement Date:</span> {guestDetails.approvedAt && format(new Date(guestDetails.approvedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div>
                        <span className="font-medium">Booking Reference:</span> {guestDetails?.bookingCode}
                      </div>
                    </div>
                    {guestDetails?.approvedBy && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="font-medium">Verification Completed:</span> {guestDetails.approvedBy} on {guestDetails.approvedAt && format(new Date(guestDetails.approvedAt), 'MMMM d, yyyy')}
                      </div>
                    )}
                    <p className="mt-2 text-[9px] sm:text-[10px] text-gray-500">
                      This electronic agreement has the same legal validity as a written signature under the Uniform Electronic Transactions Act.
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Notice - Small */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-[9px] sm:text-[10px] text-gray-400">
                  Platform services provided by ItWhip Technologies, Inc. | Arizona Marketplace Facilitator
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleDownload}
                  disabled={!isVerified}
                  className={`text-xs sm:text-sm flex items-center ${
                    isVerified 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={!isVerified ? 'PDF available after verification' : 'Download PDF'}
                >
                  <IoDownloadOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <IoPrintOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Print
                </button>
              </div>
              {context === 'booking' && agreementAccepted ? (
                <span className="text-xs sm:text-sm text-green-600">✓ Agreement Accepted</span>
              ) : (
                <button
                  onClick={onClose}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}