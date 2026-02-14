// app/fleet/api/language/bulk-update/route.ts
// Bulk Update API — edit multiple keys at once
// Phase 2 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

// Set a nested value by dot-path
function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string): void {
  const parts = keyPath.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) {
      current[parts[i]] = {}
    }
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

// Get a nested value by dot-path
function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  const parts = keyPath.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// Append to changelog
function appendChangelog(entry: Record<string, unknown>) {
  const changelogPath = path.join(process.cwd(), 'messages', '.changelog.json')
  let changelog: Record<string, unknown>[] = []
  try {
    if (fs.existsSync(changelogPath)) {
      changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'))
    }
  } catch { /* start fresh */ }

  changelog.unshift({
    id: `chg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })

  if (changelog.length > 500) changelog = changelog.slice(0, 500)
  fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8')
}

interface BulkUpdate {
  namespace: string
  key: string
  value: string
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { locale, updates, author, source } = body as {
      locale: string
      updates: BulkUpdate[]
      author?: string
      source?: string
    }

    if (!locale || !updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: locale, updates (non-empty array)' },
        { status: 400 }
      )
    }

    if (locale === 'en') {
      return NextResponse.json(
        { error: 'Cannot bulk-edit English (baseline) translations' },
        { status: 400 }
      )
    }

    if (updates.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 updates per request' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Language file not found: ${locale}.json` },
        { status: 404 }
      )
    }

    // Read current file
    const content = fs.readFileSync(filePath, 'utf-8')
    const messages = JSON.parse(content)

    // Apply updates
    const results: { namespace: string; key: string; oldValue: string; newValue: string }[] = []
    const errors: { namespace: string; key: string; error: string }[] = []

    for (const update of updates) {
      if (!update.namespace || !update.key || update.value === undefined) {
        errors.push({ namespace: update.namespace, key: update.key, error: 'Missing fields' })
        continue
      }

      if (!messages[update.namespace]) {
        errors.push({ namespace: update.namespace, key: update.key, error: 'Namespace not found' })
        continue
      }

      const nsObj = messages[update.namespace] as Record<string, unknown>
      const oldVal = getNestedValue(nsObj, update.key)
      const oldStr = typeof oldVal === 'string' ? oldVal : ''

      setNestedValue(nsObj, update.key, update.value)
      results.push({
        namespace: update.namespace,
        key: update.key,
        oldValue: oldStr,
        newValue: update.value,
      })
    }

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf-8')

    // Log to changelog
    if (results.length > 0) {
      appendChangelog({
        action: 'bulk-update',
        locale,
        count: results.length,
        namespaces: [...new Set(results.map(r => r.namespace))],
        author: author || 'admin',
        source: source || 'manual',
      })
    }

    return NextResponse.json({
      success: true,
      locale,
      updated: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Language Bulk Update API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update translations' },
      { status: 500 }
    )
  }
}
