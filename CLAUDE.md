# Claude Code Project Guidelines

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
