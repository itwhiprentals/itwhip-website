const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getStats() {
  const totalReviews = await prisma.rentalReview.count({ where: { isVisible: true } })
  const avgRating = await prisma.rentalReview.aggregate({
    where: { isVisible: true },
    _avg: { rating: true },
    _count: { rating: true }
  })
  
  // Get category breakdown
  const economyReviews = await prisma.rentalReview.count({
    where: { 
      isVisible: true,
      car: { dailyRate: { lt: 75 } }
    }
  })
  
  const suvReviews = await prisma.rentalReview.count({
    where: { 
      isVisible: true,
      car: { dailyRate: { gte: 75, lt: 150 } }
    }
  })
  
  const luxuryReviews = await prisma.rentalReview.count({
    where: { 
      isVisible: true,
      car: { dailyRate: { gte: 150 } }
    }
  })
  
  console.log('=== REVIEW STATISTICS ===')
  console.log('Total Reviews:', totalReviews)
  console.log('Average Rating:', avgRating._avg.rating?.toFixed(1))
  console.log('Rating Count:', avgRating._count.rating)
  console.log('')
  console.log('=== BY CATEGORY ===')
  console.log('Economy (<$75/day):', economyReviews)
  console.log('SUV/Mid ($75-150/day):', suvReviews)
  console.log('Luxury (>$150/day):', luxuryReviews)
  
  await prisma.$disconnect()
}

getStats()
