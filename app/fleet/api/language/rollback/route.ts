// app/fleet/api/language/rollback/route.ts
// Rollback API — restore a snapshot version with diff preview
// Phase 5 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const MESSAGES_DIR = path.join(process.cwd(), 'messages')
const VERSIONS_DIR = path.join(MESSAGES_DIR, '.versions')
const CHANGELOG_PATH = path.join(MESSAGES_DIR, '.changelog.json')

function countLeafKeys(obj: Record<string, unknown>): number {
  let count = 0
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      count += countLeafKeys(val as Record<string, unknown>)
    } else {
      count++
    }
  }
  return count
}

function getLeafEntries(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  const entries: [string, string][] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...getLeafEntries(val as Record<string, unknown>, fullKey))
    } else {
      entries.push([fullKey, typeof val === 'string' ? val : JSON.stringify(val)])
    }
  }
  return entries
}

// POST: Preview diff or apply rollback
export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { filename, preview } = body

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    // Validate filename format: {locale}_{timestamp}.json
    const match = filename.match(/^(.+?)_(\d+)\.json$/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid snapshot filename' }, { status: 400 })
    }

    const locale = match[1]
    const snapshotPath = path.join(VERSIONS_DIR, filename)
    const currentPath = path.join(MESSAGES_DIR, `${locale}.json`)

    if (!fs.existsSync(snapshotPath)) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
    }

    if (!fs.existsSync(currentPath)) {
      return NextResponse.json({ error: `Current file not found: ${locale}.json` }, { status: 404 })
    }

    const snapshotContent = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))
    const currentContent = JSON.parse(fs.readFileSync(currentPath, 'utf-8'))

    // Compute diff
    const snapshotKeys = new Map<string, string>()
    const currentKeys = new Map<string, string>()

    for (const ns of Object.keys(snapshotContent)) {
      if (typeof snapshotContent[ns] === 'object' && snapshotContent[ns] !== null) {
        for (const [key, val] of getLeafEntries(snapshotContent[ns])) {
          snapshotKeys.set(`${ns}.${key}`, val)
        }
      }
    }

    for (const ns of Object.keys(currentContent)) {
      if (typeof currentContent[ns] === 'object' && currentContent[ns] !== null) {
        for (const [key, val] of getLeafEntries(currentContent[ns])) {
          currentKeys.set(`${ns}.${key}`, val)
        }
      }
    }

    const added: string[] = []
    const removed: string[] = []
    const changed: { key: string; from: string; to: string }[] = []

    // Keys in snapshot but not in current = will be added by rollback
    for (const [key, val] of snapshotKeys) {
      if (!currentKeys.has(key)) {
        added.push(key)
      } else if (currentKeys.get(key) !== val) {
        changed.push({ key, from: currentKeys.get(key)!, to: val })
      }
    }

    // Keys in current but not in snapshot = will be removed by rollback
    for (const key of currentKeys.keys()) {
      if (!snapshotKeys.has(key)) {
        removed.push(key)
      }
    }

    const diff = {
      locale,
      snapshotDate: new Date(parseInt(match[2])).toISOString(),
      snapshotKeys: snapshotKeys.size,
      currentKeys: currentKeys.size,
      added: added.length,
      removed: removed.length,
      changed: changed.length,
      details: {
        added: added.slice(0, 50),
        removed: removed.slice(0, 50),
        changed: changed.slice(0, 50),
      },
    }

    if (preview) {
      return NextResponse.json({ diff })
    }

    // Apply rollback: create snapshot of current state first, then overwrite
    if (!fs.existsSync(VERSIONS_DIR)) {
      fs.mkdirSync(VERSIONS_DIR, { recursive: true })
    }

    // Backup current before overwriting
    const backupFilename = `${locale}_${Date.now()}.json`
    fs.copyFileSync(currentPath, path.join(VERSIONS_DIR, backupFilename))

    // Overwrite with snapshot
    fs.copyFileSync(snapshotPath, currentPath)

    // Log to changelog
    try {
      let changelog: unknown[] = []
      if (fs.existsSync(CHANGELOG_PATH)) {
        changelog = JSON.parse(fs.readFileSync(CHANGELOG_PATH, 'utf-8'))
      }

      changelog.unshift({
        id: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        action: 'rollback',
        locale,
        namespace: '*',
        key: '*',
        oldValue: `current (${currentKeys.size} keys)`,
        newValue: `snapshot ${filename} (${snapshotKeys.size} keys)`,
        author: 'admin',
        source: 'system',
      })

      const trimmed = (changelog as unknown[]).slice(0, 500)
      fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(trimmed, null, 2) + '\n', 'utf-8')
    } catch { /* changelog write failure shouldn't block rollback */ }

    return NextResponse.json({
      success: true,
      diff,
      backupCreated: backupFilename,
    })
  } catch (error) {
    console.error('[Rollback API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to rollback' },
      { status: 500 }
    )
  }
}
