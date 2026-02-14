// app/fleet/api/language/add/route.ts
// Add New Key API — adds a key to all language files
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

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { namespace, key, values } = body as {
      namespace: string
      key: string
      values: Record<string, string>
    }

    if (!namespace || !key || !values || !values.en) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace, key, values.en' },
        { status: 400 }
      )
    }

    // Validate key format
    if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must start with a letter and contain only letters, numbers, dots, and underscores' },
        { status: 400 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    // Check if key already exists in English
    const enPath = path.join(messagesDir, 'en.json')
    const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

    if (!enMessages[namespace]) {
      // Create new namespace in all files
      for (const code of localeCodes) {
        const filePath = path.join(messagesDir, `${code}.json`)
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        content[namespace] = {}
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8')
      }
      // Reload en after creating namespace
      Object.assign(enMessages, JSON.parse(fs.readFileSync(enPath, 'utf-8')))
    }

    const existingValue = getNestedValue(enMessages[namespace] as Record<string, unknown>, key)
    if (existingValue !== undefined) {
      return NextResponse.json(
        { error: `Key '${key}' already exists in namespace '${namespace}'` },
        { status: 409 }
      )
    }

    // Add to all language files
    const addedLocales: string[] = []
    for (const code of localeCodes) {
      const filePath = path.join(messagesDir, `${code}.json`)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      if (!content[namespace]) {
        content[namespace] = {}
      }

      const value = values[code] || ''
      setNestedValue(content[namespace] as Record<string, unknown>, key, value)
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8')
      addedLocales.push(code)
    }

    // Log to changelog
    appendChangelog({
      action: 'add',
      namespace,
      key,
      values,
      locales: addedLocales,
      author: body.author || 'admin',
      source: body.source || 'manual',
    })

    return NextResponse.json({
      success: true,
      namespace,
      key,
      addedTo: addedLocales,
    })
  } catch (error) {
    console.error('[Language Add API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add translation key' },
      { status: 500 }
    )
  }
}
