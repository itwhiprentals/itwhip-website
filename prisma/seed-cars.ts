// prisma/seed-cars.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Check if host already exists
  let erickHost = await prisma.rentalHost.findUnique({
    where: { email: "erick@example.com" }
  })

  // If not, create the host
  if (!erickHost) {
    erickHost = await prisma.rentalHost.create({
      data: {
        name: "Erick Nick",
        email: "erick@example.com",
        phone: "602-555-0001",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85255",
        isVerified: true,
        responseTime: 30,
        responseRate: 95,
        totalTrips: 0,
        rating: 5.0,
        bio: "Luxury and exotic car enthusiast. Treat my cars with respect and enjoy the ride!",
        profilePhoto: null,
        active: true
      }
    })
  }

  // Create Lamborghini Huracan
  const lambo = await prisma.rentalCar.create({
    data: {
      hostId: erickHost.id,
      source: 'p2p',
      make: 'Lamborghini',
      model: 'Huracan LP 580-2 Spyder',
      year: 2017,
      color: "Pearl White",  // ADD THIS LINE
      carType: 'CONVERTIBLE',
      seats: 2,
      doors: 2,
      transmission: 'AUTOMATIC',
      fuelType: 'PREMIUM',
      mpgCity: 14,
      mpgHighway: 21,
      dailyRate: 999,
      weeklyRate: 6293,
      monthlyRate: 23976,
      deliveryFee: 150,
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      address: "North Scottsdale",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85255",
      latitude: 33.6054,
      longitude: -111.9258,
      features: "Convertible, Apple CarPlay, Bluetooth, Premium Sound, Leather Seats, Navigation, Backup Camera, Sport Mode, Carbon Fiber Interior",
      rules: "No smoking. Must be 25+ to book. Valid driver's license and insurance required. 200 miles/day included, $3/mile after.",
      insuranceIncluded: false,
      insuranceDaily: 99,
      minTripDuration: 1,
      maxTripDuration: 30,
      advanceNotice: 24,
      airportPickup: true,
      hotelDelivery: true,
      homeDelivery: true,
      isActive: true,
      instantBook: true,
      totalTrips: 0,
      rating: 0
    }
  })

  // Add all 14 photos
  const photos = [
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0324_kgt9ne.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0319_vlhz1u.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0325_dmgjrf.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0327_n6xqba.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178755/IMG_0318_o4ofpx.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178755/IMG_0322_eghub8.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178755/IMG_0321_vvvpkg.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178755/IMG_0320_xc29rc.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178755/IMG_0311_oxmgzq.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178754/IMG_0310_jzpcnc.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178754/IMG_0309_inrkhd.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178753/IMG_0314_mpmvwo.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178751/IMG_0313_clprt2.jpg",
    "https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178751/IMG_0316_s9l62q.jpg"
  ]

  for (let i = 0; i < photos.length; i++) {
    await prisma.rentalCarPhoto.create({
      data: {
        carId: lambo.id,
        url: photos[i],
        order: i,
        caption: i === 0 ? "Front exterior view" : null
      }
    })
  }

  console.log(`✅ Created/Found host: ${erickHost.name} (${erickHost.id})`)
  console.log(`✅ Created car: ${lambo.year} ${lambo.make} ${lambo.model} (${lambo.id})`)
  console.log(`✅ Added ${photos.length} photos`)
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })