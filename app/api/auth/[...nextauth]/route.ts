// app/api/auth/[...nextauth]/route.ts
// NextAuth.js API route handler for OAuth (Google + Apple)

import NextAuth from 'next-auth'
import { getAuthOptions } from '@/app/lib/auth/next-auth-config'

const handler = NextAuth(await getAuthOptions())

export { handler as GET, handler as POST }
