// app/fleet/api/choe/auth.ts
// Shared fleet API key validation for Choé admin routes

import { NextRequest } from 'next/server'

const FLEET_KEY = process.env.FLEET_API_KEY || 'phoenix-fleet-2847'
const PHOENIX_KEY = 'phoenix-fleet-2847'

/**
 * Validate fleet API key from request query params
 * Accepts both the env-based key and the legacy phoenix key (matches middleware)
 */
export function validateFleetKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY || key === PHOENIX_KEY
}

/**
 * Get fleet key from request (for use in responses)
 */
export function getFleetKey(request: NextRequest): string {
  return request.nextUrl.searchParams.get('key') || ''
}
