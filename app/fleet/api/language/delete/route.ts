// app/fleet/api/language/delete/route.ts
// Delete Key API — removes a key from all language files
// Phase 2 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

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

// Delete a nested key by dot-path
function deleteNestedKey(obj: Record<string, unknown>, keyPath: string): boolean {
  const parts = keyPath.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) {
      return false
    }
    current = current[parts[i]] as Record<string, unknown>
  }
  const lastKey = parts[parts.length - 1]
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }
  return false
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

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { namespace, key } = body

    if (!namespace || !key) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace, key' },
        { status: 400 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    // Collect old values before deleting
    const deletedValues: Record<string, string> = {}
    let foundInAny = false

    for (const code of localeCodes) {
      const filePath = path.join(messagesDir, `${code}.json`)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      if (content[namespace]) {
        const val = getNestedValue(content[namespace] as Record<string, unknown>, key)
        if (val !== undefined) {
          deletedValues[code] = typeof val === 'string' ? val : JSON.stringify(val)
          foundInAny = true
        }
      }
    }

    if (!foundInAny) {
      return NextResponse.json(
        { error: `Key '${key}' not found in namespace '${namespace}'` },
        { status: 404 }
      )
    }

    // Delete from all files
    for (const code of localeCodes) {
      const filePath = path.join(messagesDir, `${code}.json`)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      if (content[namespace]) {
        deleteNestedKey(content[namespace] as Record<string, unknown>, key)
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8')
      }
    }

    // Log to changelog
    appendChangelog({
      action: 'delete',
      namespace,
      key,
      deletedValues,
      author: body.author || 'admin',
      source: 'manual',
    })

    return NextResponse.json({
      success: true,
      namespace,
      key,
      deletedValues,
    })
  } catch (error) {
    console.error('[Language Delete API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete translation key' },
      { status: 500 }
    )
  }
}
