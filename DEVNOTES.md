# ItWhip Development Notes

## Recent Fixes (January 2026)

### Two-Factor Authentication (Jan 26)
- [x] TOTP-based 2FA using `otpauth` library
- [x] QR code generation for authenticator apps (Google Authenticator, Authy, 1Password)
- [x] Manual secret entry option for accessibility
- [x] 10 backup codes generated with Argon2 hashing
- [x] New endpoints: /api/user/2fa/setup, /api/user/2fa/verify, /api/user/2fa/disable
- [x] TwoFactorSetupModal component with step-by-step flow
- [x] DisableTwoFactorModal with password confirmation
- [x] SecurityTab fully integrated with 2FA enable/disable
- [x] Confirmation emails sent on 2FA enable/disable
- [x] Fixed export-data API Prisma relation names (RentalReview, LoginAttempt, Session)

### Token-Based Password Setup for Converted Guests (Jan 26)
- [x] New `/auth/set-password` page for setting initial password via token
- [x] Light/dark mode toggle with localStorage persistence
- [x] Password strength indicator (weak/medium/strong)
- [x] New `/api/auth/set-password` endpoint for token validation
- [x] Token generation in guest-onboard/validate route when sending welcome email
- [x] New guest-welcome email template matching prospect invitation layout
- [x] Resend security email button in fleet guest-prospects admin panel
- [x] Email reference ID included in all security setup emails
- [x] 7-day token expiration for password setup links
- [x] Reuses resetToken/resetTokenExpiry fields from User model

### Guest Profile Page Redesign (Jan 25)
- [x] Simplified ProfileHeader: removed stats grid, compact layout with photo/name/badge
- [x] Consolidated tabs from 7 to 5: Account, Documents, Insurance, Payment, Security
- [x] Added photo upload section to Account tab with clear guidelines
- [x] Email/phone change with verification flow (sends link to new email)
- [x] New SecurityTab: password management, 2FA, account linking, deletion
- [x] API: Added hasPassword field to detect converted prospects (via invite link)
- [x] New endpoint: /api/user/set-password for no-password accounts
- [x] New endpoints: /api/guest/email/change-request, /api/guest/email/verify
- [x] Layout: Aligned Scan License and Edit buttons to right of section headers

### Guest Dashboard Enhancements (Jan 25)
- [x] Status badges on Recent Trips card (Active, Complete, Canceled, Pending)
- [x] Status badges on booking cards (mobile and desktop)
- [x] Vehicle display: Year + Make on line 1, Model on line 2
- [x] Currency formatting: $1,500.00 with locale-aware commas and decimals
- [x] Visible line separators between Recent Trips items
- [x] Important Information insurance disclaimer under Support card

### Mobile Layout Fixes (Jan 24)
- [x] Dashboard: Add -mx-2 sm:mx-0 to all cards for edge-to-edge mobile alignment
- [x] Profile: Remove VerificationProgress section (redundant with dashboard alert)
- [x] Profile: Remove Bronze membership tier badge from header
- [x] Profile: Add -mx-4 sm:mx-0 wrappers for mobile alignment
- [x] Fix date input overflow - add appearance-none, min-width:0 in globals.css
- [x] Bookings page: Fix horizontal scroll with scrollable filter pills
- [x] Bookings page: Mobile-optimized card layout (compact, no overflow)
- [x] Bookings page: Split car name display (Year Make / Model on separate lines)

### Booking Credit Invite System (Jan 25)
- [x] Add creditPurpose field to GuestProspect (guest_invite, booking_credit, refund_credit)
- [x] Add referenceBooking JSON field for previous booking details
- [x] Fleet dashboard: credit purpose dropdown with conditional reference booking fields
- [x] Dynamic email templates: "Your Credit Is Ready" header for booking credits
- [x] Reference booking section in email (vehicle, dates, location, reference ID)
- [x] 7-day default expiration for booking credits (vs 90 days for guest invites)

