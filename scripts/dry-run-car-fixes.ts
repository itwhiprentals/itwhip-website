import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

function properCase(make: string): string {
  return make.split(/([\s-])/).map(w => {
    if (w === ' ' || w === '-') return w
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  }).join('')
}

async function main() {
  const cars = await p.rentalCar.findMany({
    select: { id: true, year: true, make: true, model: true, trim: true, transmission: true, carType: true, fuelType: true, seats: true, doors: true, isActive: true },
    orderBy: [{ make: 'asc' }, { model: 'asc' }]
  })

  console.log('=== DRY RUN — NO CHANGES WILL BE MADE ===\n')
  let carsWithChanges = 0

  for (const c of cars) {
    const changes: string[] = []

    // Make: all-caps → proper case (only if 4+ chars and all uppercase)
    if (c.make === c.make.toUpperCase() && c.make.length > 3) {
      const proper = properCase(c.make)
      if (proper !== c.make) {
        changes.push(`make: "${c.make}" → "${proper}"`)
      }
    }

    // Transmission: lowercase → UPPERCASE
    if (c.transmission && c.transmission !== c.transmission.toUpperCase()) {
      changes.push(`transmission: "${c.transmission}" → "${c.transmission.toUpperCase()}"`)
    }

    // carType: fix non-standard values
    if (c.carType) {
      const typeMap: Record<string, string> = { midsize: 'SUV' }
      const lower = c.carType.toLowerCase()
      if (c.carType !== c.carType.toUpperCase()) {
        const fix = typeMap[lower] || c.carType.toUpperCase()
        changes.push(`carType: "${c.carType}" → "${fix}"`)
      }
    }

    // fuelType: normalize
    if (c.fuelType) {
      const fuelMap: Record<string, string> = { gas: 'REGULAR', gasoline: 'REGULAR' }
      const lower = c.fuelType.toLowerCase()
      const fix = fuelMap[lower] || c.fuelType.toUpperCase()
      if (fix !== c.fuelType) {
        changes.push(`fuelType: "${c.fuelType}" → "${fix}"`)
      }
    }

    // Specific fuel: AMG GT and Range Rover Sport need PREMIUM not REGULAR
    if (c.make.includes('Mercedes') && c.model === 'AMG GT' && c.fuelType?.toLowerCase() === 'gas') {
      // Override the REGULAR → PREMIUM
      const idx = changes.findIndex(ch => ch.startsWith('fuelType:'))
      if (idx >= 0) changes[idx] = `fuelType: "${c.fuelType}" → "PREMIUM" (AMG GT needs premium)`
    }
    if (c.model === 'Range Rover Sport' && c.fuelType?.toLowerCase() === 'gas') {
      const idx = changes.findIndex(ch => ch.startsWith('fuelType:'))
      if (idx >= 0) changes[idx] = `fuelType: "${c.fuelType}" → "PREMIUM" (RR Sport needs premium)`
    }

    // Trim fixes
    if (c.trim === 'Light, Wind, GT-Line') changes.push(`trim: "${c.trim}" → "Wind"`)
    if (c.trim === 'AMG GT C') changes.push(`trim: "AMG GT C" → "C"`)
    if (c.trim === 'RR') changes.push(`trim: "RR" → "" (not a real trim)`)

    // Door fixes
    if (c.model === 'Accord' && c.year === 2015 && c.doors === 2) changes.push('doors: 2 → 4')
    if (c.model?.includes('Prius') && c.doors === 5) changes.push('doors: 5 → 4')

    if (changes.length > 0) {
      const status = c.isActive ? 'ACTIVE' : 'INACTIVE'
      console.log(`${c.year} ${c.make} ${c.model} ${c.trim || ''}  [${status}]`)
      for (const ch of changes) console.log(`  → ${ch}`)
      console.log()
      carsWithChanges++
    }
  }

  console.log('=== SUMMARY ===')
  console.log(`Total cars: ${cars.length}`)
  console.log(`Cars needing fixes: ${carsWithChanges}`)
  console.log(`Cars already clean: ${cars.length - carsWithChanges}`)
  console.log('\n=== END DRY RUN — NOTHING WAS CHANGED ===')
  await p.$disconnect()
}
main()
