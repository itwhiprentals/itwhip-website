/**
 * Metrics Collection System for ItWhip Platform
 * Tracks performance metrics, counters, and gauges for monitoring
 */

import { EventEmitter } from 'events'
import { logger } from './logger'

// Metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

// Metric units
export enum MetricUnit {
  MILLISECONDS = 'ms',
  SECONDS = 's',
  BYTES = 'bytes',
  KILOBYTES = 'kb',
  MEGABYTES = 'mb',
  COUNT = 'count',
  PERCENT = 'percent',
  REQUESTS = 'requests',
  ERRORS = 'errors'
}

// Metric data point
interface MetricPoint {
  name: string
  type: MetricType
  value: number
  unit: MetricUnit
  tags: Record<string, string>
  timestamp: number
}

// Histogram buckets for response times (in ms)
const RESPONSE_TIME_BUCKETS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]

// Histogram buckets for payload sizes (in bytes)
const PAYLOAD_SIZE_BUCKETS = [100, 1000, 10000, 100000, 1000000, 10000000]

/**
 * Metrics store for in-memory aggregation
 */
class MetricsStore {
  private counters = new Map<string, number>()
  private gauges = new Map<string, number>()
  private histograms = new Map<string, number[]>()
  private summaries = new Map<string, { sum: number; count: number; min: number; max: number }>()
  private tags = new Map<string, Record<string, string>>()
  
  /**
   * Increment a counter
   */
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
    
    if (tags) {
      this.tags.set(key, tags)
    }
  }
  
  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    this.gauges.set(key, value)
    
    if (tags) {
      this.tags.set(key, tags)
    }
  }
  
  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    const values = this.histograms.get(key) || []
    values.push(value)
    
    // Keep only last 10000 values to prevent memory issues
    if (values.length > 10000) {
      values.shift()
    }
    
    this.histograms.set(key, values)
    
    if (tags) {
      this.tags.set(key, tags)
    }
  }
  
  /**
   * Update a summary
   */
  updateSummary(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags)
    const current = this.summaries.get(key) || {
      sum: 0,
      count: 0,
      min: Infinity,
      max: -Infinity
    }
    
    current.sum += value
    current.count++
    current.min = Math.min(current.min, value)
    current.max = Math.max(current.max, value)
    
    this.summaries.set(key, current)
    
    if (tags) {
      this.tags.set(key, tags)
    }
  }
  
  /**
   * Get all metrics
   */
  getMetrics(): {
    counters: Array<{ name: string; value: number; tags?: Record<string, string> }>
    gauges: Array<{ name: string; value: number; tags?: Record<string, string> }>
    histograms: Array<{ name: string; values: number[]; stats: any; tags?: Record<string, string> }>
    summaries: Array<{ name: string; stats: any; tags?: Record<string, string> }>
  } {
    const metrics = {
      counters: [] as any[],
      gauges: [] as any[],
      histograms: [] as any[],
      summaries: [] as any[]
    }
    
    // Export counters
    for (const [key, value] of this.counters.entries()) {
      metrics.counters.push({
        name: this.getNameFromKey(key),
        value,
        tags: this.tags.get(key)
      })
    }
    
    // Export gauges
    for (const [key, value] of this.gauges.entries()) {
      metrics.gauges.push({
        name: this.getNameFromKey(key),
        value,
        tags: this.tags.get(key)
      })
    }
    
    // Export histograms with statistics
    for (const [key, values] of this.histograms.entries()) {
      metrics.histograms.push({
        name: this.getNameFromKey(key),
        values,
        stats: this.calculateHistogramStats(values),
        tags: this.tags.get(key)
      })
    }
    
    // Export summaries
    for (const [key, stats] of this.summaries.entries()) {
      metrics.summaries.push({
        name: this.getNameFromKey(key),
        stats: {
          ...stats,
          avg: stats.count > 0 ? stats.sum / stats.count : 0
        },
        tags: this.tags.get(key)
      })
    }
    
    return metrics
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
    this.summaries.clear()
    this.tags.clear()
  }
  
  /**
   * Get key for metric with tags
   */
  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name
    }
    
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    
    return `${name}{${tagStr}}`
  }
  
  /**
   * Extract name from key
   */
  private getNameFromKey(key: string): string {
    const index = key.indexOf('{')
    return index > 0 ? key.substring(0, index) : key
  }
  
  /**
   * Calculate histogram statistics
   */
  private calculateHistogramStats(values: number[]): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
    buckets: Record<string, number>
  } {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        buckets: {}
      }
    }
    
    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)
    
    // Calculate percentiles
    const p50Index = Math.floor(sorted.length * 0.5)
    const p95Index = Math.floor(sorted.length * 0.95)
    const p99Index = Math.floor(sorted.length * 0.99)
    
    // Calculate bucket distribution
    const buckets: Record<string, number> = {}
    for (const bucket of RESPONSE_TIME_BUCKETS) {
      buckets[`le_${bucket}`] = values.filter(v => v <= bucket).length
    }
    buckets['le_inf'] = values.length
    
    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[p50Index],
      p95: sorted[p95Index] || sorted[sorted.length - 1],
      p99: sorted[p99Index] || sorted[sorted.length - 1],
      buckets
    }
  }
}

