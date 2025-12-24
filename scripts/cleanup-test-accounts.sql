-- Cleanup Test Accounts and Reset Legacy Dual IDs
-- This script will:
-- 1. Delete test accounts completely (User + all profiles)
-- 2. For hxris007@gmail.com: Keep User + RentalHost, delete ReviewerProfile only
-- 3. Search for additional accounts (ken pegaso, hxris08)
-- 4. Reset ALL legacyDualId fields to NULL (fresh start)

-- =====================================================
-- STEP 1: Find and display accounts to delete
-- =====================================================

\echo '================================================'
\echo 'STEP 1: Finding accounts to delete...'
\echo '================================================'

-- Accounts to DELETE COMPLETELY
\echo '\n🗑️  ACCOUNTS TO DELETE COMPLETELY:'
SELECT
  id, email, name,
  "createdAt"::date as created,
  role,
  "legacyDualId"
FROM "User"
WHERE email IN (
  'abner80rios@gmail.com',
  'christianhaguma@gmail.com',
  'hxris09@gmail.com',
  'josedmurillo17@gmail.com',
  'ricktricky39@gmail.com',
  'richceo6@gmail.com',
  'info@itwhip.com'
);

-- Account to KEEP HOST, DELETE GUEST
\echo '\n⭐ ACCOUNT TO KEEP HOST, DELETE GUEST:'
SELECT
  id, email, name,
  "createdAt"::date as created,
  role,
  "legacyDualId"
FROM "User"
WHERE email = 'hxris007@gmail.com';

-- Search for additional accounts
\echo '\n🔍 SEARCHING FOR ADDITIONAL ACCOUNTS (ken pegaso/pagaso, hxris08):'
SELECT
  id, email, name,
  "createdAt"::date as created,
  role,
  "legacyDualId"
FROM "User"
WHERE
  email ILIKE '%ken%'
  OR email ILIKE '%pegaso%'
  OR email ILIKE '%pagaso%'
  OR email ILIKE '%hxris08%'
  OR name ILIKE '%ken%pegaso%'
  OR name ILIKE '%ken%pagaso%';

-- =====================================================
-- STEP 2: Delete accounts completely
-- =====================================================

\echo '\n================================================'
\echo 'STEP 2: Deleting test accounts...'
\echo '================================================'

-- Start transaction
BEGIN;

-- Delete associated Account records (NextAuth)
DELETE FROM "Account"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email IN (
    'abner80rios@gmail.com',
    'christianhaguma@gmail.com',
    'hxris09@gmail.com',
    'josedmurillo17@gmail.com',
    'ricktricky39@gmail.com',
    'richceo6@gmail.com',
    'info@itwhip.com'
  )
);

\echo '✅ Deleted Account records'

-- Delete RentalHost profiles
DELETE FROM "RentalHost"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email IN (
    'abner80rios@gmail.com',
    'christianhaguma@gmail.com',
    'hxris09@gmail.com',
    'josedmurillo17@gmail.com',
    'ricktricky39@gmail.com',
    'richceo6@gmail.com',
    'info@itwhip.com'
  )
);

\echo '✅ Deleted RentalHost records'

-- Delete ReviewerProfile profiles
DELETE FROM "ReviewerProfile"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email IN (
    'abner80rios@gmail.com',
    'christianhaguma@gmail.com',
    'hxris09@gmail.com',
    'josedmurillo17@gmail.com',
    'ricktricky39@gmail.com',
    'richceo6@gmail.com',
    'info@itwhip.com'
  )
);

\echo '✅ Deleted ReviewerProfile records'

-- Delete AccountLinkRequest records
DELETE FROM "AccountLinkRequest"
WHERE "initiatingUserId" IN (
  SELECT id FROM "User"
  WHERE email IN (
    'abner80rios@gmail.com',
    'christianhaguma@gmail.com',
    'hxris09@gmail.com',
    'josedmurillo17@gmail.com',
    'ricktricky39@gmail.com',
    'richceo6@gmail.com',
    'info@itwhip.com'
  )
)
OR "targetEmail" IN (
  'abner80rios@gmail.com',
  'christianhaguma@gmail.com',
  'hxris09@gmail.com',
  'josedmurillo17@gmail.com',
  'ricktricky39@gmail.com',
  'richceo6@gmail.com',
  'info@itwhip.com'
);

\echo '✅ Deleted AccountLinkRequest records'

