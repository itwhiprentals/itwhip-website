# Role System Audit & Migration Plan
**Date:** 2026-01-13
**Status:** CRITICAL - Inconsistent naming, no enum enforcement

---

## 🚨 Critical Issues Found

### 1. No Enum for hostType
**Problem:** `hostType` is stored as a free-form String field with no enum constraint.
```prisma
// Current (BAD)
hostType String @default("PENDING")

// Should be (GOOD)
hostType HostType @default(INDIVIDUAL)
```

**Risk:** Anyone can insert any random string as hostType. No database-level validation.

### 2. Multiple hostType Values in Use
Found **8 different hostType values** being used inconsistently across codebase:

| Value | Usage Count | Industry Standard? | Keep? |
|-------|------------|-------------------|-------|
| `REAL` | 138 files | ❌ No (confusing) | ❌ Migrate to INDIVIDUAL |
| `FLEET_PARTNER` | 138 files | ⚠️ Vehicle-specific | ✅ Migrate to BUSINESS |
| `PARTNER` | 138 files | ❌ Redundant with FLEET_PARTNER | ❌ Merge into BUSINESS |
| `MANAGED` | 37 files | ✅ Clear | ✅ Migrate to PLATFORM |
| `PENDING` | Used as default | ❌ Wrong - use approvalStatus | ❌ Remove |
| `PREMIUM` | 2 files | ❌ Wrong context (tier, not type) | ❌ Remove |
| `PLATFORM` | 17 files | ✅ Industry standard | ✅ Keep (or use PLATFORM instead of MANAGED) |
| `INDIVIDUAL` | Unknown | ✅ Industry standard | ✅ Target value |

### 3. Inconsistent Checking Logic
**Problem:** Code checks for multiple variations:
```typescript
// Found in 30+ files:
if (hostType === 'FLEET_PARTNER' || hostType === 'PARTNER') { ... }
```
This is fragile and error-prone. Should be:
```typescript
if (hostType === 'BUSINESS') { ... }
```

---

## 📊 Database State Analysis

### Current Schema Issues

**File:** `prisma/schema.prisma:582`
```prisma
// LINE 582 - CURRENT (BROKEN)
hostType String @default("PENDING")  // ❌ No enum, default is a status not a type
approvalStatus String @default("PENDING")  // ❌ Also no enum

// Scattered role flags (good approach, keep these)
isHostManager Boolean @default(false)
managesOwnCars Boolean @default(false)
managesOthersCars Boolean @default(false)
isVehicleOwner Boolean @default(false)
```

### Missing Flag
```prisma
// NOT FOUND - Need to add:
isFleetPartnerLimited Boolean @default(false)
```

---

## 🎯 Recommended Industry-Standard Migration

### New Schema (Target State)

```prisma
model RentalHost {
  // ... existing fields ...

  // ===== UPDATED ROLE SYSTEM =====

  // Primary account type (ENFORCED ENUM)
  hostType HostType @default(INDIVIDUAL)

  // Approval status (SEPARATE from type)
  approvalStatus ApprovalStatus @default(PENDING)

  // Role flags (keep existing + add new)
  isHostManager Boolean @default(false)
  managesOwnCars Boolean @default(false)
  managesOthersCars Boolean @default(false)
  isVehicleOwner Boolean @default(false)
  isFleetPartnerLimited Boolean @default(false)  // NEW

  // ... rest of fields ...
}

// NEW ENUM (industry-standard names)
enum HostType {
  INDIVIDUAL      // Real people (individuals) - replaces REAL
  BUSINESS        // Registered companies - replaces FLEET_PARTNER + PARTNER
  PLATFORM        // ItWhip-owned vehicles - replaces MANAGED
}

// CLARIFIED ENUM (already exists but needs cleanup)
enum ApprovalStatus {
  PENDING         // Awaiting review
  APPROVED        // Can operate
  REJECTED        // Denied access
  SUSPENDED       // Temporarily blocked
  NEEDS_ATTENTION // Requires action
}
```

---

## 🔄 Migration Steps

### Step 1: Add Enum to Schema

**File:** `prisma/schema.prisma`

Add after line 5188 (after other enums):
```prisma
// Host Account Type Enum (Industry Standard)
enum HostType {
  INDIVIDUAL  // Individuals hosting vehicles (replaces REAL)
  BUSINESS    // Registered businesses (replaces FLEET_PARTNER + PARTNER)
  PLATFORM    // Platform-owned vehicles (replaces MANAGED)
}
```

Change line 582:
```prisma
// BEFORE:
hostType String @default("PENDING")

// AFTER:
hostType HostType @default(INDIVIDUAL)
```

Add new flag around line 593 (with other flags):
```prisma
isFleetPartnerLimited Boolean @default(false)
```

