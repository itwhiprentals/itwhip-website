// app/partner/tracking/demo/components/feature-demos/KillSwitchDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLocationOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoKeyOutline,
  IoPowerOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

type KillSwitchPhase = 'ready' | 'confirm' | 'verifying' | 'executing' | 'disabled' | 'recovery'
type DisableMode = 'starter' | 'full'

interface AuditEvent {
  action: string
  timestamp: Date
  user: string
  location: string
}

export default function KillSwitchDemo() {
  const [phase, setPhase] = useState<KillSwitchPhase>('ready')
  const [disableMode, setDisableMode] = useState<DisableMode>('starter')
  const [confirmStep, setConfirmStep] = useState(0) // 0, 1, 2 for 3-step confirmation
  const [locationVerified, setLocationVerified] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [disabledAt, setDisabledAt] = useState<Date | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([
    { action: 'Kill switch armed', timestamp: new Date(Date.now() - 86400000), user: 'Fleet Manager', location: 'Phoenix, AZ' },
    { action: 'Settings updated', timestamp: new Date(Date.now() - 172800000), user: 'System Admin', location: 'Remote' }
  ])

  // Simulate location verification
  useEffect(() => {
    if (phase === 'confirm' && !locationVerified) {
      const timer = setTimeout(() => {
        setLocationVerified(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [phase, locationVerified])

  const handleInitiateKillSwitch = () => {
    setPhase('confirm')
    setConfirmStep(0)
    setLocationVerified(false)
    setTwoFactorCode('')
  }

  const handleConfirmStep = () => {
    if (confirmStep < 2) {
      setConfirmStep(prev => prev + 1)
    } else {
      // Final step - verify 2FA
      if (twoFactorCode.length === 6) {
        setPhase('verifying')
        setTimeout(() => {
          setPhase('executing')
          setTimeout(() => {
            setPhase('disabled')
            setDisabledAt(new Date())
            setAuditLog(prev => [
              {
                action: `Vehicle ${disableMode === 'full' ? 'fully' : 'starter'} disabled`,
                timestamp: new Date(),
                user: 'Current User',
                location: 'Phoenix, AZ'
              },
              ...prev.slice(0, 9)
            ])
          }, 2000)
        }, 1500)
      }
    }
  }

  const handleReEnable = () => {
    setPhase('recovery')
    setTimeout(() => {
      setPhase('ready')
      setAuditLog(prev => [
        {
          action: 'Vehicle re-enabled',
          timestamp: new Date(),
          user: 'Current User',
          location: 'Phoenix, AZ'
        },
        ...prev.slice(0, 9)
      ])
    }, 2000)
  }

  const handleCancel = () => {
    setPhase('ready')
    setConfirmStep(0)
    setTwoFactorCode('')
  }

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'disabled': return 'red'
      case 'verifying':
      case 'executing': return 'yellow'
      case 'recovery': return 'blue'
      default: return 'green'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hardware Requirement Notice */}
      <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <IoWarningOutline className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm sm:text-base font-bold text-red-400 mb-1">
              Requires MooveTrax Hardware
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">
              Kill switch functionality is <strong>NOT available</strong> through ItWhip+ or Bouncie + Smartcar.
              This feature requires dedicated MooveTrax hardware installation.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://moovetrax.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
              >
                Get MooveTrax →
              </a>
              <span className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                ~$12/mo + hardware
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col items-center">
          {/* Status Icon */}
          <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
            phase === 'disabled'
              ? 'bg-red-500/20 border-4 border-red-500'
              : phase === 'verifying' || phase === 'executing'
                ? 'bg-yellow-500/20 border-4 border-yellow-500 animate-pulse'
                : phase === 'recovery'
                  ? 'bg-blue-500/20 border-4 border-blue-500 animate-pulse'
                  : 'bg-green-500/20 border-4 border-green-500'
          }`}>
            {phase === 'disabled' ? (
              <IoPowerOutline className="w-16 h-16 sm:w-20 sm:h-20 text-red-500" />
            ) : phase === 'verifying' || phase === 'executing' ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            ) : phase === 'recovery' ? (
              <IoShieldCheckmarkOutline className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500" />
            ) : (
              <IoShieldCheckmarkOutline className="w-16 h-16 sm:w-20 sm:h-20 text-green-500" />
            )}

            {/* Pulsing ring when disabled */}
            {phase === 'disabled' && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-30" />
            )}
          </div>

          {/* Status Text */}
          <div className="mt-4 text-center">
            <h3 className={`text-lg sm:text-xl font-bold ${
              phase === 'disabled' ? 'text-red-400' :
              phase === 'verifying' || phase === 'executing' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {phase === 'ready' && 'Kill Switch Ready'}
              {phase === 'confirm' && 'Confirmation Required'}
              {phase === 'verifying' && 'Verifying Identity...'}
              {phase === 'executing' && 'Disabling Vehicle...'}
              {phase === 'disabled' && 'Vehicle Disabled'}
              {phase === 'recovery' && 'Re-enabling Vehicle...'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {phase === 'ready' && 'Vehicle starter is armed and can be disabled remotely'}
              {phase === 'disabled' && disabledAt && `Disabled at ${disabledAt.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Flow */}
      {phase === 'confirm' && (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border-2 border-yellow-500/50">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0, 1, 2].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step < confirmStep ? 'bg-green-500 text-white' :
                  step === confirmStep ? 'bg-yellow-500 text-black' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {step < confirmStep ? <IoCheckmarkCircle className="w-5 h-5" /> : step + 1}
                </div>
                {step < 2 && (
                  <div className={`w-8 h-0.5 ${step < confirmStep ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {confirmStep === 0 && (
            <div className="text-center space-y-4">
              <IoLocationOutline className="w-12 h-12 mx-auto text-blue-400" />
              <h4 className="font-semibold text-white">Location Verification</h4>
              <p className="text-sm text-gray-400">Verifying your location matches authorized zones...</p>
              {locationVerified ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <IoCheckmarkCircle className="w-5 h-5" />
                  <span>Location Verified: Phoenix, AZ</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              )}
            </div>
          )}

          {confirmStep === 1 && (
            <div className="text-center space-y-4">
              <IoAlertCircleOutline className="w-12 h-12 mx-auto text-orange-400" />
              <h4 className="font-semibold text-white">Select Disable Mode</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDisableMode('starter')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    disableMode === 'starter'
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <IoKeyOutline className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm font-medium text-white">Starter Only</p>
                  <p className="text-[10px] text-gray-400 mt-1">Prevents starting, running engine continues</p>
                </button>
                <button
                  onClick={() => setDisableMode('full')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    disableMode === 'full'
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <IoPowerOutline className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-medium text-white">Full Disable</p>
                  <p className="text-[10px] text-gray-400 mt-1">Stops engine immediately (use with caution)</p>
                </button>
              </div>
            </div>
          )}

          {confirmStep === 2 && (
            <div className="text-center space-y-4">
              <IoLockClosedOutline className="w-12 h-12 mx-auto text-purple-400" />
              <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Enter the 6-digit code from your authenticator app</p>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 mx-auto text-center text-2xl font-mono tracking-[0.5em] bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-[10px] text-gray-500">(Enter any 6 digits for demo)</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStep}
              disabled={(confirmStep === 0 && !locationVerified) || (confirmStep === 2 && twoFactorCode.length !== 6)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                (confirmStep === 0 && !locationVerified) || (confirmStep === 2 && twoFactorCode.length !== 6)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {confirmStep === 2 ? 'Confirm Disable' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {phase === 'disabled' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
            <IoCallOutline className="w-4 h-4" />
            Notifications Sent
          </h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>Fleet Manager notified via SMS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>Security team alerted</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>Event logged in system</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          The starter interrupt (kill switch) prevents the vehicle&apos;s starter motor from engaging, making it impossible to start the engine. The vehicle can still be towed or moved but cannot be driven.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          ⚠️ SAFETY CRITICAL
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          The kill switch must NEVER be activated while the vehicle is in motion. Disabling a moving vehicle can cause loss of power steering and brake assist, potentially resulting in loss of control, accidents, injury, or death.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          This feature should only be used when the vehicle is confirmed parked and stationary. Safe systems only immobilize when the vehicle is at rest. Improper use may result in legal liability including prosecution under traffic safety laws.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          <span className="text-yellow-400 font-medium">For financed vehicles:</span> The kill switch may be controlled by the lender. Tampering with the device may violate your finance agreement. Most U.S. states and EU regulations require written disclosure and consent before installation.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">MooveTrax:</span> Only provider with kill switch capability</li>
          <li className="pl-4">• Passive auto-engage via Bluetooth when host walks away</li>
          <li className="pl-4">• Tamper detection: Kill switch auto-engages if device is removed</li>
          <li><span className="text-gray-500 font-medium">Bouncie/Smartcar/Zubie/Trackimo:</span> <span className="text-gray-500">Do not offer starter interrupt</span></li>
        </ul>
      </div>

      {/* Action Button */}
      {phase === 'ready' && (
        <button
          onClick={handleInitiateKillSwitch}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-3"
        >
          <IoWarningOutline className="w-6 h-6" />
          Initiate Kill Switch
        </button>
      )}

      {phase === 'disabled' && (
        <button
          onClick={handleReEnable}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-3"
        >
          <IoShieldCheckmarkOutline className="w-6 h-6" />
          Re-Enable Vehicle
        </button>
      )}

      {/* Audit Log */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Audit Log
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {auditLog.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-300">{event.action}</span>
                <span className="text-gray-500">by {event.user}</span>
              </div>
              <span className="text-gray-400">
                {event.timestamp.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
