require('dotenv').config()

async function testRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  console.log('Redis URL:', url || 'not-set')
  console.log('Token exists:', !!token)
  
  if (!url || !token) {
    console.log('❌ Redis not configured!')
    return
  }
  
  try {
    const setRes = await fetch(`${url}/set/test/hello`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('SET:', await setRes.json())
    
    const getRes = await fetch(`${url}/get/test`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('GET:', await getRes.json())
    
    console.log('✅ Redis working!')
  } catch (e) {
    console.log('❌ Error:', e.message)
  }
}

testRedis()