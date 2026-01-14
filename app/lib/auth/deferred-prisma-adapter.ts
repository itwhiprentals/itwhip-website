// app/lib/auth/deferred-prisma-adapter.ts
// Custom adapter that defers user creation until phone number is collected
// This prevents creating User/Account records for abandoned signups

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Adapter, AdapterUser, AdapterAccount } from 'next-auth/adapters'
import { PrismaClient } from '@prisma/client'

export function DeferredPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma)

  return {
    ...baseAdapter,

    // Override createUser to NOT create user during OAuth
    // Instead, return a "pending" user object that signals this is a new signup
    createUser: async (user) => {
      // Return a virtual user object that will NOT be saved to database
      // The actual user will be created in complete-profile when phone is submitted
      console.log('[DeferredAdapter] createUser called - returning pending user (not saving to DB)')
      return {
        id: `pending_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: null,
        isPending: true
      } as AdapterUser & { isPending: boolean }
    },

    // Override linkAccount to defer account linking for pending users
    linkAccount: async (account) => {
      // If the userId is a pending ID, don't create the account record
      if (account.userId.startsWith('pending_')) {
        console.log('[DeferredAdapter] linkAccount called for pending user - deferring (not saving to DB)')
        // Return the account object as-is (not saved to DB)
        return account as AdapterAccount
      }
      // For existing users (returning users), create account with generated ID
      // (Prisma schema requires id to be provided since it has no @default)
      console.log('[DeferredAdapter] linkAccount called for existing user - creating with generated ID')

      // Check if account already exists (user logging in again)
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      })

      if (existingAccount) {
        console.log('[DeferredAdapter] Account already exists, updating tokens')
        return prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
          },
        }) as unknown as AdapterAccount
      }

      const id = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      return prisma.account.create({
        data: {
          id,
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ?? null,
          access_token: account.access_token ?? null,
          expires_at: account.expires_at ?? null,
          token_type: account.token_type ?? null,
          scope: account.scope ?? null,
          id_token: account.id_token ?? null,
          session_state: account.session_state ?? null,
        },
      }) as unknown as AdapterAccount
    },

    // Keep getUserByEmail to check for existing users
    // This allows returning users to be found and linked properly
    getUserByEmail: async (email) => {
      const user = await baseAdapter.getUserByEmail?.(email)
      if (user) {
        console.log(`[DeferredAdapter] getUserByEmail found existing user: ${email}`)
      }
      return user ?? null
    },

    // Keep getUserByAccount for returning users who already have OAuth linked
    getUserByAccount: async (providerAccountId) => {
      const user = await baseAdapter.getUserByAccount?.(providerAccountId)
      if (user) {
        console.log(`[DeferredAdapter] getUserByAccount found existing user for provider account`)
      }
      return user ?? null
    },

    // Override getUser to return null for pending IDs
    getUser: async (id) => {
      if (id.startsWith('pending_')) {
        console.log(`[DeferredAdapter] getUser called with pending ID - returning null`)
        return null
      }
      return baseAdapter.getUser?.(id) ?? null
    },

    // Keep session methods from base adapter
    createSession: baseAdapter.createSession,
    getSessionAndUser: baseAdapter.getSessionAndUser,
    updateSession: baseAdapter.updateSession,
    deleteSession: baseAdapter.deleteSession,

    // Keep verification token methods from base adapter
    createVerificationToken: baseAdapter.createVerificationToken,
    useVerificationToken: baseAdapter.useVerificationToken,

    // Keep updateUser from base adapter (for existing users)
    updateUser: baseAdapter.updateUser,

    // Keep deleteUser from base adapter
    deleteUser: baseAdapter.deleteUser,

    // Keep unlinkAccount from base adapter
    unlinkAccount: baseAdapter.unlinkAccount,
  }
}
