const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugTokenMismatch() {
  console.log('=== TOKEN MISMATCH DEBUG ===\n')
  
  try {
    // Get Leigh's sessions
    const sessions = await prisma.session.findMany({
      where: { 
        userId: 'cmgj3g1p10034doig4dhzvlj8',
        expiresAt: { gte: new Date() }
      },
      select: {
        id: true,
        token: true,
        refreshToken: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('=== LEIGH\'S ACTIVE SESSIONS ===')
    sessions.forEach((s, i) => {
      console.log(`\nSession ${i + 1}:`)
      console.log('Token:', s.token)
      console.log('RefreshToken:', s.refreshToken)
      console.log('Expires:', s.expiresAt)
    })
    
    console.log('\n=== ISSUE ===')
    console.log('The API is trying to match a cookie value against these tokens.')
    console.log('But the cookie might contain a different value or name.')
    
    console.log('\n=== POSSIBLE FIXES ===')
    console.log('1. The cookie name might be different (not "token" or "accessToken")')
    console.log('2. The cookie might contain a JWT while DB has session ID')
    console.log('3. The auth system might be using a different session storage')
    
    console.log('\n=== CHECK YOUR AUTH SYSTEM ===')
    console.log('Look for where login sets cookies. Common patterns:')
    console.log('- res.setHeader("Set-Cookie", ...)')
    console.log('- cookies().set(...)')
    console.log('- NextResponse with cookies')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugTokenMismatch()
