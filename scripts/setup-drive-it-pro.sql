-- Drive It Pro Partner Setup Migration Script
-- Execute this via Prisma Studio or direct PostgreSQL connection
-- IMPORTANT: This migrates jordan@smartcardemo.com to Drive It Pro

-- =============================================================================
-- STEP 1: Update RentalHost Core Account Information
-- =============================================================================

UPDATE "RentalHost"
SET
  -- Account basics
  email = 'Alex@driveitpro.com',
  name = 'Alex Rodriguez',
  phone = '+16022229619',

  -- Business & Partner Identity
  partnerCompanyName = 'Drive It Pro',
  partnerSlug = 'drive-it-pro',
  isBusinessHost = true,
  businessApprovalStatus = 'APPROVED',
  hostType = 'FLEET_PARTNER',
  approvalStatus = 'APPROVED',
  active = true,

  -- Contact & Location
  partnerSupportEmail = 'info@driveitpro.com',
  partnerSupportPhone = '+16022229619',
  address = '2821 W Van Buren St.',
  city = 'Phoenix',
  state = 'AZ',
  zipCode = '85009',
  partnerWebsite = 'https://driveitpro.com',

  -- Visibility Settings
  partnerShowWebsite = true,
  partnerShowPhone = true,
  partnerShowEmail = true,

  -- Fleet Stats
  partnerFleetSize = 250,

  -- Hero Section
  partnerHeroTitle = 'Phoenix''s Premier Rideshare Vehicle Rentals',
  partnerHeroSubtitle = '250+ Fuel-Efficient Toyota Prius Hybrids | No Credit Checks | In-House Maintenance',

  -- Company Bio
  partnerBio = 'Drive It Pro is Phoenix''s locally-owned rideshare car rental company, founded in 2014, specializing in accessible vehicle rentals for rideshare and delivery drivers. We eliminate traditional barriers with no credit checks, transparent pricing, and in-house maintenance. Our exclusive fleet of fuel-efficient Toyota Prius hybrids saves drivers $20-$50 weekly on fuel while providing 99% uptime guarantee.',

  -- Branding
  partnerPrimaryColor = '#EA580C',

  -- Services JSON
  partnerServices = '{
    "rideshare": {
      "enabled": true,
      "platforms": ["Uber", "Lyft", "DoorDash", "Instacart", "Veyo"],
      "description": "All vehicles pre-approved for major rideshare and delivery platforms"
    },
    "rentals": {
      "enabled": false
    }
  }'::jsonb,

  -- Badges JSON
  partnerBadges = '[
    {
      "icon": "IoCheckmarkCircle",
      "label": "No Credit Checks",
      "description": "Get approved regardless of credit history"
    },
    {
      "icon": "IoConstruct",
      "label": "In-House Maintenance",
      "description": "Full-service garage with included repairs"
    },
    {
      "icon": "IoTrendingUp",
      "label": "40-50+ MPG",
      "description": "Fuel-efficient Toyota Prius hybrids only"
    },
    {
      "icon": "IoShieldCheckmark",
      "label": "99% Uptime Guarantee",
      "description": "Less than 1% downtime for maintenance"
    },
    {
      "icon": "IoHome",
      "label": "Rent-to-Own Available",
      "description": "48-month path to vehicle ownership"
    },
    {
      "icon": "IoCalendar",
      "label": "Open Saturdays",
      "description": "Only rideshare rental company open weekends"
    }
  ]'::jsonb,

  -- Benefits JSON
  partnerBenefits = '[
    "Lowest entry cost: $225 down payment",
    "Weekly rate: $325 + tax ($352.95 total)",
    "New customer discount: $106-$128 off first week",
    "Unlimited mileage on all platforms",
    "Maintenance costs included in rental",
    "Vacation hold program (up to 1 week)",
    "16-hour daily customer support",
    "Phone/text/WhatsApp booking"
  ]'::jsonb,

  -- Policies JSON
  partnerPolicies = '{
    "cancellation": "Contact support for cancellation policies",
    "insurance": "Drivers can obtain independent liability coverage ($60-$100/month)",
    "maintenance": "All maintenance costs included. 6-day/week service available.",
    "deposit": "$225 down payment required. Rent-to-own program available with $25 enrollment fee.",
    "fuelPolicy": "Driver responsible for fuel. Hybrid efficiency saves $20-$50 weekly.",
    "rentalTerms": "Weekly rentals only. 48-month rent-to-own option available."
  }'::jsonb,

  -- Update timestamp
  updatedAt = NOW()
WHERE email = 'jordan@smartcardemo.com';

-- =============================================================================
-- STEP 2: Update User Table (if exists)
-- =============================================================================

UPDATE "User"
SET
  email = 'Alex@driveitpro.com',
  name = 'Alex Rodriguez',
  updatedAt = NOW()
