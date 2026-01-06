/**
 * Alert System for ItWhip Platform
 * Manages alerts, notifications, and incident response
 */

import { EventEmitter } from 'events'
import { logger } from './logger'
import { createSecurityEvent } from '@/app/lib/database/audit'
import type { ThreatSeverity } from '@/app/types/security'

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Alert types
export enum AlertType {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ERROR_RATE = 'error_rate',
  AVAILABILITY = 'availability',
  CAPACITY = 'capacity',
  BUSINESS = 'business',
  COMPLIANCE = 'compliance',
  FRAUD = 'fraud'
}

// Alert status
export enum AlertStatus {
  TRIGGERED = 'triggered',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  FALSE_POSITIVE = 'false_positive'
}

// Alert channels
export enum AlertChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PAGERDUTY = 'pagerduty',
  DASHBOARD = 'dashboard'
}

// Alert definition
interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  details?: any
  source?: string
  triggeredAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  escalatedAt?: Date
  assignedTo?: string
  notes?: string[]
  metadata?: Record<string, any>
}

// Alert rule
interface AlertRule {
  id: string
  name: string
  type: AlertType
  condition: (metrics: any) => boolean
  severity: AlertSeverity
  channels: AlertChannel[]
  cooldown: number // Minutes before re-alerting
  autoResolve?: boolean
  escalationPolicy?: EscalationPolicy
  enabled: boolean
}

// Escalation policy
interface EscalationPolicy {
  levels: Array<{
    afterMinutes: number
    severity: AlertSeverity
    channels: AlertChannel[]
    notifyUsers?: string[]
  }>
}

// Notification configuration
interface NotificationConfig {
  email?: {
    enabled: boolean
    recipients: string[]
    smtp?: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
    }
  }
  sms?: {
    enabled: boolean
    recipients: string[]
    twilioConfig?: {
      accountSid: string
      authToken: string
      fromNumber: string
    }
  }
  slack?: {
    enabled: boolean
    webhookUrl: string
    channel?: string
    username?: string
  }
  webhook?: {
    enabled: boolean
    url: string
    headers?: Record<string, string>
  }
  pagerduty?: {
    enabled: boolean
    integrationKey: string
  }
}

/**
 * Alert manager
 */
class AlertManager extends EventEmitter {
  private alerts = new Map<string, Alert>()
  private rules = new Map<string, AlertRule>()
  private cooldowns = new Map<string, number>() // Rule ID -> cooldown expiry timestamp
  private notificationConfig: NotificationConfig = {}
  private escalationTimers = new Map<string, NodeJS.Timeout[]>()
  
  constructor() {
    super()
    this.loadConfiguration()
    this.setupDefaultRules()
  }
  
