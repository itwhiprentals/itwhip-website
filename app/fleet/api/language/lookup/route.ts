// app/fleet/api/language/lookup/route.ts
// Translation Lookup API — look up keys across all languages
// Phase 1 of Fleet Language Admin

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

// Get all leaf key paths from a nested object
function getLeafKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getLeafKeyPaths(val as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const namespace = searchParams.get('namespace')
    const key = searchParams.get('key')

    if (!namespace) {
      return NextResponse.json(
        { error: 'namespace parameter is required' },
        { status: 400 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    // Load all message files
    const allMessages: Record<string, Record<string, unknown>> = {}
    for (const code of localeCodes) {
      const filePath = path.join(messagesDir, `${code}.json`)
      const content = fs.readFileSync(filePath, 'utf-8')
      allMessages[code] = JSON.parse(content)
    }

    if (key) {
      // Lookup specific key across all languages
      const values: Record<string, string> = {}
      for (const code of localeCodes) {
        const nsObj = allMessages[code]?.[namespace] as Record<string, unknown> | undefined
        if (nsObj) {
          const val = getNestedValue(nsObj, key)
          values[code] = typeof val === 'string' ? val : ''
        } else {
          values[code] = ''
        }
      }

      return NextResponse.json({
        namespace,
        key,
        values,
      })
    } else {
      // Return all keys in namespace (for autocomplete / browsing)
      const enNs = allMessages['en']?.[namespace] as Record<string, unknown> | undefined
      if (!enNs) {
        return NextResponse.json(
          { error: `Namespace '${namespace}' not found` },
          { status: 404 }
        )
      }

      const keys = getLeafKeyPaths(enNs)

      // Optionally include values for all languages
      const includeValues = searchParams.get('values') === 'true'

      if (includeValues) {
        const entries = keys.map(k => {
          const values: Record<string, string> = {}
          for (const code of localeCodes) {
            const nsObj = allMessages[code]?.[namespace] as Record<string, unknown> | undefined
            if (nsObj) {
              const val = getNestedValue(nsObj, k)
              values[code] = typeof val === 'string' ? val : ''
            } else {
              values[code] = ''
            }
          }
          return { key: k, values }
        })

        return NextResponse.json({
          namespace,
          totalKeys: keys.length,
          locales: localeCodes,
          entries,
        })
      }

      return NextResponse.json({
        namespace,
        totalKeys: keys.length,
        keys,
      })
    }
  } catch (error) {
    console.error('[Language Lookup API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup translation' },
      { status: 500 }
    )
  }
}
