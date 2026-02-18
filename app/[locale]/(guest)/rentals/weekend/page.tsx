// app/(guest)/rentals/weekend/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import prisma from '@/app/lib/database/prisma'
import UseCasePage from '@/app/[locale]/(guest)/rentals/components/UseCasePage'
import { getUseCaseBySlug } from '@/app/lib/data/use-cases'

export const revalidate = 60

const useCaseData = getUseCaseBySlug('weekend')!

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('rentalsWeekendTitle'),
    description: t('rentalsWeekendDescription'),
    openGraph: {
      title: t('rentalsWeekendTitle'),
      description: t('rentalsWeekendDescription'),
      url: 'https://itwhip.com/rentals/weekend',
      type: 'website'
    },
    alternates: {
      canonical: 'https://itwhip.com/rentals/weekend',
    },
  }
}

export default async function WeekendPage() {
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
      { instantBook: 'desc' },
      { rating: 'desc' }
    ],
    take: 24
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : 49
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : 299

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
