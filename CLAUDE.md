# CLAUDE.md — ITWhip Website (Next.js Backend + Website)

## Project Overview
ITWhip is a peer-to-peer car rental marketplace operating in Arizona (itwhip.com).
Next.js app with Prisma/PostgreSQL, Stripe Connect, AWS App Runner, S3 + CloudFront.
Solo founder build. The mobile app (ItWhipApp) is a separate React Native/Expo repo
that consumes this backend's API routes. Both repos MUST share the same logic.

## Golden Rule
The website backend and the mobile app are ONE platform. If logic exists here,
the mobile app must match. If a field changes here, update the mobile API calls.
If a business rule changes here, the mobile app's behavior must reflect it.
Never fix something on the backend that breaks the mobile app, and vice versa.

---

## Architecture Rules

### Schema-First Development
- Define Prisma schema fields BEFORE writing UI or API code
- Every business rule must map to a database field
- Claude Code can reference fields directly instead of interpreting paragraphs of logic
- Run `npx prisma db push` or create a migration after schema changes

### Auth Tokens — NEVER MIX
- **Host tokens**: signed with `JWT_SECRET` + `JWT_REFRESH_SECRET`, audience `itwhip-host`
- **Guest tokens**: signed with `GUEST_JWT_SECRET` + `GUEST_JWT_REFRESH_SECRET`, audience `itwhip-guest`
- When `roleHint=host`: backend MUST return host tokens
- When `roleHint=host`: backend MUST create RentalHost record if none exists
- NEVER store guest tokens in host token slots or vice versa
- The mobile app stores them separately: `host_access_token` vs `auth_access_token`

### Phone-First Auth
- Firebase for phone OTP (free 10K/month) — website + mobile
- Twilio ONLY for transactional SMS (booking alerts, trip reminders)
- Never use Twilio for authentication
- Priority: Phone → Apple → Google → Email (fallback)

### Storage — S3 + CloudFront
- **Private bucket** (`itwhip-private-documents`): DL photos, identity docs, agreements, claims
  - Encrypted AES-256, no public access, pre-signed URLs (15-min expiry)
  - Store S3 KEY in database, never a URL
- **Public bucket** (`itwhip-public-assets`): car photos, profiles, logos
  - Served via CloudFront: `photos.itwhip.com`
  - Store full CloudFront URL in database
- NO Cloudinary. Cloudinary is eliminated.

### Push Notifications
- Direct fetch to `https://exp.host/--/api/v2/push/send`
- No expo-server-sdk (breaks in Docker)
- Create PushNotification DB record FIRST, then send push
- On logout: deregister push token BEFORE clearing auth tokens

### Deployment
- GitHub Actions → ECR → AWS App Runner (~8 min deploy)
- Docker with `output: 'standalone'` and `binaryTargets: ['native', 'linux-arm64']`
- 74 environment variables in App Runner
- 8+ EventBridge cron jobs with CRON_SECRET Bearer token

---

## Signup Defaults (ALL paths MUST match)

Every host creation path sets these exact defaults:
revenuePath: 'tiers'
commissionRate: 0.25
currentCommissionRate: 0.25
approvalStatus: 'PENDING'
dashboardAccess: false (regular) or true (prospect)
active: false

Paths: host/signup, partner/signup, auth/complete-profile, admin/approve, phone-login/collect-email

---

## Revenue Paths (Two Models)

1. **Insurance Tiers** — host opts into ITWhip insurance:
   - 40% BASIC (platform insurance, no upload needed)
   - 75% STANDARD (P2P insurance, upload required)
   - 90% PREMIUM (commercial insurance, upload required)

2. **Commission Tiers** — host uses own insurance:
   - Standard (0-9 cars): 25%
   - Gold (10-49): 20%
   - Platinum (50-99): 15%
   - Diamond (100+): 10%

---

## Lessons Learned — DO NOT REPEAT

- `RentalHost.userId` MUST be set when creating a host. Never null.
- `bookingData.hostId` can be undefined — always use `booking.booking.hostId` as fallback
- expo-server-sdk crashes in Docker (`Cannot find module '../package.json'`) — use direct fetch
- Fleet approval code: variable is `approvedBooking`, not `booking` — check scope
- Fleet push templates MUST be async — `.catch()` crashes if function returns undefined
- Badge-counts requires RentalHost.userId linked to User for emailVerified/phoneVerified checks
- Phone-login `collect-email`: when `roleHint=host`, create RentalHost AND return host tokens
- Phone-login: if existing host found by email with null userId, PATCH the userId
- Payout name mismatch: compare host profile name vs Stripe bank name BEFORE payout, not before listing
- Email verification: sent but NOT enforced at signup (red dot nudges later)
- Don't ship `.map` files in production builds
- Always check `authApi.ts` API_BASE is production before deploying mobile app

---

## Verification Timing

| Verification | At Signup | At Booking | At Pickup |
|---|---|---|---|
| Phone | Yes (if phone auth) | No | No |
| Email | Code sent, NOT blocking | No | No |
| DL + Selfie | No | Yes (checkout) | Host can verify manually |
| Banking name match | No | No | Before payout |

---

## Workflow Rules

1. **Plan before building** — 3+ steps = write plan, get approval
2. **Audit before changing** — read existing code, report what exists
3. **Build in order** — schema → API → UI
4. **Verify after building** — check logs, test endpoint, confirm DB state
5. **Never say "done" without proving it works** — show the log output, the DB state, the API response
6. **If something goes sideways, STOP and re-plan** — don't keep pushing a broken approach
7. **After ANY correction, remember the lesson** — add to Lessons Learned above

---

## DO NOT

- Change guest flows when fixing host flows (and vice versa)
- Go on tangents about unrelated systems
- Revert fixes without being asked
- Store pre-signed S3 URLs in the database (they expire)
- Use Cloudinary for anything
- Use expo-server-sdk for push notifications
- Leave console.log debug statements in production
- Add TODO comments instead of implementing
- Make the private S3 bucket publicly accessible
- Ship source maps in production builds
- Skip the plan step for non-trivial changes
- Say "expected behavior" without verifying the actual API response data

---

## SIBLING PROJECT: CHOE CLOUD

ITWhip has a sibling project: **Choe Cloud** (repo: `choe-cloud`).

Choe Cloud is a standalone AI commerce infrastructure platform. The Choe AI assistant
currently embedded in ITWhip is being extracted into Choe Cloud as a multi-tenant service.
ITWhip will become Choe Cloud's Client #1, calling the Choe Cloud API instead of running
its own embedded engine.

**Key rules:**
- ITWhip and Choe Cloud share an AWS account but NOTHING else
- Different database (separate Neon project)
- Different Stripe account
- Different S3 bucket
- Different App Runner service
- Different domain (choe.cloud vs itwhip.com)
- NEVER import code from one project into the other
- NEVER share database connections
- NEVER share auth tokens or JWT secrets

**Migration plan:**
- Phase 1 (now): Choe Cloud built as independent platform
- Phase 2 (after launch): ITWhip's embedded Choe gets an API key for Choe Cloud
- Phase 3: ITWhip calls Choe Cloud API for AI features instead of local engine
- Phase 4: ITWhip's local Choe engine deprecated, fully using Choe Cloud

**If working in ITWhip and asked about Choe Cloud:** Direct to the choe-cloud repo. Do not build Choe Cloud features inside ITWhip.
