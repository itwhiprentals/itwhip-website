// app/lib/analytics/visitor-fingerprint.ts
// Military-grade visitor fingerprinting for accurate unique visitor tracking
// Combines multiple high-entropy signals for 95%+ identification accuracy

interface FingerprintComponents {
  // Hardware signals
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelRatio: number
    orientation: string
  }
  hardware: {
    cpuCores: number
    deviceMemory: number | null
    maxTouchPoints: number
    platform: string
  }

  // Browser signals
  browser: {
    userAgent: string
    language: string
    languages: string[]
    cookieEnabled: boolean
    doNotTrack: string | null
    plugins: string[]
    vendor: string
    productSub: string
    hardwareConcurrency: number
  }

  // Timezone & locale
  timezone: {
    name: string
    offset: number
    dst: boolean
  }

  // Graphics fingerprints
  canvas: {
    hash: string
    geometry: string
  }
  webgl: {
    vendor: string
    renderer: string
    hash: string
    extensions: string[]
    parameters: Record<string, any>
  }

  // Audio fingerprint
  audio: {
    hash: string
    sampleRate: number
  }

  // Font detection
  fonts: string[]

  // Storage & features
  features: {
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    openDatabase: boolean
    webSocket: boolean
    webWorker: boolean
    webGL: boolean
    webGL2: boolean
    webRTC: boolean
    bluetooth: boolean
    battery: boolean
    notifications: boolean
    serviceWorker: boolean
  }

  // Connection info
  connection: {
    type: string | null
    effectiveType: string | null
    downlink: number | null
    rtt: number | null
    saveData: boolean
  }

  // Math fingerprint (CPU-specific floating point)
  math: {
    tan: string
    sin: string
    acos: string
  }
}

export interface VisitorFingerprint {
  visitorId: string
  fingerprintHash: string
  confidence: number
  components: FingerprintComponents
  collectedAt: string
  version: string
}

const VERSION = '2.0.0'

/**
 * Cryptographic-quality hash using SubtleCrypto
 */
async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return simpleHash(message)
  }

  try {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return simpleHash(message)
  }
}

/**
 * Simple hash fallback
 */
function simpleHash(str: string): string {
  let hash1 = 5381
  let hash2 = 52711

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash1 = ((hash1 << 5) + hash1) ^ char
    hash2 = ((hash2 << 5) + hash2) ^ char
  }

  return (Math.abs(hash1) * 4096 + Math.abs(hash2)).toString(36)
}

/**
 * Get screen/display information
 */
function getScreenInfo(): FingerprintComponents['screen'] {
  if (typeof window === 'undefined') {
    return {
      width: 0, height: 0, availWidth: 0, availHeight: 0,
      colorDepth: 0, pixelRatio: 1, orientation: 'unknown'
    }
  }

  const screen = window.screen
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: (screen as any).orientation?.type || 'unknown'
  }
}

/**
 * Get hardware information
 */
function getHardwareInfo(): FingerprintComponents['hardware'] {
  if (typeof window === 'undefined') {
    return { cpuCores: 0, deviceMemory: null, maxTouchPoints: 0, platform: 'unknown' }
  }

  return {
    cpuCores: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    platform: navigator.platform || 'unknown'
  }
}

/**
 * Get browser information
 */
function getBrowserInfo(): FingerprintComponents['browser'] {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server', language: 'en', languages: [],
      cookieEnabled: false, doNotTrack: null, plugins: [],
      vendor: '', productSub: '', hardwareConcurrency: 0
    }
  }

  const plugins: string[] = []
  if (navigator.plugins) {
    for (let i = 0; i < Math.min(navigator.plugins.length, 20); i++) {
      plugins.push(navigator.plugins[i].name)
    }
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: [...(navigator.languages || [])],
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    plugins,
    vendor: navigator.vendor || '',
    productSub: (navigator as any).productSub || '',
    hardwareConcurrency: navigator.hardwareConcurrency || 0
  }
}

/**
 * Get timezone information
 */
function getTimezoneInfo(): FingerprintComponents['timezone'] {
  const now = new Date()
  const jan = new Date(now.getFullYear(), 0, 1)
  const jul = new Date(now.getFullYear(), 6, 1)

  return {
    name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    offset: now.getTimezoneOffset(),
    dst: jan.getTimezoneOffset() !== jul.getTimezoneOffset()
  }
}