### Step 2: Create Migration File

**File:** `prisma/migrations/YYYYMMDD_standardize_host_types/migration.sql`

```sql
-- Step 1: Add new enum
CREATE TYPE "HostType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'PLATFORM');

-- Step 2: Add new column with enum type
ALTER TABLE "RentalHost" ADD COLUMN "hostType_new" "HostType";

-- Step 3: Migrate existing data with mapping
UPDATE "RentalHost"
SET "hostType_new" =
  CASE
    -- Map REAL to INDIVIDUAL
    WHEN "hostType" = 'REAL' THEN 'INDIVIDUAL'::"HostType"

    -- Map FLEET_PARTNER and PARTNER to BUSINESS
    WHEN "hostType" IN ('FLEET_PARTNER', 'PARTNER') THEN 'BUSINESS'::"HostType"

    -- Map MANAGED and PLATFORM to PLATFORM
    WHEN "hostType" IN ('MANAGED', 'PLATFORM') THEN 'PLATFORM'::"HostType"

    -- Map PENDING to INDIVIDUAL (type) + update approvalStatus
    WHEN "hostType" = 'PENDING' THEN 'INDIVIDUAL'::"HostType"

    -- Map PREMIUM to INDIVIDUAL (PREMIUM was wrong - it's a tier not a type)
    WHEN "hostType" = 'PREMIUM' THEN 'INDIVIDUAL'::"HostType"

    -- Default fallback
    ELSE 'INDIVIDUAL'::"HostType"
  END;

-- Step 4: Fix approvalStatus for PENDING hosts
UPDATE "RentalHost"
SET "approvalStatus" = 'PENDING'
WHERE "hostType" = 'PENDING' AND "approvalStatus" != 'PENDING';

-- Step 5: Drop old column and rename new one
ALTER TABLE "RentalHost" DROP COLUMN "hostType";
ALTER TABLE "RentalHost" RENAME COLUMN "hostType_new" TO "hostType";

-- Step 6: Set default and NOT NULL
ALTER TABLE "RentalHost" ALTER COLUMN "hostType" SET DEFAULT 'INDIVIDUAL'::"HostType";
ALTER TABLE "RentalHost" ALTER COLUMN "hostType" SET NOT NULL;

-- Step 7: Add new flag for limited partners
ALTER TABLE "RentalHost" ADD COLUMN "isFleetPartnerLimited" BOOLEAN NOT NULL DEFAULT false;

-- Optional: Create index for faster queries
CREATE INDEX "RentalHost_hostType_idx" ON "RentalHost"("hostType");
```

### Step 3: Update TypeScript Types

**File:** `app/types/roles.ts` (NEW FILE)

```typescript
// Industry-standard role types
export enum HostType {
  INDIVIDUAL = 'INDIVIDUAL',  // Real people
  BUSINESS = 'BUSINESS',      // Companies
  PLATFORM = 'PLATFORM'       // ItWhip-owned
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION'
}

// Computed role based on hostType + flags
export type UserRole =
  | 'individual_owner'        // INDIVIDUAL + managesOwnCars
  | 'individual_manager'      // INDIVIDUAL + isHostManager only
  | 'individual_hybrid'       // INDIVIDUAL + both flags
  | 'business_standard'       // BUSINESS + full access
  | 'business_limited'        // BUSINESS + isFleetPartnerLimited
  | 'platform_managed'        // PLATFORM

// Role determination utility
export function determineUserRole(host: {
  hostType: string
  managesOwnCars: boolean
  isHostManager: boolean
  isFleetPartnerLimited: boolean
}): UserRole {
  // Platform-managed vehicles
  if (host.hostType === HostType.PLATFORM) {
    return 'platform_managed'
  }

  // Business accounts
  if (host.hostType === HostType.BUSINESS) {
    return host.isFleetPartnerLimited ? 'business_limited' : 'business_standard'
  }

  // Individual accounts (INDIVIDUAL)
  if (host.hostType === HostType.INDIVIDUAL) {
    if (host.managesOwnCars && host.isHostManager) {
      return 'individual_hybrid'
    }
    if (host.isHostManager && !host.managesOwnCars) {
      return 'individual_manager'
    }
    return 'individual_owner'
  }

  // Fallback
  return 'individual_owner'
}

// Permission check helpers
export const rolePermissions = {
  individual_owner: {
    canAddVehicles: true,
    canManageVehicles: true,
    canProcessBookings: true,
    canMessageGuests: true,
    canViewAnalytics: true,
    canEditLandingPage: false,
    canManageOthersVehicles: false,
    canInviteHosts: false,
  },
  individual_manager: {
    canAddVehicles: false,  // CANNOT add own cars
    canManageVehicles: true,
    canProcessBookings: true,
    canMessageGuests: true,
    canViewAnalytics: true,
    canEditLandingPage: false,
    canManageOthersVehicles: true,
    canInviteHosts: false,
  },
  individual_hybrid: {
    canAddVehicles: true,
    canManageVehicles: true,
    canProcessBookings: true,
    canMessageGuests: true,
    canViewAnalytics: true,
    canEditLandingPage: true,
    canManageOthersVehicles: true,
    canInviteHosts: true,
  },
  business_standard: {
    canAddVehicles: true,
    canManageVehicles: true,
    canProcessBookings: true,
    canMessageGuests: true,
    canViewAnalytics: true,
    canEditLandingPage: true,
    canManageOthersVehicles: true,
    canInviteHosts: true,
  },
  business_limited: {
    canAddVehicles: true,
    canManageVehicles: true,
    canProcessBookings: false,  // CANNOT process bookings
    canMessageGuests: false,
    canViewAnalytics: false,
    canEditLandingPage: false,
    canManageOthersVehicles: false,
    canInviteHosts: false,
  },
  platform_managed: {
    canAddVehicles: true,
    canManageVehicles: true,
    canProcessBookings: true,
    canMessageGuests: true,
    canViewAnalytics: true,
    canEditLandingPage: false,
    canManageOthersVehicles: true,
    canInviteHosts: false,
  },
} as const

export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions.individual_owner): boolean {
  return rolePermissions[role][permission]
}
```

