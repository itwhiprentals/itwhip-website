// app/fleet/api/language/export/route.ts
// Export API — download translations as JSON, CSV, or XLIFF
// Phase 5 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const MESSAGES_DIR = path.join(process.cwd(), 'messages')

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

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const format = searchParams.get('format') || 'json'
    const filter = searchParams.get('filter') || 'all' // all, missing, namespace
    const namespace = searchParams.get('namespace')
    const locale = searchParams.get('locale')

    // Load all message files
    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))
    const targetLocales = locale ? [locale] : localeCodes

    const allMessages: Record<string, Record<string, unknown>> = {}
    for (const code of localeCodes) {
      const filePath = path.join(MESSAGES_DIR, `${code}.json`)
      allMessages[code] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }

    const enMessages = allMessages['en'] || {}
    const enNamespaces = namespace ? [namespace] : Object.keys(enMessages)

    // Build flat entries: namespace, key, values per locale
    type ExportEntry = { namespace: string; key: string; values: Record<string, string> }
    const entries: ExportEntry[] = []

    for (const ns of enNamespaces) {
      const enNs = enMessages[ns]
      if (!enNs || typeof enNs !== 'object') continue

      const enEntries = getLeafEntries(enNs as Record<string, unknown>)

      for (const [key, enValue] of enEntries) {
        const values: Record<string, string> = { en: enValue }

        for (const code of targetLocales) {
          if (code === 'en') continue
          const localeNs = allMessages[code]?.[ns]
          if (localeNs && typeof localeNs === 'object') {
            const localeEntries = getLeafEntries(localeNs as Record<string, unknown>)
            const found = localeEntries.find(([k]) => k === key)
            values[code] = found ? found[1] : ''
          } else {
            values[code] = ''
          }
        }

        // Apply filter
        if (filter === 'missing') {
          const hasMissing = targetLocales.some(c => c !== 'en' && !values[c])
          if (!hasMissing) continue
        }

        entries.push({ namespace: ns, key, values })
      }
    }

    if (format === 'csv') {
      const csvLocales = targetLocales.filter(c => c !== 'en' || targetLocales.length === 1)
      const includeEn = true
      const headers = ['Namespace', 'Key']
      if (includeEn) headers.push('EN')
      for (const code of csvLocales) {
        if (code !== 'en') headers.push(code.toUpperCase())
      }

      const rows = [headers.join(',')]
      for (const entry of entries) {
        const row = [escapeCsv(entry.namespace), escapeCsv(entry.key)]
        if (includeEn) row.push(escapeCsv(entry.values['en'] || ''))
        for (const code of csvLocales) {
          if (code !== 'en') row.push(escapeCsv(entry.values[code] || ''))
        }
        rows.push(row.join(','))
      }

      const csv = rows.join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="itwhip-translations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    if (format === 'xliff') {
      // XLIFF 1.2 format
      const targetLang = locale || 'es'
      let xliff = `<?xml version="1.0" encoding="UTF-8"?>\n`
      xliff += `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">\n`

      for (const ns of enNamespaces) {
        const nsEntries = entries.filter(e => e.namespace === ns)
        if (nsEntries.length === 0) continue

        xliff += `  <file original="${ns}" source-language="en" target-language="${targetLang}" datatype="plaintext">\n`
        xliff += `    <body>\n`

        for (const entry of nsEntries) {
          const id = `${entry.namespace}.${entry.key}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const source = (entry.values['en'] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const target = (entry.values[targetLang] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const state = target ? 'translated' : 'new'

          xliff += `      <trans-unit id="${id}">\n`
          xliff += `        <source>${source}</source>\n`
          xliff += `        <target state="${state}">${target}</target>\n`
          xliff += `      </trans-unit>\n`
        }

        xliff += `    </body>\n`
        xliff += `  </file>\n`
      }

      xliff += `</xliff>\n`

      return new NextResponse(xliff, {
        headers: {
          'Content-Type': 'application/xliff+xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="itwhip-translations-${targetLang}-${new Date().toISOString().split('T')[0]}.xliff"`,
        },
      })
    }

    // Default: JSON format
    const jsonExport: Record<string, Record<string, Record<string, string>>> = {}
    for (const entry of entries) {
      if (!jsonExport[entry.namespace]) jsonExport[entry.namespace] = {}
      jsonExport[entry.namespace][entry.key] = entry.values
    }

    return NextResponse.json({
      format: 'json',
      totalEntries: entries.length,
      locales: targetLocales,
      filter,
      data: jsonExport,
    })
  } catch (error) {
    console.error('[Export API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    )
  }
}
