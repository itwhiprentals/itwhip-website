// app/api/v3/version/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// API Version Information
const API_VERSION = {
  version: '3.2.1',
  majorVersion: 3,
  minorVersion: 2,
  patchVersion: 1,
  releaseDate: '2025-01-15',
  codename: 'Phoenix',
  stage: 'production' // development, staging, production
}

// Feature flags and capabilities
const FEATURES = {
  authentication: {
    jwt: true,
    apiKey: true,
    oauth2: true,
    mfa: true,
    sso: false // Coming soon
  },
  endpoints: {
    core: ['status', 'ping', 'version', 'auth'],
    hotels: ['search', 'availability', 'rates', 'bookings'],
    drivers: ['location', 'status', 'earnings', 'schedule'],
    analytics: ['metrics', 'reports', 'exports'],
    webhooks: ['events', 'subscriptions']
  },
  rateLimit: {
    enabled: true,
    default: 1000,
    authenticated: 5000,
    premium: 10000
  },
  security: {
    encryption: 'AES-256-GCM',
    tlsVersion: '1.3',
    cors: true,
    csp: true,
    hsts: true
  },
  formats: {
    json: true,
    xml: false,
    graphql: false,
    grpc: false
  }
}

// Deprecated features to warn clients about
const DEPRECATED = {
  endpoints: [
    {
      path: '/api/v2/*',
      deprecatedSince: '2025-01-01',
      removalDate: '2025-06-01',
      replacement: '/api/v3/*'
    },
    {
      path: '/api/v3/drivers/legacy',
      deprecatedSince: '2025-01-15',
      removalDate: '2025-03-01',
      replacement: '/api/v3/drivers/status'
    }
  ],
  parameters: [
    {
      name: 'api_token',
      deprecatedSince: '2025-01-01',
      replacement: 'X-API-Key header'
    }
  ],
  features: [
    {
      name: 'XML responses',
      deprecatedSince: '2024-12-01',
      removalDate: '2025-02-01',
      reason: 'Low usage, maintaining JSON only'
    }
  ]
}

// SDK and client library versions
const SDK_VERSIONS = {
  javascript: {
    npm: '@itwhip/sdk',
    version: '3.2.0',
    minSupported: '3.0.0',
    documentationUrl: 'https://docs.itwhip.com/sdk/javascript'
  },
  python: {
    pip: 'itwhip-sdk',
    version: '3.2.0',
    minSupported: '3.0.0',
    documentationUrl: 'https://docs.itwhip.com/sdk/python'
  },
  java: {
    maven: 'com.itwhip:sdk',
    version: '3.2.0',
    minSupported: '3.0.0',
    documentationUrl: 'https://docs.itwhip.com/sdk/java'
  },
  ios: {
    cocoapods: 'ItWhipSDK',
    version: '3.2.0',
    minSupported: '3.0.0',
    documentationUrl: 'https://docs.itwhip.com/sdk/ios'
  },
  android: {
    gradle: 'com.itwhip:android-sdk',
    version: '3.2.0',
    minSupported: '3.0.0',
    documentationUrl: 'https://docs.itwhip.com/sdk/android'
  }
}

// Service dependencies and their statuses
const DEPENDENCIES = {
  database: {
    type: 'PostgreSQL',
    version: '15.2',
    status: 'healthy'
  },
  cache: {
    type: 'Redis',
    version: '7.0',
    status: 'healthy'
  },
  search: {
    type: 'Elasticsearch',
    version: '8.7',
    status: 'healthy'
  },
  queue: {
    type: 'RabbitMQ',
    version: '3.11',
    status: 'healthy'
  },
  storage: {
    type: 'AWS S3',
    region: 'us-west-2',
    status: 'healthy'
  }
}

// Get client SDK version from User-Agent or X-SDK-Version header
async function getClientSDKInfo(): Promise<{ sdk?: string; version?: string }> {
  const headersList = await headers()
  const sdkVersion = headersList.get('x-sdk-version')
  const userAgent = headersList.get('user-agent')
  
  if (sdkVersion) {
    const [sdk, version] = sdkVersion.split('/')
    return { sdk, version }
  }
  
  if (userAgent) {
    // Parse common SDK patterns from User-Agent
    const patterns = [
      /ItWhipSDK\/([\w.-]+)/i,
      /itwhip-sdk\/([\w.-]+)/i,
      /@itwhip\/sdk\/([\w.-]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = userAgent.match(pattern)
      if (match) {
        return { sdk: 'detected', version: match[1] }
      }
    }
  }
  
  return {}
}

// Check if client version is compatible
function checkCompatibility(clientVersion?: string): { compatible: boolean; upgrade?: string; message?: string } {
  if (!clientVersion) {
    return { compatible: true }
  }
  
  const [major, minor] = clientVersion.split('.').map(Number)
  const minMajor = 3
  const minMinor = 0
  
  if (major < minMajor || (major === minMajor && minor < minMinor)) {
    return {
      compatible: false,
      upgrade: '3.2.0',
      message: `Your SDK version (${clientVersion}) is outdated. Please upgrade to version 3.0.0 or higher.`
    }
  }
  
  if (major === minMajor && minor === minMinor) {
    return {
      compatible: true,
      upgrade: '3.2.0',
      message: `Consider upgrading to the latest version (3.2.0) for new features and improvements.`
    }
  }
  
  return { compatible: true }
}

export async function GET(request: Request) {
  try {
    // Get client SDK information
    const clientInfo = await getClientSDKInfo()
    const compatibility = checkCompatibility(clientInfo.version)
    
    // Build comprehensive version response
    const response = {
      api: API_VERSION,
      features: FEATURES,
      deprecated: DEPRECATED,
      sdks: SDK_VERSIONS,
      dependencies: DEPENDENCIES,
      client: {
        ...clientInfo,
        compatibility,
        ip: (await headers()).get('x-forwarded-for')?.split(',')[0] || 'unknown'
      },
      links: {
        documentation: 'https://docs.itwhip.com/api/v3',
        changelog: 'https://docs.itwhip.com/api/v3/changelog',
        status: 'https://status.itwhip.com',
        support: 'https://support.itwhip.com'
      },
      timestamp: new Date().toISOString()
    }
    
    // Set appropriate cache headers (version info can be cached for 5 minutes)
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-API-Version': API_VERSION.version,
        'X-API-Stage': API_VERSION.stage,
        'X-Deprecated-Features': DEPRECATED.endpoints.length > 0 ? 'true' : 'false',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-SDK-Version'
      }
    })
    
  } catch (error) {
    console.error('Version endpoint error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve version information',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-SDK-Version',
      'Access-Control-Max-Age': '86400',
    }
  })
}

// Block other methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Version endpoint only supports GET requests' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Version endpoint only supports GET requests' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Version endpoint only supports GET requests' },
    { status: 405 }
  )
}