### Step 4: Update API Files (138 files need changes)

**Pattern to find and replace:**

#### Pattern 1: Dual checks for FLEET_PARTNER and PARTNER
```typescript
// BEFORE (30+ files):
if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

// AFTER:
import { HostType } from '@/app/types/roles'

if (partner.hostType !== HostType.BUSINESS) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

#### Pattern 2: REAL checks
```typescript
// BEFORE:
whereConditions.hostType = 'REAL'

// AFTER:
import { HostType } from '@/app/types/roles'

whereConditions.hostType = HostType.INDIVIDUAL
```

#### Pattern 3: MANAGED checks
```typescript
// BEFORE:
if (host.hostType === 'MANAGED') {
  // Skip platform vehicles
}

// AFTER:
import { HostType } from '@/app/types/roles'

if (host.hostType === HostType.PLATFORM) {
  // Skip platform vehicles
}
```

#### Pattern 4: PLATFORM vs MANAGED confusion
```typescript
// BEFORE (inconsistent usage):
host.hostType === 'PLATFORM' ? 'bg-purple-100' : 'bg-blue-100'
// Sometimes uses PLATFORM, sometimes MANAGED

// AFTER (consistent):
import { HostType } from '@/app/types/roles'

host.hostType === HostType.PLATFORM ? 'bg-purple-100' : 'bg-blue-100'
```

---

## 📁 Files Requiring Updates

### Critical API Files (Must update first)
1. ✅ `app/api/partner/session/route.ts` - Already accepts all types
2. ✅ `app/api/auth/oauth-redirect/route.ts` - Already accepts all types
3. ✅ `app/api/host/login/route.ts` - Already handles logout
4. ❌ `app/api/partner/login/route.ts` - Still has restrictive checks
5. ❌ `app/api/host/signup/route.ts` - Sets hostType on signup
6. ❌ `app/api/partner/signup/route.ts` - Sets hostType on signup

### Partner API Endpoints (30+ files needing dual-check removal)
All files with pattern: `hostType !== 'FLEET_PARTNER' && hostType !== 'PARTNER'`
- app/api/partner/customers/search/route.ts
- app/api/partner/hero-image/route.ts
- app/api/partner/logo/route.ts
- app/api/partner/bookings/confirm/route.ts
- app/api/partner/bookings/send-review/route.ts
- app/api/partner/bookings/availability/route.ts
- app/api/partner/bookings/[id]/charges/route.ts
- app/api/partner/bookings/create/route.ts
- app/api/partner/fleet/[id]/toggle-active/route.ts
- app/api/partner/fleet/[id]/photos/[photoId]/route.ts
- app/api/partner/fleet/[id]/photos/route.ts
- app/api/partner/fleet/[id]/insurance/route.ts
- app/api/partner/badges/route.ts
- app/api/partner/notifications/route.ts
- app/api/partner/payouts/route.ts
- app/api/partner/upload/route.ts
- app/api/partner/reviews/[id]/respond/route.ts
- app/api/partner/export/route.ts
- ... (see full list in grep results)

### Admin/Fleet Management (17 files)
Files with MANAGED or PLATFORM checks:
- app/fleet/hosts/[id]/page.tsx
- app/fleet/hosts/[id]/edit/page.tsx
- app/fleet/hosts/[id]/banking/page.tsx
- app/fleet/hosts/[id]/cars/page.tsx
- app/fleet/hosts/[id]/permissions/page.tsx
- app/api/admin/hosts/bulk-actions/route.ts
- app/api/admin/hosts/applications/route.ts
- app/api/admin/hosts/[id]/request-info/route.ts
- app/api/admin/hosts/[id]/request-documents/route.ts
- app/api/admin/hosts/[id]/background-check/route.ts
- app/api/admin/hosts/[id]/background-check/initiate/route.ts

### Frontend Components (20+ files)
Files displaying host type or checking permissions:
- app/partner/layout.tsx
- app/host/cars/add/page.tsx
- app/(guest)/rentals/[carId]/CarDetailsClient.tsx
- app/(guest)/rentals/components/details/BookingWidget.tsx
- app/rentals-components/details/BookingWidget.tsx

### Utilities & Libraries
- app/lib/commission/calculate-tier.ts
- app/lib/auth/partner-guard.ts

### Scripts (Testing & Migrations)
- scripts/resend-partner-welcome.ts
- scripts/test-partner-flow.ts
- scripts/fix-host-type.js
- scripts/inspect-hosts.ts
- scripts/migrate-hosts-users.js
- scripts/create-itwhip-partner.ts

---

## 🧪 Testing Plan

### 1. Database Migration Test
```bash
# Create test migration
npx prisma migrate dev --name standardize_host_types --create-only

