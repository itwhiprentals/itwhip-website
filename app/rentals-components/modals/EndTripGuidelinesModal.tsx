// app/(guest)/rentals/components/modals/EndTripGuidelinesModal.tsx

'use client'

import { useState, useRef } from 'react'

// Icon Components
const XCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Car = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MapPin = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Camera = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

const DollarSign = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Key = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)

interface EndTripGuidelinesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EndTripGuidelinesModal({ 
  isOpen, 
  onClose 
}: EndTripGuidelinesModalProps) {
  const [activeTab, setActiveTab] = useState('standard')
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-6 h-6 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">End Trip Guidelines</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('standard')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'standard'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Standard Return
            </button>
            <button
              onClick={() => setActiveTab('early')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'early'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Early Return
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'emergency'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Emergency
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'standard' && (
            <div className="space-y-6">
              {/* Return Process Steps */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Standard Return Process</h3>
                
                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">1</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Arrive at Return Location</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Return to the agreed drop-off location. If using an approved ItWhip location, 
                          follow the specific instructions for that site.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Park in Designated Area</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Park in the specified spot. Ensure the vehicle is legally parked and won't 
                          receive tickets or be towed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">3</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Document Vehicle Condition</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Take photos of all four sides, interior, odometer, and fuel gauge. 
                          Report any new damage immediately.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">4</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Return Keys</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Place keys in the designated keybox or hand to host. Never leave keys 
                          in the vehicle unless specifically instructed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">5</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Complete End Trip in App</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Click "End Trip" and upload your photos. Your trip officially ends 
                          when confirmed in the app.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Required Photos Checklist */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Required Photos</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Front of vehicle</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Back of vehicle</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Driver's side</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Passenger's side</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Interior (front seats)</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Interior (back seats)</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Odometer reading</span>
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-xs text-gray-700">Fuel gauge</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Reminders */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Before You Leave</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <ul className="space-y-2 text-xs text-amber-800">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Check for personal belongings (phone, wallet, sunglasses, chargers)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ensure fuel is at the same level as pickup to avoid fees</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Remove all trash and personal items</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lock all doors and windows</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Confirm parking brake is engaged (if applicable)</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'early' && (
            <div className="space-y-6">
              {/* Early Return Notice */}
              <section>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-2">Important: Early Return Policy</h4>
                      <p className="text-xs text-red-800 mb-2">
                        Returning a vehicle early does not qualify for any refund. You are responsible 
                        for the full rental period as originally booked.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Early Return Process */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Early Return Process</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">1. Contact Your Host</h4>
                    <p className="text-xs text-gray-600">
                      Message your host immediately through the app to inform them of early return. 
                      They may need to arrange for vehicle pickup or provide alternative drop-off instructions.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">2. Confirm Drop-off Location</h4>
                    <p className="text-xs text-gray-600">
                      The original return location may not be available for early returns. Wait for 
                      host confirmation before proceeding to any location.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">3. Document Everything</h4>
                    <p className="text-xs text-gray-600">
                      Take extra care to document the vehicle condition, location, and any communication 
                      with the host. This protects both parties.
                    </p>
                  </div>
                </div>
              </section>

              {/* Financial Implications */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Financial Implications</h3>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <DollarSign className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">No Refunds</p>
                        <p className="text-xs text-gray-600">
                          The full rental amount remains due regardless of early return.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <DollarSign className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Potential Additional Fees</p>
                        <p className="text-xs text-gray-600">
                          Early return to unapproved locations may incur retrieval fees.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <DollarSign className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Host Discretion</p>
                        <p className="text-xs text-gray-600">
                          Some hosts may offer partial credits for future bookings at their discretion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Alternative Options */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Consider These Alternatives</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2 text-xs text-blue-800">
                    <li>• Keep the vehicle for the full period - you've already paid for it</li>
                    <li>• Allow a friend or family member to use it (check policy first)</li>
                    <li>• Use it for local errands or exploration</li>
                    <li>• Park it safely and return on the scheduled date</li>
                  </ul>
                </div>
              </section>

              {/* Policy Reference */}
              <section>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-600 mb-2">
                    For complete refund and cancellation policies, see:
                  </p>
                  <div className="space-y-1">
                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 block">
                      Cancellation Policy
                    </a>
                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 block">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              {/* Emergency Priority */}
              <section>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-2">In Case of Emergency</h4>
                      <p className="text-sm font-bold text-red-900 mb-1">CALL 911 FIRST</p>
                      <p className="text-xs text-red-800">
                        For accidents, medical emergencies, or crimes, always contact emergency services 
                        before contacting ItWhip or the host.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Accident Protocol */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">If You're in an Accident</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Ensure Safety</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Check for injuries. Call 911 if anyone is hurt. Move to safety if possible.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">2</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Call Police</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          File a police report for any accident, regardless of severity.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Document Everything</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Photos of damage, other vehicles, license plates, insurance info, witness contacts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">4</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Contact ItWhip Support</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Call: 1-800-ITWHIP-1 (24/7 emergency line)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">5</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Notify Host</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Message the host through the app with details and photos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vehicle Issues */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Vehicle Breakdown</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <ul className="space-y-2 text-xs text-amber-800">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">1.</span>
                      <span>Move to a safe location off the road</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">2.</span>
                      <span>Turn on hazard lights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">3.</span>
                      <span>Contact host for roadside assistance info</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">4.</span>
                      <span>Document issue with photos/videos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">5.</span>
                      <span>Do not authorize repairs without host approval</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Emergency Contacts */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Life-Threatening Emergency</p>
                      <p className="text-sm font-bold text-red-600">911</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">ItWhip 24/7 Emergency</p>
                      <p className="text-sm font-bold text-gray-900">1-800-ITWHIP-1</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Non-Emergency Support</p>
                      <p className="text-sm font-bold text-gray-900">(555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Abandonment Warning */}
              <section>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-2">Vehicle Abandonment</h4>
                      <p className="text-xs text-red-800">
                        Abandoning a rental vehicle is a criminal offense. You must properly return 
                        the vehicle or make arrangements with the host. Abandonment may result in:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-red-800">
                        <li>• Criminal charges</li>
                        <li>• Full liability for vehicle recovery costs</li>
                        <li>• Permanent ban from ItWhip</li>
                        <li>• Legal action for damages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Review complete guidelines in your rental agreement
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}