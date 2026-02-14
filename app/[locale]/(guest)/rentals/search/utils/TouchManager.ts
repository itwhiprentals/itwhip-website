// app/(guest)/rentals/search/utils/TouchManager.ts

export interface TouchState {
    startY: number
    startX: number
    currentY: number
    currentX: number
    startTime: number
    velocityY: number
    velocityX: number
    isDragging: boolean
    isScrolling: boolean
  }
  
  export interface SwipeHandlers {
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onDrag?: (deltaY: number, velocityY: number) => void
    onRelease?: (velocityY: number) => void
  }
  
  export class TouchManager {
    private element: HTMLElement
    private handlers: SwipeHandlers
    private touchState: TouchState
    private rafId: number | null = null
    private lastY: number = 0
    private lastX: number = 0
    private lastTime: number = 0
    
    // Thresholds
    private readonly SWIPE_THRESHOLD = 50
    private readonly VELOCITY_THRESHOLD = 0.3
    private readonly TAP_THRESHOLD = 10
    private readonly TAP_TIME_THRESHOLD = 200
    
    constructor(element: HTMLElement, handlers: SwipeHandlers = {}) {
      this.element = element
      this.handlers = handlers
      this.touchState = this.getInitialState()
      
      this.bindEvents()
    }
    
    private getInitialState(): TouchState {
      return {
        startY: 0,
        startX: 0,
        currentY: 0,
        currentX: 0,
        startTime: 0,
        velocityY: 0,
        velocityX: 0,
        isDragging: false,
        isScrolling: false
      }
    }
    
    private bindEvents() {
      // Touch events
      this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false })
      this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false })
      this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false })
      this.element.addEventListener('touchcancel', this.handleTouchEnd, { passive: false })
      
      // Mouse events for desktop testing
      this.element.addEventListener('mousedown', this.handleMouseDown)
      this.element.addEventListener('mousemove', this.handleMouseMove)
      this.element.addEventListener('mouseup', this.handleMouseUp)
      this.element.addEventListener('mouseleave', this.handleMouseUp)
    }
    
    private handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      this.touchState = {
        ...this.getInitialState(),
        startY: touch.clientY,
        startX: touch.clientX,
        currentY: touch.clientY,
        currentX: touch.clientX,
        startTime: Date.now(),
        isDragging: true
      }
      
      this.lastY = touch.clientY
      this.lastTime = Date.now()
    }
    
    private handleTouchMove = (e: TouchEvent) => {
      if (!this.touchState.isDragging) return
      
      const touch = e.touches[0]
      const currentTime = Date.now()
      const deltaY = touch.clientY - this.touchState.startY
      const deltaX = touch.clientX - this.touchState.startX
      
      // Calculate velocity
      const timeDelta = currentTime - this.lastTime
      if (timeDelta > 0) {
        this.touchState.velocityY = (touch.clientY - this.lastY) / timeDelta
        this.touchState.velocityX = (touch.clientX - this.lastX) / timeDelta
      }
      
      // Determine if scrolling vertically or horizontally
      if (!this.touchState.isScrolling && Math.abs(deltaY) > this.TAP_THRESHOLD) {
        this.touchState.isScrolling = true
        
        // Prevent default if dragging vertically (for bottom sheet)
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          e.preventDefault()
        }
      }
      
      this.touchState.currentY = touch.clientY
      this.touchState.currentX = touch.clientX
      
      // Call drag handler
      if (this.handlers.onDrag && this.touchState.isScrolling) {
        this.handlers.onDrag(deltaY, this.touchState.velocityY)
      }
      
      this.lastY = touch.clientY
      this.lastTime = currentTime
    }
    
    private handleTouchEnd = (e: TouchEvent) => {
      if (!this.touchState.isDragging) return
      
      const deltaY = this.touchState.currentY - this.touchState.startY
      const deltaX = this.touchState.currentX - this.touchState.startX
      const duration = Date.now() - this.touchState.startTime
      
      // Detect swipe gestures
      if (Math.abs(deltaY) > this.SWIPE_THRESHOLD || 
          Math.abs(this.touchState.velocityY) > this.VELOCITY_THRESHOLD) {
        
        if (deltaY < 0 && this.handlers.onSwipeUp) {
          this.handlers.onSwipeUp()
        } else if (deltaY > 0 && this.handlers.onSwipeDown) {
          this.handlers.onSwipeDown()
        }
      }
      
      if (Math.abs(deltaX) > this.SWIPE_THRESHOLD || 
          Math.abs(this.touchState.velocityX) > this.VELOCITY_THRESHOLD) {
        
        if (deltaX < 0 && this.handlers.onSwipeLeft) {
          this.handlers.onSwipeLeft()
        } else if (deltaX > 0 && this.handlers.onSwipeRight) {
          this.handlers.onSwipeRight()
        }
      }
      
      // Call release handler with final velocity
      if (this.handlers.onRelease) {
        this.handlers.onRelease(this.touchState.velocityY)
      }
      
      // Reset state
      this.touchState = this.getInitialState()
    }
    
    // Mouse event handlers for desktop
    private handleMouseDown = (e: MouseEvent) => {
      this.touchState = {
        ...this.getInitialState(),
        startY: e.clientY,
        startX: e.clientX,
        currentY: e.clientY,
        currentX: e.clientX,
        startTime: Date.now(),
        isDragging: true
      }
      
      this.lastY = e.clientY
      this.lastTime = Date.now()
    }
    
    private handleMouseMove = (e: MouseEvent) => {
      if (!this.touchState.isDragging) return
      
      const currentTime = Date.now()
      const deltaY = e.clientY - this.touchState.startY
      
      // Calculate velocity
      const timeDelta = currentTime - this.lastTime
      if (timeDelta > 0) {
        this.touchState.velocityY = (e.clientY - this.lastY) / timeDelta
      }
      
      this.touchState.currentY = e.clientY
      this.touchState.currentX = e.clientX
      
      if (this.handlers.onDrag) {
        this.handlers.onDrag(deltaY, this.touchState.velocityY)
      }
      
      this.lastY = e.clientY
      this.lastTime = currentTime
    }
    
    private handleMouseUp = (e: MouseEvent) => {
      if (!this.touchState.isDragging) return
      
      const deltaY = this.touchState.currentY - this.touchState.startY
      
      if (Math.abs(deltaY) > this.SWIPE_THRESHOLD) {
        if (deltaY < 0 && this.handlers.onSwipeUp) {
          this.handlers.onSwipeUp()
        } else if (deltaY > 0 && this.handlers.onSwipeDown) {
          this.handlers.onSwipeDown()
        }
      }
      
      if (this.handlers.onRelease) {
        this.handlers.onRelease(this.touchState.velocityY)
      }
      
      this.touchState = this.getInitialState()
    }
    
    // Utility methods
    public enableMomentumScroll(element: HTMLElement) {
      let velocity = 0
      let rafId: number | null = null
      
      const decelerate = () => {
        velocity *= 0.95 // Friction
        
        if (Math.abs(velocity) > 0.1) {
          element.scrollTop += velocity * 16 // 60fps timing
          rafId = requestAnimationFrame(decelerate)
        } else {
          velocity = 0
        }
      }
      
      this.handlers.onRelease = (finalVelocity: number) => {
        velocity = finalVelocity * 100 // Scale for scrolling
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(decelerate)
      }
    }
    
    public destroy() {
      this.element.removeEventListener('touchstart', this.handleTouchStart)
      this.element.removeEventListener('touchmove', this.handleTouchMove)
      this.element.removeEventListener('touchend', this.handleTouchEnd)
      this.element.removeEventListener('touchcancel', this.handleTouchEnd)
      this.element.removeEventListener('mousedown', this.handleMouseDown)
      this.element.removeEventListener('mousemove', this.handleMouseMove)
      this.element.removeEventListener('mouseup', this.handleMouseUp)
      this.element.removeEventListener('mouseleave', this.handleMouseUp)
      
      if (this.rafId) cancelAnimationFrame(this.rafId)
    }
  }
  
  // Helper function for bottom sheet behavior
  export function createBottomSheet(
    element: HTMLElement,
    options: {
      snapPoints?: number[]
      defaultPosition?: number
      onPositionChange?: (position: number) => void
    } = {}
  ) {
    const { 
      snapPoints = [0, 0.5, 1], 
      defaultPosition = 0.5,
      onPositionChange 
    } = options
    
    const windowHeight = window.innerHeight
    let currentPosition = defaultPosition
    
    const setPosition = (position: number) => {
      const clampedPosition = Math.max(0, Math.min(1, position))
      const translateY = (1 - clampedPosition) * windowHeight
      
      element.style.transform = `translateY(${translateY}px)`
      element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      
      currentPosition = clampedPosition
      if (onPositionChange) onPositionChange(clampedPosition)
    }
    
    // Set initial position
    setPosition(defaultPosition)
    
    const touchManager = new TouchManager(element, {
      onDrag: (deltaY: number) => {
        element.style.transition = 'none'
        const newPosition = currentPosition + (-deltaY / windowHeight)
        const translateY = (1 - newPosition) * windowHeight
        element.style.transform = `translateY(${translateY}px)`
      },
      
      onRelease: (velocityY: number) => {
        // Find nearest snap point
        const projectedPosition = currentPosition + (-velocityY * 200 / windowHeight)
        const nearestSnap = snapPoints.reduce((prev, curr) => 
          Math.abs(curr - projectedPosition) < Math.abs(prev - projectedPosition) ? curr : prev
        )
        
        setPosition(nearestSnap)
      }
    })
    
    return {
      setPosition,
      destroy: () => touchManager.destroy()
    }
  }