import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET() {
  try {
    // Use raw SQL to update
    const result = await prisma.$executeRaw`
      UPDATE "RentalHost" 
      SET "hostType" = 'PLATFORM',
          "approvalStatus" = 'APPROVED',
          "dashboardAccess" = false,
          "active" = true
      WHERE "hostType" = 'PENDING'
    `
    
    // Update emails
    const emailResult = await prisma.$executeRaw`
      UPDATE "RentalHost" 
      SET "email" = REPLACE("email", '@example.com', '@itwhip.com')
      WHERE "email" LIKE '%@example.com'
    `
    
    return NextResponse.json({
      success: true,
      hostsUpdated: result,
      emailsFixed: emailResult
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
