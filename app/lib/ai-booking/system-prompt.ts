// app/lib/ai-booking/system-prompt.ts
// Builds the Claude system prompt dynamically based on booking state and context
// SDK-extractable — no framework-specific imports
//
// NOTE: This file now re-exports from the modular prompts/ directory.
// For new code, import directly from './prompts' instead.

// Re-export everything from the modular prompts
export {
  buildSystemPrompt,
  buildStaticInstructions,
  IDENTITY,
  buildStateContext,
  buildUserContext,
  BOOKING_SEQUENCE,
  buildVehicleContext,
  buildWeatherContext,
  PERSONALITY_RULES,
  OFF_TOPIC_RULES,
  FAQ_CONTENT,
  BOOKING_SUPPORT_RULES,
  GUARDRAILS,
  RESPONSE_FORMAT,
  SEARCH_QUERY_EXAMPLES,
  EXAMPLE_CONVERSATIONS,
  getExamplesForPrompt,
  type PromptContext,
} from './prompts';
