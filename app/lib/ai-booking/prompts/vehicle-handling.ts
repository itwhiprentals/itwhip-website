// app/lib/ai-booking/prompts/vehicle-handling.ts
// Vehicle listing context and handling instructions

import type { VehicleSummary, WeatherContext } from '../types';

/**
 * Build context string for available vehicles
 */
export function buildVehicleContext(vehicles: VehicleSummary[]): string {
  if (vehicles.length === 0) return 'AVAILABLE CARS: None found matching criteria.';

  const list = vehicles
    .map(
      (v, i) =>
        `  ${i + 1}. ${v.year} ${v.make} ${v.model} — $${v.dailyRate}/day` +
        (v.rating ? ` · ⭐${v.rating}` : '') +
        (v.trips > 0 ? ` · ${v.trips} trips` : '') +
        (v.distance ? ` · ${v.distance}` : '') +
        ` · ${v.location}` +
        (v.depositAmount === 0 ? ' · No Deposit' : '') +
        (v.instantBook ? ' · Instant Book' : '') +
        (v.vehicleType === 'RIDESHARE' ? ' · Rideshare' : '') +
        ` [ID: ${v.id}]`
    )
    .join('\n');

  return `AVAILABLE CARS (${vehicles.length} found):\n${list}

When presenting cars to the user:
- Do NOT list out the cars in text format — the visual cards below your message show all the details (photos, price, rating, distance, full pricing breakdown)
- Do NOT show internal IDs to the user
- Keep your reply SHORT: just acknowledge the results and invite them to browse
- Example replies:
  - "Found 6 great options in Phoenix! 🚗 Tap any card to see photos and pricing details."
  - "Here are your matches! Each card shows the full breakdown — tap 'Details' to expand."
  - "Nice selection available! Take a look at the cards below and let me know which one catches your eye."
- The cards handle everything: photos, daily rate, service fees, taxes, deposit, and total price
- If user asks for "photos" or "pictures", tell them to tap any card to expand and see all photos
- If a car has "No Deposit", highlight this as a benefit when relevant!

RELATIVE REFERENCES (critical):
- The cars listed above are numbered 1-N. When a user says "the second one", "the first option", "#3", "that last one", etc., resolve it to the correct car from this list.
- "Something similar but cheaper" means: identify which car they're referring to, then note its type/class and suggest alternatives at a lower price from the same list OR set a new searchQuery with a lower priceMax.
- NEVER re-search when the user is referencing cars already shown. Use the list above.

COMPARISON REQUESTS:
- If user asks to compare two cars (e.g. "difference between the Tesla and Kia"), provide the comparison IMMEDIATELY — do NOT ask "would you like me to compare?" when they already asked.
- Compare: price, rating, distance, type, and any notable differences.
- Keep comparisons concise: 3-4 bullet points max, then ask which they prefer.

VEHICLE SELECTION (critical):
- When the user names a car from the list above (by name, number, or partial match like "BMW" or "the Corvette"), this is a SELECTION — NOT a new search request.
- Set extractedData.vehicleId to the matching car's ID from the list above.
- Do NOT set searchQuery when the user is selecting from already-shown vehicles.
- Move to CONFIRMING state and show a booking summary.
- Example: if cars include "2018 BMW 430i [ID: abc123]" and user says "BMW 430i" → set extractedData.vehicleId = "abc123", nextState = "CONFIRMING"`;
}

/**
 * Build weather context for vehicle recommendations
 */
export function buildWeatherContext(weather: WeatherContext): string {
  return `WEATHER CONTEXT (relevant to vehicle recommendation):
${weather.city}: ${weather.temp}°F, ${weather.description}${weather.forecast ? `. Forecast: ${weather.forecast}` : ''}
Use this to inform vehicle recommendations (e.g., convertible on sunny days, hardtop if rain expected).`;
}
