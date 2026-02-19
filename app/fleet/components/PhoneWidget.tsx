// app/fleet/components/PhoneWidget.tsx
// Floating browser-based phone for fleet dashboard
// Uses @twilio/voice-sdk Device class for WebRTC calling
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Device, Call } from '@twilio/voice-sdk'

type WidgetState = 'collapsed' | 'idle' | 'incoming' | 'active' | 'dialing'

export default function PhoneWidget() {
  const [state, setState] = useState<WidgetState>('collapsed')
  const [deviceReady, setDeviceReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callerInfo, setCallerInfo] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch token and initialize device
  const initDevice = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/twilio/voice-token', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get token')
      }
      const { token } = await res.json()

      // Destroy existing device if any
      if (deviceRef.current) {
        deviceRef.current.destroy()
      }

      const device = new Device(token, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        allowIncomingWhileBusy: false,
        logLevel: 1,
      })

      device.on('registered', () => {
        console.log('[PhoneWidget] Device registered')
        setDeviceReady(true)
        setError(null)
      })

      device.on('unregistered', () => {
        console.log('[PhoneWidget] Device unregistered')
        setDeviceReady(false)
      })

      device.on('error', (err) => {
        console.error('[PhoneWidget] Device error:', err)
        setError(err.message || 'Device error')
      })

      device.on('incoming', (incomingCall: Call) => {
        console.log('[PhoneWidget] Incoming call from:', incomingCall.parameters.From)
        callRef.current = incomingCall
        setCallerInfo(incomingCall.parameters.From || 'Unknown')
        setState('incoming')

        incomingCall.on('cancel', () => {
          console.log('[PhoneWidget] Incoming call canceled')
          resetCall()
        })

        incomingCall.on('disconnect', () => {
          console.log('[PhoneWidget] Call disconnected')
          resetCall()
        })
      })

      device.on('tokenWillExpire', async () => {
        console.log('[PhoneWidget] Token expiring, refreshing...')
        try {
          const res = await fetch('/api/twilio/voice-token', { credentials: 'include' })
          if (res.ok) {
            const { token: newToken } = await res.json()
            device.updateToken(newToken)
          }
        } catch (e) {
          console.error('[PhoneWidget] Token refresh failed:', e)
        }
      })

      await device.register()
      deviceRef.current = device
    } catch (err: any) {
      console.error('[PhoneWidget] Init failed:', err)
      setError(err.message || 'Failed to initialize phone')
      setDeviceReady(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initDevice()

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy()
        deviceRef.current = null
      }
      if (timerRef.current) clearInterval(timerRef.current)
      if (tokenRefreshRef.current) clearTimeout(tokenRefreshRef.current)
    }
  }, [initDevice])

  // Call duration timer
  const startTimer = useCallback(() => {
    setCallDuration(0)
    timerRef.current = setInterval(() => {
      setCallDuration(d => d + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetCall = useCallback(() => {
    callRef.current = null
    setCallerInfo('')
    setCallDuration(0)
    setIsMuted(false)
    stopTimer()
    setState(prev => prev === 'collapsed' ? 'collapsed' : 'idle')
  }, [stopTimer])

  // Make outbound call
  const makeCall = useCallback(async () => {
    if (!deviceRef.current || !phoneNumber.trim()) return

    try {
      setError(null)
      setState('dialing')

      // Format number: add +1 if just 10 digits
      let to = phoneNumber.trim()
      if (/^\d{10}$/.test(to)) to = `+1${to}`
      else if (/^1\d{10}$/.test(to)) to = `+${to}`
      else if (!to.startsWith('+')) to = `+${to}`

      const call = await deviceRef.current.connect({
        params: { To: to },
      })

      callRef.current = call
      setCallerInfo(to)

      call.on('accept', () => {
        console.log('[PhoneWidget] Call accepted')
        setState('active')
        startTimer()
      })

      call.on('disconnect', () => {
        console.log('[PhoneWidget] Call disconnected')
        resetCall()
      })

      call.on('cancel', () => {
        console.log('[PhoneWidget] Call canceled')
        resetCall()
      })

      call.on('error', (err) => {
        console.error('[PhoneWidget] Call error:', err)
        setError(err.message || 'Call failed')
        resetCall()
      })
    } catch (err: any) {
      console.error('[PhoneWidget] Make call failed:', err)
      setError(err.message || 'Failed to place call')
      setState('idle')
    }
  }, [phoneNumber, startTimer, resetCall])

  // Answer incoming call
  const answerCall = useCallback(() => {
    if (!callRef.current) return
    callRef.current.accept()
    setState('active')
    startTimer()

    callRef.current.on('disconnect', () => {
      resetCall()
    })
  }, [startTimer, resetCall])

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!callRef.current) return
    callRef.current.reject()
    resetCall()
  }, [resetCall])

  // Hang up active call
  const hangUp = useCallback(() => {
    if (!callRef.current) return
    callRef.current.disconnect()
    resetCall()
  }, [resetCall])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!callRef.current) return
    const newMuted = !isMuted
    callRef.current.mute(newMuted)
    setIsMuted(newMuted)
  }, [isMuted])

  // Send DTMF digit
  const sendDigit = useCallback((digit: string) => {
    if (callRef.current && state === 'active') {
      callRef.current.sendDigits(digit)
    } else {
      setPhoneNumber(prev => prev + digit)
    }
  }, [state])

  // Format duration
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Format phone for display
  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
  }

  // Collapsed state — just a circle button
  if (state === 'collapsed') {
    return (
      <button
        onClick={() => setState('idle')}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        title="Open Phone"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {/* Status dot */}
        <span className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 dark:border-gray-100 ${deviceReady ? 'bg-green-400' : 'bg-red-400'}`} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${deviceReady ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {deviceReady ? 'Phone Ready' : 'Connecting...'}
          </span>
        </div>
        <button
          onClick={() => {
            if (state === 'active' || state === 'dialing') return // Don't collapse during call
            setState('collapsed')
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* ─── INCOMING CALL ──────────────────────────── */}
      {state === 'incoming' && (
        <div className="p-4 text-center space-y-3">
          <div className="animate-pulse">
            <svg className="w-10 h-10 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Incoming Call</p>
          <p className="text-lg font-mono text-gray-700 dark:text-gray-300">{formatPhone(callerInfo)}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={answerCall}
              className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
              title="Answer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button
              onClick={rejectCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              title="Decline"
            >
              <svg className="w-6 h-6 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─── ACTIVE CALL ────────────────────────────── */}
      {(state === 'active' || state === 'dialing') && (
        <div className="p-4 text-center space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {state === 'dialing' ? 'Dialing...' : 'On Call'}
          </p>
          <p className="text-lg font-mono text-gray-700 dark:text-gray-300">{formatPhone(callerInfo)}</p>
          {state === 'active' && (
            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatDuration(callDuration)}</p>
          )}

          {/* Call controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
                </svg>
              )}
            </button>
            <button
              onClick={hangUp}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              title="Hang Up"
            >
              <svg className="w-5 h-5 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>

          {/* In-call dial pad toggle */}
          {state === 'active' && (
            <DialPad onDigit={sendDigit} compact />
          )}
        </div>
      )}

      {/* ─── IDLE — Dial Pad ────────────────────────── */}
      {state === 'idle' && (
        <div className="p-4 space-y-3">
          {/* Number input */}
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phoneNumber.trim()) makeCall()
              }}
              placeholder="Enter number..."
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phoneNumber && (
              <button
                onClick={() => setPhoneNumber('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dial pad */}
          <DialPad onDigit={sendDigit} />

          {/* Call button */}
          <button
            onClick={makeCall}
            disabled={!phoneNumber.trim() || !deviceReady}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Dial Pad Component ────────────────────────────
function DialPad({ onDigit, compact }: { onDigit: (d: string) => void; compact?: boolean }) {
  const [showPad, setShowPad] = useState(!compact)

  if (compact && !showPad) {
    return (
      <button
        onClick={() => setShowPad(true)}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
      >
        Keypad
      </button>
    )
  }

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  return (
    <div className="space-y-1">
      {compact && (
        <button
          onClick={() => setShowPad(false)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-1"
        >
          Hide keypad
        </button>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        {keys.flat().map(key => (
          <button
            key={key}
            onClick={() => onDigit(key)}
            className="py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium transition-colors"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
