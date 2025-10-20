import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 40),
    databaseUrlLength: process.env.DATABASE_URL?.length,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}