WHERE email = 'jordan@smartcardemo.com';

-- =============================================================================
-- STEP 3: Update All Drive It Pro Vehicles Pricing
-- =============================================================================

UPDATE "RentalCar"
SET
  dailyRate = 50.42,      -- $352.95 weekly ÷ 7 days
  weeklyRate = 325.00,    -- Base weekly rate (tax added at checkout)
  vehicleType = 'RIDESHARE',
  isActive = true,
  updatedAt = NOW()
WHERE hostId = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com');

-- =============================================================================
-- STEP 4: Create NEWDRIVER Discount Code
-- =============================================================================

INSERT INTO partner_discounts (
  id,
  hostId,
  code,
  title,
  description,
  percentage,
  startsAt,
  expiresAt,
  isActive,
  maxUses,
  usedCount,
  createdAt,
  updatedAt
)
SELECT
  gen_random_uuid(),
  id,
  'NEWDRIVER',
  'New Driver Discount',
  'New customer discount - $106-$128 off first week',
  30.0,  -- 30% off
  NOW(),
  NOW() + INTERVAL '1 year',
  true,
  NULL,  -- unlimited uses
  0,
  NOW(),
  NOW()
FROM "RentalHost"
WHERE email = 'Alex@driveitpro.com'
-- Only insert if doesn't already exist
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- STEP 5: Create Partner FAQs
-- =============================================================================

INSERT INTO partner_faqs (id, hostId, question, answer, "order", isActive, createdAt, updatedAt)
SELECT
  gen_random_uuid(),
  rh.id,
  'Do you require a credit check?',
  'No! Drive It Pro eliminates credit screening from our rental process, making reliable transportation accessible regardless of credit history.',
  1,
  true,
  NOW(),
  NOW()
FROM "RentalHost" rh
WHERE rh.email = 'Alex@driveitpro.com'

UNION ALL

SELECT
  gen_random_uuid(),
  rh.id,
  'What vehicles do you offer?',
  'We specialize exclusively in fuel-efficient Toyota Prius Gen III hybrid vehicles, all pre-approved for Uber, Lyft, DoorDash, Instacart, and Veyo.',
  2,
  true,
  NOW(),
  NOW()
FROM "RentalHost" rh
WHERE rh.email = 'Alex@driveitpro.com'

UNION ALL

SELECT
  gen_random_uuid(),
  rh.id,
  'What is your rent-to-own program?',
  'Our rent-to-own program requires a $25 one-time enrollment fee. After 48 months of on-time payments, you receive either the vehicle title OR a $5,000 account credit.',
  3,
  true,
  NOW(),
  NOW()
FROM "RentalHost" rh
WHERE rh.email = 'Alex@driveitpro.com'

UNION ALL

SELECT
  gen_random_uuid(),
  rh.id,
  'Do you offer maintenance?',
  'Yes! All maintenance costs are included in your rental agreement. We operate our own full-service garage with mechanics available 6 days a week, no appointments required. We maintain less than 1% downtime.',
  4,
  true,
  NOW(),
  NOW()
FROM "RentalHost" rh
WHERE rh.email = 'Alex@driveitpro.com'

UNION ALL

SELECT
  gen_random_uuid(),
  rh.id,
  'What are your hours?',
  'Monday-Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed. Customer support available ~16 hours daily via phone, text, WhatsApp, and live chat.',
  5,
  true,
  NOW(),
  NOW()
FROM "RentalHost" rh
WHERE rh.email = 'Alex@driveitpro.com'

-- Only if FAQs don't already exist for this host
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify RentalHost was updated
SELECT
  email,
  name,
  partnerCompanyName,
  partnerSlug,
  isBusinessHost,
  businessApprovalStatus,
  hostType,
  approvalStatus
FROM "RentalHost"
WHERE email = 'Alex@driveitpro.com';

-- Verify vehicles were updated
SELECT
  COUNT(*) as vehicle_count,
  MIN(weeklyRate) as min_weekly_rate,
  MAX(weeklyRate) as max_weekly_rate,
  vehicleType
FROM "RentalCar"
WHERE hostId = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com')
GROUP BY vehicleType;

-- Verify discount was created
SELECT code, title, percentage, description, isActive
FROM partner_discounts
WHERE hostId = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com');

-- Verify FAQs were created
SELECT COUNT(*) as faq_count
FROM partner_faqs
WHERE hostId = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com');

-- =============================================================================
-- POST-MIGRATION TASKS
-- =============================================================================
-- 1. Upload Drive It Pro logo to Cloudinary
-- 2. Update partnerLogo field in RentalHost with Cloudinary URL
-- 3. Set password for Alex@driveitpro.com to: Alex2026!
-- 4. Test login at /partner/login
-- 5. Verify landing page at /rideshare/drive-it-pro
-- 6. Verify appears in /fleet/business as approved business
-- =============================================================================
