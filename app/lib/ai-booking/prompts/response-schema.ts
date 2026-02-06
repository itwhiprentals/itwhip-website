// app/lib/ai-booking/prompts/response-schema.ts
// JSON response format and field rules for Claude

/**
 * The required JSON response format
 */
export const RESPONSE_FORMAT = `RESPONSE FORMAT:
You MUST respond with valid JSON only. No text outside the JSON object.

{
  "reply": "Your conversational message to the user",
  "nextState": "COLLECTING_DATES",
  "extractedData": {
    "location": "Scottsdale",
    "startDate": "2026-02-01",
    "endDate": "2026-02-02"
  },
  "action": null,
  "searchQuery": null
}

FIELD RULES:
- reply: 2-3 sentences, ends with question or action prompt
- nextState: The state AFTER processing this message
- extractedData: Only include fields you actually extracted. Omit fields with no new data.
- action: null for normal flow, or one of: "HANDOFF_TO_PAYMENT", "NEEDS_LOGIN", "NEEDS_VERIFICATION", "HIGH_RISK_REVIEW", "START_OVER"
- searchQuery: Include ONLY when searching for cars (location + dates available)

CRITICAL FILTER RULES (read carefully):
1. "no deposit" / "without deposit" / "zero deposit" / "$0 deposit" → ALWAYS set noDeposit: true
2. Specific make (Toyota, BMW, Tesla) → ALWAYS set make field
3. Vehicle type (SUV, sedan, luxury, sports, electric) → ALWAYS set carType field
4. Price mentions → set priceMin and/or priceMax
5. "instant book" / "book now" / "right now" → set instantBook: true
6. "uber" / "lyft" / "rideshare" / "doordash" → set vehicleType: "RIDESHARE"

WHEN TO SET searchQuery:
- Transitioning to COLLECTING_VEHICLE with location + dates
- User changes search criteria (location, dates, type, make)
- User asks to browse ("show me what you have", "what's available")
- You CAN re-search even if vehicles were already shown
- If location known but no dates, default to tomorrow + 3 days`;

/**
 * Specific searchQuery examples - ALL include location + dates
 */
export const SEARCH_QUERY_EXAMPLES = `
SEARCHQUERY EXAMPLES — follow these patterns exactly (always include location + dates):

No deposit in Phoenix:
{ "location": "Phoenix", "noDeposit": true, "pickupDate": "2026-02-05", "returnDate": "2026-02-08" }

Budget sedan, no deposit:
{ "location": "Tempe", "carType": "sedan", "noDeposit": true, "priceMax": 40, "pickupDate": "2026-02-05", "returnDate": "2026-02-08" }

SUV under $50/day in Scottsdale:
{ "location": "Scottsdale", "carType": "SUV", "priceMax": 50, "pickupDate": "2026-02-10", "returnDate": "2026-02-14" }

Tesla/electric vehicle:
{ "location": "Phoenix", "carType": "electric", "make": "Tesla", "pickupDate": "2026-02-05", "returnDate": "2026-02-07" }

Luxury instant book:
{ "location": "Tempe", "carType": "luxury", "instantBook": true, "pickupDate": "2026-02-06", "returnDate": "2026-02-09" }

Price range search:
{ "location": "Mesa", "priceMin": 30, "priceMax": 60, "pickupDate": "2026-02-05", "returnDate": "2026-02-08" }

Rideshare vehicle for Uber/Lyft:
{ "location": "Phoenix", "vehicleType": "RIDESHARE", "pickupDate": "2026-02-05", "returnDate": "2026-02-12" }`;

/**
 * Complete response examples showing full JSON structure
 */
export const FULL_RESPONSE_EXAMPLES = `
COMPLETE RESPONSE EXAMPLES:

User says "I need a car with no deposit in Phoenix next weekend":
{
  "reply": "I'll find cars with no security deposit in Phoenix for next weekend!",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": { "location": "Phoenix", "startDate": "2026-02-07", "endDate": "2026-02-09" },
  "action": null,
  "searchQuery": { "location": "Phoenix", "noDeposit": true, "pickupDate": "2026-02-07", "returnDate": "2026-02-09" }
}

User says "show me SUVs under 60 bucks in Scottsdale":
{
  "reply": "Looking for SUVs under $60/day in Scottsdale!",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": { "location": "Scottsdale" },
  "action": null,
  "searchQuery": { "location": "Scottsdale", "carType": "SUV", "priceMax": 60, "pickupDate": "2026-02-05", "returnDate": "2026-02-08" }
}

User says "any Teslas available?" (location already known as Tempe):
{
  "reply": "Let me check Tesla availability in Tempe for your dates!",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": {},
  "action": null,
  "searchQuery": { "location": "Tempe", "make": "Tesla", "carType": "electric", "pickupDate": "2026-02-10", "returnDate": "2026-02-13" }
}

User says "I need a car for Uber, no deposit please":
{
  "reply": "I'll find rideshare-approved cars with no deposit for you!",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": {},
  "action": null,
  "searchQuery": { "location": "Phoenix", "vehicleType": "RIDESHARE", "noDeposit": true, "pickupDate": "2026-02-05", "returnDate": "2026-02-12" }
}`;

/**
 * Vehicle selection and information request examples
 * These are CRITICAL - Claude often fails to distinguish selection vs info requests
 */
export const VEHICLE_SELECTION_EXAMPLES = `
<vehicle_interaction_examples>
CRITICAL: Know the difference between SELECTING a vehicle vs ASKING about it.

SELECTION (user wants to book this car):
User says "I'll take the Honda Civic" or "Let's go with that one" or "Book the BMW":
{
  "reply": "Great choice! The 2022 Honda Civic is confirmed. Let me prepare your booking details.",
  "nextState": "CONFIRMING",
  "extractedData": { "vehicleId": "use_the_actual_vehicle_id_from_context" },
  "action": null,
  "searchQuery": null
}

INFORMATION REQUEST (user wants to know more, NOT booking yet):
User says "Does that BMW have good reviews?" or "Tell me more about the Tesla" or "What features does it have?":
{
  "reply": "The 2023 BMW 3 Series has a 4.8★ rating from 23 trips! Renters love its smooth handling and premium interior.",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": {},
  "action": null,
  "searchQuery": null
}

COMPARISON REQUEST (don't re-search, use shown vehicles):
User says "Which one is cheaper?" or "Compare the first two" or "What's the best value?":
{
  "reply": "The Honda Civic at $45/day offers the best value with a 4.9★ rating. The BMW is $75/day but has more luxury features.",
  "nextState": "COLLECTING_VEHICLE",
  "extractedData": {},
  "action": null,
  "searchQuery": null
}

READY FOR PAYMENT (after confirmation):
User says "Yes, let's book it" or "I'm ready to pay" (after vehicle confirmed):
{
  "reply": "Perfect! Let me hand you off to complete your payment.",
  "nextState": "READY_FOR_PAYMENT",
  "extractedData": {},
  "action": "HANDOFF_TO_PAYMENT",
  "searchQuery": null
}
</vehicle_interaction_examples>`;
