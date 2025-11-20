// scripts/seed-vehicle-classifications.ts

import prisma from '../app/lib/database/prisma'
import { VehicleCategory, RiskCategory } from '@prisma/client'

interface ClassificationData {
  make: string
  model: string
  year: number
  category: VehicleCategory
  riskLevel: RiskCategory
  baseValue: number
  baseRateMultiplier: number
  riskMultiplier: number
  isInsurable: boolean
  insurabilityReason?: string
  requiresManualReview: boolean
  features?: string[]
}

const classifications: ClassificationData[] = [
  // Economy vehicles
  { make: 'Honda', model: 'Civic', year: 2023, category: 'ECONOMY', riskLevel: 'LOW', baseValue: 24000, baseRateMultiplier: 0.8, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Toyota', model: 'Corolla', year: 2023, category: 'ECONOMY', riskLevel: 'LOW', baseValue: 22000, baseRateMultiplier: 0.8, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Nissan', model: 'Versa', year: 2023, category: 'ECONOMY', riskLevel: 'LOW', baseValue: 18000, baseRateMultiplier: 0.8, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  
  // Standard vehicles
  { make: 'Toyota', model: 'Camry', year: 2023, category: 'STANDARD', riskLevel: 'LOW', baseValue: 28000, baseRateMultiplier: 1.0, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Honda', model: 'Accord', year: 2023, category: 'STANDARD', riskLevel: 'LOW', baseValue: 30000, baseRateMultiplier: 1.0, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Mazda', model: 'CX-5', year: 2023, category: 'STANDARD', riskLevel: 'LOW', baseValue: 32000, baseRateMultiplier: 1.0, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Ford', model: 'F-150', year: 2023, category: 'STANDARD', riskLevel: 'MEDIUM', baseValue: 45000, baseRateMultiplier: 1.0, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false },
  
  // Premium vehicles
  { make: 'Tesla', model: 'Model 3', year: 2023, category: 'PREMIUM', riskLevel: 'MEDIUM', baseValue: 45000, baseRateMultiplier: 1.2, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false, features: ['electric', 'autopilot'] },
  { make: 'Tesla', model: 'Model Y', year: 2023, category: 'PREMIUM', riskLevel: 'MEDIUM', baseValue: 55000, baseRateMultiplier: 1.2, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false, features: ['electric', 'autopilot'] },
  { make: 'Audi', model: 'A4', year: 2023, category: 'PREMIUM', riskLevel: 'MEDIUM', baseValue: 52000, baseRateMultiplier: 1.2, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false },
  { make: 'BMW', model: '3 Series', year: 2023, category: 'PREMIUM', riskLevel: 'MEDIUM', baseValue: 54000, baseRateMultiplier: 1.2, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false },
  
  // Luxury vehicles
  { make: 'Mercedes-Benz', model: 'S-Class', year: 2023, category: 'LUXURY', riskLevel: 'MEDIUM', baseValue: 120000, baseRateMultiplier: 1.5, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false },
  { make: 'BMW', model: '7 Series', year: 2023, category: 'LUXURY', riskLevel: 'MEDIUM', baseValue: 115000, baseRateMultiplier: 1.5, riskMultiplier: 1.2, isInsurable: true, requiresManualReview: false },
  { make: 'Porsche', model: 'Cayenne', year: 2023, category: 'LUXURY', riskLevel: 'HIGH', baseValue: 95000, baseRateMultiplier: 1.5, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: false },
  { make: 'Tesla', model: 'Model S', year: 2023, category: 'LUXURY', riskLevel: 'HIGH', baseValue: 105000, baseRateMultiplier: 1.5, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: false, features: ['electric', 'autopilot', 'ludicrous_mode'] },
  
  // Performance/High Risk vehicles
  { make: 'BMW', model: 'M3', year: 2023, category: 'LUXURY', riskLevel: 'HIGH', baseValue: 85000, baseRateMultiplier: 1.5, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: true, features: ['sport_mode', 'performance_brakes'] },
  { make: 'Mercedes-Benz', model: 'AMG GT', year: 2023, category: 'LUXURY', riskLevel: 'HIGH', baseValue: 140000, baseRateMultiplier: 1.5, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: true, features: ['sport_mode', 'performance_brakes'] },
  { make: 'Porsche', model: '911', year: 2023, category: 'LUXURY', riskLevel: 'HIGH', baseValue: 125000, baseRateMultiplier: 1.5, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: true, features: ['sport_mode', 'performance_brakes'] },
  
  // Exotic vehicles
  { make: 'Ferrari', model: '488', year: 2022, category: 'EXOTIC', riskLevel: 'EXTREME', baseValue: 350000, baseRateMultiplier: 2.0, riskMultiplier: 2.0, isInsurable: true, requiresManualReview: true, insurabilityReason: 'Requires special underwriting' },
  { make: 'Lamborghini', model: 'Huracan', year: 2022, category: 'EXOTIC', riskLevel: 'EXTREME', baseValue: 280000, baseRateMultiplier: 2.0, riskMultiplier: 2.0, isInsurable: true, requiresManualReview: true, insurabilityReason: 'Requires special underwriting' },
  { make: 'McLaren', model: '720S', year: 2022, category: 'EXOTIC', riskLevel: 'EXTREME', baseValue: 320000, baseRateMultiplier: 2.0, riskMultiplier: 2.0, isInsurable: true, requiresManualReview: true, insurabilityReason: 'Requires special underwriting' },
  
  // Supercars (borderline insurable)
  { make: 'Bugatti', model: 'Chiron', year: 2022, category: 'SUPERCAR', riskLevel: 'EXTREME', baseValue: 3000000, baseRateMultiplier: 3.0, riskMultiplier: 2.0, isInsurable: false, requiresManualReview: true, insurabilityReason: 'Vehicle value exceeds maximum coverage limit' },
  
  // Common older vehicles
  { make: 'Toyota', model: 'Camry', year: 2018, category: 'STANDARD', riskLevel: 'LOW', baseValue: 18000, baseRateMultiplier: 1.0, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Honda', model: 'Civic', year: 2018, category: 'ECONOMY', riskLevel: 'LOW', baseValue: 16000, baseRateMultiplier: 0.8, riskMultiplier: 1.0, isInsurable: true, requiresManualReview: false },
  { make: 'Ford', model: 'Mustang', year: 2018, category: 'PREMIUM', riskLevel: 'HIGH', baseValue: 28000, baseRateMultiplier: 1.2, riskMultiplier: 1.5, isInsurable: true, requiresManualReview: false, features: ['sport_mode'] },
]

async function main() {
  console.log('🚗 Starting vehicle classification seed...')
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const data of classifications) {
    try {
      // Check if classification already exists
      const existing = await prisma.vehicleClassification.findFirst({
        where: {
          make: data.make,
          model: data.model,
          year: data.year,
          providerId: null // Global classifications
        }
      })
      
      if (existing) {
        // Update existing classification
        await prisma.vehicleClassification.update({
          where: { id: existing.id },
          data: {
            category: data.category,
            riskLevel: data.riskLevel,
            baseValue: data.baseValue,
            currentValue: data.baseValue,
            baseRateMultiplier: data.baseRateMultiplier,
            riskMultiplier: data.riskMultiplier,
            isInsurable: data.isInsurable,
            insurabilityReason: data.insurabilityReason,
            requiresManualReview: data.requiresManualReview,
            features: data.features ? { features: data.features } : undefined,
            valueSource: 'SEED'
          }
        })
        updated++
        console.log(`✓ Updated: ${data.year} ${data.make} ${data.model}`)
      } else {
        // Create new classification
        await prisma.vehicleClassification.create({
          data: {
            make: data.make,
            model: data.model,
            year: data.year,
            category: data.category,
            riskLevel: data.riskLevel,
            baseValue: data.baseValue,
            currentValue: data.baseValue,
            baseRateMultiplier: data.baseRateMultiplier,
            riskMultiplier: data.riskMultiplier,
            isInsurable: data.isInsurable,
            insurabilityReason: data.insurabilityReason,
            requiresManualReview: data.requiresManualReview,
            features: data.features ? { features: data.features } : {},
            valueSource: 'SEED',
            createdBy: 'SYSTEM'
          }
        })
        created++
        console.log(`✓ Created: ${data.year} ${data.make} ${data.model}`)
      }
    } catch (error) {
      console.error(`✗ Error processing ${data.year} ${data.make} ${data.model}:`, error)
      skipped++
    }
  }
  
  console.log('\n📊 Seed Results:')
  console.log(`✓ Created: ${created} classifications`)
  console.log(`✓ Updated: ${updated} classifications`)
  console.log(`✗ Skipped: ${skipped} classifications`)
  
  // Update any existing cars that match these classifications
  console.log('\n🔄 Updating existing cars with classifications...')
  
  const carsUpdated = await prisma.$executeRaw`
    UPDATE "RentalCar" rc
    SET 
      "classificationId" = vc.id,
      "insuranceEligible" = vc."isInsurable",
      "insuranceCategory" = vc.category::text,
      "insuranceRiskLevel" = vc."riskLevel"::text,
      "estimatedValue" = vc."currentValue",
      "requiresManualUnderwriting" = vc."requiresManualReview"
    FROM "VehicleClassification" vc
    WHERE 
      rc.make = vc.make 
      AND rc.model = vc.model 
      AND rc.year = vc.year
      AND rc."classificationId" IS NULL
      AND vc."providerId" IS NULL
  `
  
  console.log(`✓ Updated ${carsUpdated} existing cars with classifications`)
  
  console.log('\n✅ Vehicle classification seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })