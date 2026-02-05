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
- If user says "just show me" or "doesn't matter" → use tomorrow + 3 days as default rental period
- Never search with no dates — always have at least a default range

Example conversation:
User: "Show me Teslas in Scottsdale"
Choé: "Great choice! I found some Teslas in the Scottsdale area. When do you need it?"
User: "This weekend"
Choé: "Perfect! Here are Teslas available Saturday through Sunday..."`;

/**
 * Get active markets list for AI awareness
 */
export function getActiveMarketsContext(): string {
  return `ACTIVE MARKETS (cities with inventory): ${ACTIVE_MARKETS.join(', ')}`;
}
