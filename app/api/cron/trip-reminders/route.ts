// app/api/cron/trip-reminders/route.ts
// Push notifications for trips starting/ending within 1 hour
// Runs every 30 minutes via EventBridge → Lambda

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { NotificationTemplates } from '@/app/lib/notifications/push'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000)
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  let startReminders = 0
  let endReminders = 0

  try {
    // Trips starting in 30-60 min
    const startingSoon = await prisma.rentalBooking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: { gte: thirtyMinFromNow, lte: oneHourFromNow },
        pickupReminderSent: false,
      },
      select: { id: true, renterId: true, car: { select: { year: true, make: true, model: true } } },
    })

    for (const booking of startingSoon) {
      if (booking.renterId) {
        const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        await NotificationTemplates.tripStartingSoon(booking.renterId, carName, booking.id)
        await prisma.rentalBooking.update({ where: { id: booking.id }, data: { pickupReminderSent: true } })
        startReminders++
      }
    }

    // Trips ending in 30-60 min
    const endingSoon = await prisma.rentalBooking.findMany({
      where: {
        status: 'CONFIRMED',
        tripStatus: 'ACTIVE',
        endDate: { gte: thirtyMinFromNow, lte: oneHourFromNow },
        returnReminder3hSent: false,
      },
      select: { id: true, renterId: true, car: { select: { year: true, make: true, model: true } } },
    })

    for (const booking of endingSoon) {
      if (booking.renterId) {
        const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        await NotificationTemplates.tripEndingSoon(booking.renterId, carName, booking.id)
        await prisma.rentalBooking.update({ where: { id: booking.id }, data: { returnReminder3hSent: true } })
        endReminders++
      }
    }

    return NextResponse.json({ success: true, startReminders, endReminders })
  } catch (error) {
    console.error('[Trip Reminders] Error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
