# ItWhip Development Notes

## Recent Fixes (January 2026)

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