/**
 * Generate canvas fingerprint with multiple techniques
 */
function getCanvasFingerprint(): FingerprintComponents['canvas'] {
  if (typeof window === 'undefined') {
    return { hash: 'server', geometry: 'server' }
  }

  try {
    // Text rendering fingerprint
    const canvas = document.createElement('canvas')
    canvas.width = 280
    canvas.height = 60
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return { hash: 'no-context', geometry: 'no-context' }
    }

    // Complex text rendering
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.font = '11pt "Times New Roman"'
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😊', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.font = '18pt Arial'
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😊', 4, 45)

    // Add geometric shapes
    ctx.strokeStyle = 'rgb(120,186,176)'
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true)
    ctx.stroke()

    // Add gradient
    const gradient = ctx.createLinearGradient(0, 0, 100, 0)
    gradient.addColorStop(0, 'red')
    gradient.addColorStop(0.5, 'green')
    gradient.addColorStop(1, 'blue')
    ctx.fillStyle = gradient
    ctx.fillRect(200, 30, 75, 25)

    const textHash = simpleHash(canvas.toDataURL())

    // Geometry fingerprint (more stable)
    const geoCanvas = document.createElement('canvas')
    geoCanvas.width = 100
    geoCanvas.height = 100
    const geoCtx = geoCanvas.getContext('2d')

    if (geoCtx) {
      geoCtx.fillStyle = '#000'
      geoCtx.beginPath()
      geoCtx.arc(50, 50, 45, 0, Math.PI * 2)
      geoCtx.fill()
      geoCtx.fillStyle = '#fff'
      geoCtx.beginPath()
      geoCtx.arc(50, 50, 30, 0, Math.PI * 2)
      geoCtx.fill()
    }

    const geoHash = simpleHash(geoCanvas.toDataURL())

    return { hash: textHash, geometry: geoHash }

  } catch {
    return { hash: 'error', geometry: 'error' }
  }
}

/**
 * Get WebGL fingerprint with renderer info and parameter hash
 */
function getWebGLFingerprint(): FingerprintComponents['webgl'] {
  if (typeof window === 'undefined') {
    return {
      vendor: 'server', renderer: 'server', hash: 'server',
      extensions: [], parameters: {}
    }
  }

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

    if (!gl) {
      return {
        vendor: 'no-webgl', renderer: 'no-webgl', hash: 'no-webgl',
        extensions: [], parameters: {}
      }
    }

    // Get debug info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR)
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER)

    // Get extensions
    const extensions = gl.getSupportedExtensions() || []

    // Collect parameters for fingerprinting
    const parameters: Record<string, any> = {
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      stencilBits: gl.getParameter(gl.STENCIL_BITS),
      version: gl.getParameter(gl.VERSION)
    }

    // Create hash from all WebGL data
    const hashInput = [vendor, renderer, ...extensions, JSON.stringify(parameters)].join('|')

    return {
      vendor: vendor || 'unknown',
      renderer: renderer || 'unknown',
      hash: simpleHash(hashInput),
      extensions: extensions.slice(0, 30),
      parameters
    }

  } catch {
    return {
      vendor: 'error', renderer: 'error', hash: 'error',
      extensions: [], parameters: {}
    }
  }
}

/**
 * Generate audio fingerprint using AudioContext
 */
async function getAudioFingerprint(): Promise<FingerprintComponents['audio']> {
  if (typeof window === 'undefined' || !window.OfflineAudioContext) {
    return { hash: 'server', sampleRate: 0 }
  }

  try {
    const audioContext = new OfflineAudioContext(1, 44100, 44100)

    // Create oscillator
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime)

    // Create compressor for more unique output
    const compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-50, audioContext.currentTime)
    compressor.knee.setValueAtTime(40, audioContext.currentTime)
    compressor.ratio.setValueAtTime(12, audioContext.currentTime)
    compressor.attack.setValueAtTime(0, audioContext.currentTime)
    compressor.release.setValueAtTime(0.25, audioContext.currentTime)

    // Connect nodes
    oscillator.connect(compressor)
    compressor.connect(audioContext.destination)
    oscillator.start(0)

    // Render and get fingerprint
    const buffer = await audioContext.startRendering()
    const channelData = buffer.getChannelData(0)

    // Sample specific points for fingerprint (not all 44100 samples)
    const samples: number[] = []
    for (let i = 4500; i < 5000; i++) {
      samples.push(channelData[i])
    }

    // Create hash from samples
    const hash = simpleHash(samples.map(s => s.toFixed(6)).join(','))

    return {
      hash,
      sampleRate: audioContext.sampleRate
    }

  } catch {
    return { hash: 'error', sampleRate: 0 }
  }
}

