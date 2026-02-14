// app/fleet/api/language/snapshot/route.ts
// Version Snapshot API — create/list snapshots of translation files
// Phase 5 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const MESSAGES_DIR = path.join(process.cwd(), 'messages')
const VERSIONS_DIR = path.join(MESSAGES_DIR, '.versions')
const MAX_SNAPSHOTS_PER_LOCALE = 20

function ensureVersionsDir() {
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true })
  }
}

// GET: List all snapshots
export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    ensureVersionsDir()

    const { searchParams } = request.nextUrl
    const locale = searchParams.get('locale')

    const files = fs.readdirSync(VERSIONS_DIR)
      .filter(f => f.endsWith('.json'))
      .filter(f => !locale || f.startsWith(`${locale}_`))

    const snapshots = files.map(f => {
      const stat = fs.statSync(path.join(VERSIONS_DIR, f))
      // Format: {locale}_{timestamp}.json
      const match = f.match(/^(.+?)_(\d+)\.json$/)
      return {
        filename: f,
        locale: match?.[1] || 'unknown',
        timestamp: match?.[2] ? new Date(parseInt(match[2])).toISOString() : stat.mtime.toISOString(),
        size: stat.size,
        sizeKB: Math.round(stat.size / 1024),
      }
    })

    // Sort newest first
    snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      snapshots,
      total: snapshots.length,
    })
  } catch (error) {
    console.error('[Snapshot API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to list snapshots' },
      { status: 500 }
    )
  }
}

// POST: Create a snapshot of one or all locales
export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    ensureVersionsDir()

    const body = await request.json()
    const { locale } = body // optional: snapshot single locale or all

    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    const toSnapshot = locale ? [locale] : localeCodes
    const created: string[] = []

    const timestamp = Date.now()

    for (const code of toSnapshot) {
      const srcPath = path.join(MESSAGES_DIR, `${code}.json`)
      if (!fs.existsSync(srcPath)) continue

      const destFilename = `${code}_${timestamp}.json`
      const destPath = path.join(VERSIONS_DIR, destFilename)
      fs.copyFileSync(srcPath, destPath)
      created.push(destFilename)

      // Cleanup: keep only MAX_SNAPSHOTS_PER_LOCALE per locale
      const localeSnapshots = fs.readdirSync(VERSIONS_DIR)
        .filter(f => f.startsWith(`${code}_`) && f.endsWith('.json'))
        .sort()

      if (localeSnapshots.length > MAX_SNAPSHOTS_PER_LOCALE) {
        const toRemove = localeSnapshots.slice(0, localeSnapshots.length - MAX_SNAPSHOTS_PER_LOCALE)
        for (const old of toRemove) {
          fs.unlinkSync(path.join(VERSIONS_DIR, old))
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      timestamp: new Date(timestamp).toISOString(),
    })
  } catch (error) {
    console.error('[Snapshot API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    )
  }
}
