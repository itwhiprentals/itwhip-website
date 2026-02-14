// app/fleet/api/language/update/route.ts
// Edit Single Key API — updates one translation value
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

  // Keep last 500 entries
  if (changelog.length > 500) changelog = changelog.slice(0, 500)

  fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { locale, namespace, key, value } = body

    if (!locale || !namespace || !key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: locale, namespace, key, value' },
        { status: 400 }
      )
    }

    if (locale === 'en') {
      return NextResponse.json(
        { error: 'Cannot edit English (baseline) translations through this endpoint' },
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

    if (!messages[namespace]) {
      return NextResponse.json(
        { error: `Namespace '${namespace}' not found in ${locale}.json` },
        { status: 404 }
      )
    }

    // Get old value
    const nsObj = messages[namespace] as Record<string, unknown>
    const oldValue = getNestedValue(nsObj, key)
    const oldStr = typeof oldValue === 'string' ? oldValue : ''

    // Set new value
    setNestedValue(nsObj, key, value)

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf-8')

    // Log to changelog
    appendChangelog({
      action: 'update',
      locale,
      namespace,
      key,
      oldValue: oldStr,
      newValue: value,
      author: body.author || 'admin',
      source: body.source || 'manual',
    })

    return NextResponse.json({
      success: true,
      locale,
      namespace,
      key,
      oldValue: oldStr,
      newValue: value,
    })
  } catch (error) {
    console.error('[Language Update API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    )
  }
}
