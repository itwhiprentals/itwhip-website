// app/fleet/api/language/changelog/route.ts
// Translation Change Log API — read/clear changelog entries
// Phase 5 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const CHANGELOG_PATH = path.join(process.cwd(), 'messages', '.changelog.json')

interface ChangelogEntry {
  id: string
  timestamp: string
  action: string
  locale: string
  namespace: string
  key: string
  oldValue: string
  newValue: string
  author: string
  source: string
}

function readChangelog(): ChangelogEntry[] {
  try {
    if (!fs.existsSync(CHANGELOG_PATH)) return []
    const content = fs.readFileSync(CHANGELOG_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const locale = searchParams.get('locale')
    const namespace = searchParams.get('namespace')
    const action = searchParams.get('action')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let entries = readChangelog()

    // Apply filters
    if (locale) entries = entries.filter(e => e.locale === locale)
    if (namespace) entries = entries.filter(e => e.namespace === namespace)
    if (action) entries = entries.filter(e => e.action === action)
    if (source) entries = entries.filter(e => e.source === source)

    // Sort newest first
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const total = entries.length
    const paginated = entries.slice(offset, offset + limit)

    // Aggregate stats
    const actions: Record<string, number> = {}
    const sources: Record<string, number> = {}
    const locales: Record<string, number> = {}
    for (const e of entries) {
      actions[e.action] = (actions[e.action] || 0) + 1
      sources[e.source] = (sources[e.source] || 0) + 1
      locales[e.locale] = (locales[e.locale] || 0) + 1
    }

    return NextResponse.json({
      entries: paginated,
      total,
      offset,
      limit,
      stats: { actions, sources, locales },
    })
  } catch (error) {
    console.error('[Changelog API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to read changelog' },
      { status: 500 }
    )
  }
}

// POST: Undo a specific changelog entry (rollback single key)
export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 })
    }

    const entries = readChangelog()
    const entry = entries.find(e => e.id === entryId)

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (!entry.oldValue && entry.action !== 'add') {
      return NextResponse.json({ error: 'Cannot undo: no old value recorded' }, { status: 400 })
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const filePath = path.join(messagesDir, `${entry.locale}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Language file not found: ${entry.locale}` }, { status: 404 })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const messages = JSON.parse(content)

    if (entry.action === 'add') {
      // Undo add = delete the key
      const nsObj = messages[entry.namespace]
      if (nsObj) {
        const parts = entry.key.split('.')
        let current = nsObj
        for (let i = 0; i < parts.length - 1; i++) {
          if (typeof current[parts[i]] !== 'object') break
          current = current[parts[i]]
        }
        delete current[parts[parts.length - 1]]
      }
    } else if (entry.action === 'delete') {
      // Undo delete = restore the key
      if (!messages[entry.namespace]) messages[entry.namespace] = {}
      const parts = entry.key.split('.')
      let current = messages[entry.namespace]
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {}
        current = current[parts[i]]
      }
      current[parts[parts.length - 1]] = entry.oldValue
    } else {
      // Undo update = restore old value
      if (!messages[entry.namespace]) messages[entry.namespace] = {}
      const parts = entry.key.split('.')
      let current = messages[entry.namespace]
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {}
        current = current[parts[i]]
      }
      current[parts[parts.length - 1]] = entry.oldValue
    }

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf-8')

    // Log the undo as a new changelog entry
    const undoEntry: ChangelogEntry = {
      id: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      action: 'rollback',
      locale: entry.locale,
      namespace: entry.namespace,
      key: entry.key,
      oldValue: entry.newValue,
      newValue: entry.oldValue,
      author: 'admin',
      source: 'system',
    }

    entries.unshift(undoEntry)
    // Keep max 500
    const trimmed = entries.slice(0, 500)
    fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(trimmed, null, 2) + '\n', 'utf-8')

    return NextResponse.json({
      success: true,
      undone: entry,
      restoredValue: entry.oldValue,
    })
  } catch (error) {
    console.error('[Changelog Undo API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to undo change' },
      { status: 500 }
    )
  }
}
