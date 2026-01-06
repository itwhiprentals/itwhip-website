/**
 * Logging System for ItWhip Platform
 * Structured logging with Winston for production-ready log management
 */

import winston from 'winston'
import { createHash } from 'crypto'

// Log levels
const LOG_LEVELS = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
    trace: 'gray'
  }
}

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'
const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /authorization/i,
  /cookie/i,
  /credit/i,
  /card/i,
  /cvv/i,
  /ssn/i,
  /pin/i
]

// Fields to always redact
const REDACT_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'pin',
  'authorization'
]

/**
 * Redact sensitive information from logs
 */
function redactSensitiveData(obj: any, depth = 0): any {
  if (depth > 10) return '[Max depth reached]'
  
  if (typeof obj === 'string') {
    // Check if it looks like a token or key
    if (obj.length > 20 && /^[A-Za-z0-9_\-]+$/.test(obj)) {
      return obj.substring(0, 6) + '...[REDACTED]'
    }
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item, depth + 1))
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const redacted: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if key should be redacted
      const shouldRedact = REDACT_FIELDS.includes(key) || 
        SENSITIVE_PATTERNS.some(pattern => pattern.test(key))
      
      if (shouldRedact) {
        redacted[key] = '[REDACTED]'
      } else if (typeof value === 'object') {
        redacted[key] = redactSensitiveData(value, depth + 1)
      } else {
        redacted[key] = value
      }
    }
    
    return redacted
  }
  
  return obj
}

/**
 * Format error objects for logging
 */
function formatError(error: Error): object {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack?.split('\n').slice(0, 10).join('\n'), // Limit stack trace
    ...(error as any) // Include any custom properties
  }
}

/**
 * Custom format for console output
 */
