// app/fleet/components/PhoneWidget.tsx
// Fleet dashboard browser phone with full conference controls
// Features: outbound/inbound calls, mute, hold, add participant,
// conference panel, silent monitor, active calls list
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Device, Call } from '@twilio/voice-sdk'

type WidgetState = 'collapsed' | 'idle' | 'incoming' | 'active' | 'dialing'

interface Participant {
  callSid: string
  label: string
  muted: boolean
  hold: boolean
  phoneNumber?: string | null
  isClient?: boolean
}

interface ConferenceInfo {
  sid: string
  friendlyName: string
  participants: Participant[]
}

interface ActiveConf {
  sid: string
  friendlyName: string
  participantCount: number
}

// ─── API helper ──────────────────────────────────────────────
async function confAction(payload: Record<string, unknown>) {
  const res = await fetch('/api/twilio/masked-call/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Conference action failed')
  }
  return res.json()
}

// ─── Format helpers ──────────────────────────────────────────
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatPhone(phone: string) {
  if (phone.startsWith('client:')) return 'Fleet Agent'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export default function PhoneWidget() {
  // Core state
  const [state, setState] = useState<WidgetState>('collapsed')
  const [deviceReady, setDeviceReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callerInfo, setCallerInfo] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Conference state
  const [conference, setConference] = useState<ConferenceInfo | null>(null)
  const [showConf, setShowConf] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addNumber, setAddNumber] = useState('')
  const [addingParticipant, setAddingParticipant] = useState(false)
  const [showKeypad, setShowKeypad] = useState(false)

  // Active conferences for monitoring (idle state)
  const [activeConfs, setActiveConfs] = useState<ActiveConf[]>([])

  // Refs
  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const confPollRef = useRef<NodeJS.Timeout | null>(null)
  const activePollRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Device init ─────────────────────────────────────────────
  const initDevice = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/twilio/voice-token', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get token')
      }
      const { token } = await res.json()

      if (deviceRef.current) deviceRef.current.destroy()

      const device = new Device(token, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        allowIncomingWhileBusy: false,
        logLevel: 1,
      })

      device.on('registered', () => {
        setDeviceReady(true)
        setError(null)
      })
      device.on('unregistered', () => setDeviceReady(false))
      device.on('error', (err) => {
        console.error('[PhoneWidget] Device error:', err)
        setError(err.message || 'Device error')
      })

      device.on('incoming', (incomingCall: Call) => {
        callRef.current = incomingCall
        setCallerInfo(incomingCall.parameters.From || 'Unknown')
        setState('incoming')
        incomingCall.on('cancel', () => resetCall())
        incomingCall.on('disconnect', () => resetCall())
      })

      device.on('tokenWillExpire', async () => {
        try {
          const r = await fetch('/api/twilio/voice-token', { credentials: 'include' })
          if (r.ok) {
            const { token: t } = await r.json()
            device.updateToken(t)
          }
        } catch {}
      })

      await device.register()
      deviceRef.current = device
    } catch (err: any) {
      console.error('[PhoneWidget] Init failed:', err)
      setError(err.message || 'Failed to initialize phone')
      setDeviceReady(false)
    }
  }, [])

  useEffect(() => {
    initDevice()
    return () => {
      if (deviceRef.current) { deviceRef.current.destroy(); deviceRef.current = null }
      if (timerRef.current) clearInterval(timerRef.current)
      if (confPollRef.current) clearInterval(confPollRef.current)
      if (activePollRef.current) clearInterval(activePollRef.current)
    }
  }, [initDevice])

  // ─── Phone dial event listener (from fleet bookings) ─────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.number) {
        setPhoneNumber(detail.number)
        if (state === 'collapsed') setState('idle')
      }
    }
    window.addEventListener('phone-dial', handler)
    return () => window.removeEventListener('phone-dial', handler)
  }, [state])

  // ─── Call timer ──────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setCallDuration(0)
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const resetCall = useCallback(() => {
    callRef.current = null
    setCallerInfo('')
    setCallDuration(0)
    setIsMuted(false)
    setIsMonitoring(false)
    setConference(null)
    setShowConf(false)
    setShowAddPanel(false)
    setShowKeypad(false)
    stopTimer()
    if (confPollRef.current) { clearInterval(confPollRef.current); confPollRef.current = null }
    setState(prev => prev === 'collapsed' ? 'collapsed' : 'idle')
  }, [stopTimer])

  // ─── Make outbound call ──────────────────────────────────────
  const makeCall = useCallback(async () => {
    if (!deviceRef.current || !phoneNumber.trim()) return
    try {
      setError(null)
      setState('dialing')
      let to = phoneNumber.trim()
      if (/^\d{10}$/.test(to)) to = `+1${to}`
      else if (/^1\d{10}$/.test(to)) to = `+${to}`
      else if (!to.startsWith('+') && !to.startsWith('monitor:')) to = `+${to}`

      const call = await deviceRef.current.connect({ params: { To: to } })
      callRef.current = call
      setCallerInfo(to)

      call.on('accept', () => {
        setState('active')
        startTimer()
      })
      call.on('disconnect', () => resetCall())
      call.on('cancel', () => resetCall())
      call.on('error', (err) => { setError(err.message || 'Call failed'); resetCall() })
    } catch (err: any) {
      setError(err.message || 'Failed to place call')
      setState('idle')
    }
  }, [phoneNumber, startTimer, resetCall])

  const answerCall = useCallback(() => {
    if (!callRef.current) return
    callRef.current.accept()
    setState('active')
    startTimer()
    callRef.current.on('disconnect', () => resetCall())
  }, [startTimer, resetCall])

  const rejectCall = useCallback(() => {
    if (!callRef.current) return
    callRef.current.reject()
    resetCall()
  }, [resetCall])

  const hangUp = useCallback(() => {
    if (!callRef.current) return
    callRef.current.disconnect()
    resetCall()
  }, [resetCall])

  const toggleMute = useCallback(() => {
    if (!callRef.current) return
    const m = !isMuted
    callRef.current.mute(m)
    setIsMuted(m)
  }, [isMuted])

  const sendDigit = useCallback((digit: string) => {
    if (callRef.current && state === 'active') {
      callRef.current.sendDigits(digit)
    } else {
      setPhoneNumber(prev => prev + digit)
    }
  }, [state])

  // ─── Conference discovery & polling ──────────────────────────
  const discoverConference = useCallback(async () => {
    try {
      const callSid = callRef.current?.parameters?.CallSid
      const data = await confAction({ action: 'find-conference', ...(callSid ? { callSid } : {}) })
      if (data.found) {
        setConference({ sid: data.conferenceSid, friendlyName: data.friendlyName, participants: data.participants })
      }
    } catch {}
  }, [])

  const refreshParticipants = useCallback(async () => {
    if (!conference?.sid) return
    try {
      const data = await confAction({ action: 'participants', conferenceSid: conference.sid })
      if (data.success) {
        setConference(prev => prev ? { ...prev, participants: data.participants } : null)
      }
    } catch {
      setConference(null)
    }
  }, [conference?.sid])

  // Discover conference 2s after call goes active
  useEffect(() => {
    if (state === 'active' && !conference) {
      const t = setTimeout(discoverConference, 2000)
      return () => clearTimeout(t)
    }
  }, [state, conference, discoverConference])

  // Poll participants every 5s while in conference
  useEffect(() => {
    if (state === 'active' && conference) {
      confPollRef.current = setInterval(refreshParticipants, 5000)
      return () => { if (confPollRef.current) clearInterval(confPollRef.current) }
    }
  }, [state, conference, refreshParticipants])

  // Poll active conferences when idle
  useEffect(() => {
    if (state === 'idle') {
      const fetch = async () => {
        try {
          const data = await confAction({ action: 'active-conferences' })
          if (data.success) setActiveConfs(data.conferences || [])
        } catch { setActiveConfs([]) }
      }
      fetch()
      activePollRef.current = setInterval(fetch, 10000)
      return () => { if (activePollRef.current) clearInterval(activePollRef.current) }
    } else {
      setActiveConfs([])
    }
  }, [state])

  // ─── Conference actions ──────────────────────────────────────
  const holdParticipant = async (sid: string, h: boolean) => {
    if (!conference) return
    try { await confAction({ action: 'hold', conferenceSid: conference.sid, participantSid: sid, hold: h }); refreshParticipants() }
    catch { setError('Hold failed') }
  }

  const muteParticipant = async (sid: string, m: boolean) => {
    if (!conference) return
    try { await confAction({ action: 'mute', conferenceSid: conference.sid, participantSid: sid, muted: m }); refreshParticipants() }
    catch { setError('Mute failed') }
  }

  const kickParticipant = async (sid: string) => {
    if (!conference) return
    try { await confAction({ action: 'kick', conferenceSid: conference.sid, participantSid: sid }); refreshParticipants() }
    catch { setError('Kick failed') }
  }

  const addParticipantToConf = async () => {
    if (!conference || !addNumber.trim()) return
    let to = addNumber.trim()
    if (/^\d{10}$/.test(to)) to = `+1${to}`
    else if (/^1\d{10}$/.test(to)) to = `+${to}`
    else if (!to.startsWith('+')) to = `+${to}`
    setAddingParticipant(true)
    try {
      await confAction({ action: 'add', conferenceSid: conference.sid, phone: to, label: to })
      setAddNumber('')
      setShowAddPanel(false)
      setTimeout(refreshParticipants, 3000)
    } catch { setError('Add participant failed') }
    finally { setAddingParticipant(false) }
  }

  const endAllConference = async () => {
    if (!conference) return
    try { await confAction({ action: 'end', conferenceSid: conference.sid }); resetCall() }
    catch { setError('End conference failed') }
  }

  const monitorConference = (friendlyName: string) => {
    if (!deviceRef.current) return
    setPhoneNumber(`monitor:${friendlyName}`)
    setIsMonitoring(true)
    setState('dialing')
    setCallerInfo(`Monitoring: ${friendlyName}`)
    deviceRef.current.connect({ params: { To: `monitor:${friendlyName}` } }).then(call => {
      callRef.current = call
      call.on('accept', () => { setState('active'); startTimer() })
      call.on('disconnect', () => resetCall())
      call.on('error', (err) => { setError(err.message); resetCall() })
    }).catch(err => { setError('Monitor failed'); setState('idle'); setIsMonitoring(false) })
  }

  // ─── COLLAPSED ───────────────────────────────────────────────
  if (state === 'collapsed') {
    return (
      <button
        onClick={() => setState('idle')}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        title="Open Phone"
      >
        <PhoneIcon />
        <span className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 dark:border-gray-100 ${deviceReady ? 'bg-green-400' : 'bg-red-400'}`} />
      </button>
    )
  }

  // ─── EXPANDED ────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-[60] w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${deviceReady ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {isMonitoring ? 'Monitoring' : deviceReady ? 'Phone Ready' : 'Connecting...'}
          </span>
        </div>
        <button
          onClick={() => { if (state !== 'active' && state !== 'dialing') setState('collapsed') }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          title="Minimize"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs flex-shrink-0">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* INCOMING */}
      {state === 'incoming' && (
        <div className="p-4 text-center space-y-3">
          <div className="animate-pulse">
            <PhoneIcon className="w-10 h-10 mx-auto text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Incoming Call</p>
          <p className="text-lg font-mono text-gray-700 dark:text-gray-300">{formatPhone(callerInfo)}</p>
          <div className="flex justify-center gap-4">
            <button onClick={answerCall} className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center" title="Answer">
              <PhoneIcon />
            </button>
            <button onClick={rejectCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center" title="Decline">
              <PhoneOffIcon />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE / DIALING */}
      {(state === 'active' || state === 'dialing') && (
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 text-center space-y-2 flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {state === 'dialing' ? 'Dialing...' : isMonitoring ? 'Monitoring (Silent)' : 'On Call'}
            </p>
            <p className="text-base font-mono text-gray-700 dark:text-gray-300">{formatPhone(callerInfo)}</p>
            {state === 'active' && (
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatDuration(callDuration)}</p>
            )}

            {/* Control buttons */}
            <div className="flex justify-center gap-2 pt-1">
              <CtrlBtn
                onClick={toggleMute}
                active={isMuted}
                title={isMuted ? 'Unmute' : 'Mute'}
                icon={isMuted ? <MutedIcon /> : <MicIcon />}
              />
              {conference && !isMonitoring && (
                <CtrlBtn
                  onClick={() => setShowConf(!showConf)}
                  active={showConf}
                  title="Conference"
                  icon={<UsersIcon />}
                  badge={conference.participants.length}
                />
              )}
              {!isMonitoring && (
                <CtrlBtn
                  onClick={() => setShowKeypad(!showKeypad)}
                  active={showKeypad}
                  title="Keypad"
                  icon={<GridIcon />}
                />
              )}
              <button
                onClick={hangUp}
                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                title="Hang Up"
              >
                <PhoneOffIcon />
              </button>
            </div>
          </div>

          {/* Keypad (expandable) */}
          {showKeypad && state === 'active' && (
            <div className="px-4 pb-3 flex-shrink-0">
              <DialPad onDigit={sendDigit} compact />
            </div>
          )}

          {/* Conference Panel (expandable, scrollable) */}
          {showConf && conference && (
            <div className="border-t border-gray-200 dark:border-gray-700 overflow-y-auto flex-1 min-h-0">
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Participants ({conference.participants.length})
                  </span>
                  {!isMonitoring && (
                    <button
                      onClick={() => setShowAddPanel(!showAddPanel)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {/* Add participant panel */}
                {showAddPanel && (
                  <div className="flex gap-1.5">
                    <input
                      type="tel"
                      value={addNumber}
                      onChange={e => setAddNumber(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addParticipantToConf() }}
                      placeholder="Phone number..."
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono"
                    />
                    <button
                      onClick={addParticipantToConf}
                      disabled={addingParticipant || !addNumber.trim()}
                      className="px-2.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium"
                    >
                      {addingParticipant ? '...' : 'Dial'}
                    </button>
                  </div>
                )}

                {/* Participant list */}
                {conference.participants.map(p => (
                  <div key={p.callSid} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.hold ? 'bg-yellow-400' : p.muted ? 'bg-red-400' : 'bg-green-400'}`} />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {p.isClient ? 'You (Fleet)' : formatPhone(p.label || p.callSid)}
                      </span>
                    </div>
                    {!p.isClient && !isMonitoring && (
                      <div className="flex gap-1 flex-shrink-0">
                        <MiniBtn
                          onClick={() => muteParticipant(p.callSid, !p.muted)}
                          title={p.muted ? 'Unmute' : 'Mute'}
                          active={p.muted}
                        >
                          {p.muted ? 'M' : 'm'}
                        </MiniBtn>
                        <MiniBtn
                          onClick={() => holdParticipant(p.callSid, !p.hold)}
                          title={p.hold ? 'Unhold' : 'Hold'}
                          active={p.hold}
                        >
                          H
                        </MiniBtn>
                        <MiniBtn
                          onClick={() => kickParticipant(p.callSid)}
                          title="Remove"
                          danger
                        >
                          x
                        </MiniBtn>
                      </div>
                    )}
                  </div>
                ))}

                {/* End All */}
                {!isMonitoring && conference.participants.length > 1 && (
                  <button
                    onClick={endAllConference}
                    className="w-full py-1.5 text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    End All Conference
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IDLE */}
      {state === 'idle' && (
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Number input */}
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && phoneNumber.trim()) makeCall() }}
              placeholder="Enter number..."
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phoneNumber && (
              <button onClick={() => setPhoneNumber('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XIcon />
              </button>
            )}
          </div>

          <DialPad onDigit={sendDigit} />

          {/* Call button */}
          <button
            onClick={makeCall}
            disabled={!phoneNumber.trim() || !deviceReady}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <PhoneIcon className="w-4 h-4" /> Call
          </button>

          {/* Active Conferences (monitoring) */}
          {activeConfs.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Live Calls ({activeConfs.length})
              </p>
              {activeConfs.map(c => (
                <div key={c.sid} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                      {c.friendlyName.replace(/^(browser|call|bridge|masked)-/, '').slice(0, 20)}
                    </p>
                    <p className="text-[10px] text-gray-400">{c.participantCount} participants</p>
                  </div>
                  <button
                    onClick={() => monitorConference(c.friendlyName)}
                    className="px-2 py-1 text-[10px] font-medium text-purple-600 hover:text-purple-700 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Monitor
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

function CtrlBtn({ onClick, active, title, icon, badge }: {
  onClick: () => void; active?: boolean; title: string; icon: React.ReactNode; badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        active
          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title={title}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

function MiniBtn({ onClick, title, active, danger, children }: {
  onClick: () => void; title: string; active?: boolean; danger?: boolean; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
          : active
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

function DialPad({ onDigit, compact }: { onDigit: (d: string) => void; compact?: boolean }) {
  const keys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['*', '0', '#']]
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {keys.flat().map(key => (
        <button
          key={key}
          onClick={() => onDigit(key)}
          className={`${compact ? 'py-1.5' : 'py-2.5'} rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium transition-colors`}
        >
          {key}
        </button>
      ))}
    </div>
  )
}

// ─── Icons (inline SVGs to avoid dependency bloat) ──────────────

function PhoneIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function PhoneOffIcon() {
  return (
    <svg className="w-5 h-5 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
    </svg>
  )
}

function MutedIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
