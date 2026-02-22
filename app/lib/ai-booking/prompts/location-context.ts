// app/lib/ai-booking/prompts/location-context.ts
// Location intelligence context for system prompts

import {
  PHOENIX_METRO,
  TUCSON_METRO,
  ACTIVE_MARKETS,
  hasActiveInventory,
  getNearestMarket,
  getMetroArea,
  extractCityName,
} from '../filters/location';

/**
 * Service area awareness for the AI
 */
export const SERVICE_AREA_CONTEXT = `SERVICE AREAS:
Phoenix Metro (shared inventory, 25-mile search radius covers all): ${PHOENIX_METRO.slice(0, 8).join(', ')}, etc.
Tucson Metro: ${TUCSON_METRO.join(', ')}
Other Active Markets: Flagstaff, Sedona, Prescott

IMPORTANT: When user mentions any Phoenix metro city (Scottsdale, Tempe, Mesa, Chandler, etc.), cars may be in nearby cities — this is normal and expected. Don't ask "do you want cars from Phoenix instead?" — just show the results.`;

/**
 * Build location-specific context based on user's requested city
 */
export function buildLocationContext(location: string | null): string {
  if (!location) {
    return `LOCATION: Not yet specified. Ask where in Arizona they need the car.`;
  }

  const cityName = extractCityName(location);
  const metro = getMetroArea(location);
  const hasInventory = hasActiveInventory(location);

  const lines: string[] = [`REQUESTED LOCATION: ${location}`];

  if (metro) {
    lines.push(`METRO AREA: ${metro} — cars from neighboring cities are normal and expected`);
  }

  if (!hasInventory) {
    const nearest = getNearestMarket(location);
    if (nearest) {
      lines.push(`INVENTORY WARNING: ${cityName} has no listings. Nearest market: ${nearest.nearest} (${nearest.distance}, ${nearest.driveTime})`);
      lines.push(`BEHAVIOR: Politely inform user and offer to search ${nearest.nearest} instead. Example: "We don't have cars in ${cityName} yet, but I can search ${nearest.nearest} — it's about ${nearest.driveTime} away. Would that work?"`);
    }
  }

  return lines.join('\n');
}

/**
 * Default dates behavior for the AI
 */
export const DEFAULT_DATES_BEHAVIOR = `DEFAULT DATES:
When user requests cars without specifying dates (e.g., "show me cars in Phoenix", "what SUVs do you have"):
- Suggest default dates: "When do you need it? If you're flexible, I can show what's available starting tomorrow."
- If user confirms with ANY affirmative ("yes", "sure", "ok", "yeah", "sounds good", "just show me", "doesn't matter", "that works") → IMMEDIATELY call search_vehicles with tomorrow as pickupDate and tomorrow+3 days as returnDate. Do NOT ask for dates again.
- "today and tomorrow", "this weekend", "next week" → convert to actual YYYY-MM-DD dates and search immediately
- Never search with no dates — always have at least a default range
- CRITICAL: When you say "Here's what I found" or "Let me show you" — you MUST actually call the search_vehicles tool. Never say you found cars without calling the tool first.

Example conversation:
User: "Show me Teslas in Scottsdale"
Choé: "When do you need it? If you're flexible, I can show what's available starting tomorrow."
User: "yes" or "sure" or "sounds good"
Choé: [calls search_vehicles with tomorrow + 3 days] "Here's what's available..."
User: "This weekend"
Choé: [calls search_vehicles with Saturday-Sunday dates] "Perfect! Here are Teslas available Saturday through Sunday..."`;

/**
 * Get active markets list for AI awareness
 */
export function getActiveMarketsContext(): string {
  return `ACTIVE MARKETS (cities with inventory): ${ACTIVE_MARKETS.join(', ')}`;
}