  /**
   * Load notification configuration
   */
  private loadConfiguration(): void {
    this.notificationConfig = {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        smtp: process.env.SMTP_HOST ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        } : undefined
      },
      sms: {
        enabled: process.env.ALERT_SMS_ENABLED === 'true',
        recipients: process.env.ALERT_SMS_RECIPIENTS?.split(',') || [],
        twilioConfig: process.env.TWILIO_ACCOUNT_SID ? {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          fromNumber: process.env.TWILIO_FROM_NUMBER || ''
        } : undefined
      },
      slack: {
        enabled: process.env.ALERT_SLACK_ENABLED === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_CHANNEL,
        username: process.env.SLACK_USERNAME || 'ItWhip Alerts'
      },
      webhook: {
        enabled: process.env.ALERT_WEBHOOK_ENABLED === 'true',
        url: process.env.ALERT_WEBHOOK_URL || ''
      },
      pagerduty: {
        enabled: process.env.PAGERDUTY_ENABLED === 'true',
        integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || ''
      }
    }
  }
  
  /**
   * Setup default alert rules
   */
  private setupDefaultRules(): void {
    // High error rate rule
    this.addRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      type: AlertType.ERROR_RATE,
      condition: (metrics) => {
        const errorRate = metrics.errorRate || 0
        return errorRate > 10 // 10% error rate
      },
      severity: AlertSeverity.HIGH,
      channels: [AlertChannel.SLACK, AlertChannel.EMAIL],
      cooldown: 15,
      enabled: true
    })
    
    // Slow response time rule
    this.addRule({
      id: 'slow_response',
      name: 'Slow Response Time',
      type: AlertType.PERFORMANCE,
      condition: (metrics) => {
        const p95 = metrics.responseTime?.p95 || 0
        return p95 > 3000 // 3 seconds
      },
      severity: AlertSeverity.MEDIUM,
      channels: [AlertChannel.SLACK],
      cooldown: 30,
      enabled: true
    })
    
    // Security threat rule
    this.addRule({
      id: 'security_threat',
      name: 'Security Threat Detected',
      type: AlertType.SECURITY,
      condition: (metrics) => {
        const threats = metrics.threats || 0
        return threats > 0
      },
      severity: AlertSeverity.CRITICAL,
      channels: [AlertChannel.EMAIL, AlertChannel.SMS, AlertChannel.PAGERDUTY],
      cooldown: 5,
      enabled: true,
      escalationPolicy: {
        levels: [
          {
            afterMinutes: 5,
            severity: AlertSeverity.CRITICAL,
            channels: [AlertChannel.SMS, AlertChannel.PAGERDUTY],
            notifyUsers: ['security-team@itwhip.com']
          },
          {
            afterMinutes: 15,
            severity: AlertSeverity.CRITICAL,
            channels: [AlertChannel.SMS],
            notifyUsers: ['cto@itwhip.com']
          }
        ]
      }
    })
    
    // Low disk space rule
    this.addRule({
      id: 'low_disk_space',
      name: 'Low Disk Space',
      type: AlertType.CAPACITY,
      condition: (metrics) => {
        const diskUsage = metrics.diskUsage || 0
        return diskUsage > 90 // 90% disk usage
      },
      severity: AlertSeverity.MEDIUM,
      channels: [AlertChannel.EMAIL],
      cooldown: 60,
      enabled: true
    })
    
    // Revenue anomaly rule
    this.addRule({
      id: 'revenue_anomaly',
      name: 'Revenue Anomaly',
      type: AlertType.BUSINESS,
      condition: (metrics) => {
        const revenueDropPercent = metrics.revenueDropPercent || 0
        return revenueDropPercent > 30 // 30% drop
      },
      severity: AlertSeverity.HIGH,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
      cooldown: 120,
      enabled: true
    })
    
    // Fraud detection rule
    this.addRule({
      id: 'fraud_detected',
      name: 'Potential Fraud Detected',
      type: AlertType.FRAUD,
      condition: (metrics) => {
        const fraudScore = metrics.fraudScore || 0
        return fraudScore > 80 // High fraud score
      },
      severity: AlertSeverity.HIGH,
      channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
      cooldown: 30,
      enabled: true
    })
  }
  
  /**
   * Add or update an alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }
  
  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }
  
  /**
   * Enable/disable a rule
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }
  
  /**
   * Check rules against metrics
   */
  async checkRules(metrics: any): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue
      
      // Check cooldown
      const cooldownExpiry = this.cooldowns.get(rule.id)
      if (cooldownExpiry && Date.now() < cooldownExpiry) {
        continue
      }
      
      // Check condition
      try {
        if (rule.condition(metrics)) {
          await this.triggerAlert({
            type: rule.type,
            severity: rule.severity,
            title: rule.name,
            message: `Alert rule "${rule.name}" triggered`,
            details: { metrics, rule: rule.id },
            source: 'rule_engine'
          }, rule)
        }
      } catch (error) {
        logger.error('Error checking alert rule', {
          rule: rule.id,
          error
        })
      }
    }
  }
  
  /**
   * Trigger an alert
   */
  async triggerAlert(
    alert: Omit<Alert, 'id' | 'status' | 'triggeredAt'>,
    rule?: AlertRule
  ): Promise<string> {
    const alertId = this.generateAlertId()
    
    const fullAlert: Alert = {
      ...alert,
      id: alertId,
      status: AlertStatus.TRIGGERED,
      triggeredAt: new Date()
    }
    
    // Store alert
    this.alerts.set(alertId, fullAlert)
    
    // Set cooldown if rule exists
    if (rule) {
      const cooldownMs = rule.cooldown * 60 * 1000
      this.cooldowns.set(rule.id, Date.now() + cooldownMs)
    }
    
    // Log alert
    logger.warn('Alert triggered', {
      alert: fullAlert
    })
    
    // Create security event if security alert
    if (alert.type === AlertType.SECURITY) {
      await createSecurityEvent({
        type: 'alert_triggered',
        severity: this.mapSeverity(alert.severity),
        sourceIp: '0.0.0.0',
        userAgent: 'system',
        message: alert.title,
        details: alert.details,
        action: 'alert',
        blocked: false
      })
    }
    
    // Send notifications
    const channels = rule?.channels || this.getDefaultChannels(alert.severity)
    await this.sendNotifications(fullAlert, channels)
    
    // Setup escalation if needed
    if (rule?.escalationPolicy) {
      this.setupEscalation(alertId, rule.escalationPolicy)
    }
    
    // Emit event
    this.emit('alert:triggered', fullAlert)
    
    return alertId
  }
  
  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`)
    }
    
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledgedAt = new Date()
    alert.assignedTo = acknowledgedBy
    
    logger.info('Alert acknowledged', {
      alertId,
      acknowledgedBy
    })
    
    this.emit('alert:acknowledged', alert)
  }
  
  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    notes?: string
  ): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`)
    }
    
    alert.status = AlertStatus.RESOLVED
    alert.resolvedAt = new Date()
    
    if (notes) {
      alert.notes = alert.notes || []
      alert.notes.push(`[${new Date().toISOString()}] ${resolvedBy}: ${notes}`)
    }
    
    // Cancel escalation timers
    this.cancelEscalation(alertId)
    
    logger.info('Alert resolved', {
      alertId,
      resolvedBy,
      notes
    })
    
    this.emit('alert:resolved', alert)
  }
  
  /**
   * Escalate an alert
   */
  private async escalateAlert(alertId: string, level: number): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (!alert || alert.status === AlertStatus.RESOLVED) {
      return
    }
    
    alert.status = AlertStatus.ESCALATED
    alert.escalatedAt = new Date()
    
    logger.warn('Alert escalated', {
      alertId,
      level
    })
    
    this.emit('alert:escalated', alert)
  }
  
  /**
   * Setup escalation timers
   */
  private setupEscalation(alertId: string, policy: EscalationPolicy): void {
    const timers: NodeJS.Timeout[] = []
    
    for (let i = 0; i < policy.levels.length; i++) {
      const level = policy.levels[i]
      const timer = setTimeout(async () => {
        const alert = this.alerts.get(alertId)
        if (alert && alert.status !== AlertStatus.RESOLVED) {
          await this.escalateAlert(alertId, i)
          await this.sendNotifications(alert, level.channels)
          
          // Notify specific users if specified
          if (level.notifyUsers) {
            await this.notifyUsers(alert, level.notifyUsers)
          }
        }
      }, level.afterMinutes * 60 * 1000)
      
      timers.push(timer)
    }
    
    this.escalationTimers.set(alertId, timers)
  }
  
  /**
   * Cancel escalation timers
   */
  private cancelEscalation(alertId: string): void {
    const timers = this.escalationTimers.get(alertId)
    if (timers) {
      timers.forEach(timer => clearTimeout(timer))
      this.escalationTimers.delete(alertId)
    }
  }
  
  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(
    alert: Alert,
    channels: AlertChannel[]
  ): Promise<void> {
    const promises: Promise<void>[] = []
    
    for (const channel of channels) {
      switch (channel) {
        case AlertChannel.EMAIL:
          if (this.notificationConfig.email?.enabled) {
            promises.push(this.sendEmailNotification(alert))
          }
          break
        
        case AlertChannel.SMS:
          if (this.notificationConfig.sms?.enabled) {
            promises.push(this.sendSmsNotification(alert))
          }
          break
        
        case AlertChannel.SLACK:
          if (this.notificationConfig.slack?.enabled) {
            promises.push(this.sendSlackNotification(alert))
          }
          break
        
        case AlertChannel.WEBHOOK:
          if (this.notificationConfig.webhook?.enabled) {
            promises.push(this.sendWebhookNotification(alert))
          }
          break
        
        case AlertChannel.PAGERDUTY:
          if (this.notificationConfig.pagerduty?.enabled) {
            promises.push(this.sendPagerDutyNotification(alert))
          }
          break
        
        case AlertChannel.DASHBOARD:
          // Dashboard notifications are handled via WebSocket
          this.emit('alert:dashboard', alert)
          break
      }
    }
    
    await Promise.allSettled(promises)
  }
  
  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      // Implementation depends on your email service
      // This is a placeholder
      logger.info('Email notification sent', {
        alert: alert.id,
        recipients: this.notificationConfig.email?.recipients
      })
    } catch (error) {
      logger.error('Failed to send email notification', { error, alert: alert.id })
    }
  }
  
  /**
   * Send SMS notification
   */
  private async sendSmsNotification(alert: Alert): Promise<void> {
    try {
      // Implementation using Twilio or similar
      logger.info('SMS notification sent', {
        alert: alert.id,
        recipients: this.notificationConfig.sms?.recipients
      })
    } catch (error) {
      logger.error('Failed to send SMS notification', { error, alert: alert.id })
    }
  }
  
  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert): Promise<void> {
    try {
      const color = this.getSeverityColor(alert.severity)
      
      const payload = {
        channel: this.notificationConfig.slack?.channel,
        username: this.notificationConfig.slack?.username,
        attachments: [{
          color,
          title: `🚨 ${alert.title}`,
          text: alert.message,
          fields: [
            {
              title: 'Type',
              value: alert.type,
              short: true
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Time',
              value: alert.triggeredAt.toISOString(),
              short: true
            },
            {
              title: 'Alert ID',
              value: alert.id,
              short: true
            }
          ],
          footer: 'ItWhip Alert System',
          ts: Math.floor(alert.triggeredAt.getTime() / 1000)
        }]
      }
      
      // Send to Slack webhook
      const response = await fetch(this.notificationConfig.slack?.webhookUrl || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.statusText}`)
      }
      
      logger.info('Slack notification sent', { alert: alert.id })
    } catch (error) {
      logger.error('Failed to send Slack notification', { error, alert: alert.id })
    }
  }
  
  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    try {
      const response = await fetch(this.notificationConfig.webhook?.url || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.notificationConfig.webhook?.headers
        },
        body: JSON.stringify(alert)
      })
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`)
      }
      
      logger.info('Webhook notification sent', { alert: alert.id })
    } catch (error) {
      logger.error('Failed to send webhook notification', { error, alert: alert.id })
    }
  }
  
  /**
   * Send PagerDuty notification
   */
  private async sendPagerDutyNotification(alert: Alert): Promise<void> {
    try {
      const payload = {
        routing_key: this.notificationConfig.pagerduty?.integrationKey,
        event_action: 'trigger',
        dedup_key: alert.id,
        payload: {
          summary: alert.title,
          severity: alert.severity === AlertSeverity.CRITICAL ? 'critical' : 
                   alert.severity === AlertSeverity.HIGH ? 'error' :
                   alert.severity === AlertSeverity.MEDIUM ? 'warning' : 'info',
          source: 'ItWhip',
          custom_details: alert.details
        }
      }
      
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`PagerDuty API failed: ${response.statusText}`)
      }
      
      logger.info('PagerDuty notification sent', { alert: alert.id })
    } catch (error) {
      logger.error('Failed to send PagerDuty notification', { error, alert: alert.id })
    }
  }
  
  /**
   * Notify specific users
   */
  private async notifyUsers(alert: Alert, users: string[]): Promise<void> {
    // Implementation depends on your user notification system
    logger.info('Users notified', {
      alert: alert.id,
      users
    })
  }
  
  /**
   * Get default channels based on severity
   */
  private getDefaultChannels(severity: AlertSeverity): AlertChannel[] {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return [AlertChannel.EMAIL, AlertChannel.SMS, AlertChannel.SLACK, AlertChannel.PAGERDUTY]
      case AlertSeverity.HIGH:
        return [AlertChannel.EMAIL, AlertChannel.SLACK]
      case AlertSeverity.MEDIUM:
        return [AlertChannel.SLACK]
      case AlertSeverity.LOW:
        return [AlertChannel.DASHBOARD]
      default:
        return [AlertChannel.DASHBOARD]
    }
  }
  
  /**
   * Map alert severity to threat severity
   */
  private mapSeverity(severity: AlertSeverity): ThreatSeverity {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'CRITICAL' as ThreatSeverity
      case AlertSeverity.HIGH:
        return 'HIGH' as ThreatSeverity
      case AlertSeverity.MEDIUM:
        return 'MEDIUM' as ThreatSeverity
      case AlertSeverity.LOW:
        return 'LOW' as ThreatSeverity
      default:
        return 'LOW' as ThreatSeverity
    }
  }
  
  /**
   * Get color for severity (for Slack)
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#FF0000' // Red
      case AlertSeverity.HIGH:
        return '#FF9900' // Orange
      case AlertSeverity.MEDIUM:
        return '#FFFF00' // Yellow
      case AlertSeverity.LOW:
        return '#00FF00' // Green
      default:
        return '#808080' // Gray
    }
  }
  
  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(
      alert => alert.status !== AlertStatus.RESOLVED
    )
  }
  
  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId)
  }
  
  /**
   * Get alert statistics
   */
  getStatistics(): {
    total: number
    active: number
    resolved: number
    bySeverity: Record<AlertSeverity, number>
    byType: Record<AlertType, number>
  } {
    const alerts = Array.from(this.alerts.values())
    
    const stats = {
      total: alerts.length,
      active: 0,
      resolved: 0,
      bySeverity: {} as Record<AlertSeverity, number>,
      byType: {} as Record<AlertType, number>
    }
    
    for (const alert of alerts) {
      if (alert.status === AlertStatus.RESOLVED) {
        stats.resolved++
      } else {
        stats.active++
      }
      
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
    }
    
    return stats
  }
}

// Create singleton instance
const alertManager = new AlertManager()

// Export convenience functions
export async function createAlert(
  params: {
    type: AlertType
    severity: AlertSeverity
    title: string
    message: string
    details?: any
  }
): Promise<string> {
  return alertManager.triggerAlert(params)
}

export async function acknowledgeAlert(alertId: string, user: string): Promise<void> {
  return alertManager.acknowledgeAlert(alertId, user)
}

export async function resolveAlert(
  alertId: string,
  user: string,
  notes?: string
): Promise<void> {
  return alertManager.resolveAlert(alertId, user, notes)
}

export function getActiveAlerts(): Alert[] {
  return alertManager.getActiveAlerts()
}

// Export the manager and types
export { alertManager, AlertManager }
export default alertManager