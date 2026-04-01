import { NextRequest, NextResponse } from 'next/server'
import { getAllChoeConfig, setChoeConfig } from '@/app/lib/ai/choeConfig'

export async function GET() {
  try {
    const config = await getAllChoeConfig()
    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Config object required' }, { status: 400 })
    }
    for (const [key, value] of Object.entries(config)) {
      await setChoeConfig(key, String(value), 'fleet-admin')
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}
