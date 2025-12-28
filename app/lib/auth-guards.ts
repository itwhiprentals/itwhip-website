// app/lib/auth-guards.ts
// Guard system for preventing cross-account-type auto-login

export type AccountType = 'HOST' | 'GUEST' | 'NONE'
export type AuthMethod = 'oauth' | 'credentials'
export type RequestedArea = 'host' | 'guest'

export type GuardAction =
  | 'ALLOW_ACCESS'           // User is on correct path, allow login
  | 'SHOW_HOST_ON_GUEST'     // Host trying to access guest area
  | 'SHOW_GUEST_ON_HOST'     // Guest trying to access host area
  | 'SHOW_NO_ACCOUNT'        // No account found (login mode)
  | 'REDIRECT_TO_SIGNUP'     // New user, redirect to signup flow

export interface GuardResult {
  action: GuardAction
  reason: string
  redirectUrl?: string
  guardParams?: {
    guardType: string
    accountType: AccountType
    authMethod: AuthMethod
    requestedArea: RequestedArea
  }
}

export interface GuardConfig {
  title: string
  message: string
  icon: 'warning' | 'info' | 'error'
  primaryAction: {
    label: string
    url: string
  }
  secondaryActions?: {
    label: string
    url: string
  }[]
}

/**
 * Check if user should be allowed access or shown a guard screen
 *
 * RULES:
 * - Can only auto-login when on CORRECT path (host on host login, guest on guest login)
 * - Cannot auto-login when on WRONG path - must show guard screen
 * - Accounts should NEVER auto-create
 * - Users MUST go through proper signup flow
 */
export function checkAccountAccess(
  requestedArea: RequestedArea,
  hasHostProfile: boolean,
  hasGuestProfile: boolean,
  authMethod: AuthMethod,
  isAuthenticated: boolean,
  isLoginMode: boolean = false
): GuardResult {
  // Determine what type of account the user has
  const accountType: AccountType = hasHostProfile
    ? 'HOST'
    : hasGuestProfile
      ? 'GUEST'
      : 'NONE'

  // Case 1: User has no account (no host profile AND no guest profile)
  if (accountType === 'NONE') {
    if (isLoginMode) {
      // Login mode: User trying to login but has no account
      return {
        action: 'SHOW_NO_ACCOUNT',
        reason: `No ${requestedArea} account found for this email`,
        guardParams: {
          guardType: 'no-account',
          accountType: 'NONE',
          authMethod,
          requestedArea
        }
      }
    } else {
      // Signup mode: Redirect to signup flow (complete-profile)
      return {
        action: 'REDIRECT_TO_SIGNUP',
        reason: 'New user needs to complete signup',
        redirectUrl: `/auth/complete-profile?roleHint=${requestedArea}&mode=signup`
      }
    }
  }

  // Case 2: HOST user trying to access GUEST area
  if (requestedArea === 'guest' && hasHostProfile && !hasGuestProfile) {
    return {
      action: 'SHOW_HOST_ON_GUEST',
      reason: 'Host user tried to access guest area without guest profile',
      guardParams: {
        guardType: 'host-on-guest',
        accountType: 'HOST',
        authMethod,
        requestedArea
      }
    }
  }

  // Case 3: GUEST user trying to access HOST area
  if (requestedArea === 'host' && hasGuestProfile && !hasHostProfile) {
    return {
      action: 'SHOW_GUEST_ON_HOST',
      reason: 'Guest user tried to access host area without host profile',
      guardParams: {
        guardType: 'guest-on-host',
        accountType: 'GUEST',
        authMethod,
        requestedArea
      }
    }
  }

  // Case 4: User has BOTH profiles - allow access to requested area
  if (hasHostProfile && hasGuestProfile) {
    return {
      action: 'ALLOW_ACCESS',
      reason: 'User has both profiles, access allowed'
    }
  }

  // Case 5: User is on correct path
  // HOST on host login → Allow
  // GUEST on guest login → Allow
  if (
    (requestedArea === 'host' && hasHostProfile) ||
    (requestedArea === 'guest' && hasGuestProfile)
  ) {
    return {
      action: 'ALLOW_ACCESS',
      reason: `User has ${accountType} profile, accessing ${requestedArea} area - allowed`
    }
  }

  // Default: Should not reach here, but show guard screen for safety
  return {
    action: 'SHOW_NO_ACCOUNT',
    reason: 'Unexpected state - showing guard screen for safety',
    guardParams: {
      guardType: 'unknown',
      accountType,
      authMethod,
      requestedArea
    }
  }
}

/**
 * Get guard screen configuration based on the guard type
 */
export function getGuardConfig(
  guardType: string,
  accountType: AccountType,
  authMethod: AuthMethod,
  requestedArea: RequestedArea
): GuardConfig {
  // HOST user on GUEST login page
  if (guardType === 'host-on-guest') {
    return {
      title: 'Host Account Detected',
      message: 'You are already registered as a Host with this email. You cannot access the guest area with this account.',
      icon: 'warning',
      primaryAction: {
        label: 'Go to Host Dashboard',
        url: '/host/dashboard'
      },
      secondaryActions: [
        {
          label: 'Link a Guest Account',
          url: '/host/dashboard?tab=account-linking'
        },
        {
          label: 'Use a Different Account',
          url: authMethod === 'oauth'
            ? '/api/auth/signout?callbackUrl=/auth/signin'
            : '/auth/signin'
        }
      ]
    }
  }

  // GUEST user on HOST login page
  if (guardType === 'guest-on-host') {
    return {
      title: 'Guest Account Detected',
      message: 'You have a Guest account with this email. You cannot access the host area with this account.',
      icon: 'warning',
      primaryAction: {
        label: 'Go to Guest Dashboard',
        url: '/dashboard'
      },
      secondaryActions: [
        {
          label: 'Apply to Become a Host',
          url: '/host/signup'
        },
        {
          label: 'Use a Different Account',
          url: authMethod === 'oauth'
            ? '/api/auth/signout?callbackUrl=/host/login'
            : '/host/login'
        }
      ]
    }
  }

  // No account found (login mode)
  if (guardType === 'no-account') {
    const isHost = requestedArea === 'host'
    return {
      title: isHost ? 'No Host Account Found' : 'No Account Found',
      message: `No ${isHost ? 'host ' : ''}account exists with this email. Would you like to create one?`,
      icon: 'info',
      primaryAction: {
        label: isHost ? 'Apply to Become a Host' : 'Create Guest Account',
        url: isHost ? '/host/signup' : '/auth/signup'
      },
      secondaryActions: [
        {
          label: 'Try a Different Account',
          url: authMethod === 'oauth'
            ? `/api/auth/signout?callbackUrl=${isHost ? '/host/login' : '/auth/signin'}`
            : isHost ? '/host/login' : '/auth/signin'
        }
      ]
    }
  }

  // Default fallback
  return {
    title: 'Access Restricted',
    message: 'You cannot access this area with your current account.',
    icon: 'error',
    primaryAction: {
      label: 'Go Home',
      url: '/'
    }
  }
}

/**
 * Build URL params for guard redirect
 */
export function buildGuardRedirectUrl(
  baseUrl: string,
  guardParams: GuardResult['guardParams']
): string {
  if (!guardParams) return baseUrl

  const params = new URLSearchParams({
    guard: guardParams.guardType,
    accountType: guardParams.accountType,
    authMethod: guardParams.authMethod,
    requestedArea: guardParams.requestedArea
  })

  return `${baseUrl}?${params.toString()}`
}
