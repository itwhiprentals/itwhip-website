import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await prisma.rentalBooking.findUnique({
    where: { id },
    select: { endTripWizardStep: true }
  })
  return NextResponse.json({ step: booking?.endTripWizardStep ?? null })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await verifyRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { step } = await request.json()
  if (typeof step !== 'number') return NextResponse.json({ error: 'Invalid step' }, { status: 400 })

  await prisma.rentalBooking.update({ where: { id }, data: { endTripWizardStep: step } })
  console.log(`[WizardStep] ${id} → step ${step}`)
  return NextResponse.json({ success: true })
}