### Guest Dashboard UX Improvements (Jan 24)
- [x] Guest invite link redirects to `/dashboard` instead of `/payments/credits`
- [x] Lock icon with tooltip on Credits & Bonus stat when unverified
- [x] Lock icon with tooltip on Credits page header when unverified
- [x] Desktop logout dropdown menu (Profile + Sign Out options)
- [x] Remove footer from dashboard-style pages (`/dashboard`, `/profile`, `/payments/*`, `/messages`, `/claims/*`, `/settings/*`)
- [x] Fix transaction history to show dollar sign (+$250.00 format)
- [x] Reduce header/footer logo size by 30% (w-10 → w-7)
- [x] Fixed user role from invalid 'GUEST' to 'CLAIMED' in guest onboard API

### Email Deliverability Fixes (Jan 24)
- [x] Reverted dark mode CSS from email templates (Gmail ignores media queries)
- [x] Removed List-Unsubscribe headers (endpoint doesn't exist)
- [x] Fixed sender.ts to not pass empty headers object to nodemailer
- [x] Changed guest invite subject from promotional "$25 credit waiting" to "your account is ready"
- [x] Changed CTA from "Claim Your Credit" to "Activate Your Account"
- [x] Removed urgency language ("waiting", "gift", "claim") to avoid Yahoo spam filters
- [x] Configured DKIM authentication with Microsoft 365 (selector1, selector2 CNAME records)
- [x] Verified all email auth passes: SPF, DKIM, DMARC

### Fleet Analytics & Monitoring Improvements (Jan 24)
- [x] Military-grade device detection (tablet regex, Mobi keyword, Client Hints)
- [x] Real bounce rate calculation (single-page sessions / total visitors)
- [x] Real uptime tracking with health checks (not estimates)
- [x] Database-level aggregation for returning users (no memory issues)
- [x] Add composite indexes for analytics queries (migration: add_analytics_indexes)
- [x] HTTP cache headers on API responses (15s-2min TTL)
- [x] Views Over Time chart: previous period comparison, trend indicators
- [x] Security: Remove hardcoded JWT secret fallbacks (require in production)
- [x] Next.js compression and image optimization enabled
- [x] FLEET_API_KEY added to Vercel environment
- [x] Drill-down for Avg Load Time: slowest pages/locations with P95, min, max
- [x] Drill-down for Bounce Rate: highest bounce pages/locations with visitor counts
- [x] Military-grade geolocation: city, region, country in Top Locations toggle
- [x] StatsDetailModal shows detailed breakdown when clicking metrics
- [x] Page layout reorganized: stats row, full-width chart, 4-column bottom grid
- [x] ChartHeader and ChartLegend components for Views Over Time

### Identity Verification Help Page (Jan 23)
- [x] Create `/help/identity-verification` page explaining Stripe Identity
- [x] Build scroll-linked ID scanner animation component
- [x] Arizona sample driver's license in scanner animation
- [x] Stripe Identity badge with dark mode support
- [x] Mobile and desktop responsive design
- [x] Add Identity Verification link to footer
- [x] Fix mobile scroll jitter with Framer Motion useSpring

### Email Tracking & Verification System (Jan 23)
- [x] EmailLog model with reference IDs (format: REF-XX-XXXXXX)
- [x] Public `/verify-email` page for email authenticity verification
- [x] Fleet `/fleet/emails` page for searching email logs
- [x] Visible, clickable reference IDs in guest invite emails
- [x] Centralized email config in `/app/lib/email/config.ts`
- [x] Schema versioning for Prisma client hot-reload in dev
- [x] API endpoints: `/api/verify-email-reference`, `/api/fleet/emails`
- [x] Emails button added to fleet dashboard Management Hub

### Guest Prospect Invitation System (Jan 22)
- [x] Guest prospects management page `/fleet/guest-prospects`
- [x] Guest invite page `/guest-invite` with token validation
- [x] Guest onboard API `/api/guest-onboard/validate` with credit application
- [x] 72-hour expiry for guest invite links
- [x] Expired access tracking (expiredAccessCount, lastExpiredAccessAt)
- [x] Tracking pixel for prospect engagement
- [x] Guest credits system `/api/fleet/guests/[id]/credits`
- [x] Suspense boundary fix for Next.js 15
- [x] Updated guest invite email template (match host invite design)
- [x] Fixed Prisma errors in credit application (nanoid, depositTransaction)
- [x] Fixed guest invite auth recognition (add /payments/ to protected paths)

### Host Prospect Expiry Tracking (Jan 22)
- [x] Track expired link access attempts on host prospects
- [x] Show warning badge when prospect tried with expired link
- [x] Display "Tried Xx with expired link" in ProspectCard

### Edit Mode & UX Improvements (Jan 18)
- [x] BottomSheet component for mobile-friendly inline editing
- [x] Edit mode context system for landing page preview with section editors
- [x] Section editors: Hero, Services, Policies, FAQs, Contact/Social
- [x] DraftPage component for graceful handling of unpublished partners
- [x] Login tracking fields: lastLoginAt, previousLoginAt on RentalHost
- [x] WhyBookSection horizontal scroll on home page (8 benefit cards)
- [x] Mobile menu navigation fix: use /partner/* routes directly (fixes re-login bug)
- [x] Fix policies editor to use object structure matching database
- [x] Show only host first name in landing page titles (not full name)

### Landing Page Preview System (Jan 17)
- [x] Token-based preview for hosts to view unpublished landing pages
- [x] JWT preview tokens with 1-hour expiry via `/api/partner/preview-token`
- [x] Graceful not-found page for non-existent/unpublished partner slugs
- [x] PreviewBanner component with quick edit links to specific tabs
- [x] Publishing requirements tooltip explaining what's needed to go live:
  - Account approved
  - Valid URL slug set
  - At least 1 active vehicle
  - Rideshare or Rentals enabled
- [x] Dashboard header shows Live (green) vs Draft (yellow) status
- [x] Deep linking to editor tabs via `?tab=` query parameter
- [x] Breadcrumb hidden in preview mode for cleaner experience
- [x] Componentized landing page editor (reduced from 1510 to ~337 lines)

### Auth & Session Fixes
- [x] Fix Prisma relation names broken by `db pull` command
- [x] Add `@default(cuid())` to Session model
- [x] Add `@@map()` for snake_case models (platform_settings, insurance_history)
- [x] Fix middleware redirect loop when role not in allowed list
- [x] Remove Prisma code from middleware (Edge Runtime incompatible)
- [x] Fix OAuth redirect to use CLAIMED role for ANONYMOUS users

### Dashboard UX Improvements
- [x] Update tooltip alignment on stat cards
- [x] Remove card info display from Deposit stat
- [x] Separate verification states: incomplete vs processing
- [x] Orange alert when user started but didn't finish Stripe verification
- [x] Updated bonus text to "$250 Credit and Bonus"

### Booking Page Stripe Identity Integration
- [x] Replaced manual document uploads with Stripe Identity verification
- [x] Identity verification via Stripe (driver's license + selfie match)
- [x] Insurance upload is now optional (for 50% deposit discount)
- [x] Shows verification states: not started, pending/incomplete, verified
- [x] Return URL brings users back to booking page after verification

### Verify-First Flow (No Account Required)
- [x] Guests can verify identity WITHOUT creating an account first
- [x] Email input field for unauthenticated users
- [x] Silent email check before starting verification:
  - If email already verified → Prompt to sign in
  - If host account exists → Prompt to sign in and switch to guest
  - If new email → Start Stripe Identity verification
- [x] Webhook auto-creates User + ReviewerProfile after verification
- [x] Name and DOB populated from driver's license data
- [x] After Stripe return, check for auto-created account
- [x] New API endpoint: `/api/identity/verify-guest` (no auth required)

---

## In Progress

### Host Invite Expiry Options (Jan 22)
- [ ] Add expiry dropdown to ProspectCard Send Invite (48h, 72h, 7 days)
- [ ] Update `/api/fleet/prospects/[id]/invite` to accept expiryHours param
- [ ] Default to 48 hours if not specified

---

## Planned Features

### Unified Portal Consolidation
See: `.claude/plans/cosmic-swimming-moore.md`
- Merge Host Dashboard into Partner Portal
- Role-based navigation visibility
- Unified sign-up flow

---

## Notes

### Stripe Identity Verification States
- `null` / not started → Yellow "Verify Your Identity" alert
- `pending` → Orange "Complete Your Verification" (user may not have finished)
- `requires_input` → Orange "Complete Your Verification" (Stripe needs more info)
- `verified` → No alert shown

### User Roles
- `ANONYMOUS` → Default for new users (maps to CLAIMED for guest access)
- `CLAIMED` → Verified guest
- `STARTER`, `BUSINESS`, `ENTERPRISE` → Upgraded tiers
