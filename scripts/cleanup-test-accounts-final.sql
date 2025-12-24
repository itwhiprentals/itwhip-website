-- Cleanup Test Accounts and Reset Legacy Dual IDs (FINAL VERSION)
-- This script handles all foreign key dependencies properly
-- Order: Dependent records → Profiles → Accounts → Users → Reset legacyDualId

\echo '================================================'
\echo 'CLEANUP TEST ACCOUNTS - FINAL VERSION'
\echo '================================================'

-- Start transaction
BEGIN;

-- =====================================================
-- STEP 1: Find User IDs to delete
-- =====================================================

\echo '\n================================================'
\echo 'STEP 1: Finding User IDs to delete...'
\echo '================================================'

-- Create temp table with User IDs to delete
CREATE TEMP TABLE users_to_delete AS
SELECT id, email, name
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

\echo '📋 Users to delete:'
SELECT email, name FROM users_to_delete ORDER BY email;

-- =====================================================
-- STEP 2: Delete dependent records (cascading deletes)
-- =====================================================

\echo '\n================================================'
\echo 'STEP 2: Deleting dependent records...'
\echo '================================================'

-- Delete Claims (must be deleted before RentalBooking)
DELETE FROM "Claim"
WHERE "bookingId" IN (
  SELECT rb.id FROM "RentalBooking" rb
  JOIN "ReviewerProfile" rp ON rp.id = rb."reviewerProfileId"
  WHERE rp."userId" IN (SELECT id FROM users_to_delete)
);

\echo '✅ Deleted Claim records'

-- Delete RentalReview records (reviews written by these users)
DELETE FROM "RentalReview"
WHERE "reviewerProfileId" IN (
  SELECT rp.id FROM "ReviewerProfile" rp
  WHERE rp."userId" IN (SELECT id FROM users_to_delete)
);

\echo '✅ Deleted RentalReview records (as reviewer)'

-- Delete RentalReview records (reviews for cars owned by these users)
DELETE FROM "RentalReview"
WHERE "carId" IN (
  SELECT rc.id FROM "RentalCar" rc
  WHERE rc."hostId" IN (
    SELECT rh.id FROM "RentalHost" rh
    WHERE rh."userId" IN (SELECT id FROM users_to_delete)
  )
);

\echo '✅ Deleted RentalReview records (for their cars)'

-- Delete RentalBooking records (bookings made by these users as guests)
DELETE FROM "RentalBooking"
WHERE "reviewerProfileId" IN (
  SELECT rp.id FROM "ReviewerProfile" rp
  WHERE rp."userId" IN (SELECT id FROM users_to_delete)
);

\echo '✅ Deleted RentalBooking records (as guest)'

-- Delete RentalBooking records (bookings for cars owned by these users as hosts)
DELETE FROM "RentalBooking"
WHERE "carId" IN (
  SELECT rc.id FROM "RentalCar" rc
  WHERE rc."hostId" IN (
    SELECT rh.id FROM "RentalHost" rh
    WHERE rh."userId" IN (SELECT id FROM users_to_delete)
  )
);

\echo '✅ Deleted RentalBooking records (for their cars)'

-- Delete RentalCar records (must be deleted before RentalHost)
DELETE FROM "RentalCar"
WHERE "hostId" IN (
  SELECT rh.id FROM "RentalHost" rh
  WHERE rh."userId" IN (SELECT id FROM users_to_delete)
);

\echo '✅ Deleted RentalCar records'

-- =====================================================
-- STEP 3: Delete profile records
-- =====================================================

\echo '\n================================================'
\echo 'STEP 3: Deleting profile records...'
\echo '================================================'

-- Delete RentalHost profiles
DELETE FROM "RentalHost"
WHERE "userId" IN (SELECT id FROM users_to_delete);

\echo '✅ Deleted RentalHost records'

-- Delete ReviewerProfile profiles
DELETE FROM "ReviewerProfile"
WHERE "userId" IN (SELECT id FROM users_to_delete);

\echo '✅ Deleted ReviewerProfile records'

-- =====================================================
-- STEP 4: Delete AccountLinkRequest records
-- =====================================================

\echo '\n================================================'
\echo 'STEP 4: Deleting AccountLinkRequest records...'
\echo '================================================'

DELETE FROM "AccountLinkRequest"
WHERE "initiatingUserId" IN (SELECT id FROM users_to_delete)
OR "targetEmail" IN (SELECT email FROM users_to_delete);

\echo '✅ Deleted AccountLinkRequest records'

-- =====================================================
-- STEP 5: Delete Account records (NextAuth)
-- =====================================================

\echo '\n================================================'
\echo 'STEP 5: Deleting Account records...'
\echo '================================================'

DELETE FROM "Account"
WHERE "userId" IN (SELECT id FROM users_to_delete);

\echo '✅ Deleted Account records'

-- =====================================================
-- STEP 6: Delete User records
-- =====================================================

\echo '\n================================================'
\echo 'STEP 6: Deleting User records...'
\echo '================================================'

DELETE FROM "User"
WHERE id IN (SELECT id FROM users_to_delete);

\echo '✅ Deleted User records'

-- =====================================================
-- STEP 7: Delete guest profile for hxris007@gmail.com
-- =====================================================

\echo '\n================================================'
\echo 'STEP 7: Deleting guest profile for hxris007@gmail.com...'
\echo '================================================'

-- First delete any bookings for this guest profile
DELETE FROM "RentalBooking"
WHERE "reviewerProfileId" IN (
  SELECT id FROM "ReviewerProfile"
  WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'hxris007@gmail.com')
);

\echo '✅ Deleted RentalBooking records for hxris007@gmail.com'

-- Delete any reviews by this reviewer
DELETE FROM "RentalReview"
WHERE "reviewerProfileId" IN (
  SELECT id FROM "ReviewerProfile"
  WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'hxris007@gmail.com')
);

\echo '✅ Deleted RentalReview records for hxris007@gmail.com'

-- Delete ReviewerProfile for hxris007@gmail.com (keep User + RentalHost)
DELETE FROM "ReviewerProfile"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email = 'hxris007@gmail.com'
);

\echo '✅ Deleted ReviewerProfile for hxris007@gmail.com'

-- =====================================================
-- STEP 8: Reset ALL legacyDualId to NULL
-- =====================================================

\echo '\n================================================'
\echo 'STEP 8: Resetting ALL legacyDualId to NULL...'
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
-- STEP 9: Verify cleanup
-- =====================================================

\echo '\n================================================'
\echo 'STEP 9: Verifying cleanup...'
\echo '================================================'

-- Check deleted accounts (should be 0)
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
\echo '\n⭐ Verifying hxris007@gmail.com:'
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

-- Check legacyDualId reset (all should be 0)
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
\echo '\n👥 All remaining users (showing last 20):'
SELECT
  id, email, name,
  "createdAt"::date as created,
  role,
  "legacyDualId"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 20;

-- Commit transaction
COMMIT;

\echo '\n================================================'
\echo '✅ CLEANUP COMPLETE!'
\echo '================================================'
\echo 'Test accounts deleted:'
\echo '  • abner80rios@gmail.com'
\echo '  • christianhaguma@gmail.com'
\echo '  • hxris09@gmail.com'
\echo '  • josedmurillo17@gmail.com'
\echo '  • ricktricky39@gmail.com'
\echo '  • richceo6@gmail.com'
\echo '  • info@itwhip.com'
\echo ''
\echo 'hxris007@gmail.com: Guest profile removed, Host kept'
\echo ''
\echo 'ALL legacyDualId fields reset to NULL'
\echo ''
\echo 'System ready for fresh testing!'
\echo '================================================'
