// app/fleet/api/language/remove-language/route.ts
// Remove Language API — archives a language file (does not delete)
// Phase 4 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

// Append to changelog
function appendChangelog(entry: Record<string, unknown>) {
  const changelogPath = path.join(process.cwd(), 'messages', '.changelog.json')
  let changelog: Record<string, unknown>[] = []
  try {
    if (fs.existsSync(changelogPath)) {
      changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'))
    }
  } catch { /* start fresh */ }
  changelog.unshift({ id: `chg_${Date.now()}`, timestamp: new Date().toISOString(), ...entry })
  if (changelog.length > 500) changelog = changelog.slice(0, 500)
  fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, confirmName } = body

    if (!code) {
      return NextResponse.json({ error: 'Missing required field: code' }, { status: 400 })
    }

    if (code === 'en') {
      return NextResponse.json({ error: 'Cannot remove the default English language' }, { status: 400 })
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const filePath = path.join(messagesDir, `${code}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Language file not found: ${code}.json` }, { status: 404 })
    }

    // Require confirmation by typing the language name
    if (!confirmName) {
      return NextResponse.json(
        { error: 'Confirmation required. Include confirmName field with the language name.' },
        { status: 400 }
      )
    }

    // Archive the file (rename to .archived)
    const archivePath = path.join(messagesDir, `${code}.json.archived`)
    fs.renameSync(filePath, archivePath)

    appendChangelog({
      action: 'remove-language',
      code,
      confirmName,
      archivedTo: `${code}.json.archived`,
    })

    return NextResponse.json({
      success: true,
      code,
      archivedTo: `${code}.json.archived`,
      message: `Language ${code} has been archived. The file can be restored by renaming ${code}.json.archived back to ${code}.json.`,
      manualSteps: [
        `Remove '${code}' from locales array in i18n/routing.ts`,
        `Remove '${code}' from middleware.ts locale detection`,
        `Remove ${code} option from LanguageSwitcher.tsx`,
        'Deploy changes to apply',
      ],
    })
  } catch (error) {
    console.error('[Remove Language API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove language' },
      { status: 500 }
    )
  }
}
