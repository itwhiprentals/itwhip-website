// app/lib/amadeus-auth.ts
// This file handles Amadeus OAuth2 authentication
// NEVER import this in client components!

interface AmadeusToken {
    access_token: string
    token_type: string
    expires_in: number
    expires_at?: number
    state: string
    scope: string
  }
  
  // Cache token in memory (in production, use Redis)
  let cachedToken: AmadeusToken | null = null
  
  /**
   * Get Amadeus API credentials from environment
   * These are NEVER exposed to the client!
   */
  function getAmadeusCredentials() {
    const apiKey = process.env.AMADEUS_API_KEY
    const apiSecret = process.env.AMADEUS_API_SECRET
    const baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
    
    if (!apiKey || !apiSecret) {
      console.error('Amadeus credentials missing from environment variables!')
      throw new Error('Amadeus configuration error')
    }
    
    return { apiKey, apiSecret, baseUrl }
  }
  
  /**
   * Get OAuth2 token from Amadeus
   * Tokens are valid for 30 minutes
   */
  export async function getAmadeusToken(): Promise<string> {
    try {
      // Check if we have a valid cached token
      if (cachedToken && cachedToken.expires_at && cachedToken.expires_at > Date.now()) {
        console.log('Using cached Amadeus token')
        return cachedToken.access_token
      }
      
      console.log('Fetching new Amadeus token...')
      const { apiKey, apiSecret, baseUrl } = getAmadeusCredentials()
      
      // Prepare OAuth2 request
      const tokenUrl = `${baseUrl}/v1/security/oauth2/token`
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret
      })
      
      // Request new token
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      
      if (!response.ok) {
        const error = await response.text()
        console.error('Amadeus token error:', error)
        throw new Error('Failed to get Amadeus token')
      }
      
      const token: AmadeusToken = await response.json()
      
      // Add expiration timestamp (30 seconds before actual expiry for safety)
      token.expires_at = Date.now() + ((token.expires_in - 30) * 1000)
      
      // Cache the token
      cachedToken = token
      
      console.log('Amadeus token obtained successfully')
      return token.access_token
      
    } catch (error) {
      console.error('Amadeus authentication failed:', error)
      throw new Error('Unable to authenticate with Amadeus')
    }
  }
  
  /**
   * Make authenticated request to Amadeus API
   * Automatically handles token refresh
   */
  export async function amadeusRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const { baseUrl } = getAmadeusCredentials()
      const token = await getAmadeusToken()
      
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${baseUrl}${endpoint}`
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          ...options.headers
        }
      })
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60'
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`)
      }
      
      // Handle token expiration
      if (response.status === 401) {
        console.log('Token expired, refreshing...')
        cachedToken = null // Clear cached token
        return amadeusRequest(endpoint, options) // Retry with new token
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Amadeus API error:', error)
        throw new Error(error.errors?.[0]?.detail || 'Amadeus API request failed')
      }
      
      return response.json()
      
    } catch (error) {
      console.error('Amadeus request failed:', error)
      throw error
    }
  }
  
  /**
   * Cache implementation for API responses
   * In production, use Redis instead of memory
   */
  const responseCache = new Map<string, { data: any; expires: number }>()
  
  export async function cachedAmadeusRequest(
    endpoint: string,
    cacheKey: string,
    ttl: number = 3600000 // 1 hour default
  ): Promise<any> {
    // Check cache
    const cached = responseCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      console.log(`Cache hit for ${cacheKey}`)
      return cached.data
    }
    
    // Make request
    console.log(`Cache miss for ${cacheKey}, fetching...`)
    const data = await amadeusRequest(endpoint)
    
    // Cache response
    responseCache.set(cacheKey, {
      data,
      expires: Date.now() + ttl
    })
    
    // Clean old cache entries (simple cleanup)
    if (responseCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of responseCache.entries()) {
        if (value.expires < now) {
          responseCache.delete(key)
        }
      }
    }
    
    return data
  }
  
  /**
   * Test Amadeus connection
   */
  export async function testAmadeusConnection(): Promise<boolean> {
    try {
      const token = await getAmadeusToken()
      return !!token
    } catch (error) {
      console.error('Amadeus connection test failed:', error)
      return false
    }
  }