# Review generated SQL
cat prisma/migrations/YYYYMMDD_standardize_host_types/migration.sql

# Apply to dev database
npx prisma migrate dev

# Verify data integrity
psql $DATABASE_URL -c "SELECT hostType, COUNT(*) FROM \"RentalHost\" GROUP BY hostType;"
```

### 2. API Testing Checklist
- [ ] INDIVIDUAL host can access partner portal
- [ ] BUSINESS host can access all business features
- [ ] PLATFORM vehicles are properly excluded from user lists
- [ ] Login/signup creates correct hostType
- [ ] OAuth flow sets correct hostType
- [ ] Role determination function works correctly
- [ ] Permission checks work for all role types

### 3. Frontend Testing
- [ ] Navigation shows correct items per role
- [ ] Host type badges display correctly
- [ ] Landing page visibility rules work
- [ ] Add vehicle button shows/hides correctly
- [ ] Booking management access is correct per role

---

## ⏱️ Estimated Implementation Time

| Task | Files | Complexity | Time |
|------|-------|-----------|------|
| Schema changes | 1 | Medium | 1 hour |
| Create migration SQL | 1 | High | 2 hours |
| Run migration | 1 | Low | 15 min |
| Create types file | 1 | Low | 30 min |
| Update API files | 138 | Medium | 8 hours |
| Update frontend files | 20 | Low | 3 hours |
| Update utilities | 2 | Low | 30 min |
| Testing | N/A | High | 4 hours |
| **TOTAL** | **164 files** | - | **~20 hours** |

---

## 🎯 Success Criteria

✅ Database schema uses enum for hostType (not String)
✅ Only 3 host types exist: INDIVIDUAL, BUSINESS, PLATFORM
✅ No code checks for REAL, FLEET_PARTNER, PARTNER, MANAGED, PENDING
✅ All API tests pass
✅ All frontend components render correctly
✅ Role permissions work as expected
✅ No TypeScript errors
✅ No Prisma validation errors

---

## 🚀 Migration Order

1. **Schema Update** (Day 1)
   - Update Prisma schema with enum
   - Add isFleetPartnerLimited flag
   - Generate migration

2. **Database Migration** (Day 1)
   - Run migration on dev
   - Verify data integrity
   - Test rollback

3. **Types & Utils** (Day 1)
   - Create types/roles.ts
   - Update helper functions

4. **API Updates** (Day 2-3)
   - Update all partner API endpoints
   - Update admin/fleet endpoints
   - Update auth endpoints

5. **Frontend Updates** (Day 4)
   - Update components
   - Update layouts
   - Update pages

6. **Testing** (Day 5)
   - Integration tests
   - Manual QA
   - Fix bugs

7. **Deploy** (Day 5)
   - Deploy to staging
   - Final QA
   - Deploy to production

---

## 📝 Migration Command Summary

```bash
# 1. Update schema file manually
# 2. Create migration
npx prisma migrate dev --name standardize_host_types

# 3. Generate Prisma Client
npx prisma generate

# 4. Update code files
# (Use find/replace patterns above)

# 5. Test TypeScript compilation
npm run build

# 6. Run tests
npm test

# 7. Deploy
npm run deploy
```

---

## 🔗 Related Documentation

- [Industry Standard User Types](https://stripe.com/docs/connect/accounts)
- [Prisma Enum Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
- [Next.js TypeScript Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

**END OF AUDIT**
