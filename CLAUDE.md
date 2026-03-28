# Claude Code Project Guidelines

## Website ↔ App Sync Rule

**CRITICAL: All UI changes must be made in BOTH places simultaneously.**

The ItWhip website and mobile app share the same API, business logic, and booking flow. Any change to a guest-facing screen (booking detail, cancellation, payments, progress bar, etc.) MUST be implemented in both:
- **Website**: `app/[locale]/(guest)/rentals/...` components
- **App**: `ItWhipApp/src/components/guest/...` and `ItWhipApp/app/(guest)/...`

Same stages, same cards, same data, same formatting. Never update one without the other.

## Prisma / Database Migrations

**CRITICAL: Follow these rules to prevent database drift**

- **ALWAYS** use `npx prisma migrate dev --name <migration_name>` for schema changes
- **NEVER** use `npx prisma db push` (causes drift - migrations won't match database state)
- For production deployments: use `npx prisma migrate deploy`
- For hotfixes: use the patching workflow (create targeted migration, test, deploy)

### Why this matters
The project was baselined on 2025-01-13 after severe migration drift caused by `db push`.
All 61 migrations were squashed into a single `0_init` baseline. Going forward, every
schema change MUST go through proper migrations to maintain sync between:
- `prisma/schema.prisma` (source of truth)
- `prisma/migrations/` (migration history)
- Production database (actual state)

### Prisma Commands Reference
```bash
# Development: Create a new migration
npx prisma migrate dev --name add_user_preferences

# Production: Apply pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Generate Prisma client (after schema changes)
npx prisma generate
```

## Authentication System

The app uses a dual-role authentication system:
- **Guest/Renter**: Uses `accessToken` cookie, `ReviewerProfile` model
- **Host/Partner**: Uses `partner_token` or `hostAccessToken` cookie, `RentalHost` model
- Users can have both profiles linked via `User.legacyDualId`

## Project Structure

- `/app/partner/` - Unified business portal (hosts, fleet managers, partners)
- `/app/host/` - Legacy host dashboard (being deprecated, redirects to /partner/)
- `/app/admin/` - Admin dashboard
- `/app/api/` - API routes

## Code Style

- Use TypeScript for all new files
- Follow existing patterns in the codebase
- Prefer editing existing files over creating new ones
- All card components must use `rounded-lg` for consistent border radius

## AI Booking Assistant (Choé)

- Service layer: `app/lib/ai-booking/` (types, state-machine, prompts/, filters/, validators/, detection/)
- API: `POST /api/ai/booking` — Claude Haiku pattern (~$0.005/conversation)
- UI components: `app/components/ai/` (ChatView, ChatViewStreaming, MessageBubble, VehicleCard, ProgressBar, BookingSummary, ChatInput, SearchToggle, SearchWrapper)
- Entry points: `/rentals/search?mode=ai` (toggle in SearchResultsClient), homepage AI button
- Search API returns photos as `[{url, alt}]` objects — search-bridge normalizes to string URLs
- Model: `claude-haiku-4-5-20251001` (stored in ChoeAISettings table)

## Mobile App Card & Color Standards

All mobile app cards/pages/screens MUST follow these rules:

- **Cards**: `backgroundColor: colors.surface`, `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: RADIUS.lg`, `SHADOW.sm`
- **Edge-to-edge**: Cards stretch full width within `paddingHorizontal: SPACING.md`
- **Stat tiles**: Tinted `#F3F4F6` (light) / `rgba(55,65,81,0.5)` (dark) — not plain white
- **Dark mode**: Clean Tailwind grays (`#111827` bg, `#1F2937` surface, `#374151` border) — NO purple tints
- **Light mode**: White surface + visible borders (never borderless white-on-white)
- **Theme file**: `ItWhipApp/src/theme/index.ts`
- Any screen touched that has old faded/borderless styles gets updated to match

## Git Commits

- Use author: Chris H <info@itwhip.com>
- Do NOT use Co-Authored-By: Claude lines

## After Each Deployment

**IMPORTANT: Update documentation after every deployment**

After pushing changes to main (deployment), update `DEVNOTES.md`:
1. Move completed items from "In Progress" to the appropriate "Recent Fixes" section
2. Add new items to "In Progress" if work is ongoing
3. Keep the file organized by feature area

This ensures development history is tracked and teammates can see what changed.

## Business Rules & Architecture

### Development Approach
- ALWAYS define Prisma schema fields BEFORE writing UI/API code
- Every business rule maps to a database field — if you can't answer a question with a query, the schema is incomplete
- When implementing features with multiple logic branches, run the schema migration first as a separate step, confirm it passes, then implement UI/API
- One-liner logic per field, no paragraph interpretation

### Revenue System (Two Separate Paths)

**Insurance Tiers** (host opts INTO ITWhip insurance):
- Guest picks protection level at checkout
- Revenue split tied to coverage: Basic 40% / Standard 75% / Premium 90%
- Host keeps more when guest picks higher coverage (platform risk lower)

**Commission Tiers** (host uses OWN insurance):
- Split by fleet size, NOT per booking:
  - Standard: 0-9 cars → 25% commission, host keeps 75%
  - Gold: 10-49 cars → 20% commission, host keeps 80%
  - Platinum: 50-99 cars → 15% commission, host keeps 85%
  - Diamond: 100+ cars → 10% commission, host keeps 90%
- Auto-update tier when car count changes
- Prospect/recruited hosts ALWAYS land here (they have their own insurance)

### Prospect Host Flow
- Zero-CAC supply acquisition: target luxury car owners on Facebook/Instagram
- Booking-first onboarding: DM with real booking → email link → dashboard shows payout
- Onboarding bottomsheet: Secure → Agreement → Payment → Add Car
- Agreement preference: ITWHIP (default, recommended) | OWN (host uploads PDF, AI validates) | BOTH
- Payment preference: CASH | PLATFORM (Stripe Connect)
- Fleet admin approves car (5 min) → booking auto-links → host confirms

### Welcome Discount
- First recruited booking: 10% platform fee instead of 25%
- Schema: host.welcomeDiscountUsed === false → apply 10%
- After first booking COMPLETES: flip welcomeDiscountUsed = true
- All subsequent bookings: standard tier rate (25% for Standard)
- UI: strikethrough 25%, green "+$X Welcome Partner Discount", actual 10% fee

### Cash Booking Rules
- Guest pays host directly at pickup
- Handoff checklist is SEQUENTIAL and REQUIRED:
  1. Guest arrived
  2. Payment received (cash collected) — REQUIRED, cannot skip
  3. DL checked in person
  4. Guest identity confirmed personally (manual verification, saves $5)
  5. Guest begins vehicle inspection
  6. Handoff complete
- No "didn't pay" option — if no cash, host cancels booking
- Handoff complete on cash booking = ALWAYS paid
- Platform fee tracked in PlatformFeeOwed, deducted from next payout

### Guest Verification (Two Paths)
- Stripe Identity: $5 charge to host → added to HostDeductible
- Manual by host during handoff: host checks DL, confirms identity → saves $5
- Guest is verified if: documentsVerified === true OR manuallyVerifiedByHost === true
- ITWhip verifies document is authentic + selfie matches. Does NOT verify DL standing with DMV.

### Platform Fee Collection
- Platform bookings: deducted automatically from Stripe capture
- Cash bookings: tracked in PlatformFeeOwed, deducted from next payout or charged to payment method on file
- Host deductibles ($5 verification): tracked in HostDeductible, deducted from next payout
- Payout formula: hostEarnings - SUM(HostDeductible.PENDING) - SUM(PlatformFeeOwed.PENDING)

### Key Schema One-Liners
```
COMMISSION RATE:    booking.platformFeeRate ?? (host.welcomeDiscountUsed === false && prospect ? 0.10 : host.commissionRate)
GUEST VERIFIED:     guest.documentsVerified === true || guest.manuallyVerifiedByHost === true
WELCOME DISCOUNT:   host.welcomeDiscountUsed === false (one field, one check)
CASH PAID:          handoff complete on cash booking = always paid
PAYOUT:             hostEarnings - SUM(HostDeductible.PENDING) - SUM(PlatformFeeOwed.PENDING)
CAR ACTIVATABLE:    car.approvalStatus === 'APPROVED' && car.isActive === false
TIER:               0-9 STANDARD 0.25 | 10-49 GOLD 0.20 | 50-99 PLATINUM 0.15 | 100+ DIAMOND 0.10
```

### Choé AI Assistant
- Powered by Claude API (Haiku for search, Sonnet for document validation)
- Handles: car search, booking flow, guest verification, booking status, policy questions, host support
- Detects host vs guest context and adjusts responses
- Roadside emergencies route to phone: (602) 609-2577
- Cost: ~$0.005 per conversation

### What's Needed for Booking (Context-Aware)
- Cash booking: Insurance OPTIONAL, Agreement OPTIONAL (host may use own), Bank Account NOT REQUIRED, Guest Verification OPTIONAL (host verifies at handoff)
- Platform booking: Insurance OPTIONAL, Agreement REQUIRED (ITWhip standard minimum), Bank Account REQUIRED, Guest Verification REQUIRED
- Insurance is NEVER required regardless of payment type — never show red warning for insurance
