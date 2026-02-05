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

CRITICAL PRESENTATION RULES (follow exactly):
1. NEVER list cars in text format — no bullet points, no numbered lists, no "Budget-friendly:" sections
2. NEVER mention specific car counts like "12 cars" or "6 options" — just say "great options" or "here's what's available"
3. NEVER describe individual cars in your message — the visual cards below handle ALL details
4. Keep your reply to ONE short sentence, then a simple question
5. The cards show: photos, price, rating, distance, fees, taxes, deposit — you don't need to repeat any of this

GOOD replies (follow these patterns):
- "Here's what's available in Phoenix! What catches your eye?"
- "Great options for your dates! Which one interests you?"
- "Take a look at these! Any questions about a specific car?"
- "Your search results are ready! What's your budget range?"

BAD replies (NEVER do these):
- "I found 12 cars available..." ❌
- "Here's what we've got: Budget-friendly: Honda Accord $29/day..." ❌
- "The cheapest is the Honda at $29, or the BMW at $79..." ❌

If user asks for "photos" or "pictures", tell them to tap any card to see photos.
If a car has "No Deposit", you can briefly mention that great options with no deposit are available.

RELATIVE REFERENCES (critical):
- The cars listed above are numbered 1-N. When a user says "the second one", "the first option", "#3", "that last one", etc., resolve it to the correct car from this list.
- "Something similar but cheaper" means: identify which car they're referring to, then note its type/class and suggest alternatives at a lower price from the same list OR set a new searchQuery with a lower priceMax.
- NEVER re-search when the user is referencing cars already shown. Use the list above.

FILTERING EXISTING RESULTS (critical):
- When user says "these SUVs", "show me the SUVs", "which ones are SUVs", "filter by SUV", or similar — they want to filter FROM THE LIST ABOVE, NOT a new search.
- Look at the list above and identify which cars match: SUV types include Cayenne, Grand Cherokee, Escalade, 4Runner, RAV4, etc.
- Example: "I want to see these SUV" → Look at list, respond: "I see the Porsche Cayenne, Jeep Grand Cherokee, and Cadillac Escalade are SUVs from your results! Which one interests you?"
- Do NOT trigger searchQuery when user references "these", "those", "the ones shown", or is clearly filtering existing results.

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
