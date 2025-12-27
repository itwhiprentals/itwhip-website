// app/api/partner/discounts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await jwtVerify(token, JWT_SECRET)

    // Return empty discounts for now
    return NextResponse.json({
      success: true,
      discounts: []
    })
  } catch (error) {
    console.error('[Partner Discounts] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await jwtVerify(token, JWT_SECRET)
    const body = await request.json()

    // TODO: Implement discount creation
    return NextResponse.json({
      success: true,
      discount: { id: 'temp', ...body }
    })
  } catch (error) {
    console.error('[Partner Discounts] Error:', error)
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}