const consoleFormat = winston.format.printf(({ 
  timestamp, 
  level, 
  message, 
  requestId,
  userId,
  ...metadata 
}) => {
  let msg = `${timestamp} [${level.toUpperCase()}]`
  
  if (requestId) msg += ` [${requestId}]`
  if (userId) msg += ` [User:${userId}]`
  
  msg += ` ${message}`
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`
  }
  
  return msg
})

/**
 * Create Winston logger instance
 */
const createLogger = () => {
  const logger = winston.createLogger({
    levels: LOG_LEVELS.levels,
    level: LOG_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: {
      service: 'itwhip-api',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '3.2.1'
    },
    transports: []
  })
  
  // Console transport for development
  if (isDevelopment) {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
        consoleFormat
      )
    }))
  }
  
  // Console transport for production (JSON format)
  if (isProduction) {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }))
  }
  
  // File transport for errors
  if (process.env.LOG_TO_FILE === 'true') {
    logger.add(new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }))
    
    // File transport for all logs
    logger.add(new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    }))
  }
  
  return logger
}

// Create the logger instance
const winstonLogger = createLogger()

/**
 * Logger wrapper with additional features
 */
class Logger {
  private context: Record<string, any> = {}
  
  /**
   * Set context that will be included in all logs
   */
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context }
  }
  
  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {}
  }
  
  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger()
    childLogger.context = { ...this.context, ...context }
    return childLogger
  }
  
  /**
   * Log with redaction and context
   */
  private log(level: string, message: string, meta?: any): void {
    const metadata = {
      ...this.context,
      ...meta,
      timestamp: new Date().toISOString()
    }
    
    // Redact sensitive data
    const redactedMeta = redactSensitiveData(metadata)
    
    // Add correlation ID if available
    if (metadata.requestId) {
      redactedMeta.correlationId = createHash('sha256')
        .update(metadata.requestId)
        .digest('hex')
        .substring(0, 16)
    }
    
    // Log based on level
    winstonLogger.log(level, message, redactedMeta)
  }
  
  /**
   * Log levels
   */
  error(message: string, meta?: any): void {
    // Format error objects
    if (meta?.error instanceof Error) {
      meta.error = formatError(meta.error)
    }
    
    this.log('error', message, meta)
    
    // Track error metrics
    if (meta?.error) {
      this.trackErrorMetric(meta.error)
    }
  }
  
  warn(message: string, meta?: any): void {
    this.log('warn', message, meta)
  }
  
  info(message: string, meta?: any): void {
    this.log('info', message, meta)
  }
  
  http(message: string, meta?: any): void {
    this.log('http', message, meta)
  }
  
  debug(message: string, meta?: any): void {
    this.log('debug', message, meta)
  }
  
  trace(message: string, meta?: any): void {
    this.log('trace', message, meta)
  }
  
  /**
   * Track error metrics
   */
  private trackErrorMetric(error: any): void {
    // In production, send to error tracking service
    if (isProduction && process.env.SENTRY_DSN) {
      // Sentry integration would go here
    }
  }
  
  /**
   * Log API request
   */
  logRequest(req: {
    method: string
    path: string
    query?: any
    body?: any
    headers?: any
    ip?: string
    userId?: string
  }): void {
    this.http('API Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userId: req.userId,
      userAgent: req.headers?.['user-agent']
    })
  }
  
  /**
   * Log API response
   */
  logResponse(res: {
    statusCode: number
    responseTime: number
    path: string
    method: string
    error?: any
  }): void {
    const level = res.statusCode >= 500 ? 'error' :
                  res.statusCode >= 400 ? 'warn' : 'info'
    
    this.log(level, 'API Response', {
      statusCode: res.statusCode,
      responseTime: res.responseTime,
      path: res.path,
      method: res.method,
      error: res.error
    })
  }
  
  /**
   * Log database query
   */
  logQuery(query: {
    model: string
    action: string
    args?: any
    duration: number
    error?: any
  }): void {
    const level = query.error ? 'error' : 
                  query.duration > 1000 ? 'warn' : 'debug'
    
    this.log(level, 'Database Query', {
      model: query.model,
      action: query.action,
      args: query.args,
      duration: query.duration,
      slow: query.duration > 1000,
      error: query.error
    })
  }
  
  /**
   * Log security event
   */
  logSecurity(event: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    ip?: string
    userId?: string
    details?: any
  }): void {
    const level = event.severity === 'critical' ? 'error' :
                  event.severity === 'high' ? 'warn' : 'info'
    
    this.log(level, `Security: ${event.message}`, {
      securityEvent: true,
      type: event.type,
      severity: event.severity,
      ip: event.ip,
      userId: event.userId,
      details: event.details
    })
  }
  
  /**
   * Log performance metric
   */
  logPerformance(metric: {
    name: string
    value: number
    unit: string
    tags?: Record<string, string>
  }): void {
    this.debug('Performance Metric', {
      metric: metric.name,
      value: metric.value,
      unit: metric.unit,
      tags: metric.tags
    })
  }
  
  /**
   * Log audit event
   */
  logAudit(event: {
    action: string
    resource: string
    resourceId?: string
    userId?: string
    result: 'success' | 'failure'
    details?: any
  }): void {
    this.info('Audit Event', {
      audit: true,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      userId: event.userId,
      result: event.result,
      details: event.details
    })
  }
  
  /**
   * Measure and log execution time
   */
  async measureTime<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      this.debug(`Operation completed: ${operation}`, {
        operation,
        duration,
        success: true
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.error(`Operation failed: ${operation}`, {
        operation,
        duration,
        success: false,
        error
      })
      
      throw error
    }
  }
  
  /**
   * Create a profiler for measuring multiple steps
   */
  createProfiler(name: string): Profiler {
    return new Profiler(name, this)
  }
}

/**
 * Profiler for measuring execution time of multiple steps
 */
class Profiler {
  private steps: Array<{ name: string; duration: number }> = []
  private currentStep: { name: string; startTime: number } | null = null
  private startTime: number
  
  constructor(
    private name: string,
    private logger: Logger
  ) {
    this.startTime = Date.now()
  }
  
  /**
   * Start measuring a step
   */
  startStep(stepName: string): void {
    if (this.currentStep) {
      this.endStep()
    }
    
    this.currentStep = {
      name: stepName,
      startTime: Date.now()
    }
  }
  
  /**
   * End the current step
   */
  endStep(): void {
    if (!this.currentStep) return
    
    const duration = Date.now() - this.currentStep.startTime
    this.steps.push({
      name: this.currentStep.name,
      duration
    })
    
    this.currentStep = null
  }
  
  /**
   * Finish profiling and log results
   */
  finish(): void {
    if (this.currentStep) {
      this.endStep()
    }
    
    const totalDuration = Date.now() - this.startTime
    
    this.logger.debug(`Profile: ${this.name}`, {
      profile: this.name,
      totalDuration,
      steps: this.steps,
      stepCount: this.steps.length
    })
  }
}

// Export singleton logger instance
export const logger = new Logger()

// Export for testing
export { Logger, Profiler, redactSensitiveData }

export default logger