// app/fleet/api/language/import/route.ts
// Import API — import translations from JSON or CSV with preview
// Phase 5 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const MESSAGES_DIR = path.join(process.cwd(), 'messages')
const VERSIONS_DIR = path.join(MESSAGES_DIR, '.versions')
const CHANGELOG_PATH = path.join(MESSAGES_DIR, '.changelog.json')

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  const parts = keyPath.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string): void {
  const parts = keyPath.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {}
    }
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Parse header
  const headers = parseCsvLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }
    rows.push(row)
  }

  return rows
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  values.push(current)
  return values
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { format, content, preview } = body

    if (!format || !content) {
      return NextResponse.json(
        { error: 'format and content are required' },
        { status: 400 }
      )
    }

    // Parse input based on format
    type ImportEntry = { namespace: string; key: string; locale: string; value: string }
    const importEntries: ImportEntry[] = []

    if (format === 'json') {
      // Expected format: { "Namespace": { "key.path": { "es": "value", "fr": "value" } } }
      const data = typeof content === 'string' ? JSON.parse(content) : content

      for (const ns of Object.keys(data)) {
        const nsData = data[ns]
        if (typeof nsData !== 'object' || nsData === null) continue

        for (const key of Object.keys(nsData)) {
          const keyData = nsData[key]
          if (typeof keyData !== 'object' || keyData === null) continue

          for (const locale of Object.keys(keyData)) {
            if (locale === 'en') continue // Skip English imports
            const value = keyData[locale]
            if (typeof value === 'string' && value.trim()) {
              importEntries.push({ namespace: ns, key, locale, value })
            }
          }
        }
      }
    } else if (format === 'csv') {
      const rows = parseCsv(typeof content === 'string' ? content : JSON.stringify(content))
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Empty CSV data' }, { status: 400 })
      }

      // CSV headers: Namespace, Key, EN, ES, FR, ...
      const sampleRow = rows[0]
      const localeColumns = Object.keys(sampleRow)
        .filter(h => !['Namespace', 'Key', 'EN', 'namespace', 'key', 'en'].includes(h))
        .map(h => h.toLowerCase())

      for (const row of rows) {
        const ns = row['Namespace'] || row['namespace']
        const key = row['Key'] || row['key']
        if (!ns || !key) continue

        for (const locale of localeColumns) {
          const value = row[locale.toUpperCase()] || row[locale]
          if (value && value.trim()) {
            importEntries.push({ namespace: ns, key, locale, value })
          }
        }
      }
    } else {
      return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 })
    }

    if (importEntries.length === 0) {
      return NextResponse.json({ error: 'No importable entries found' }, { status: 400 })
    }

    // Load current messages for comparison
    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    const allMessages: Record<string, Record<string, unknown>> = {}
    for (const code of localeCodes) {
      const filePath = path.join(MESSAGES_DIR, `${code}.json`)
      allMessages[code] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }

    // Categorize entries
    const added: ImportEntry[] = []
    const updated: (ImportEntry & { oldValue: string })[] = []
    const unchanged: ImportEntry[] = []
    const skipped: (ImportEntry & { reason: string })[] = []

    for (const entry of importEntries) {
      if (!localeCodes.includes(entry.locale)) {
        skipped.push({ ...entry, reason: `Locale ${entry.locale} not found` })
        continue
      }

      const nsObj = allMessages[entry.locale]?.[entry.namespace] as Record<string, unknown> | undefined
      if (!nsObj) {
        added.push(entry)
        continue
      }

      const currentValue = getNestedValue(nsObj, entry.key)
      if (currentValue === undefined || currentValue === '') {
        added.push(entry)
      } else if (currentValue !== entry.value) {
        updated.push({ ...entry, oldValue: String(currentValue) })
      } else {
        unchanged.push(entry)
      }
    }

    const previewResult = {
      total: importEntries.length,
      added: added.length,
      updated: updated.length,
      unchanged: unchanged.length,
      skipped: skipped.length,
      details: {
        added: added.slice(0, 30),
        updated: updated.slice(0, 30),
        skipped: skipped.slice(0, 10),
      },
    }

    if (preview) {
      return NextResponse.json({ preview: previewResult })
    }

    // Apply import — create snapshot first
    if (!fs.existsSync(VERSIONS_DIR)) {
      fs.mkdirSync(VERSIONS_DIR, { recursive: true })
    }

    const affectedLocales = new Set([...added, ...updated].map(e => e.locale))
    const timestamp = Date.now()
    for (const code of affectedLocales) {
      const srcPath = path.join(MESSAGES_DIR, `${code}.json`)
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(VERSIONS_DIR, `${code}_${timestamp}.json`))
      }
    }

    // Apply changes
    for (const entry of [...added, ...updated]) {
      if (!allMessages[entry.locale][entry.namespace]) {
        allMessages[entry.locale][entry.namespace] = {}
      }
      setNestedValue(
        allMessages[entry.locale][entry.namespace] as Record<string, unknown>,
        entry.key,
        entry.value
      )
    }

    // Write updated files
    for (const code of affectedLocales) {
      const filePath = path.join(MESSAGES_DIR, `${code}.json`)
      fs.writeFileSync(filePath, JSON.stringify(allMessages[code], null, 2) + '\n', 'utf-8')
    }

    // Log to changelog
    try {
      let changelog: unknown[] = []
      if (fs.existsSync(CHANGELOG_PATH)) {
        changelog = JSON.parse(fs.readFileSync(CHANGELOG_PATH, 'utf-8'))
      }

      changelog.unshift({
        id: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        action: 'import',
        locale: Array.from(affectedLocales).join(','),
        namespace: '*',
        key: '*',
        oldValue: '',
        newValue: `Imported ${added.length} new + ${updated.length} updated`,
        author: 'admin',
        source: 'imported',
      })

      const trimmed = (changelog as unknown[]).slice(0, 500)
      fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(trimmed, null, 2) + '\n', 'utf-8')
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      result: previewResult,
      snapshotCreated: true,
    })
  } catch (error) {
    console.error('[Import API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to import' },
      { status: 500 }
    )
  }
}