-- Delete User records
DELETE FROM "User"
WHERE email IN (
  'abner80rios@gmail.com',
  'christianhaguma@gmail.com',
  'hxris09@gmail.com',
  'josedmurillo17@gmail.com',
  'ricktricky39@gmail.com',
  'richceo6@gmail.com',
  'info@itwhip.com'
);

\echo '✅ Deleted User records'

-- =====================================================
-- STEP 3: Delete guest profile for hxris007@gmail.com
-- =====================================================

\echo '\n================================================'
\echo 'STEP 3: Deleting guest profile for hxris007@gmail.com...'
\echo '================================================'

-- Delete ReviewerProfile for hxris007@gmail.com (keep User + RentalHost)
DELETE FROM "ReviewerProfile"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email = 'hxris007@gmail.com'
);

\echo '✅ Deleted ReviewerProfile for hxris007@gmail.com (kept User + RentalHost)'

-- =====================================================
-- STEP 4: Reset ALL legacyDualId to NULL
-- =====================================================

\echo '\n================================================'
\echo 'STEP 4: Resetting ALL legacyDualId to NULL...'
\echo '================================================'

-- Reset User.legacyDualId
UPDATE "User"
SET "legacyDualId" = NULL
WHERE "legacyDualId" IS NOT NULL;

\echo '✅ Reset User.legacyDualId'

-- Reset RentalHost.legacyDualId
UPDATE "RentalHost"
SET "legacyDualId" = NULL
WHERE "legacyDualId" IS NOT NULL;

\echo '✅ Reset RentalHost.legacyDualId'

-- Reset ReviewerProfile.legacyDualId
UPDATE "ReviewerProfile"
SET "legacyDualId" = NULL
WHERE "legacyDualId" IS NOT NULL;

\echo '✅ Reset ReviewerProfile.legacyDualId'

-- =====================================================
-- STEP 5: Verify cleanup
-- =====================================================

\echo '\n================================================'
\echo 'STEP 5: Verifying cleanup...'
\echo '================================================'

-- Check deleted accounts
\echo '\n🔍 Verifying deleted accounts (should be 0):'
SELECT COUNT(*) as deleted_accounts_remaining
FROM "User"
WHERE email IN (
  'abner80rios@gmail.com',
  'christianhaguma@gmail.com',
  'hxris09@gmail.com',
  'josedmurillo17@gmail.com',
  'ricktricky39@gmail.com',
  'richceo6@gmail.com',
  'info@itwhip.com'
);

-- Check hxris007 (should have User + RentalHost, NO ReviewerProfile)
\echo '\n⭐ Verifying hxris007@gmail.com (should have User + RentalHost, NO ReviewerProfile):'
SELECT
  'User' as record_type,
  COUNT(*) as count
FROM "User"
WHERE email = 'hxris007@gmail.com'
UNION ALL
SELECT
  'RentalHost' as record_type,
  COUNT(*) as count
FROM "RentalHost"
WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'hxris007@gmail.com')
UNION ALL
SELECT
  'ReviewerProfile' as record_type,
  COUNT(*) as count
FROM "ReviewerProfile"
WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'hxris007@gmail.com');

-- Check legacyDualId reset
\echo '\n🔄 Verifying legacyDualId reset (all should be 0):'
SELECT
  'User' as table_name,
  COUNT(*) as accounts_with_legacy_dual_id
FROM "User"
WHERE "legacyDualId" IS NOT NULL
UNION ALL
SELECT
  'RentalHost' as table_name,
  COUNT(*) as accounts_with_legacy_dual_id
FROM "RentalHost"
WHERE "legacyDualId" IS NOT NULL
UNION ALL
SELECT
  'ReviewerProfile' as table_name,
  COUNT(*) as accounts_with_legacy_dual_id
FROM "ReviewerProfile"
WHERE "legacyDualId" IS NOT NULL;

-- Show all remaining users
\echo '\n👥 All remaining users:'
SELECT
  id, email, name,
  "createdAt"::date as created,
  role,
  "legacyDualId"
FROM "User"
ORDER BY "createdAt" DESC;

-- Commit transaction
COMMIT;

\echo '\n================================================'
\echo '✅ CLEANUP COMPLETE!'
\echo '================================================'
\echo 'All test accounts deleted, hxris007@gmail.com guest profile removed,'
\echo 'and ALL legacyDualId fields reset to NULL.'
\echo 'System ready for fresh testing!'
\echo '================================================'
