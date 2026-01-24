// app/fleet/monitoring/components/SecurityEventDetailModal.tsx
// Modal showing detailed information about a security event with diagnosis and fixes

'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoShieldOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoCheckmarkOutline,
  IoAlertCircleOutline,
  IoCopyOutline,
  IoInformationCircleOutline,
  IoConstructOutline
} from 'react-icons/io5'

export interface SecurityEvent {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ip: string
  location: string
  message: string
  action: string
  blocked: boolean
  timestamp: string
}

interface SecurityEventDetailModalProps {
  event: SecurityEvent | null
  onClose: () => void
}

const severityConfig = {
  CRITICAL: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: IoCloseCircleOutline,
    label: 'Critical - Immediate Action Required'
  },
  HIGH: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: IoWarningOutline,
    label: 'High - Attention Needed'
  },
  MEDIUM: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: IoWarningOutline,
    label: 'Medium - Monitor'
  },
  LOW: {
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: IoCheckmarkCircleOutline,
    label: 'Low - Informational'
  }
}

// Event type analysis configurations
const eventTypeAnalysis: Record<string, {
  title: string
  description: string
  possibleCauses: string[]
  recommendedFixes: string[]
  isNormal?: boolean
}> = {
  'login_failure': {
    title: 'Failed Login Attempt',
    description: 'A user attempted to log in but authentication failed.',
    possibleCauses: [
      'Incorrect password entered',
      'User forgot their credentials',
      'Automated brute force attempt',
      'Credential stuffing attack',
      'Typo in email/username'
    ],
    recommendedFixes: [
      'Check if this IP has multiple failed attempts - could indicate attack',
      'Review the account for any signs of compromise',
      'Consider implementing rate limiting if not already in place',
      'Enable 2FA for the affected account',
      'Check if the account exists - could be probing for valid users'
    ]
  },
  'login_success': {
    title: 'Successful Login',
    description: 'A user successfully authenticated.',
    possibleCauses: [
      'Normal user login',
      'Admin accessing the system',
      'API token authentication'
    ],
    recommendedFixes: [
      'Verify the login location matches expected user patterns',
      'Check if login time is within normal working hours',
      'Review any sensitive actions taken during this session'
    ],
    isNormal: true
  },
  'rate_limit': {
    title: 'Rate Limit Exceeded',
    description: 'Request rate exceeded the allowed threshold and was throttled.',
    possibleCauses: [
      'Legitimate high traffic (viral content, marketing campaign)',
      'Automated scraping attempt',
      'DDoS attack',
      'Misconfigured client/bot',
      'API integration sending too many requests'
    ],
    recommendedFixes: [
      'Check if the IP belongs to a known service or bot',
      'Review the endpoints being accessed for patterns',
      'Consider whitelisting legitimate API integrations',
      'Implement progressive rate limiting instead of hard blocks',
      'Check for DDoS patterns (distributed IPs, specific endpoint)'
    ]
  },
  'suspicious_activity': {
    title: 'Suspicious Activity Detected',
    description: 'Unusual behavior patterns were detected that may indicate an attack.',
    possibleCauses: [
      'Unusual access patterns',
      'Accessing restricted endpoints',
      'Unusual geographic access',
      'Rapid sequential requests',
      'Known attack signatures detected'
    ],
    recommendedFixes: [
      'Review the full request logs for this IP',
      'Check if this is a new user or returning attacker',
      'Consider temporary IP ban if activity continues',
      'Enable additional logging for this session',
      'Alert security team for manual review'
    ]
  },
  'account_lockout': {
    title: 'Account Locked',
    description: 'An account was automatically locked due to multiple failed authentication attempts.',
    possibleCauses: [
      'User forgot password and tried multiple times',
      'Targeted brute force attack on specific account',
      'Shared account with multiple users',
      'Saved password no longer valid'
    ],
    recommendedFixes: [
      'Contact the user to verify if they were trying to login',
      'Review failed attempt history for attack patterns',
      'Provide secure password reset option',
      'Consider implementing temporary soft-locks before hard-locks'
    ]
  },
  'password_reset': {
    title: 'Password Reset Request',
    description: 'A password reset was requested for an account.',
    possibleCauses: [
      'User forgot their password',
      'User proactively changing credentials',
      'Potential account takeover attempt'
    ],
    recommendedFixes: [
      'Verify the reset was completed from expected location',
      'Check if there are unusual login attempts after reset',
      'Review if user reported suspicious activity',
      'Monitor account for unauthorized access'
    ]
  },
  'brute_force': {
    title: 'Brute Force Attack Detected',
    description: 'Multiple rapid authentication attempts suggest a brute force attack.',
    possibleCauses: [
      'Automated attack script targeting login',
      'Credential stuffing from leaked database',
      'Dictionary attack on passwords',
      'Systematic user enumeration'
    ],
    recommendedFixes: [
      'Immediately block the source IP temporarily',
      'Enable CAPTCHA after failed attempts',
      'Review affected accounts for strong passwords',
      'Check if any accounts were compromised',
      'Report IP to threat intelligence services',
      'Consider implementing honeypot accounts'
    ]
  },
  'sql_injection': {
    title: 'SQL Injection Attempt',
    description: 'A request contained SQL injection patterns attempting to manipulate database queries.',
    possibleCauses: [
      'Automated vulnerability scanner',
      'Targeted attack on your application',
      'Penetration testing (check if authorized)',
      'Bot exploiting known vulnerabilities'
    ],
    recommendedFixes: [
      'Verify all database queries use parameterized statements',
      'Review the targeted endpoint for vulnerabilities',
      'Block the IP and report to threat intelligence',
      'Ensure WAF rules are up to date',
      'Check database for any unauthorized changes',
      'Run a security audit on affected endpoints'
    ]
  },
  'xss_attempt': {
    title: 'XSS Attack Attempt',
    description: 'A request contained cross-site scripting (XSS) patterns attempting to inject malicious scripts.',
    possibleCauses: [
      'Automated vulnerability scanner',
      'Targeted XSS attack',
      'Testing for stored XSS vulnerabilities',
      'Attempting session hijacking'
    ],
    recommendedFixes: [
      'Verify all user inputs are properly sanitized',
      'Check Content-Security-Policy headers are in place',
      'Review the targeted endpoint for vulnerabilities',
      'Ensure output encoding is implemented',
      'Block the IP if persistent',
      'Test application for reflected and stored XSS'
    ]
  }
}

