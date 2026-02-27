// app/api/partner/onboarding/agreement/test/route.ts
// Send a test e-sign email to the host so they can preview the signing experience

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, generateEmailReference, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import {
  generateAgreementToken,
  getTokenExpiryDate,
  generateSigningUrl
} from '@/app/lib/agreements/tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        },
        cars: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/agreement/test - Send test e-sign email to host
export async function POST() {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host (recruitedVia is source of truth)
    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    const request = prospect.request
    if (!request) {
      return NextResponse.json(
        { error: 'No linked request found' },
        { status: 404 }
      )
    }

    // Check test count (max 2 tests)
    if (prospect.testEsignCount >= 2) {
      return NextResponse.json(
        { error: 'Maximum test limit reached (2/2)', testCount: prospect.testEsignCount },
        { status: 429 }
      )
    }

    // For OWN or BOTH preference, require uploaded agreement
    const pref = prospect.agreementPreference
    if ((pref === 'OWN' || pref === 'BOTH') && !prospect.hostAgreementUrl) {
      return NextResponse.json(
        { error: 'Please upload your rental agreement PDF first' },
        { status: 400 }
      )
    }

    // Generate agreement token for testing
    const agreementToken = generateAgreementToken()
    const expiresAt = getTokenExpiryDate(1) // 1 day for test

    // Store the test agreement token + increment count
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        testAgreementToken: agreementToken,
        testAgreementExpiresAt: expiresAt,
        testAgreementSentAt: new Date(),
        testEsignCount: { increment: 1 },
        lastActivityAt: new Date()
      }
    })

    // Generate signing URL
    const signingUrl = generateSigningUrl(agreementToken)

    // Get vehicle info
    const car = host.cars[0]
    const vehicleName = car
      ? `${car.year} ${car.make} ${car.model}`
      : (request as any).vehicleInfo || 'Your Vehicle'

    // Send test email to host
    const hostFirstName = host.name?.split(' ')[0] || 'Host'
    const emailRefId = generateEmailReference('TE')
    const testSubject = `[TEST] Preview Your E-Sign Experience — ${vehicleName}`

    // Build what-you'll-see list based on agreement preference
    const whatYoullSee: string[] = []
    if (pref !== 'OWN') whatYoullSee.push('ItWhip Standard Agreement terms')
    if (pref === 'OWN' || pref === 'BOTH') whatYoullSee.push('Your uploaded rental agreement')
    whatYoullSee.push('Signature capture area')

    let emailSent = false
    try {
      const emailResult = await sendEmail(
        host.email,
        testSubject,
        `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

            <!-- Header -->
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Test Preview</p>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">E-Sign Experience Preview</h1>
            </div>

            <!-- Test notice -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                <strong>This is a TEST email.</strong> Click below to see exactly what your guests will experience when signing agreements.
              </p>
            </div>

            <!-- Main content -->
            <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
              Hi ${hostFirstName},
            </p>

            <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
              You requested a preview of the e-signature experience for your <strong>${vehicleName}</strong>. This is what your guests will see when signing the rental agreement.
            </p>

            <!-- What you'll see -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
              ${whatYoullSee.map(item => `
              <tr>
                <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #16a34a; margin-right: 8px;">&#10003;</span> ${item}
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${signingUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Preview E-Sign Experience
              </a>
            </div>

            <p style="font-size: 14px; color: #111827; margin: 20px 0;">
              <strong>This test link expires in 24 hours.</strong> Your signature here won't create a real agreement.
            </p>

            ${getEmailFooterHtml(emailRefId)}
          </body>
        </html>
        `,
        `
TEST — E-SIGN EXPERIENCE PREVIEW

Hi ${hostFirstName},

This is a TEST email. Click below to see exactly what your guests will experience when signing agreements.

You requested a preview of the e-signature experience for your ${vehicleName}.

What you'll see:
${whatYoullSee.map(item => `- ${item}`).join('\n')}

Preview the signing experience: ${signingUrl}

This test link expires in 24 hours. Your signature here won't create a real agreement.

${getEmailFooterText(emailRefId)}
        `.trim()
      )

      emailSent = emailResult.success
      console.log(`[Test E-Sign] Email sent to ${host.email}`)

      await logEmail({
        recipientEmail: host.email,
        recipientName: host.name || 'Host',
        subject: testSubject,
        emailType: 'SYSTEM',
        relatedType: 'host_prospect',
        relatedId: prospect.id,
        messageId: emailResult.messageId,
        referenceId: emailRefId,
        metadata: { testEsignCount: prospect.testEsignCount + 1, vehicleName }
      })
    } catch (emailError) {
      console.error('[Test E-Sign] Email send error:', emailError)
    }

    return NextResponse.json({
      success: true,
      emailSent,
      sentTo: host.email,
      signingUrl,
      expiresAt,
      testCount: prospect.testEsignCount + 1,
      message: emailSent
        ? `Test e-sign email sent to ${host.email}`
        : `Test link generated but email failed. Try this URL: ${signingUrl}`
    })

  } catch (error: unknown) {
    console.error('[Test E-Sign API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send test e-sign' },
      { status: 500 }
    )
  }
}
