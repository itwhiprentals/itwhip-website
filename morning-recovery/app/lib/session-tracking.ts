// app/lib/session-tracking.ts

import { v4 as uuidv4 } from 'uuid'

interface FieldInteraction {
  fieldName: string
  focusTime: number
  blurTime: number
  changeCount: number
  timeSpent: number
  copyPasteDetected: boolean
  value?: string
}

interface PageView {
  url: string
  timestamp: number
  timeOnPage?: number
}

interface SessionData {
  sessionId: string
  startTime: number
  endTime?: number
  duration?: number
  pageViews: PageView[]
  fieldInteractions: Map<string, FieldInteraction>
  mouseEvents: number
  keyboardEvents: number
  scrollEvents: number
  clickEvents: number
  copyPasteEvents: number
  maxScrollDepth: number
  abandoned: boolean
  completedBooking: boolean
  validationErrors: number
  formSubmitAttempts: number
}

class BookingSessionTracker {
  private session: SessionData
  private currentPage: PageView | null = null
  private eventListeners: Array<{ element: Element | Window; event: string; handler: EventListener }> = []
  private scrollCheckInterval: NodeJS.Timeout | null = null
  private fieldFocusTime: Map<string, number> = new Map()
  private lastActivity: number = Date.now()
  private inactivityTimeout: NodeJS.Timeout | null = null

  constructor() {
    // Generate unique session ID or retrieve existing one
    const existingSessionId = this.getSessionStorage('booking_session_id')
    const sessionId = existingSessionId || uuidv4()
    
    if (!existingSessionId) {
      this.setSessionStorage('booking_session_id', sessionId)
    }

    this.session = {
      sessionId,
      startTime: Date.now(),
      pageViews: [],
      fieldInteractions: new Map(),
      mouseEvents: 0,
      keyboardEvents: 0,
      scrollEvents: 0,
      clickEvents: 0,
      copyPasteEvents: 0,
      maxScrollDepth: 0,
      abandoned: true,
      completedBooking: false,
      validationErrors: 0,
      formSubmitAttempts: 0
    }

    this.initializeTracking()
  }

  private getSessionStorage(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  private setSessionStorage(key: string, value: string): void {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      // SessionStorage not available
    }
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return

    // Track page view
    this.trackPageView(window.location.href)

    // Global event listeners
    this.addEventListener(window, 'mousemove', this.throttle(() => {
      this.session.mouseEvents++
      this.updateActivity()
    }, 500))

    this.addEventListener(window, 'keydown', () => {
      this.session.keyboardEvents++
      this.updateActivity()
    })

    this.addEventListener(window, 'scroll', this.throttle(() => {
      this.session.scrollEvents++
      this.updateScrollDepth()
      this.updateActivity()
    }, 500))

    this.addEventListener(window, 'click', (e) => {
      this.session.clickEvents++
      this.updateActivity()
    })

    // Copy/Paste detection
    this.addEventListener(document, 'copy', () => {
      this.session.copyPasteEvents++
    })

    this.addEventListener(document, 'paste', (e) => {
      this.session.copyPasteEvents++
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const fieldName = target.getAttribute('name') || target.getAttribute('id') || 'unknown'
        const interaction = this.session.fieldInteractions.get(fieldName)
        if (interaction) {
          interaction.copyPasteDetected = true
        }
      }
    })

    // Detect form validation errors
    this.addEventListener(document, 'invalid', () => {
      this.session.validationErrors++
    }, true)

