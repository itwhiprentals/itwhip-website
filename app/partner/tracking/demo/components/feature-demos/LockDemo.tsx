// app/partner/tracking/demo/components/feature-demos/LockDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoCarSportOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

type DoorStatus = 'locked' | 'unlocked' | 'ajar'
type ActionPhase = 'idle' | 'sending' | 'confirming' | 'complete'

interface DoorStates {
  frontLeft: DoorStatus
  frontRight: DoorStatus
  rearLeft: DoorStatus
  rearRight: DoorStatus
  trunk: DoorStatus
  hood: DoorStatus
}

interface LockEvent {
  action: 'lock' | 'unlock'
  timestamp: Date
  source: 'remote' | 'key' | 'auto'
  success: boolean
}

export default function LockDemo() {
  const [isLocked, setIsLocked] = useState(true)
  const [actionPhase, setActionPhase] = useState<ActionPhase>('idle')
  const [signalWaves, setSignalWaves] = useState(0)
  const [doorStates, setDoorStates] = useState<DoorStates>({
    frontLeft: 'locked',
    frontRight: 'locked',
    rearLeft: 'locked',
    rearRight: 'locked',
    trunk: 'locked',
    hood: 'locked'
  })
  const [lockHistory, setLockHistory] = useState<LockEvent[]>([
    { action: 'lock', timestamp: new Date(Date.now() - 3600000), source: 'remote', success: true },
    { action: 'unlock', timestamp: new Date(Date.now() - 7200000), source: 'key', success: true },
    { action: 'lock', timestamp: new Date(Date.now() - 10800000), source: 'auto', success: true }
  ])

  // Signal wave animation
  useEffect(() => {
    if (actionPhase === 'sending') {
      const interval = setInterval(() => {
        setSignalWaves(prev => (prev + 1) % 4)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [actionPhase])

  const handleLockAction = async (action: 'lock' | 'unlock') => {
    if (actionPhase !== 'idle') return

    setActionPhase('sending')

    // Simulate signal transmission
    await new Promise(resolve => setTimeout(resolve, 1200))

    setActionPhase('confirming')

    // Simulate sequential door locking/unlocking
    const doorOrder: (keyof DoorStates)[] = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight', 'trunk', 'hood']
    const newStatus: DoorStatus = action === 'lock' ? 'locked' : 'unlocked'

    for (const door of doorOrder) {
      await new Promise(resolve => setTimeout(resolve, 150))
      setDoorStates(prev => ({ ...prev, [door]: newStatus }))
    }

    setIsLocked(action === 'lock')
    setActionPhase('complete')

    // Add to history
    setLockHistory(prev => [
      { action, timestamp: new Date(), source: 'remote', success: true },
      ...prev.slice(0, 4)
    ])

    // Reset after showing complete
    setTimeout(() => setActionPhase('idle'), 1500)
  }

  const getDoorColor = (status: DoorStatus): string => {
    switch (status) {
      case 'locked': return 'bg-green-500'
      case 'unlocked': return 'bg-yellow-500'
      case 'ajar': return 'bg-red-500'
    }
  }

  const getStatusText = (): string => {
    switch (actionPhase) {
      case 'sending': return 'Sending command...'
      case 'confirming': return 'Confirming...'
      case 'complete': return isLocked ? 'Vehicle Locked' : 'Vehicle Unlocked'
      default: return isLocked ? 'All Doors Secured' : 'Vehicle Unlocked'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Vehicle Visualization */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <div className="relative flex flex-col items-center">
          {/* Signal Waves Animation */}
          {actionPhase === 'sending' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="relative">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-400 transition-all duration-300 ${
                      signalWaves > i ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    style={{
                      width: `${24 + i * 16}px`,
                      height: `${24 + i * 16}px`
                    }}
                  />
                ))}
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Car Top-Down View */}
          <div className="relative w-48 h-72 sm:w-56 sm:h-80">
            {/* Car body outline */}
            <svg viewBox="0 0 200 280" className="w-full h-full">
              {/* Car body */}
              <path
                d="M40 60 Q40 30 100 30 Q160 30 160 60 L170 80 L170 220 Q170 250 140 260 L60 260 Q30 250 30 220 L30 80 Z"
                fill={isLocked ? '#166534' : '#854d0e'}
                stroke={isLocked ? '#22c55e' : '#eab308'}
                strokeWidth="3"
                className="transition-all duration-500"
              />
              {/* Windshield */}
              <path
                d="M50 65 Q100 55 150 65 L145 100 Q100 95 55 100 Z"
                fill="#1f2937"
                stroke="#374151"
                strokeWidth="2"
              />
              {/* Rear window */}
              <path
                d="M55 200 L145 200 Q140 230 100 235 Q60 230 55 200"
                fill="#1f2937"
                stroke="#374151"
                strokeWidth="2"
              />
              {/* Hood */}
              <rect x="60" y="35" width="80" height="25" rx="5" fill="#1f2937" stroke="#374151" strokeWidth="1" />
              {/* Trunk */}
              <rect x="60" y="240" width="80" height="15" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="1" />
            </svg>

            {/* Door indicators - positioned around the car */}
            {/* Front Left */}
            <div className="absolute top-[30%] left-0 transform -translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.frontLeft)} shadow-lg transition-colors duration-300`} />
              <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-gray-400 mt-1 whitespace-nowrap">FL</span>
            </div>

            {/* Front Right */}
            <div className="absolute top-[30%] right-0 transform translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.frontRight)} shadow-lg transition-colors duration-300`} />
              <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-gray-400 mt-1 whitespace-nowrap">FR</span>
            </div>

            {/* Rear Left */}
            <div className="absolute top-[55%] left-0 transform -translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.rearLeft)} shadow-lg transition-colors duration-300`} />
              <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-gray-400 mt-1 whitespace-nowrap">RL</span>
            </div>

            {/* Rear Right */}
            <div className="absolute top-[55%] right-0 transform translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.rearRight)} shadow-lg transition-colors duration-300`} />
              <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-gray-400 mt-1 whitespace-nowrap">RR</span>
            </div>

            {/* Hood */}
            <div className="absolute top-[8%] left-1/2 transform -translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.hood)} shadow-lg transition-colors duration-300`} />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 whitespace-nowrap">Hood</span>
            </div>

            {/* Trunk */}
            <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getDoorColor(doorStates.trunk)} shadow-lg transition-colors duration-300`} />
              <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-gray-400 mt-1 whitespace-nowrap">Trunk</span>
            </div>

            {/* Center lock icon */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              isLocked ? 'bg-green-500/20' : 'bg-yellow-500/20'
            } ${actionPhase === 'complete' ? 'animate-pulse' : ''}`}>
              {isLocked ? (
                <IoLockClosedOutline className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
              ) : (
                <IoLockOpenOutline className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400" />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
            actionPhase === 'complete'
              ? isLocked ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              : actionPhase !== 'idle'
                ? 'bg-blue-500/20 text-blue-400'
                : isLocked ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {actionPhase === 'sending' && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {actionPhase === 'complete' && (
              <IoCheckmarkCircle className="w-4 h-4" />
            )}
            {actionPhase === 'idle' && (
              <IoShieldCheckmarkOutline className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Door Status Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { key: 'frontLeft', label: 'Front L' },
          { key: 'frontRight', label: 'Front R' },
          { key: 'rearLeft', label: 'Rear L' },
          { key: 'rearRight', label: 'Rear R' },
          { key: 'trunk', label: 'Trunk' },
          { key: 'hood', label: 'Hood' }
        ].map(door => (
          <div key={door.key} className="bg-gray-800 rounded-lg p-2 sm:p-3 text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getDoorColor(doorStates[door.key as keyof DoorStates])}`} />
            <p className="text-[10px] sm:text-xs text-gray-400">{door.label}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-white capitalize">
              {doorStates[door.key as keyof DoorStates]}
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => handleLockAction('lock')}
          disabled={actionPhase !== 'idle' || isLocked}
          className={`relative flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            isLocked
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : actionPhase !== 'idle'
                ? 'bg-green-700 text-white cursor-wait'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
          }`}
        >
          <IoLockClosedOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          Lock All
        </button>

        <button
          onClick={() => handleLockAction('unlock')}
          disabled={actionPhase !== 'idle' || !isLocked}
          className={`relative flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            !isLocked
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : actionPhase !== 'idle'
                ? 'bg-yellow-700 text-white cursor-wait'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-yellow-500/25'
          }`}
        >
          <IoLockOpenOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          Unlock All
        </button>
      </div>

      {/* Lock History */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
          <IoTimeOutline className="w-4 h-4" />
          Recent Activity
        </h4>
        <div className="space-y-2">
          {lockHistory.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2">
                {event.action === 'lock' ? (
                  <IoLockClosedOutline className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <IoLockOpenOutline className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <span className="text-gray-300 capitalize">{event.action}ed</span>
                <span className="text-gray-500">via {event.source}</span>
              </div>
              <span className="text-gray-400">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Unlocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Ajar</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How It Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Remote lock commands are transmitted securely via encrypted cellular connection to your vehicle&apos;s telematics system. Door status confirmation is sent back within seconds.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          Important Notice
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Remote lock/unlock requires compatible vehicle (2015+ for Smartcar). Command delivery depends on cellular connectivity. Always verify lock status before leaving vehicle unattended. This feature requires explicit user consent through secure authentication.
        </p>

        <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">
          Capabilities by Provider
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li><span className="text-white font-medium">Smartcar:</span> API-based, 39 car brands, OAuth2 consent flow</li>
          <li><span className="text-white font-medium">MooveTrax:</span> Hardware relay + Bluetooth proximity auto-lock</li>
          <li><span className="text-gray-500 font-medium">Bouncie/Zubie/Trackimo:</span> <span className="text-gray-500">Monitoring only, no lock control</span></li>
        </ul>
      </div>
    </div>
  )
}