export default function SecurityEventDetailModal({ event, onClose }: SecurityEventDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (event) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [event])

  if (!event) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const config = severityConfig[event.severity]
  const Icon = config.icon
  const analysis = eventTypeAnalysis[event.type] || {
    title: event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: event.message,
    possibleCauses: ['Event type not recognized - requires manual review'],
    recommendedFixes: ['Review event details and determine appropriate action']
  }

  const timestamp = new Date(event.timestamp)
  const formattedDate = timestamp.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${config.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {analysis.title}
              </h2>
              <p className={`text-xs ${config.color}`}>
                {config.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Status Banner */}
          <div className={`mb-4 p-3 rounded-lg ${event.blocked ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : analysis.isNormal ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
            <div className="flex items-center gap-2">
              {event.blocked ? (
                <>
                  <IoCloseCircleOutline className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    This request was automatically blocked
                  </span>
                </>
              ) : analysis.isNormal ? (
                <>
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    This is a normal event - no action required
                  </span>
                </>
              ) : (
                <>
                  <IoAlertCircleOutline className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    This event may require attention
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              What Happened
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {analysis.description}
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
              {event.message}
            </p>
          </div>

          {/* Time & Location Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoTimeOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">When</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedTime}
              </p>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoLocationOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {event.location || 'Unknown'}
              </p>
            </div>
          </div>

          {/* IP Address */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Source IP Address
            </label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <IoGlobeOutline className="w-4 h-4 text-gray-400" />
              <code className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300">
                {event.ip}
              </code>
              <button
                onClick={() => copyToClipboard(event.ip)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copy IP"
              >
                {copied ? <IoCheckmarkOutline className="w-4 h-4 text-green-500" /> : <IoCopyOutline className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Possible Causes */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IoInformationCircleOutline className="w-4 h-4" />
              Possible Causes
            </label>
            <ul className="space-y-2">
              {analysis.possibleCauses.map((cause, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Fixes */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IoConstructOutline className="w-4 h-4" />
              Recommended Actions
            </label>
            <ul className="space-y-2">
              {analysis.recommendedFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <IoCheckmarkOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Taken */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
              Action Taken by System
            </label>
            <div className="flex items-center gap-2">
              <IoLockClosedOutline className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {event.action || 'Logged for review'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => window.open(`https://www.abuseipdb.com/check/${event.ip}`, '_blank')}
              className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              Check IP Reputation
            </button>
            <button
              onClick={() => window.open(`https://ipinfo.io/${event.ip}`, '_blank')}
              className="px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              View IP Details
            </button>
            <button
              onClick={() => copyToClipboard(JSON.stringify(event, null, 2))}
              className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy Event Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
