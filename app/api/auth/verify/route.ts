// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify the token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Return user data
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'guest'
      }
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}