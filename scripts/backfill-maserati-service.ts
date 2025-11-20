import { prisma } from '@/app/lib/database/prisma'

async function backfillMaseratiService() {
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'
  const hostId = 'cmfj0oxqm004udomy7qivgt18'

  console.log('🔧 BACKFILLING MASERATI SERVICE HISTORY...\n')

  try {
    // 1. Most Recent Service: October 2024 - Oil Change
    const service1 = await prisma.vehicleServiceRecord.create({
      data: {
        carId,
        serviceType: 'OIL_CHANGE',
        serviceDate: new Date('2024-10-15'),
        mileageAtService: 68000,
        nextServiceDue: new Date('2025-04-15'),
        nextServiceMileage: 71000,
        shopName: 'Maserati of Scottsdale',
        shopAddress: '15505 N Scottsdale Rd, Scottsdale, AZ 85254',
        technicianName: 'Marco Rossi',
        invoiceNumber: 'MAS-2024-1015',
        receiptUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-receipt.jpg',
        itemsServiced: ['Synthetic Oil Change', 'Oil Filter', 'Fluid Top-Off', 'Multi-Point Inspection'],
        costTotal: 285.00,
        notes: 'Regular maintenance - vehicle in excellent condition',
        verifiedByFleet: true,
        verifiedAt: new Date('2024-10-16'),
        verifiedBy: 'fleet-admin',
      }
    })
    console.log('✅ Service 1 created:', service1.id)
    console.log('   Type: OIL_CHANGE')
    console.log('   Date: Oct 15, 2024')
    console.log('   Mileage: 68,000 miles\n')

    // 2. June 2023 - Major Service + State Inspection
    const service2 = await prisma.vehicleServiceRecord.create({
      data: {
        carId,
        serviceType: 'MAJOR_SERVICE_60K',
        serviceDate: new Date('2023-06-20'),
        mileageAtService: 60500,
        nextServiceDue: new Date('2024-06-20'),
        nextServiceMileage: 66000,
        shopName: 'Maserati of Scottsdale',
        shopAddress: '15505 N Scottsdale Rd, Scottsdale, AZ 85254',
        technicianName: 'Giovanni Bianchi',
        invoiceNumber: 'MAS-2023-0620',
        receiptUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-receipt.jpg',
        inspectionReportUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-inspection.jpg',
        itemsServiced: [
          'Full Synthetic Oil Change',
          'Air Filter Replacement',
          'Cabin Filter Replacement',
          'Brake Fluid Flush',
          'Coolant Flush',
          'Spark Plugs',
          'Multi-Point Inspection',
          'State Inspection'
        ],
        costTotal: 1250.00,
        notes: '60k mile major service - all systems checked and functioning properly',
        verifiedByFleet: true,
        verifiedAt: new Date('2023-06-21'),
        verifiedBy: 'fleet-admin',
      }
    })
    console.log('✅ Service 2 created:', service2.id)
    console.log('   Type: MAJOR_SERVICE_60K')
    console.log('   Date: Jun 20, 2023')
    console.log('   Mileage: 60,500 miles\n')

    // 3. August 2022 - Oil Change
    const service3 = await prisma.vehicleServiceRecord.create({
      data: {
        carId,
        serviceType: 'OIL_CHANGE',
        serviceDate: new Date('2022-08-10'),
        mileageAtService: 48000,
        nextServiceDue: new Date('2023-02-10'),
        nextServiceMileage: 51000,
        shopName: 'Maserati of Scottsdale',
        shopAddress: '15505 N Scottsdale Rd, Scottsdale, AZ 85254',
        technicianName: 'Alessandro Ferrari',
        invoiceNumber: 'MAS-2022-0810',
        receiptUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-receipt.jpg',
        itemsServiced: ['Synthetic Oil Change', 'Oil Filter', 'Tire Rotation', 'Brake Inspection'],
        costTotal: 320.00,
        notes: 'Routine maintenance',
        verifiedByFleet: true,
        verifiedAt: new Date('2022-08-11'),
        verifiedBy: 'fleet-admin',
      }
    })
    console.log('✅ Service 3 created:', service3.id)
    console.log('   Type: OIL_CHANGE')
    console.log('   Date: Aug 10, 2022')
    console.log('   Mileage: 48,000 miles\n')

    // 4. March 2021 - Oil Change + State Inspection
    const service4 = await prisma.vehicleServiceRecord.create({
      data: {
        carId,
        serviceType: 'STATE_INSPECTION',
        serviceDate: new Date('2021-03-15'),
        mileageAtService: 40000,
        nextServiceDue: new Date('2022-03-15'),
        nextServiceMileage: 45000,
        shopName: 'Maserati of Scottsdale',
        shopAddress: '15505 N Scottsdale Rd, Scottsdale, AZ 85254',
        technicianName: 'Marco Rossi',
        invoiceNumber: 'MAS-2021-0315',
        receiptUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-receipt.jpg',
        inspectionReportUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample-inspection.jpg',
        itemsServiced: ['State Safety Inspection', 'Oil Change', 'Brake Check', 'Emissions Test'],
        costTotal: 350.00,
        notes: 'Passed state inspection - all systems nominal',
        verifiedByFleet: true,
        verifiedAt: new Date('2021-03-16'),
        verifiedBy: 'fleet-admin',
      }
    })
    console.log('✅ Service 4 created:', service4.id)
    console.log('   Type: STATE_INSPECTION')
    console.log('   Date: Mar 15, 2021')
    console.log('   Mileage: 40,000 miles\n')

    // 5. Update RentalCar with latest service info
    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        lastOilChange: new Date('2024-10-15'),
        lastInspection: new Date('2023-06-20'),
        inspectionExpiresAt: new Date('2024-06-20'),
        nextOilChangeDue: new Date('2025-04-15'),
        nextInspectionDue: new Date('2024-06-20'),
        serviceOverdue: false,
        inspectionExpired: true,
        highUsageInspectionNeeded: false,
        currentMileage: 68000,
      }
    })
    console.log('✅ Updated RentalCar service tracking fields')
    console.log('   Last Oil Change: Oct 15, 2024')
    console.log('   Last Inspection: Jun 20, 2023')
    console.log('   Inspection Status: ⚠️  EXPIRED')
    console.log('   Current Mileage: 68,000 miles\n')

    console.log('=' .repeat(60))
    console.log('📊 BACKFILL COMPLETE!')
    console.log('=' .repeat(60))
    console.log('✅ 4 service records created')
    console.log('✅ RentalCar service fields updated')
    console.log('⚠️  Inspection is OVERDUE (expired Jun 20, 2024)')
    console.log('')
    console.log('🎯 WHAT TO TEST:')
    console.log('1. Go to: /host/cars/' + carId + '/edit')
    console.log('2. Click "Service & Maintenance" tab')
    console.log('3. You should see:')
    console.log('   - RED banner: "State Inspection Overdue"')
    console.log('   - 4 service records in history')
    console.log('   - ESG card showing compliance score')
    console.log('')
    console.log('4. Go to: /host/dashboard')
    console.log('   - Check ServiceMetricsDashboardCard')
    console.log('   - Should show overdue inspection alert')

  } catch (error) {
    console.error('❌ Backfill failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillMaseratiService()