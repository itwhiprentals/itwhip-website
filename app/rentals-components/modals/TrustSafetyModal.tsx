// app/(guest)/rentals/components/modals/TrustSafetyModal.tsx

'use client'

import { useState, useRef } from 'react'

// Icon Components
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

const UserCheck = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Car = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Phone = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const AlertTriangle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

const Camera = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Lock = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Users = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

interface TrustSafetyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TrustSafetyModal({ 
  isOpen, 
  onClose 
}: TrustSafetyModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trust & Safety at ItWhip</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="prose prose-sm max-w-none">
            {/* Professional Platform Overview */}
            <section className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-purple-900 mb-2">Professional Car Sharing Platform</h3>
                <p className="text-xs text-purple-800 mb-3">
                  ItWhip operates a professional car sharing marketplace with comprehensive protection, 
                  verified hosts, and 24/7 human support. Unlike other platforms, we handle all guest 
                  communication and provide complete insurance coverage during rentals.
                </p>
                
                {/* Platform Statistics */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-xl font-bold text-purple-600">2,847+</div>
                    <p className="text-xs text-gray-600">Verified Hosts</p>
                  </div>
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-xl font-bold text-purple-600">48hr</div>
                    <p className="text-xs text-gray-600">Claims Resolution</p>
                  </div>
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-xl font-bold text-purple-600">24/7</div>
                    <p className="text-xs text-gray-600">Human Support</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Comprehensive Verification */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                Multi-Layer Verification System
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-3">Host Verification</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-800">Background Check</p>
                        <p className="text-xs text-green-700">Criminal & driving history</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-800">Vehicle Ownership</p>
                        <p className="text-xs text-green-700">Title & registration verified</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-800">Insurance Verification</p>
                        <p className="text-xs text-green-700">Personal coverage confirmed</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-800">Quality Standards</p>
                        <p className="text-xs text-green-700">Vehicle inspection required</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Guest Screening by Tier</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Economy/Standard</p>
                        <p className="text-xs text-blue-700">21+, valid license, ID verification</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Luxury</p>
                        <p className="text-xs text-blue-700">25+, 700+ credit, enhanced screening</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Premium</p>
                        <p className="text-xs text-blue-700">30+, 750+ credit, financial verification</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Exotic</p>
                        <p className="text-xs text-blue-700">30+, in-person verify, $5K deposit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Comprehensive Protection */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <ShieldCheck className="w-5 h-5 text-purple-600 mr-2" />
                Protection Included with Every Rental
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage by Vehicle Tier</h4>
                    <ul className="text-xs space-y-1">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Economy/Standard:</span>
                        <span className="font-medium">$750K liability</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Luxury/Premium:</span>
                        <span className="font-medium">$1M liability</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Exotic:</span>
                        <span className="font-medium">$2M liability</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">What's Included</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Physical damage protection</li>
                      <li>• Third-party liability</li>
                      <li>• Medical payments coverage</li>
                      <li>• 48-72 hour claims resolution</li>
                      <li>• $0 monthly insurance cost</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-purple-50 rounded">
                  <p className="text-xs text-purple-800">
                    <strong>Important:</strong> Protection is active only during verified rental periods. 
                    Deductibles range from $500-2,500 based on vehicle tier.
                  </p>
                </div>
              </div>
            </section>

            {/* Real-Time Monitoring & Safety */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Car className="w-5 h-5 text-blue-600 mr-2" />
                Vehicle Safety & Monitoring
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">GPS Tracking</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Real-time location</li>
                    <li>• Speed monitoring</li>
                    <li>• Geofence alerts</li>
                    <li>• Route history</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">Documentation</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Pre-trip photos</li>
                    <li>• Condition reports</li>
                    <li>• Mileage tracking</li>
                    <li>• Post-trip inspection</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">Standards</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 2015+ vehicles only</li>
                    <li>• Safety inspections</li>
                    <li>• Maintenance records</li>
                    <li>• Clean title required</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 24/7 Professional Support */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                24/7 Professional Support
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-800 mb-3">
                  Unlike other platforms that rely on automated systems, ItWhip provides real human support 
                  available 24/7. We handle all guest communication so hosts can focus on their lives.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-green-900 mb-2">Standard Support</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Response: &lt;1 hour</li>
                      <li>• Chat & email</li>
                      <li>• All hosts</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-green-900 mb-2">Priority Support</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Response: &lt;15 min</li>
                      <li>• Phone available</li>
                      <li>• 10+ trips</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-green-900 mb-2">Concierge</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Immediate response</li>
                      <li>• Dedicated manager</li>
                      <li>• Exotic/Fleet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Fast Claims Resolution */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                48-72 Hour Claims Resolution
              </h3>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs text-orange-800 mb-3">
                  We learned from others' mistakes. While competitors leave hosts waiting weeks or months, 
                  ItWhip resolves claims in 48-72 hours with transparent communication throughout.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-sm font-bold text-orange-600">0-2hr</div>
                    <p className="text-xs text-gray-600">Report filed</p>
                  </div>
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-sm font-bold text-orange-600">2-24hr</div>
                    <p className="text-xs text-gray-600">Review & approval</p>
                  </div>
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-sm font-bold text-orange-600">24-48hr</div>
                    <p className="text-xs text-gray-600">Repair authorized</p>
                  </div>
                  <div className="text-center bg-white rounded p-2">
                    <div className="text-sm font-bold text-orange-600">48-72hr</div>
                    <p className="text-xs text-gray-600">Payment issued</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Response */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Emergency Response Protocol
              </h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-2">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <p className="text-xs text-red-800">
                        <strong>911:</strong> Life-threatening emergencies
                      </p>
                      <p className="text-xs text-red-800">
                        <strong>1-800-ITWHIP-1:</strong> Urgent support (24/7)
                      </p>
                      <p className="text-xs text-red-800">
                        <strong>1-800-ITWHIP-2:</strong> Roadside assistance
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-2">Immediate Action Items</h4>
                    <ol className="text-xs text-red-700 space-y-1">
                      <li>1. Ensure safety of all parties</li>
                      <li>2. Contact emergency services if needed</li>
                      <li>3. Document with photos/video</li>
                      <li>4. Call ItWhip support immediately</li>
                      <li>5. File police report if required</li>
                    </ol>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-white rounded">
                  <p className="text-xs text-red-800">
                    <strong>Our Promise:</strong> In any emergency, a real person will answer your call 
                    and stay with you until the situation is resolved. No automated systems, no transfers.
                  </p>
                </div>
              </div>
            </section>

            {/* Platform Reliability */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                Platform Stability & Reliability
              </h3>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-purple-800 mb-3">
                  ItWhip is built for long-term success with sustainable economics, proper funding, 
                  and a commitment to our community. We won't suddenly shut down or change terms.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-purple-900 mb-1">No Surprises</h4>
                    <p className="text-xs text-purple-700">
                      Locked commission rates, stable insurance, no sudden changes
                    </p>
                  </div>
                  <div className="text-center bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-purple-900 mb-1">Guaranteed Bookings</h4>
                    <p className="text-xs text-purple-700">
                      Hosts can't cancel without penalty, protecting your plans
                    </p>
                  </div>
                  <div className="text-center bg-white rounded p-3">
                    <h4 className="text-xs font-semibold text-purple-900 mb-1">Fast Payments</h4>
                    <p className="text-xs text-purple-700">
                      48-hour direct deposits, no payment disputes or holds
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety Best Practices */}
            <section className="mb-6">
              <h3 className="text-base font-semibold mb-3">Safety Best Practices</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">For Guests</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Inspect vehicle thoroughly before driving</li>
                    <li>• Take photos of any existing damage</li>
                    <li>• Test all safety features before departing</li>
                    <li>• Keep all receipts (fuel, tolls, parking)</li>
                    <li>• Report any issues immediately via app</li>
                    <li>• Return vehicle in same condition</li>
                    <li>• Follow all agreed terms and rules</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Platform Guarantees</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• All vehicles pass safety inspection</li>
                    <li>• Hosts maintain valid insurance</li>
                    <li>• 24/7 support always available</li>
                    <li>• Fast claims resolution guaranteed</li>
                    <li>• Transparent pricing, no hidden fees</li>
                    <li>• Protected payment processing</li>
                    <li>• Privacy and data security</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Trust Commitment */}
            <section className="mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
                <h4 className="text-sm font-semibold mb-2">Our Commitment to You</h4>
                <p className="text-xs mb-3">
                  ItWhip was built in response to the failures of other platforms. We've learned from their 
                  mistakes to create a professional, reliable car sharing experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Always human support</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Fast claim resolution</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Stable & reliable platform</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
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
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}