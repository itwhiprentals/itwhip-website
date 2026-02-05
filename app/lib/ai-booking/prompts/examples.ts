// app/lib/ai-booking/prompts/examples.ts
// Few-shot examples for better Claude JSON output accuracy

/**
 * Example conversations showing correct JSON responses
 * These are the most effective way to get Claude to output correct JSON
 */
export const EXAMPLE_CONVERSATIONS = [
  {
    context: 'User wants no-deposit cars',
    userMessage: 'Show me cars with no deposit in Phoenix',
    assistantResponse: {
      reply: "I'll find cars with no security deposit in Phoenix for you! 🚗",
      nextState: 'COLLECTING_DATES',
      extractedData: { location: 'Phoenix, AZ' },
      searchQuery: { location: 'Phoenix, AZ', noDeposit: true },
    },
  },
  {
    context: 'User wants cheap SUV',
    userMessage: 'I need a cheap SUV under $50/day in Scottsdale',
    assistantResponse: {
      reply: 'Looking for budget-friendly SUVs under $50/day in Scottsdale!',
      nextState: 'COLLECTING_DATES',
      extractedData: { location: 'Scottsdale, AZ', vehicleType: 'SUV' },
      searchQuery: { location: 'Scottsdale, AZ', carType: 'SUV', priceMax: 50 },
    },
  },
  {
    context: 'User wants instant booking',
    userMessage: 'Something I can book right now in Tempe',
    assistantResponse: {
      reply: 'Let me find cars available for instant booking in Tempe!',
      nextState: 'COLLECTING_DATES',
      extractedData: { location: 'Tempe, AZ' },
      searchQuery: { location: 'Tempe, AZ', instantBook: true },
    },
  },
  {
    context: 'Combined filters',
    userMessage: 'Cheap sedan with no deposit, instant book',
    assistantResponse: {
      reply: 'Finding affordable sedans with no deposit and instant booking!',
      nextState: 'COLLECTING_DATES',
      extractedData: { vehicleType: 'sedan' },
      searchQuery: { carType: 'sedan', noDeposit: true, instantBook: true },
    },
  },
  {
    context: 'Luxury preference',
    userMessage: 'I want something nice, a premium car',
    assistantResponse: {
      reply: "Let's find you a luxury vehicle! Where in Arizona do you need it?",
      nextState: 'COLLECTING_LOCATION',
      searchQuery: { carType: 'luxury' },
    },
  },
  {
    context: 'Electric vehicle',
    userMessage: 'Do you have any Teslas or electric cars?',
    assistantResponse: {
      reply: 'Yes! We have several electric vehicles. Which city?',
      nextState: 'COLLECTING_LOCATION',
      searchQuery: { carType: 'electric' },
    },
  },
  {
    context: 'Delivery request',
    userMessage: 'Can you deliver to Sky Harbor airport?',
    assistantResponse: {
      reply: 'Absolutely! Many of our cars offer airport delivery. What dates?',
      nextState: 'COLLECTING_DATES',
      extractedData: { location: 'Phoenix, AZ' },
      searchQuery: { location: 'Phoenix, AZ', delivery: 'airport' },
    },
  },
  {
    context: 'Price range',
    userMessage: 'Show me cars between $30-$60 per day',
    assistantResponse: {
      reply: "I'll find cars in the $30-$60/day range. Where do you need it?",
      nextState: 'COLLECTING_LOCATION',
      searchQuery: { priceMin: 30, priceMax: 60 },
    },
  },
];

/**
 * Format examples for inclusion in system prompt
 */
export function getExamplesForPrompt(): string {
  return (
    'EXAMPLE RESPONSES (follow these patterns):\n\n' +
    EXAMPLE_CONVERSATIONS.map(
      (ex) =>
        `User: "${ex.userMessage}"\nResponse: ${JSON.stringify(ex.assistantResponse, null, 2)}`
    ).join('\n\n---\n\n')
  );
}
