import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const req = await p.reservationRequest.findUnique({
    where: { id: 'cmm8d0z7d0000c9v0mw61xu31' },
    include: { invitedProspects: true }
  })
  console.log('=== REQUEST ===')
  console.log(JSON.stringify({
    id: req?.id,
    status: req?.status,
    guestName: req?.guestName,
    guestEmail: req?.guestEmail,
    guestPhone: req?.guestPhone,
    startDate: req?.startDate,
    endDate: req?.endDate,
    fulfilledBookingId: req?.fulfilledBookingId,
  }, null, 2))

  if (req?.invitedProspects && req.invitedProspects.length > 0) {
    const pr = req.invitedProspects[0]
    console.log('\n=== PROSPECT ===')
    console.log(JSON.stringify({
      id: pr.id,
      hostId: pr.hostId,
      status: pr.status,
      agreementPreference: pr.agreementPreference,
      paymentPreference: pr.paymentPreference,
      carId: pr.carId,
    }, null, 2))
  }

  const booking = await p.rentalBooking.findUnique({
    where: { id: 'bd8a055c-8a18-4e3e-8023-7b66366e57dc' },
    include: { renter: { include: { reviewerProfile: true } } }
  })
  console.log('\n=== BOOKING ===')
  const hasRP = booking?.renter?.reviewerProfile ? true : false
  console.log(JSON.stringify({
    id: booking?.id,
    status: booking?.status,
    startDate: booking?.startDate,
    endDate: booking?.endDate,
    renterId: booking?.renterId,
    carId: booking?.carId,
    hostId: booking?.hostId,
    agreementStatus: booking?.agreementStatus,
    paymentType: booking?.paymentType,
    guestName: booking?.guestName,
    guestEmail: booking?.guestEmail,
    renterName: booking?.renter?.name,
    renterEmail: booking?.renter?.email,
    hasReviewerProfile: hasRP,
    reviewerProfileId: booking?.renter?.reviewerProfile?.id || null,
  }, null, 2))

  await p.$disconnect()
}
main()
