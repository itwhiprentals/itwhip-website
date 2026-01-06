const { Client } = require('pg')

// EXACT same connection string
const connectionString = "postgresql://neondb_owner:npg_mWOj5kPSwsY7@ep-holy-lab-aebr0o86.us-east-2.aws.neon.tech/itwhip_prod?sslmode=require"

console.log('Testing connection to:', connectionString.replace(/:[^@]+@/, ':***@'))

const client = new Client({ connectionString })

async function test() {
  try {
    console.log('Connecting...')
    await client.connect()
    console.log('✅ CONNECTED!')
    
    const res = await client.query('SELECT current_database(), current_user')
    console.log('Database:', res.rows[0])
    
    await client.end()
  } catch (err) {
    console.error('❌ FAILED:', err.message)
  }
}

test()