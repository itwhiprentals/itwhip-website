// app/(guest)/rentals/business/page.tsx
import { Metadata } from 'next'
import prisma from '@/app/lib/database/prisma'
import UseCasePage from '@/app/(guest)/rentals/components/UseCasePage'
import { getUseCaseBySlug } from '@/app/lib/data/use-cases'

export const revalidate = 60

const useCaseData = getUseCaseBySlug('business')!

export const metadata: Metadata = {
  title: useCaseData.metaTitle,
  description: useCaseData.metaDescription,
  openGraph: {
    title: useCaseData.metaTitle,
    description: useCaseData.metaDescription,
    url: 'https://itwhip.com/rentals/business',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/business',
  },
}

export default async function BusinessPage() {
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      carType: { in: useCaseData.filters.carTypes }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      seats: true,
      dailyRate: true,
      city: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
    },
    orderBy: [
      { rating: 'desc' },
      { dailyRate: 'desc' }
    ],
    take: 24
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : 75
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : 250

  return (
    <UseCasePage
      useCaseData={useCaseData}
      cars={cars}
      totalCars={totalCars}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  )
}
