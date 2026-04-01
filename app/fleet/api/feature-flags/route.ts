import { NextRequest, NextResponse } from 'next/server'
import { getAllFlags, setFlag, seedDefaultFlags } from '@/app/lib/featureFlags'

export async function GET() {
  try {
    await seedDefaultFlags()
    const flags = await getAllFlags()
    return NextResponse.json({ flags })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load flags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, enabled } = await request.json()
    if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })
    await setFlag(key, enabled, 'fleet-admin')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 })
  }
}
