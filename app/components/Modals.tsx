// app/components/Modals.tsx

'use client'

import { useEffect, useRef } from 'react'
import { 
  IoCloseOutline,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoRocketOutline,
  IoPhonePortraitOutline,
  IoQrCodeOutline,
  IoMailOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline
} from 'react-icons/io5'
import type { ModalsProps } from '../types'
import { API_ENDPOINTS } from '../utils/constants'

// App Download Modal Component
export default function Modals({
  showAppModal,
  setShowAppModal,
  handleGetAppClick
}: ModalsProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAppModal) {
        setShowAppModal(false)
      }
    }

    if (showAppModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showAppModal, setShowAppModal])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAppModal(false)
    }
  }

  if (!showAppModal) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-lg animate-slideUp"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IoRocketOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Download ItWhip App
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Available for iOS • Android coming soon
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAppModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Features List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              What you'll get:
            </h3>
            <div className="space-y-2">
              {[
                'Real-time flight tracking & delay predictions',
                'Connect with 100+ verified drivers',
                'Save 30-40% vs surge pricing',
                'Group ride coordination',
                '24/7 support team'
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="space-y-3">
            {/* iOS Button */}
            <button 
              onClick={() => {
                window.open(API_ENDPOINTS.testFlight, '_blank')
                setShowAppModal(false)
              }}
              className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center space-x-3 group"
            >
              <IoLogoApple className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-80">Download on</div>
                <div className="text-sm font-semibold">TestFlight Beta</div>
              </div>
              <span className="ml-auto px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                BETA
              </span>
            </button>
            
            {/* Android Button (Disabled) */}
            <button 
              disabled
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center space-x-3 opacity-60"
            >
              <IoLogoGooglePlaystore className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs">Coming to</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
              <span className="ml-auto px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
                SOON
              </span>
            </button>
          </div>

          {/* QR Code Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoQrCodeOutline className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scan QR code on phone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quick access to TestFlight
                  </p>
                </div>
              </div>
              <div className="w-20 h-20 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2">
                {/* Placeholder for QR code */}
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* Email Option */}
          <div className="mt-4">
            <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <IoMailOutline className="w-5 h-5" />
              <span>Email me the download link instead</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 rounded-b-xl">
          <div className="flex items-start space-x-2">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Beta Notice:</strong> You're joining our exclusive TestFlight beta program. 
              Limited to first 1,000 users. Your feedback helps us improve the app before public launch.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Export additional modal components that might be needed
export function SignInModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign In
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Sign In
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Export driver application modal
export function DriverApplicationModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Apply to Drive
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Join the first 100 drivers • 23 spots left
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last name"
              className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="tel"
            placeholder="Phone number"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Currently driving for...</option>
            <option value="uber">Uber</option>
            <option value="lyft">Lyft</option>
            <option value="both">Both Uber & Lyft</option>
            <option value="other">Other platform</option>
            <option value="new">New to rideshare</option>
          </select>
          
          <button 
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  )
}