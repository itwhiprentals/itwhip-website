// app/api/ai/booking/checkout/auth.ts
// Shared auth helper for AI booking checkout endpoints
// Uses accessToken cookie (JWT) — same auth system as the rest of the guest API

import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import prisma from '@/app/lib/database/prisma'

const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

interface CheckoutUser {
  id: string
  email: string
  name: string | null
  phone: string | null
}

/**
 * Authenticate a checkout request using the accessToken cookie.
 * Returns the user or null if not authenticated.
 */
export async function getCheckoutUser(request: NextRequest): Promise<CheckoutUser | null> {
  const token = request.cookies.get('accessToken')?.value
  if (!token) return null

  // Try both secrets (guest JWT and platform JWT)
  const secrets = [
    { secret: GUEST_JWT_SECRET, type: 'guest' },
    { secret: JWT_SECRET, type: 'platform' },
  ]

  let payload: { userId?: string; email?: string } | null = null

  for (const { secret } of secrets) {
    try {
      const result = await jwtVerify(token, secret)
      payload = result.payload as { userId?: string; email?: string }
      break
    } catch {
      continue
    }
  }

  if (!payload?.userId || !payload?.email) return null

  // Verify user exists in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, phone: true },
  })

  return user
}
