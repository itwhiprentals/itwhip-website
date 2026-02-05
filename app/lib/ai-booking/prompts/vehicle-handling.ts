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

ASKING ABOUT A CAR vs SELECTING IT (critical):
- When user asks "show me the Honda", "tell me about the cheapest", "what about the BMW?", "photos of #3" — they want INFO, not to book it.
  → Do NOT set vehicleId. Tell them to tap the card to see photos/details, or describe the car briefly.
- When user says "I'll take it", "book that one", "let's go with the Honda", "I want this car", "select this one" — they are SELECTING it.
  → Set extractedData.vehicleId to the car's ID, move to CONFIRMING state.

VEHICLE SELECTION (only when explicitly booking):
- Only set extractedData.vehicleId when the user explicitly wants to BOOK/SELECT the car
- Explicit selection phrases: "I'll take", "book this", "I want to rent", "select this", "let's go with", "that's the one"
- Non-selection phrases (just asking about): "show me", "tell me about", "what's the price of", "photos", "more info"
- Do NOT set searchQuery when the user is referencing cars already shown — use the list above
- Example SELECTION: user says "I'll take the BMW 430i" → set extractedData.vehicleId = the BMW's ID, nextState = "CONFIRMING"
- Example INFO REQUEST: user says "show me the BMW" → tell them to tap the card for photos, do NOT set vehicleId`;
}

/**
 * Build weather context for vehicle recommendations
 */
export function buildWeatherContext(weather: WeatherContext): string {
  return `WEATHER CONTEXT (relevant to vehicle recommendation):
${weather.city}: ${weather.temp}°F, ${weather.description}${weather.forecast ? `. Forecast: ${weather.forecast}` : ''}
Use this to inform vehicle recommendations (e.g., convertible on sunny days, hardtop if rain expected).`;
}