/**
 * Metrics collector with event emitter for real-time updates
 */
class MetricsCollector extends EventEmitter {
  private store = new MetricsStore()
  private flushInterval: NodeJS.Timeout | null = null
  private customMetrics = new Map<string, (timestamp: number) => Promise<number>>()
  
  constructor() {
    super()
    this.startFlushInterval()
  }
  
  /**
   * Start periodic flush of metrics
   */
  private startFlushInterval(): void {
    const interval = parseInt(process.env.METRICS_FLUSH_INTERVAL || '60000')
    
    this.flushInterval = setInterval(() => {
      this.flush()
    }, interval)
  }
  
  /**
   * Stop flush interval
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }
  
  /**
   * Register a custom metric collector
   */
  registerCustomMetric(
    name: string,
    collector: (timestamp: number) => Promise<number>
  ): void {
    this.customMetrics.set(name, collector)
  }
  
  /**
   * Collect custom metrics
   */
  private async collectCustomMetrics(): Promise<void> {
    const timestamp = Date.now()
    
    for (const [name, collector] of this.customMetrics.entries()) {
      try {
        const value = await collector(timestamp)
        this.store.setGauge(name, value)
      } catch (error) {
        logger.error(`Failed to collect custom metric: ${name}`, { error })
      }
    }
  }
  
  /**
   * Track a counter metric
   */
  incrementCounter(
    name: string,
    tags?: Record<string, string>,
    value: number = 1
  ): void {
    this.store.incrementCounter(name, value, tags)
    
    this.emit('metric', {
      type: MetricType.COUNTER,
      name,
      value,
      tags,
      timestamp: Date.now()
    })
  }
  
  /**
   * Track a gauge metric
   */
  setGauge(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.store.setGauge(name, value, tags)
    
    this.emit('metric', {
      type: MetricType.GAUGE,
      name,
      value,
      tags,
      timestamp: Date.now()
    })
  }
  
  /**
   * Track a histogram metric
   */
  recordHistogram(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.store.recordHistogram(name, value, tags)
    
    this.emit('metric', {
      type: MetricType.HISTOGRAM,
      name,
      value,
      tags,
      timestamp: Date.now()
    })
  }
  
  /**
   * Track a timing metric
   */
  trackTiming(
    name: string,
    duration: number,
    tags?: Record<string, string>
  ): void {
    this.recordHistogram(`${name}.duration`, duration, tags)
  }
  
  /**
   * Track an API metric
   */
  trackApiMetric(metric: {
    endpoint: string
    method: string
    statusCode: number
    responseTime: number
    error?: boolean
  }): void {
    const tags = {
      endpoint: metric.endpoint,
      method: metric.method,
      status: metric.statusCode.toString(),
      status_class: `${Math.floor(metric.statusCode / 100)}xx`
    }
    
    // Track request count
    this.incrementCounter('api.requests.total', tags)
    
    // Track errors
    if (metric.error || metric.statusCode >= 400) {
      this.incrementCounter('api.requests.errors', tags)
    }
    
    // Track response time
    this.recordHistogram('api.response_time', metric.responseTime, tags)
    
    // Track by status code
    this.incrementCounter(`api.status_codes.${metric.statusCode}`, { 
      endpoint: metric.endpoint 
    })
  }
  
  /**
   * Track a database metric
   */
  trackDatabaseMetric(metric: {
    operation: string
    model: string
    duration: number
    error?: boolean
  }): void {
    const tags = {
      operation: metric.operation,
      model: metric.model
    }
    
    // Track query count
    this.incrementCounter('db.queries.total', tags)
    
    // Track errors
    if (metric.error) {
      this.incrementCounter('db.queries.errors', tags)
    }
    
    // Track duration
    this.recordHistogram('db.query_duration', metric.duration, tags)
    
    // Track slow queries
    if (metric.duration > 1000) {
      this.incrementCounter('db.slow_queries', tags)
    }
  }
  
