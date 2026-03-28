import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  console.log('=== APPLYING CAR DATA FIXES ===\n')

  const fixes: { id: string; label: string; data: Record<string, any> }[] = [
    // Honda Accord 2025 — fuelType
    { id: 'a3602aae-8f8c-42b6-a5f2-3873064429cc', label: '2025 Honda Accord SE', data: { fuelType: 'REGULAR' } },
    // Honda Accord 2015 — doors
    { id: 'cmk52adnb0001jv04ys7lyfyg', label: '2015 Honda Accord EX-L V6', data: { doors: 4 } },
    // Hyundai Tucson — trans, type, fuel
    { id: 'cmjqu5bh40003ie04urxebz37', label: '2026 Hyundai Tucson (INACTIVE)', data: { transmission: 'AUTOMATIC', carType: 'SUV', fuelType: 'HYBRID' } },
    // Kia EV6 — trim
    { id: 'cmjtsww330001dou8dxks87m7', label: '2022 Kia EV6', data: { trim: 'Wind' } },
    // Lambo Urus — trans, type, fuel
    { id: 'cmjxaaj1k0003l604ey3nqnnt', label: '2020 Lamborghini Urus (INACTIVE)', data: { transmission: 'AUTOMATIC', carType: 'SUV', fuelType: 'PREMIUM' } },
    // Land Rover RR Sport — fuel
    { id: 'd2239900-df53-4da8-9744-223bfffeee3e', label: '2019 Land Rover RR Sport', data: { fuelType: 'PREMIUM' } },
    // Mazda CX-5 — trans, type, fuel
    { id: 'cmj8w2w20001edoq9kmfh7ju3', label: '2020 Mazda CX-5 (INACTIVE)', data: { transmission: 'AUTOMATIC', carType: 'SUV', fuelType: 'REGULAR' } },
    // Nissan Altima — trans, type (SEDAN), fuel
    { id: 'cmj8w1yfp0014doq9mt2ojq62', label: '2021 Nissan Altima (INACTIVE)', data: { transmission: 'AUTOMATIC', carType: 'SEDAN', fuelType: 'REGULAR' } },
    // Nissan Maxima — trans, fuel
    { id: 'cmk684k0s0003l204pvfah2h1', label: '2014 Nissan Maxima (INACTIVE)', data: { transmission: 'AUTOMATIC', fuelType: 'REGULAR' } },
    // Nissan Sentra 2019 — trans, type, fuel
    { id: '89fd408e-87e6-4ec9-b379-2142fca6cca7', label: '2019 Nissan Sentra SV', data: { transmission: 'AUTOMATIC', carType: 'SEDAN', fuelType: 'REGULAR' } },
    // Rolls-Royce Ghost — make, trans, type, fuel, trim
    { id: '37feebbe-62f2-4375-b038-2ee4e00befe9', label: '2024 Rolls-Royce Ghost (INACTIVE)', data: { make: 'Rolls-Royce', transmission: 'AUTOMATIC', carType: 'LUXURY', fuelType: 'PREMIUM', trim: '' } },
    // Toyota Prius — doors
    { id: 'cmjung7tf0001jq04h1h9h3d3', label: '2018 Toyota Prius', data: { doors: 4 } },
    // MINI stays as MINI (official brand name) — NO CHANGE
    // AMG GT already fixed (trim: C, fuelType: PREMIUM) — already done above
    // Prius Prime already fixed (doors: 4) — already done above
  ]

  for (const fix of fixes) {
    try {
      await p.rentalCar.update({ where: { id: fix.id }, data: fix.data })
      console.log(`✓ ${fix.label}: ${JSON.stringify(fix.data)}`)
    } catch (e: any) {
      console.log(`✗ ${fix.label}: ${e.message?.slice(0, 120)}`)
    }
  }

  console.log(`\nDone.`)
  await p.$disconnect()
}
main()
