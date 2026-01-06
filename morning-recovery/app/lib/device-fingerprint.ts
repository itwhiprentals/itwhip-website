// app/lib/device-fingerprint.ts

interface DeviceFingerprint {
    fingerprint: string
    rawData: {
      screenResolution: string
      colorDepth: number
      timezone: string
      timezoneOffset: number
      language: string
      languages: string[]
      platform: string
      hardwareConcurrency: number
      deviceMemory: number | null
      touchSupport: boolean
      cookieEnabled: boolean
      doNotTrack: string | null
      plugins: number
      userAgent: string
      webGLVendor: string
      webGLRenderer: string
      fonts: string[]
      sessionStorage: boolean
      localStorage: boolean
      indexedDB: boolean
      canvasFingerprint: string
    }
  }
  
  /**
   * Simple hash function to create a consistent fingerprint
   */
  function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
  
  /**
   * Get WebGL information for fingerprinting
   */
  function getWebGLInfo(): { vendor: string; renderer: string } {
    if (typeof window === 'undefined') {
      return { vendor: 'unknown', renderer: 'unknown' }
    }
  
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        return { vendor: 'no-webgl', renderer: 'no-webgl' }
      }
  
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        return {
          vendor: (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
          renderer: (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
        }
      }
      
      return { vendor: 'masked', renderer: 'masked' }
    } catch (e) {
      return { vendor: 'error', renderer: 'error' }
    }
  }
  
  /**
   * Generate a canvas fingerprint
   */
  function getCanvasFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'no-canvas'
    }
  
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 50
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        return 'no-context'
      }
  
      // Draw text with various styles
      ctx.textBaseline = 'top'
      ctx.font = '14px "Arial"'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Canvas fingerprint 🚀', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Canvas fingerprint 🚀', 4, 17)
  
      // Get canvas data
      const dataURL = canvas.toDataURL()
      return simpleHash(dataURL)
    } catch (e) {
      return 'canvas-error'
    }
  }
  
  /**
   * Detect available fonts (limited set for performance)
   */
  function detectFonts(): string[] {
    if (typeof window === 'undefined') {
      return []
    }
  
    const testFonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
      'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Helvetica'
    ]
  
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      return []
    }
  
    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const baseFonts = ['monospace', 'sans-serif', 'serif']
    const baseFontWidths: { [key: string]: number } = {}
  
    // Get base measurements
    baseFonts.forEach(baseFont => {
      context.font = `${testSize} ${baseFont}`
      baseFontWidths[baseFont] = context.measureText(testString).width
    })
  
    // Check which fonts are available
    const detectedFonts: string[] = []
    testFonts.forEach(font => {
      const detected = baseFonts.some(baseFont => {
        context.font = `${testSize} '${font}', ${baseFont}`
        const width = context.measureText(testString).width
        return width !== baseFontWidths[baseFont]
      })
      
      if (detected) {
        detectedFonts.push(font)
      }
    })
  
    return detectedFonts
  }
  
  /**
   * Collect device fingerprint data
   */
  export function collectDeviceFingerprint(): DeviceFingerprint {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return {
        fingerprint: 'server-side',
        rawData: {
          screenResolution: '0x0',
          colorDepth: 0,
          timezone: 'UTC',
          timezoneOffset: 0,
          language: 'en',
          languages: [],
          platform: 'unknown',
          hardwareConcurrency: 0,
          deviceMemory: null,
          touchSupport: false,
          cookieEnabled: false,
          doNotTrack: null,
          plugins: 0,
          userAgent: 'server',
          webGLVendor: 'unknown',
          webGLRenderer: 'unknown',
          fonts: [],
          sessionStorage: false,
          localStorage: false,
          indexedDB: false,
          canvasFingerprint: 'none'
        }
      }
    }
  
    // Collect all device characteristics
    const screen = window.screen
    const navigator = window.navigator
    const webGL = getWebGLInfo()
  
    const rawData = {
      // Screen properties
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // Language
      language: navigator.language,
      languages: navigator.languages || [],
      
      // Hardware/Platform
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || null,
      
      // Capabilities
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      plugins: navigator.plugins?.length || 0,
      
      // User agent
      userAgent: navigator.userAgent,
      
      // WebGL
      webGLVendor: webGL.vendor,
      webGLRenderer: webGL.renderer,
      
      // Fonts
      fonts: detectFonts(),
      
      // Storage
      sessionStorage: (() => {
        try {
          return !!window.sessionStorage
        } catch {
          return false
        }
      })(),
      localStorage: (() => {
        try {
          return !!window.localStorage
        } catch {
          return false
        }
      })(),
      indexedDB: !!window.indexedDB,
      
      // Canvas
      canvasFingerprint: getCanvasFingerprint()
    }
  
    // Create a consistent string from all properties
    const fingerprintString = [
      rawData.screenResolution,
      rawData.colorDepth,
      rawData.timezone,
      rawData.timezoneOffset,
      rawData.language,
      rawData.languages.join(','),
      rawData.platform,
      rawData.hardwareConcurrency,
      rawData.deviceMemory,
      rawData.touchSupport,
      rawData.cookieEnabled,
      rawData.doNotTrack,
      rawData.plugins,
      rawData.webGLVendor,
      rawData.webGLRenderer,
      rawData.fonts.join(','),
      rawData.sessionStorage,
      rawData.localStorage,
      rawData.indexedDB,
      rawData.canvasFingerprint
    ].join('|')
  
    return {
      fingerprint: simpleHash(fingerprintString),
      rawData
    }
  }
  
  /**
   * Get a simplified fingerprint for quick checks
   */
  export function getSimpleFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'server'
    }
  
    const simple = [
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.language,
      navigator.platform,
      navigator.hardwareConcurrency || 0
    ].join('-')
  
    return simpleHash(simple)
  }
  
  /**
   * Check if this appears to be a bot based on fingerprint
   */
  export function checkBotSignals(fingerprint: DeviceFingerprint): string[] {
    const signals: string[] = []
  
    // Check for headless browser indicators
    if (fingerprint.rawData.webGLVendor === 'Brian Paul' && 
        fingerprint.rawData.webGLRenderer === 'Mesa OffScreen') {
      signals.push('headless_chrome')
    }
  
    // No plugins is suspicious for desktop
    if (fingerprint.rawData.plugins === 0 && 
        !fingerprint.rawData.touchSupport &&
        fingerprint.rawData.platform.includes('Win')) {
      signals.push('no_plugins_desktop')
    }
  
    // Check for automation tools
    if (fingerprint.rawData.userAgent.includes('HeadlessChrome') ||
        fingerprint.rawData.userAgent.includes('PhantomJS') ||
        fingerprint.rawData.userAgent.includes('Selenium')) {
      signals.push('automation_tool')
    }
  
    // Suspicious screen resolution
    if (fingerprint.rawData.screenResolution === '0x0' ||
        fingerprint.rawData.screenResolution === '1x1') {
      signals.push('invalid_screen')
    }
  
    // No hardware concurrency on modern device
    if (fingerprint.rawData.hardwareConcurrency === 0) {
      signals.push('no_cpu_cores')
    }
  
    return signals
  }