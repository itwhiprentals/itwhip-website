// app/lib/security/anomaly.ts
// AI-powered anomaly detection system for identifying and blocking threats
// Detects SQL injection, XSS, DDoS, credential stuffing, and behavioral anomalies

import { AttackType, ThreatSeverity, ThreatStatus } from '@/app/lib/dal/types'
import prisma from '@/app/lib/database/prisma'
import crypto from 'crypto'

// ============================================================================
// THREAT PATTERNS & SIGNATURES
// ============================================================================

const ATTACK_PATTERNS = {
  [AttackType.SQL_INJECTION]: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
    /(--|\||;|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|select|sys|sysobjects|syscolumns|table|update)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(SLEEP\s*\(\s*\d+\s*\))/gi,
    /(BENCHMARK\s*\(.*\))/gi,
  ],
  
  [AttackType.XSS]: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*onerror\s*=/gi,
    /<svg[^>]*onload\s*=/gi,
    /document\.(cookie|write|domain)/gi,
    /window\.(location|open)/gi,
    /eval\s*\(/gi,
    /((src|href|data|action)\s*=\s*['"]*javascript:)/gi,
  ],
  
  [AttackType.CSRF]: [
    /(<form[^>]*action\s*=)/gi,
    /(<img[^>]*src\s*=\s*['"]https?:\/\/(?!itwhip\.com))/gi,
    /(XMLHttpRequest|fetch)\s*\(/gi,
  ],
  
  [AttackType.CREDENTIAL_STUFFING]: [
    // Multiple rapid login attempts
    /^.{100,}$/,  // Unusually long input (likely automated)
  ],
  
  [AttackType.BOT]: [
    /bot|crawler|spider|scraper|curl|wget|python-requests|postman/gi,
  ],
}

// ============================================================================
// BEHAVIORAL BASELINES
// ============================================================================

interface UserBehavior {
  userId: string
  normalRequestRate: number      // requests per minute
  normalLocations: string[]      // Common IP locations
  normalUserAgents: string[]     // Common browsers
  normalEndpoints: string[]      // Commonly accessed endpoints
  lastActivity: Date
  suspiciousScore: number        // 0-100
}

const userBehaviorCache = new Map<string, UserBehavior>()

// ============================================================================
// CORE DETECTION ENGINE
// ============================================================================

export class AnomalyDetector {
  private static instance: AnomalyDetector
  private requestHistory: Map<string, { count: number; timestamps: number[] }> = new Map()
  private blockedIPs: Set<string> = new Set()
  private threatCache: Map<string, ThreatSeverity> = new Map()
  
  private constructor() {
    // Initialize with blocked IPs from database
    this.loadBlockedIPs()
  }
  
  public static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector()
    }
    return AnomalyDetector.instance
  }
  
  // ============================================================================
  // ATTACK DETECTION
  // ============================================================================
  
  /**
   * Detect SQL injection attempts
   */
  public detectSQLInjection(input: string): {
    detected: boolean
    confidence: number
    patterns: string[]
  } {
    const patterns: string[] = []
    let confidence = 0
    
    for (const pattern of ATTACK_PATTERNS[AttackType.SQL_INJECTION]) {
      if (pattern.test(input)) {
        patterns.push(pattern.source)
        confidence += 20
      }
    }
    
    // Additional heuristics
    if (input.includes('1=1') || input.includes('1 = 1')) confidence += 30
    if (input.includes('/*') || input.includes('*/')) confidence += 20
    if (input.includes('--')) confidence += 20
    if (input.match(/\d+\s*=\s*\d+/)) confidence += 10
    
    return {
      detected: confidence >= 50,
      confidence: Math.min(confidence, 100),
      patterns
    }
  }
  
  /**
   * Detect XSS attempts
   */
  public detectXSS(input: string): {
    detected: boolean
    confidence: number
    patterns: string[]
  } {
    const patterns: string[] = []
    let confidence = 0
    
    for (const pattern of ATTACK_PATTERNS[AttackType.XSS]) {
      if (pattern.test(input)) {
        patterns.push(pattern.source)
        confidence += 25
      }
    }
    
    // Check for encoded attacks
    const decoded = this.decodeInput(input)
    if (decoded !== input) {
      for (const pattern of ATTACK_PATTERNS[AttackType.XSS]) {
        if (pattern.test(decoded)) {
          patterns.push(`Encoded: ${pattern.source}`)
          confidence += 15
        }
      }
    }
    
    return {
      detected: confidence >= 50,
      confidence: Math.min(confidence, 100),
      patterns
    }
  }
  
  /**
   * Detect any attack type
   */
  public async detectAttack(
    input: string | object,
    type?: AttackType
  ): Promise<{
    detected: boolean
    attackType: AttackType | null
    severity: ThreatSeverity
    confidence: number
    details: string
  }> {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input)
    
    // Check all attack types if not specified
    const typesToCheck = type ? [type] : Object.keys(ATTACK_PATTERNS) as AttackType[]
    
    for (const attackType of typesToCheck) {
      if (attackType === AttackType.SQL_INJECTION) {
        const result = this.detectSQLInjection(inputStr)
        if (result.detected) {
          await this.logThreat(attackType, result.confidence, inputStr)
          return {
            detected: true,
            attackType,
            severity: this.calculateSeverity(result.confidence),
            confidence: result.confidence,
            details: `SQL injection detected: ${result.patterns.join(', ')}`
          }
        }
      }
      
      if (attackType === AttackType.XSS) {
        const result = this.detectXSS(inputStr)
        if (result.detected) {
          await this.logThreat(attackType, result.confidence, inputStr)
          return {
            detected: true,
            attackType,
            severity: this.calculateSeverity(result.confidence),
            confidence: result.confidence,
            details: `XSS attempt detected: ${result.patterns.join(', ')}`
          }
        }
      }
    }
    
    return {
      detected: false,
      attackType: null,
      severity: ThreatSeverity.LOW,
      confidence: 0,
      details: 'No threats detected'
    }
  }
  
  // ============================================================================
  // BEHAVIORAL ANALYSIS
  // ============================================================================
  
  /**
   * Detect DDoS patterns
   */
  public detectDDoS(
    ip: string,
    endpoint: string,
    windowMs: number = 60000 // 1 minute window
  ): {
    detected: boolean
    requestCount: number
    threshold: number
    severity: ThreatSeverity
  } {
    const now = Date.now()
    const key = `${ip}:${endpoint}`
    
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, { count: 0, timestamps: [] })
    }
    
    const history = this.requestHistory.get(key)!
    
    // Clean old timestamps
    history.timestamps = history.timestamps.filter(t => now - t < windowMs)
    
    // Add current request
    history.timestamps.push(now)
    history.count = history.timestamps.length
    
    // Dynamic threshold based on endpoint
    const threshold = this.getDDoSThreshold(endpoint)
    
    const detected = history.count > threshold
    const severity = detected
      ? history.count > threshold * 2
        ? ThreatSeverity.CRITICAL
        : ThreatSeverity.HIGH
      : ThreatSeverity.LOW
    
    if (detected) {
      this.blockIP(ip, 3600000) // Block for 1 hour
    }
    
    return {
      detected,
      requestCount: history.count,
      threshold,
      severity
    }
  }
  
  /**
   * Detect brute force attacks
   */
  public async detectBruteForce(
    identifier: string, // email or user ID
    ip: string,
    success: boolean
  ): Promise<{
    detected: boolean
    attempts: number
    shouldBlock: boolean
    severity: ThreatSeverity
  }> {
    const recentAttempts = await prisma.loginAttempt.count({
      where: {
        OR: [
          { identifier },
          { ipAddress: ip }
        ],
        success: false,
        timestamp: {
          gte: new Date(Date.now() - 600000) // Last 10 minutes
        }
      }
    })
    
    const detected = recentAttempts >= 5
    const shouldBlock = recentAttempts >= 10
    
    const severity = shouldBlock
      ? ThreatSeverity.CRITICAL
      : detected
        ? ThreatSeverity.HIGH
        : ThreatSeverity.LOW
    
    if (shouldBlock) {
      this.blockIP(ip, 7200000) // Block for 2 hours
    }
    
    return {
      detected,
      attempts: recentAttempts,
      shouldBlock,
      severity
    }
  }
  
  /**
   * Detect impossible travel (geographic anomaly)
   */
  public detectImpossibleTravel(
    userId: string,
    currentLocation: { lat: number; lng: number; ip: string },
    previousLocation: { lat: number; lng: number; ip: string; timestamp: Date }
  ): {
    detected: boolean
    distance: number
    timeElapsed: number
    impossibleSpeed: number
    severity: ThreatSeverity
  } {
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      previousLocation.lat,
      previousLocation.lng
    )
    
    const timeElapsed = (Date.now() - previousLocation.timestamp.getTime()) / 1000 / 3600 // hours
    const speed = distance / timeElapsed // km/h
    
    // Impossible if speed > 900 km/h (commercial flight speed)
    const detected = speed > 900
    
    const severity = detected
      ? speed > 2000
        ? ThreatSeverity.CRITICAL
        : ThreatSeverity.HIGH
      : ThreatSeverity.LOW
    
    return {
      detected,
      distance,
      timeElapsed: timeElapsed * 3600, // Return in seconds
      impossibleSpeed: speed,
      severity
    }
  }
  
  /**
   * Analyze user behavior for anomalies
   */
  public async analyzeUserBehavior(
    userId: string,
    currentRequest: {
      ip: string
      userAgent: string
      endpoint: string
      timestamp: Date
    }
  ): Promise<{
    isAnomalous: boolean
    anomalies: string[]
    suspiciousScore: number
    recommendation: 'allow' | 'challenge' | 'block'
  }> {
    const behavior = await this.getUserBehavior(userId)
    const anomalies: string[] = []
    let suspiciousScore = behavior.suspiciousScore
    
    // Check request rate anomaly
    const timeSinceLastActivity = currentRequest.timestamp.getTime() - behavior.lastActivity.getTime()
    const requestRate = 60000 / timeSinceLastActivity // requests per minute
    
    if (requestRate > behavior.normalRequestRate * 3) {
      anomalies.push('Abnormal request rate')
      suspiciousScore += 20
    }
    
    // Check new user agent
    if (!behavior.normalUserAgents.includes(currentRequest.userAgent)) {
      anomalies.push('New device/browser')
      suspiciousScore += 10
    }
    
    // Check unusual endpoint access
    if (!behavior.normalEndpoints.includes(currentRequest.endpoint)) {
      if (currentRequest.endpoint.includes('admin') || 
          currentRequest.endpoint.includes('api/security')) {
        anomalies.push('Accessing sensitive endpoint')
        suspiciousScore += 30
      }
    }
    
    // Update behavior
    behavior.lastActivity = currentRequest.timestamp
    behavior.suspiciousScore = Math.max(0, suspiciousScore - 1) // Decay over time
    userBehaviorCache.set(userId, behavior)
    
    // Determine recommendation
    let recommendation: 'allow' | 'challenge' | 'block' = 'allow'
    if (suspiciousScore >= 80) recommendation = 'block'
    else if (suspiciousScore >= 50) recommendation = 'challenge'
    
    return {
      isAnomalous: anomalies.length > 0,
      anomalies,
      suspiciousScore,
      recommendation
    }
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private decodeInput(input: string): string {
    try {
      // Try multiple decoding methods
      let decoded = input
      
      // URL decode
      decoded = decodeURIComponent(decoded)
      
      // HTML entity decode
      decoded = decoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&')
      
      // Base64 decode if applicable
      if (/^[A-Za-z0-9+/]+=*$/.test(decoded)) {
        try {
          decoded = Buffer.from(decoded, 'base64').toString()
        } catch {}
      }
      
      return decoded
    } catch {
      return input
    }
  }
  
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  private calculateSeverity(confidence: number): ThreatSeverity {
    if (confidence >= 90) return ThreatSeverity.CRITICAL
    if (confidence >= 70) return ThreatSeverity.HIGH
    if (confidence >= 40) return ThreatSeverity.MEDIUM
    return ThreatSeverity.LOW
  }
  
  private getDDoSThreshold(endpoint: string): number {
    // Different thresholds for different endpoints
    if (endpoint.includes('/api/auth')) return 10      // Strict for auth
    if (endpoint.includes('/api/v3')) return 60        // Normal API
    if (endpoint.includes('/public')) return 100       // Relaxed for public
    return 30 // Default
  }
  
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    if (userBehaviorCache.has(userId)) {
      return userBehaviorCache.get(userId)!
    }
    
    // Initialize with defaults
    const behavior: UserBehavior = {
      userId,
      normalRequestRate: 10,
      normalLocations: [],
      normalUserAgents: [],
      normalEndpoints: [],
      lastActivity: new Date(),
      suspiciousScore: 0
    }
    
    userBehaviorCache.set(userId, behavior)
    return behavior
  }
  
  private blockIP(ip: string, durationMs: number): void {
    this.blockedIPs.add(ip)
    
    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(ip)
    }, durationMs)
  }
  
  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }
  
  private async loadBlockedIPs(): Promise<void> {
    try {
      const threats = await prisma.threat.findMany({
        where: {
          status: ThreatStatus.BLOCKED,
          blockedUntil: {
            gt: new Date()
          }
        },
        select: {
          sourceIp: true
        }
      })
      
      threats.forEach(threat => {
        this.blockedIPs.add(threat.sourceIp)
      })
    } catch (error) {
      console.error('Failed to load blocked IPs:', error)
    }
  }
  
  private async logThreat(
    type: AttackType,
    confidence: number,
    payload: string
  ): Promise<void> {
    try {
      await prisma.threat.create({
        data: {
          id: crypto.randomUUID(),
          updatedAt: new Date(),
          type,
          severity: this.calculateSeverity(confidence),
          status: ThreatStatus.DETECTED,
          sourceIp: '0.0.0.0', // Should be passed from request
          method: 'PATTERN_MATCH',
          target: 'API',
          payload: payload.substring(0, 500), // Truncate for safety
          attempts: 1,
          detectionMethod: 'signature',
          confidence,
          automated: true,
          firstSeen: new Date(),
          lastSeen: new Date()
        } as any
      })
    } catch (error) {
      console.error('Failed to log threat:', error)
    }
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Comprehensive security check for incoming requests
   */
  public async checkRequest(request: {
    ip: string
    userAgent: string
    endpoint: string
    method: string
    body?: any
    query?: any
    headers?: any
    userId?: string
  }): Promise<{
    allowed: boolean
    threats: any[]
    action: 'allow' | 'challenge' | 'block'
    reason?: string
  }> {
    const threats: any[] = []
    
    // 1. Check if IP is blocked
    if (this.isIPBlocked(request.ip)) {
      return {
        allowed: false,
        threats: [{ type: 'BLOCKED_IP', severity: ThreatSeverity.CRITICAL }],
        action: 'block',
        reason: 'IP address is blocked'
      }
    }
    
    // 2. Check for DDoS
    const ddosCheck = this.detectDDoS(request.ip, request.endpoint)
    if (ddosCheck.detected) {
      threats.push({
        type: AttackType.DDOS,
        severity: ddosCheck.severity,
        details: `${ddosCheck.requestCount} requests in window`
      })
    }
    
    // 3. Check for SQL injection in body and query
    const inputs = [
      ...(request.body ? Object.values(request.body) : []),
      ...(request.query ? Object.values(request.query) : [])
    ]
    
    for (const input of inputs) {
      if (typeof input === 'string') {
        const sqlCheck = this.detectSQLInjection(input)
        if (sqlCheck.detected) {
          threats.push({
            type: AttackType.SQL_INJECTION,
            severity: this.calculateSeverity(sqlCheck.confidence),
            confidence: sqlCheck.confidence
          })
        }
        
        const xssCheck = this.detectXSS(input)
        if (xssCheck.detected) {
          threats.push({
            type: AttackType.XSS,
            severity: this.calculateSeverity(xssCheck.confidence),
            confidence: xssCheck.confidence
          })
        }
      }
    }
    
    // 4. Check user behavior if authenticated
    if (request.userId) {
      const behaviorCheck = await this.analyzeUserBehavior(request.userId, {
        ip: request.ip,
        userAgent: request.userAgent,
        endpoint: request.endpoint,
        timestamp: new Date()
      })
      
      if (behaviorCheck.isAnomalous) {
        threats.push({
          type: 'ANOMALOUS_BEHAVIOR',
          severity: behaviorCheck.suspiciousScore >= 50 ? ThreatSeverity.HIGH : ThreatSeverity.MEDIUM,
          anomalies: behaviorCheck.anomalies,
          score: behaviorCheck.suspiciousScore
        })
      }
    }
    
    // Determine action based on threats
    let action: 'allow' | 'challenge' | 'block' = 'allow'
    let reason: string | undefined
    
    if (threats.length > 0) {
      const criticalThreats = threats.filter(t => t.severity === ThreatSeverity.CRITICAL)
      const highThreats = threats.filter(t => t.severity === ThreatSeverity.HIGH)
      
      if (criticalThreats.length > 0) {
        action = 'block'
        reason = `Critical threat detected: ${criticalThreats[0].type}`
      } else if (highThreats.length > 0) {
        action = 'challenge'
        reason = `High severity threat detected: ${highThreats[0].type}`
      }
    }
    
    return {
      allowed: action !== 'block',
      threats,
      action,
      reason
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AnomalyDetector