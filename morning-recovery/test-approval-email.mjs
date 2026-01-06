import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testApprovalEmail() {
  const bookingId = 'cmewh3hz30002dodjbim841fn'
  const testEmail = 'hxris08@gmail.com'
  
  try {
    // First, update the booking to use your test email
    const booking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        guestEmail: testEmail,
        guestName: 'Test User'
      },
      include: {
        car: {
          include: {
            host: true,
            photos: true
          }
        }
      }
    })
    
    console.log('Updated booking email to:', testEmail)
    
    // Now trigger the approval through the API
    const response = await fetch('http://localhost:3000/api/rentals/verify/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookingId,
        approved: true,
        reviewNotes: 'Test approval - documents verified',
        adminId: 'admin@itwhip.com'
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Approval email sent to:', testEmail)
      console.log('Result:', result)
    } else {
      const error = await response.text()
      console.error('Failed to send approval:', error)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApprovalEmail()
