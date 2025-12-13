import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Simple query to keep database connection warm
    const result = await prisma.$queryRaw`SELECT 1 as ping`

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Database connection alive'
    })
  } catch (error) {
    console.error('Keep-alive failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database ping failed'
    }, { status: 500 })
  }
}
