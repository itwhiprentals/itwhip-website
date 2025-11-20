const HOST_ID = 'cmfj0oxqm004udomy7qivgt18'
const HOST_TOKEN = process.argv[2]

if (!HOST_TOKEN) {
  console.error('Usage: node scripts/recalculate-esg.js <TOKEN>')
  process.exit(1)
}

async function recalculate() {
  console.log('🔄 Forcing ESG recalculation for Parker Mills...')
  
  const response = await fetch('http://localhost:3000/api/host/esg/recalculate', {
    method: 'POST',
    headers: {
      'Cookie': `hostAccessToken=${HOST_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  
  if (response.ok) {
    console.log('✅ ESG profile recalculated successfully!')
    console.log('\nNew scores:')
    console.log(`   Composite: ${data.data?.profile?.compositeScore || 'N/A'}`)
    console.log(`   Safety: ${data.data?.profile?.safetyScore || 'N/A'}`)
    console.log(`   Environmental: ${data.data?.profile?.emissionsScore || 'N/A'}`)
    console.log(`   Version: ${data.data?.profile?.calculationVersion || 'N/A'}`)
    console.log(`   Total CO2: ${data.data?.profile?.totalCO2Impact || 'N/A'}`)
    console.log(`   Avg CO2/mile: ${data.data?.profile?.avgCO2PerMile || 'N/A'}`)
  } else {
    console.error('❌ Recalculation failed:', response.status)
    console.error(data)
  }
}

recalculate()