/**
 * Detect installed fonts
 */
function detectFonts(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  const testFonts = [
    // Common fonts
    'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
    'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
    'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
    'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype',
    'Segoe UI', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS',
    'Verdana',
    // Mac fonts
    'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple Color Emoji',
    'Apple SD Gothic Neo', 'Avenir', 'Avenir Next', 'Baskerville',
    'Big Caslon', 'Bodoni 72', 'Bradley Hand', 'Brush Script MT',
    'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter',
    'Cochin', 'Copperplate', 'Didot', 'Futura', 'Geneva', 'Gill Sans',
    'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Lucida Grande',
    'Luminari', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy',
    'Optima', 'Papyrus', 'Phosphate', 'Rockwell', 'San Francisco',
    'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand',
    // Windows fonts
    'Cambria Math', 'Franklin Gothic Medium', 'Garamond', 'MS Gothic',
    'MS PGothic', 'MS Reference Sans Serif', 'MS Sans Serif', 'MS Serif',
    'Meiryo', 'Sylfaen'
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const baseFontWidths: Record<string, number> = {}

  // Get base measurements
  baseFonts.forEach(baseFont => {
    ctx.font = `${testSize} ${baseFont}`
    baseFontWidths[baseFont] = ctx.measureText(testString).width
  })

  // Check which fonts are available
  const detectedFonts: string[] = []
  testFonts.forEach(font => {
    const detected = baseFonts.some(baseFont => {
      ctx.font = `${testSize} '${font}', ${baseFont}`
      const width = ctx.measureText(testString).width
      return width !== baseFontWidths[baseFont]
    })

    if (detected) {
      detectedFonts.push(font)
    }
  })

  return detectedFonts
}

/**
 * Get browser feature availability
 */
function getFeatures(): FingerprintComponents['features'] {
  if (typeof window === 'undefined') {
    return {
      localStorage: false, sessionStorage: false, indexedDB: false,
      openDatabase: false, webSocket: false, webWorker: false,
      webGL: false, webGL2: false, webRTC: false, bluetooth: false,
      battery: false, notifications: false, serviceWorker: false
    }
  }

  const checkStorage = (storage: 'localStorage' | 'sessionStorage'): boolean => {
    try {
      const key = '__fp_test__'
      window[storage].setItem(key, 'test')
      window[storage].removeItem(key)
      return true
    } catch {
      return false
    }
  }

  return {
    localStorage: checkStorage('localStorage'),
    sessionStorage: checkStorage('sessionStorage'),
    indexedDB: !!window.indexedDB,
    openDatabase: !!(window as any).openDatabase,
    webSocket: 'WebSocket' in window,
    webWorker: 'Worker' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    })(),
    webGL2: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!canvas.getContext('webgl2')
      } catch {
        return false
      }
    })(),
    webRTC: 'RTCPeerConnection' in window,
    bluetooth: 'bluetooth' in navigator,
    battery: 'getBattery' in navigator,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator
  }
}

/**
 * Get connection information
 */
