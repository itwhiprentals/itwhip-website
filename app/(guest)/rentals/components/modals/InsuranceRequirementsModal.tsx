// app/(guest)/rentals/components/modals/InsuranceRequirementsModal.tsx

'use client'

import { useState, useRef } from 'react'

// Icon Components (keeping existing icons)
const XCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldCheck = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

const CashIcon = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface InsuranceRequirementsModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleType?: 'economy' | 'standard' | 'luxury' | 'premium' | 'exotic'
}

export default function InsuranceRequirementsModal({ 
  isOpen, 
  onClose,
  vehicleType = 'standard'
}: InsuranceRequirementsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Coverage details by vehicle type
  const coverageByType = {
    economy: {
      liability: '$750,000',
      deductible: '$500',
      commission: '15%'
    },
    standard: {
      liability: '$750,000',
      deductible: '$500',
      commission: '15%'
    },
    luxury: {
      liability: '$1,000,000',
      deductible: '$750',
      commission: '18%'
    },
    premium: {
      liability: '$1,000,000',
      deductible: '$1,000',
      commission: '20%'
    },
    exotic: {
      liability: '$2,000,000',
      deductible: '$2,500',
      commission: '22%'
    }
  }

  const coverage = coverageByType[vehicleType]

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
    // Implementation for PDF download
    alert('PDF download will be available soon')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Trip Protection & Coverage</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
        >
          <div className="prose prose-sm max-w-none">
            
            {/* Protection Included Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start">
                <ShieldCheck className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-900 mb-1">
                    Comprehensive Protection Included
                  </h4>
                  <p className="text-xs text-green-800">
                    Every trip on ItWhip includes protection coverage at no additional cost. 
                    This coverage is built into our simple {coverage.commission} platform fee 
                    and provides up to {coverage.liability} in liability protection during your rental.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Included Section */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                What's Included in Your Trip
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">Liability Protection</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Up to {coverage.liability} third-party liability</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Bodily injury coverage</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Property damage coverage</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Medical payments up to $5,000</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">Physical Damage</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Collision coverage included</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Comprehensive coverage</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{coverage.deductible} deductible only</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Uninsured motorist protection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Additional Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start">
                    <ClockIcon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">24/7 Support</p>
                      <p className="text-xs text-blue-700">Roadside & claims assistance</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DocumentText className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">Fast Claims</p>
                      <p className="text-xs text-blue-700">48-72 hour resolution</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CashIcon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">No Hidden Fees</p>
                      <p className="text-xs text-blue-700">Coverage included in price</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Guest Responsibilities */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                Your Responsibilities
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">As a Guest, You Must:</h4>
                <ul className="text-xs text-gray-600 space-y-1.5 sm:space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Valid License:</strong> Have a valid driver's license for 2+ years</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Follow Traffic Laws:</strong> Obey all traffic regulations and parking rules</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Report Incidents:</strong> Immediately report any accidents or damage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Pay Deductible:</strong> Cover the {coverage.deductible} deductible if damage occurs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Return on Time:</strong> Return the vehicle as agreed to avoid fees</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-amber-900 mb-2">Important Notes</h4>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Protection applies only during active rental periods</li>
                  <li>• Intentional damage or illegal activities void coverage</li>
                  <li>• DUI/DWI incidents are not covered and may result in full liability</li>
                  <li>• Commercial use beyond personal travel may void protection</li>
                </ul>
              </div>
            </section>

            {/* What's Not Covered */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                Exclusions & Limitations
              </h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-red-900 mb-2 sm:mb-3">Not Covered</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Personal belongings left in vehicle</li>
                    <li>• Mechanical breakdown or wear & tear</li>
                    <li>• Interior damage from smoking/spills</li>
                    <li>• Parking tickets or traffic violations</li>
                  </ul>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Damage from off-road driving</li>
                    <li>• Racing or speed contests</li>
                    <li>• Unauthorized drivers</li>
                    <li>• International travel (Mexico/Canada)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Claims Process */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3">If an Incident Occurs</h3>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">Quick Claims Process</h4>
                <ol className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">1</span>
                    <div>
                      <strong>Ensure Safety:</strong> Move to a safe location and check for injuries
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">2</span>
                    <div>
                      <strong>Call 911:</strong> If there are injuries or significant damage
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">3</span>
                    <div>
                      <strong>Document Everything:</strong> Take photos, get witness info, file police report
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">4</span>
                    <div>
                      <strong>Contact ItWhip:</strong> Call our 24/7 claims line at 1-800-ITWHIP-1
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">5</span>
                    <div>
                      <strong>Submit Claim:</strong> Upload photos and documentation in the app
                    </div>
                  </li>
                </ol>
                
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100 rounded">
                  <p className="text-xs text-green-800">
                    <strong>Fast Resolution:</strong> Most claims are processed within 48-72 hours. 
                    We handle all coordination with repair shops and insurance carriers.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Frequently Asked Questions</h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Q: Do I need my own insurance to rent?
                  </h4>
                  <p className="text-xs text-gray-600">
                    A: No, protection is included with every rental. However, having personal auto insurance 
                    may provide additional benefits and could help with deductible costs.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Q: How much is the deductible if damage occurs?
                  </h4>
                  <p className="text-xs text-gray-600">
                    A: Your deductible is {coverage.deductible} for this {vehicleType} vehicle. This is the maximum 
                    you would pay out-of-pocket for covered physical damage to the vehicle.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Q: What if I have an accident with another car?
                  </h4>
                  <p className="text-xs text-gray-600">
                    A: Our liability coverage up to {coverage.liability} protects you for damage to other vehicles 
                    and property. Always exchange information and file a police report for any accident.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Q: Can I add additional drivers?
                  </h4>
                  <p className="text-xs text-gray-600">
                    A: Yes, additional drivers can be added if they meet our requirements (valid license, 21+ years old). 
                    They must be added before driving to ensure coverage applies.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-4 sm:mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-3 text-center">
                  24/7 Support Available
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div>
                    <p className="text-xs font-medium text-purple-800 mb-1">Emergency Claims</p>
                    <p className="text-xs sm:text-sm font-bold text-purple-900">1-800-ITWHIP-1</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-800 mb-1">Roadside Assistance</p>
                    <p className="text-xs sm:text-sm font-bold text-purple-900">1-800-ITWHIP-2</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-800 mb-1">General Support</p>
                    <p className="text-xs sm:text-sm font-bold text-purple-900">support@itwhip.com</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Disclaimer */}
            <section className="mb-4 sm:mb-6">
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>Legal Notice:</strong> This summary provides an overview of protection included with your 
                  ItWhip rental. Coverage is provided through licensed third-party insurance carriers and is subject 
                  to terms, conditions, and exclusions detailed in the full policy documents. Coverage applies only 
                  during active rental periods booked through the ItWhip platform. This is not a complete description 
                  of coverage. For full details, please review the complete terms of service and insurance policy 
                  documentation available in your account. Coverage levels and deductibles vary by vehicle tier. 
                  ItWhip Technologies Inc. is not an insurance company but facilitates coverage through partnerships 
                  with licensed carriers.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer - Fixed for mobile */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex flex-col space-y-3">
              <div className="text-center">
                <span className="text-xs text-gray-600 block mb-2">
                  Protection included • No additional insurance required
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                I Understand
              </button>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <DocumentText className="w-4 h-4 mr-1" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownload}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <DocumentText className="w-4 h-4 mr-1" />
                Print
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                Protection included • No additional insurance required
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}