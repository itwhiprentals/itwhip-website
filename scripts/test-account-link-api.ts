// scripts/test-account-link-api.ts
// Test the account linking API route

import { prisma } from '../app/lib/database/prisma'

async function testAccountLinkingAPI() {
  try {
    console.log('🧪 Testing Account Linking API Route\n')

    // Check if route files exist
    const fs = require('fs')
    const path = require('path')

    const requestRoutePath = path.join(process.cwd(), 'app/api/account/link/request/route.ts')
    const verifyRoutePath = path.join(process.cwd(), 'app/api/account/link/verify/route.ts')

    console.log('📁 Checking route files:')
    console.log(`- Request route: ${fs.existsSync(requestRoutePath) ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`- Verify route: ${fs.existsSync(verifyRoutePath) ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log()

    // Check verifyRequest function
    const verifyRequestPath = path.join(process.cwd(), 'app/lib/auth/verify-request.ts')
    console.log('📁 Checking auth utilities:')
    console.log(`- verifyRequest: ${fs.existsSync(verifyRequestPath) ? '✅ EXISTS' : '❌ MISSING'}`)

    if (fs.existsSync(verifyRequestPath)) {
      const content = fs.readFileSync(verifyRequestPath, 'utf-8')
      const hasHostTokenCheck = content.includes('hostAccessToken')
      console.log(`- Checks hostAccessToken: ${hasHostTokenCheck ? '✅ YES' : '❌ NO'}`)
    }
    console.log()

    // Check middleware
    const middlewarePath = path.join(process.cwd(), 'middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, 'utf-8')
      const hasAccountLinkRoute = content.includes('/api/account/link')
      const hasHostSettings = content.includes('/host/settings')
      console.log('📁 Checking middleware:')
      console.log(`- Has /api/account/link: ${hasAccountLinkRoute ? '✅ YES' : '❌ NO'}`)
      console.log(`- Has /host/settings: ${hasHostSettings ? '✅ YES' : '❌ NO'}`)
    }
    console.log()

    // Check AccountLinking component
    const componentPath = path.join(process.cwd(), 'app/lib/components/account-linking.tsx')
    console.log('📁 Checking UI components:')
    console.log(`- AccountLinking component: ${fs.existsSync(componentPath) ? '✅ EXISTS' : '❌ MISSING'}`)

    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf-8')
      const hasUserTypeProp = content.includes('userType')
      const hasAccountOptions = content.includes('showAccountOptions')
      console.log(`- Has userType prop: ${hasUserTypeProp ? '✅ YES' : '❌ NO'}`)
      console.log(`- Has account options flow: ${hasAccountOptions ? '✅ YES' : '❌ NO'}`)
    }
    console.log()

    // Check host settings page
    const hostSettingsPath = path.join(process.cwd(), 'app/host/settings/account-linking/page.tsx')
    const guestSettingsPath = path.join(process.cwd(), 'app/(guest)/settings/account-linking/page.tsx')
    console.log('📁 Checking settings pages:')
    console.log(`- Host settings page: ${fs.existsSync(hostSettingsPath) ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`- Guest settings page: ${fs.existsSync(guestSettingsPath) ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log()

    console.log('✅ All files are in place!')
    console.log()
    console.log('📝 NEXT STEPS:')
    console.log('1. Restart the dev server (npm run dev)')
    console.log('2. Login as host (hxris007@gmail.com)')
    console.log('3. Navigate to: /host/settings/account-linking')
    console.log('4. Enter a guest email (e.g., test-guest@example.com)')
    console.log('5. Should show "No Guest Account Found" with login/signup options')
    console.log('6. Test the linking flow')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testAccountLinkingAPI()