function getConnectionInfo(): FingerprintComponents['connection'] {
  if (typeof window === 'undefined') {
    return {
      type: null, effectiveType: null, downlink: null, rtt: null, saveData: false
    }
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (!connection) {
    return {
      type: null, effectiveType: null, downlink: null, rtt: null, saveData: false
    }
  }

  return {
    type: connection.type || null,
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || false
  }
}

/**
 * Get math fingerprint (CPU-specific floating point behavior)
 */
function getMathFingerprint(): FingerprintComponents['math'] {
  // These values can differ slightly between CPU architectures
  const tan = Math.tan(-1e300).toString()
  const sin = Math.sin(Math.PI).toString()
  const acos = Math.acos(0.5).toString()

  return { tan, sin, acos }
}

/**
 * Calculate confidence score based on available signals
 */
function calculateConfidence(components: FingerprintComponents): number {
  let score = 0
  const weights = {
    canvas: 15,
    webgl: 15,
    audio: 12,
    fonts: 10,
    hardware: 10,
    screen: 8,
    timezone: 8,
    browser: 7,
    features: 5,
    connection: 5,
    math: 5
  }

  // Canvas
  if (components.canvas.hash !== 'error' && components.canvas.hash !== 'server') {
    score += weights.canvas
  }

  // WebGL
  if (components.webgl.hash !== 'error' && components.webgl.vendor !== 'no-webgl') {
    score += weights.webgl
  }

  // Audio
  if (components.audio.hash !== 'error' && components.audio.hash !== 'server') {
    score += weights.audio
  }

  // Fonts
  if (components.fonts.length > 5) {
    score += weights.fonts
  } else if (components.fonts.length > 0) {
    score += weights.fonts * 0.5
  }

  // Hardware
  if (components.hardware.cpuCores > 0) {
    score += weights.hardware
  }

  // Screen
  if (components.screen.width > 0) {
    score += weights.screen
  }

  // Timezone
  if (components.timezone.name !== 'unknown') {
    score += weights.timezone
  }

  // Browser
  score += weights.browser

  // Features
  score += weights.features

  // Connection
  if (components.connection.effectiveType) {
    score += weights.connection
  }

  // Math
  score += weights.math

  return Math.min(score, 100)
}

/**
 * Collect all fingerprint components
 */
export async function collectVisitorFingerprint(): Promise<VisitorFingerprint> {
  const components: FingerprintComponents = {
    screen: getScreenInfo(),
    hardware: getHardwareInfo(),
    browser: getBrowserInfo(),
    timezone: getTimezoneInfo(),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    audio: await getAudioFingerprint(),
    fonts: detectFonts(),
    features: getFeatures(),
    connection: getConnectionInfo(),
    math: getMathFingerprint()
  }

  // Create stable fingerprint hash from most stable components
  const stableComponents = [
    components.canvas.hash,
    components.canvas.geometry,
    components.webgl.hash,
    components.webgl.vendor,
    components.webgl.renderer,
    components.audio.hash,
    components.fonts.join(','),
    components.hardware.cpuCores,
    components.hardware.platform,
    components.screen.colorDepth,
    components.screen.pixelRatio,
    components.timezone.name,
    components.timezone.offset,
    components.math.tan,
    components.math.sin,
    components.math.acos,
    components.browser.language,
    components.browser.hardwareConcurrency
  ].join('|')

  const fingerprintHash = await sha256(stableComponents)

  // Create visitor ID (shorter, URL-safe version)
  const visitorId = `fp_${fingerprintHash.slice(0, 16)}`

  const confidence = calculateConfidence(components)

  return {
    visitorId,
    fingerprintHash,
    confidence,
    components,
    collectedAt: new Date().toISOString(),
    version: VERSION
  }
}

/**
 * Get or create persistent visitor ID
 * Uses localStorage with fingerprint fallback
 */
export async function getVisitorId(): Promise<{
  visitorId: string
  source: 'storage' | 'fingerprint' | 'new'
  confidence: number
}> {
  const STORAGE_KEY = '__itw_vid__'
  const EXPIRY_DAYS = 365

  // Try localStorage first
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const expiry = new Date(data.expiry)
        if (expiry > new Date()) {
          // Refresh expiry
          data.expiry = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
          data.lastSeen = new Date().toISOString()
          data.visits = (data.visits || 0) + 1
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

          return {
            visitorId: data.visitorId,
            source: 'storage',
            confidence: 99 // High confidence from persistent storage
          }
        }
      }
    } catch {
      // Storage not available
    }
  }

  // Fall back to fingerprint
  const fingerprint = await collectVisitorFingerprint()

  // Try to store for future visits
  if (typeof window !== 'undefined') {
    try {
      const data = {
        visitorId: fingerprint.visitorId,
        fingerprintHash: fingerprint.fingerprintHash,
        expiry: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        created: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        visits: 1
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

      return {
        visitorId: fingerprint.visitorId,
        source: 'new',
        confidence: fingerprint.confidence
      }
    } catch {
      // Could not store
    }
  }

  return {
    visitorId: fingerprint.visitorId,
    source: 'fingerprint',
    confidence: fingerprint.confidence
  }
}

/**
 * Get detailed fingerprint for fraud detection/analysis
 */
export async function getDetailedFingerprint(): Promise<VisitorFingerprint> {
  return collectVisitorFingerprint()
}
