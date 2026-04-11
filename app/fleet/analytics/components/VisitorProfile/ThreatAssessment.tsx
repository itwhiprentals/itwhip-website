// app/fleet/analytics/components/VisitorProfile/ThreatAssessment.tsx
// Auto-generated threat summary for a visitor

'use client'

import { EnrichedVisitor } from '../shared/types'

interface ThreatAssessmentProps {
  visitor: EnrichedVisitor
  behavioral: {
    totalPages: number
    avgTimeBetweenPages: number | null
    authPagesVisited: string[]
    sensitivePagesVisited: string[]
    sessionDurationMs: number | null
  }
  securityEventCount: number
  loginAttemptCount: number
}

interface Finding {
  level: 'critical' | 'high' | 'medium' | 'low' | 'clean'
  message: string
}

export default function ThreatAssessment({ visitor, behavioral, securityEventCount, loginAttemptCount }: ThreatAssessmentProps) {
  const findings: Finding[] = []

  // Evaluate threat indicators
  if (visitor.isTor) findings.push({ level: 'critical', message: 'Using Tor — identity fully anonymized' })
  if (visitor.isProxy) findings.push({ level: 'high', message: 'Using proxy — IP may be masked' })
  if (visitor.isVpn) findings.push({ level: 'medium', message: 'Using VPN — location may not be accurate' })
  if (visitor.isHosting) findings.push({ level: 'high', message: `Datacenter IP (${visitor.isp || 'unknown provider'}) — likely automated` })
  if (visitor.riskScore >= 70) findings.push({ level: 'critical', message: `High risk score: ${visitor.riskScore}/100` })
  else if (visitor.riskScore >= 40) findings.push({ level: 'high', message: `Elevated risk score: ${visitor.riskScore}/100` })

  if (behavioral.sensitivePagesVisited.length > 0) {
    findings.push({ level: 'critical', message: `Accessed ${behavioral.sensitivePagesVisited.length} sensitive path(s): ${behavioral.sensitivePagesVisited.join(', ')}` })
  }
  if (behavioral.avgTimeBetweenPages !== null && behavioral.avgTimeBetweenPages < 1000) {
    findings.push({ level: 'high', message: `Bot-like speed — ${behavioral.avgTimeBetweenPages}ms avg between pages` })
  }
  if (securityEventCount > 0) {
    findings.push({ level: 'high', message: `${securityEventCount} security event(s) from this IP` })
  }
  if (loginAttemptCount > 3) {
    findings.push({ level: 'high', message: `${loginAttemptCount} login attempt(s) — possible brute force` })
  }

  if (findings.length === 0) {
    findings.push({ level: 'clean', message: `Normal user — ${visitor.city || 'Unknown'}, ${visitor.isp || 'Unknown ISP'}, ${behavioral.totalPages} pages over ${formatDuration(behavioral.sessionDurationMs)}` })
  }

  // Overall threat level
  const levels = findings.map(f => f.level)
  const overallLevel = levels.includes('critical') ? 'critical'
    : levels.includes('high') ? 'high'
    : levels.includes('medium') ? 'medium'
    : levels.includes('low') ? 'low'
    : 'clean'

  const levelConfig = {
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', title: 'CRITICAL THREAT', titleColor: 'text-red-700', icon: '🔴' },
    high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', title: 'HIGH RISK', titleColor: 'text-orange-700', icon: '🟠' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', title: 'MEDIUM RISK', titleColor: 'text-yellow-700', icon: '🟡' },
    low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', title: 'LOW RISK', titleColor: 'text-blue-700', icon: '🔵' },
    clean: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', title: 'CLEAN', titleColor: 'text-green-700', icon: '🟢' },
  }

  const config = levelConfig[overallLevel]

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{config.icon}</span>
        <h3 className={`text-sm font-bold uppercase tracking-wide ${config.titleColor}`}>{config.title}</h3>
      </div>
      <ul className="space-y-1.5">
        {findings.map((f, i) => (
          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <span className="text-[10px] mt-1">{findingIcon(f.level)}</span>
            {f.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function findingIcon(level: string): string {
  if (level === 'critical') return '🔴'
  if (level === 'high') return '🟠'
  if (level === 'medium') return '🟡'
  if (level === 'clean') return '✅'
  return '🔵'
}

function formatDuration(ms: number | null): string {
  if (!ms) return 'single page'
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}
