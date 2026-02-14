// app/fleet/api/language/quality/route.ts
// Quality Check API — scans for translation issues
// Phase 1 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

type Severity = 'error' | 'warning' | 'info'

interface QualityIssue {
  severity: Severity
  check: string
  locale: string
  namespace: string
  key: string
  enValue: string
  localeValue: string
  message: string
}

// Get all leaf entries from a nested object as [path, value] pairs
function getLeafEntries(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  const entries: [string, string][] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...getLeafEntries(val as Record<string, unknown>, fullKey))
    } else if (typeof val === 'string') {
      entries.push([fullKey, val])
    }
  }
  return entries
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

// Extract {variables} from a string
function extractVariables(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g)
  return matches ? matches.sort() : []
}

// Extract HTML tags from a string
function extractHtmlTags(str: string): string[] {
  const matches = str.match(/<\/?[a-zA-Z][^>]*>/g)
  return matches ? matches.sort() : []
}

// Check ICU syntax validity (basic check)
function hasICUSyntaxError(str: string): boolean {
  // Check for unbalanced braces in plural/select
  let depth = 0
  for (const ch of str) {
    if (ch === '{') depth++
    if (ch === '}') depth--
    if (depth < 0) return true
  }
  if (depth !== 0) return true

  // Check for common plural/select issues
  const pluralMatch = str.match(/\{[^,]+,\s*plural\s*,/)
  if (pluralMatch) {
    // Ensure it has at least 'other' case
    if (!str.includes('other{') && !str.includes('other {')) {
      return true
    }
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const enMessages = allMessages['en'] || {}
    const enNamespaces = Object.keys(enMessages)
    const nonEnLocales = localeCodes.filter(c => c !== 'en')

    const issues: QualityIssue[] = []

    for (const ns of enNamespaces) {
      const enNs = (enMessages[ns] as Record<string, unknown>) || {}
      const enEntries = getLeafEntries(enNs)

      for (const locale of nonEnLocales) {
        const localeNs = (allMessages[locale]?.[ns] as Record<string, unknown>) || {}

        for (const [keyPath, enValue] of enEntries) {
          const localeVal = getNestedValue(localeNs, keyPath)
          const localeValue = typeof localeVal === 'string' ? localeVal : ''

          // Skip if no locale value exists (that's a coverage issue, not quality)
          if (localeValue === '' && localeVal === undefined) continue

          // Check 1: Empty values (key exists but empty)
          if (localeValue === '' && localeVal !== undefined) {
            issues.push({
              severity: 'warning',
              check: 'empty',
              locale,
              namespace: ns,
              key: keyPath,
              enValue,
              localeValue,
              message: 'Translation exists but is empty',
            })
            continue
          }

          // Check 2: Missing variables
          const enVars = extractVariables(enValue)
          const localeVars = extractVariables(localeValue)
          if (enVars.length > 0) {
            const missingVars = enVars.filter(v => !localeVars.includes(v))
            if (missingVars.length > 0) {
              issues.push({
                severity: 'error',
                check: 'missing_variables',
                locale,
                namespace: ns,
                key: keyPath,
                enValue,
                localeValue,
                message: `Missing variables: ${missingVars.join(', ')}`,
              })
            }
          }

          // Check 3: ICU syntax errors
          if (enValue.includes(', plural,') || enValue.includes(', select,')) {
            if (hasICUSyntaxError(localeValue)) {
              issues.push({
                severity: 'error',
                check: 'icu_syntax',
                locale,
                namespace: ns,
                key: keyPath,
                enValue,
                localeValue,
                message: 'ICU plural/select syntax error',
              })
            }
          }

          // Check 4: HTML tag mismatch
          const enTags = extractHtmlTags(enValue)
          const localeTags = extractHtmlTags(localeValue)
          if (enTags.length > 0 && JSON.stringify(enTags) !== JSON.stringify(localeTags)) {
            issues.push({
              severity: 'warning',
              check: 'html_mismatch',
              locale,
              namespace: ns,
              key: keyPath,
              enValue,
              localeValue,
              message: `HTML tags don't match EN. EN: ${enTags.join('')}, ${locale.toUpperCase()}: ${localeTags.join('') || '(none)'}`,
            })
          }

          // Check 5: Untranslated (value identical to English)
          // Only flag if the value is multi-word (single words often legitimately match)
          if (localeValue === enValue && enValue.includes(' ') && enValue.length > 5) {
            issues.push({
              severity: 'warning',
              check: 'untranslated',
              locale,
              namespace: ns,
              key: keyPath,
              enValue,
              localeValue,
              message: 'Value identical to English — likely untranslated',
            })
          }

          // Check 6: Length variance (>2x longer)
          if (localeValue.length > enValue.length * 2 && enValue.length > 10) {
            issues.push({
              severity: 'info',
              check: 'length_warning',
              locale,
              namespace: ns,
              key: keyPath,
              enValue,
              localeValue,
              message: `Translation is ${Math.round(localeValue.length / enValue.length)}x longer than English (${localeValue.length} vs ${enValue.length} chars)`,
            })
          }

          // Check 7: Trailing/leading spaces
          if (localeValue !== localeValue.trim()) {
            issues.push({
              severity: 'info',
              check: 'trailing_spaces',
              locale,
              namespace: ns,
              key: keyPath,
              enValue,
              localeValue,
              message: 'Has leading or trailing whitespace',
            })
          }
        }
      }
    }

    // Group summary
    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      byLocale: {} as Record<string, number>,
      byCheck: {} as Record<string, number>,
    }

    for (const locale of nonEnLocales) {
      summary.byLocale[locale] = issues.filter(i => i.locale === locale).length
    }

    const checkTypes = ['missing_variables', 'icu_syntax', 'empty', 'untranslated', 'html_mismatch', 'length_warning', 'trailing_spaces']
    for (const check of checkTypes) {
      const count = issues.filter(i => i.check === check).length
      if (count > 0) summary.byCheck[check] = count
    }

    return NextResponse.json({
      issues,
      summary,
    })
  } catch (error) {
    console.error('[Language Quality API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to run quality checks' },
      { status: 500 }
    )
  }
}