    // Track form submit attempts
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      this.addEventListener(form, 'submit', () => {
        this.session.formSubmitAttempts++
      })
    })

    // Check for inactivity
    this.startInactivityTimer()

    // Track scroll depth periodically
    this.scrollCheckInterval = setInterval(() => {
      this.updateScrollDepth()
    }, 1000)

    // Cleanup on page unload
    this.addEventListener(window, 'beforeunload', () => {
      this.endSession()
    })
  }

  private addEventListener(element: Element | Window | Document, event: string, handler: EventListener, useCapture = false): void {
    element.addEventListener(event, handler, useCapture)
    this.eventListeners.push({ element, event, handler })
  }

  private throttle(func: Function, wait: number): EventListener {
    let timeout: NodeJS.Timeout | null = null
    let lastCall = 0
    
    return ((event: Event) => {
      const now = Date.now()
      const remaining = wait - (now - lastCall)
      
      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        lastCall = now
        func(event)
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastCall = Date.now()
          timeout = null
          func(event)
        }, remaining)
      }
    }) as EventListener
  }

  private updateActivity(): void {
    this.lastActivity = Date.now()
    this.startInactivityTimer()
  }

  private startInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout)
    }
    
    // Mark as abandoned if no activity for 5 minutes
    this.inactivityTimeout = setTimeout(() => {
      this.session.abandoned = true
      this.endSession()
    }, 5 * 60 * 1000)
  }

  private updateScrollDepth(): void {
    if (typeof window === 'undefined') return
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrolled = window.scrollY
    const scrollPercentage = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0
    
    this.session.maxScrollDepth = Math.max(this.session.maxScrollDepth, scrollPercentage)
  }

  public trackPageView(url: string): void {
    // End timing for previous page
    if (this.currentPage) {
      this.currentPage.timeOnPage = Date.now() - this.currentPage.timestamp
    }

    // Start timing for new page
    this.currentPage = {
      url,
      timestamp: Date.now()
    }
    
    this.session.pageViews.push(this.currentPage)
  }

  public trackFieldInteraction(fieldName: string, element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void {
    if (!this.session.fieldInteractions.has(fieldName)) {
      this.session.fieldInteractions.set(fieldName, {
        fieldName,
        focusTime: 0,
        blurTime: 0,
        changeCount: 0,
        timeSpent: 0,
        copyPasteDetected: false
      })
    }

    const interaction = this.session.fieldInteractions.get(fieldName)!

    // Focus event
    element.addEventListener('focus', () => {
      interaction.focusTime = Date.now()
      this.fieldFocusTime.set(fieldName, Date.now())
      this.updateActivity()
    })

    // Blur event
    element.addEventListener('blur', () => {
      interaction.blurTime = Date.now()
      const focusTime = this.fieldFocusTime.get(fieldName)
      if (focusTime) {
        interaction.timeSpent += Date.now() - focusTime
        this.fieldFocusTime.delete(fieldName)
      }
      this.updateActivity()
    })

    // Change event
    element.addEventListener('input', () => {
      interaction.changeCount++
      this.updateActivity()
    })

    // Store final value (for non-sensitive fields)
    if (!['password', 'card', 'cvv', 'ssn'].some(term => fieldName.toLowerCase().includes(term))) {
      element.addEventListener('change', () => {
        interaction.value = element.value.substring(0, 50) // Store first 50 chars only
      })
    }
  }

  public trackFormFields(): void {
    if (typeof document === 'undefined') return

    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach((element) => {
      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      const fieldName = input.name || input.id || `field_${Array.from(inputs).indexOf(input)}`
      this.trackFieldInteraction(fieldName, input)
    })
  }

  public markBookingCompleted(): void {
    this.session.completedBooking = true
    this.session.abandoned = false
    this.endSession()
  }

  public getSessionData(): SessionData {
    // Calculate final duration
    this.session.duration = Date.now() - this.session.startTime
    this.session.endTime = Date.now()
    
    // Finalize current page timing
    if (this.currentPage) {
      this.currentPage.timeOnPage = Date.now() - this.currentPage.timestamp
    }

    return {
      ...this.session,
      fieldInteractions: this.session.fieldInteractions // Map will be converted to JSON
    }
  }

  public getSessionSummary(): object {
    const data = this.getSessionData()
    
    // Convert Map to object for JSON serialization
    const fieldInteractionsObj: { [key: string]: FieldInteraction } = {}
    data.fieldInteractions.forEach((value, key) => {
      fieldInteractionsObj[key] = value
    })

    return {
      sessionId: data.sessionId,
      duration: data.duration,
      pageViewCount: data.pageViews.length,
      fieldInteractionCount: data.fieldInteractions.size,
      totalInteractions: data.mouseEvents + data.keyboardEvents + data.clickEvents,
      copyPasteUsed: data.copyPasteEvents > 0,
      maxScrollDepth: Math.round(data.maxScrollDepth),
      abandoned: data.abandoned,
      completedBooking: data.completedBooking,
      validationErrors: data.validationErrors,
      formSubmitAttempts: data.formSubmitAttempts,
      fieldTimings: fieldInteractionsObj,
      suspiciousActivity: this.detectSuspiciousActivity(data)
    }
  }

  private detectSuspiciousActivity(data: SessionData): string[] {
    const flags: string[] = []

    // Very short session (under 30 seconds)
    if (data.duration && data.duration < 30000) {
      flags.push('very_short_session')
    }

    // No mouse movement
    if (data.mouseEvents === 0) {
      flags.push('no_mouse_movement')
    }

    // Excessive copy/paste
    if (data.copyPasteEvents > 5) {
      flags.push('excessive_copy_paste')
    }

    // No scrolling on long page
    if (data.maxScrollDepth === 0 && data.duration && data.duration > 10000) {
      flags.push('no_scrolling')
    }

    // Too many validation errors
    if (data.validationErrors > 10) {
      flags.push('excessive_validation_errors')
    }

    // Instant form completion (all fields filled in under 5 seconds)
    let totalFieldTime = 0
    data.fieldInteractions.forEach(interaction => {
      totalFieldTime += interaction.timeSpent
    })
    if (data.fieldInteractions.size > 5 && totalFieldTime < 5000) {
      flags.push('instant_form_completion')
    }

    // No keyboard events despite form interactions
    if (data.fieldInteractions.size > 0 && data.keyboardEvents === 0) {
      flags.push('no_keyboard_with_form')
    }

    return flags
  }

  private endSession(): void {
    // Clean up event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    this.eventListeners = []

    // Clear intervals
    if (this.scrollCheckInterval) {
      clearInterval(this.scrollCheckInterval)
    }
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout)
    }

    // Clear session storage
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem('booking_session_id')
      } catch {
        // SessionStorage not available
      }
    }
  }

  public destroy(): void {
    this.endSession()
  }
}

// Export singleton instance
let trackerInstance: BookingSessionTracker | null = null

export function initializeSessionTracking(): BookingSessionTracker {
  if (!trackerInstance && typeof window !== 'undefined') {
    trackerInstance = new BookingSessionTracker()
  }
  return trackerInstance!
}

export function getSessionTracker(): BookingSessionTracker | null {
  return trackerInstance
}

export function endSessionTracking(): void {
  if (trackerInstance) {
    trackerInstance.destroy()
    trackerInstance = null
  }
}