import { NextRequest, NextResponse } from 'next/server'
import { getAllKillswitches, killFeature, reviveFeature, KILLSWITCH_INFO } from '@/app/lib/killswitch'

export async function GET() {
  try {
    const switches = await getAllKillswitches()
    return NextResponse.json({ switches, info: KILLSWITCH_INFO })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load killswitches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { feature, active, reason } = await request.json()
    if (!feature) return NextResponse.json({ error: 'Feature required' }, { status: 400 })
    if (active) {
      await killFeature(feature, reason || 'Manual kill', 'fleet-admin')
    } else {
      await reviveFeature(feature, 'fleet-admin')
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update killswitch' }, { status: 500 })
  }
}