  /**
   * Track a cache metric
   */
  trackCacheMetric(metric: {
    operation: 'get' | 'set' | 'delete'
    hit?: boolean
    duration: number
    key?: string
  }): void {
    const tags = {
      operation: metric.operation
    }
    
    // Track operation count
    this.incrementCounter('cache.operations.total', tags)
    
    // Track hits/misses for get operations
    if (metric.operation === 'get') {
      if (metric.hit) {
        this.incrementCounter('cache.hits', tags)
      } else {
        this.incrementCounter('cache.misses', tags)
      }
    }
    
    // Track duration
    this.recordHistogram('cache.operation_duration', metric.duration, tags)
  }
  
  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: {
    type: 'booking' | 'ride' | 'revenue' | 'user'
    action: string
    value?: number
    tags?: Record<string, string>
  }): void {
    const tags = {
      type: metric.type,
      action: metric.action,
      ...metric.tags
    }
    
    const metricName = `business.${metric.type}.${metric.action}`
    
    if (metric.value !== undefined) {
      this.recordHistogram(metricName, metric.value, tags)
    } else {
      this.incrementCounter(metricName, tags)
    }
  }
  
  /**
   * Get current metrics
   */
  getMetrics(): any {
    return this.store.getMetrics()
  }
  
  /**
   * Flush metrics to external system
   */
  async flush(): Promise<void> {
    try {
      // Collect custom metrics
      await this.collectCustomMetrics()
      
      // Get all metrics
      const metrics = this.getMetrics()
      
      // Emit flush event
      this.emit('flush', metrics)
      
      // Log summary
      logger.debug('Metrics flushed', {
        counters: metrics.counters.length,
        gauges: metrics.gauges.length,
        histograms: metrics.histograms.length,
        summaries: metrics.summaries.length
      })
      
      // Send to external monitoring service (DataDog, Prometheus, etc.)
      if (process.env.METRICS_ENDPOINT) {
        await this.sendToExternalService(metrics)
      }
      
    } catch (error) {
      logger.error('Failed to flush metrics', { error })
    }
  }
  
  /**
   * Send metrics to external service
   */
  private async sendToExternalService(metrics: any): Promise<void> {
    // Implementation depends on your monitoring service
    // This is a placeholder for DataDog, Prometheus, CloudWatch, etc.
    
    if (process.env.DATADOG_API_KEY) {
      // Send to DataDog
    } else if (process.env.PROMETHEUS_PUSHGATEWAY) {
      // Send to Prometheus
    } else if (process.env.CLOUDWATCH_NAMESPACE) {
      // Send to CloudWatch
    }
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.store.reset()
  }
  
  /**
   * Create a timer for measuring operations
   */
  startTimer(name: string, tags?: Record<string, string>): () => void {
    const startTime = Date.now()
    
    return () => {
      const duration = Date.now() - startTime
      this.trackTiming(name, duration, tags)
    }
  }
}

// System metrics collector
class SystemMetrics {
  /**
   * Collect memory metrics
   */
  static getMemoryMetrics(): {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  } {
    const mem = process.memoryUsage()
    
    return {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024), // MB
      external: Math.round(mem.external / 1024 / 1024), // MB
      rss: Math.round(mem.rss / 1024 / 1024) // MB
    }
  }
  
  /**
   * Collect CPU metrics
   */
  static getCpuMetrics(): {
    user: number
    system: number
  } {
    const usage = process.cpuUsage()
    
    return {
      user: Math.round(usage.user / 1000), // ms
      system: Math.round(usage.system / 1000) // ms
    }
  }
  
  /**
   * Collect event loop lag
   */
  static async getEventLoopLag(): Promise<number> {
    const start = Date.now()
    
    return new Promise(resolve => {
      setImmediate(() => {
        resolve(Date.now() - start)
      })
    })
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector()

// Register system metrics collectors
metricsCollector.registerCustomMetric('system.memory.heap_used', async () => {
  return SystemMetrics.getMemoryMetrics().heapUsed
})

metricsCollector.registerCustomMetric('system.memory.rss', async () => {
  return SystemMetrics.getMemoryMetrics().rss
})

metricsCollector.registerCustomMetric('system.event_loop.lag', async () => {
  return await SystemMetrics.getEventLoopLag()
})

// Export functions for ease of use
export function incrementCounter(
  name: string,
  tags?: Record<string, string>,
  value: number = 1
): void {
  metricsCollector.incrementCounter(name, tags, value)
}

export function setGauge(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  metricsCollector.setGauge(name, value, tags)
}

export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  metricsCollector.recordHistogram(name, value, tags)
}

export function trackTiming(
  name: string,
  duration: number,
  tags?: Record<string, string>
): void {
  metricsCollector.trackTiming(name, duration, tags)
}

export function startTimer(
  name: string,
  tags?: Record<string, string>
): () => void {
  return metricsCollector.startTimer(name, tags)
}

// Export without MetricType and MetricUnit since they're already exported at the top
export { metricsCollector, MetricsCollector, SystemMetrics }

export default metricsCollector