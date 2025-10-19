import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendHostVerificationEmail } from '@/app/lib/email'

export async function POST(request) {
  try {
    const { hostId } = await request.json()
    
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })
    
    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const token = Buffer.from(`${hostId}:${code}`).toString('base64')
    
    await prisma.activityLog.create({
      data: {
        entityType: 'HOST',
        entityId: hostId,
        action: 'VERIFICATION_REQUESTED',
        metadata: {
          code,
          token,
          verificationType: 'email'
        }
      }
    })
    
    const emailResult = await sendHostVerificationEmail(host.email, {
      hostName: host.name,
      verificationType: 'email',
      verificationCode: code,
      verificationUrl: `http://localhost:3000/verify?token=${token}`,
      expiresInMinutes: 15
    })
    
    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      code,
      checkEmail: host.email
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint ready' })
}
