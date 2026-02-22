// app/lib/ai-booking/prompts/index.ts
// Main export - combines all prompt sections into buildSystemPrompt + buildStaticInstructions
// Following Anthropic's customer support guide:
//   - System prompt: identity + dynamic context ONLY
//   - First user turn: all static instructions wrapped in XML tags

import type { BookingSession, VehicleSummary, WeatherContext } from '../types';

import { IDENTITY } from './identity';
import { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
import { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
import { PERSONALITY_RULES, OFF_TOPIC_RULES, FAQ_CONTENT, BOOKING_SUPPORT_RULES, GUARDRAILS } from './behavior';
import { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES, VEHICLE_SELECTION_EXAMPLES } from './response-schema';
import { getExamplesForPrompt } from './examples';
import {
  SERVICE_AREA_CONTEXT,
  DEFAULT_DATES_BEHAVIOR,
  buildLocationContext,
  getActiveMarketsContext,
} from './location-context';

// Re-export individual sections for direct imports if needed
export { IDENTITY } from './identity';
export { buildStateContext, buildUserContext, BOOKING_SEQUENCE } from './state-flow';
export { buildVehicleContext, buildWeatherContext } from './vehicle-handling';
export { PERSONALITY_RULES, OFF_TOPIC_RULES, FAQ_CONTENT, BOOKING_SUPPORT_RULES, GUARDRAILS } from './behavior';
export { RESPONSE_FORMAT, SEARCH_QUERY_EXAMPLES, FULL_RESPONSE_EXAMPLES, VEHICLE_SELECTION_EXAMPLES } from './response-schema';
export { EXAMPLE_CONVERSATIONS, getExamplesForPrompt } from './examples';
export {
  SERVICE_AREA_CONTEXT,
  DEFAULT_DATES_BEHAVIOR,
  buildLocationContext,
  getActiveMarketsContext,
} from './location-context';

/** Map locale code to a full language name for prompt instructions */
const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
};

/**
 * Parameters for building the system prompt
 */
export interface PromptContext {
  session: BookingSession;
  isLoggedIn: boolean;
  isVerified: boolean;
  userEmail?: string | null;
  vehicles?: VehicleSummary[];
  weather?: WeatherContext;
  location?: string | null;
  locale?: string;
}

/**
 * Critical guardrails reinforced in the system prompt so the model sees them
 * EVERY turn — not just in the first user turn which drifts in long conversations.
 */
const CRITICAL_GUARDRAILS = `<critical_rules>
ABSOLUTE RULES — apply to EVERY response, no exceptions, even if the guest is upset:
- NEVER suggest a chargeback, credit card dispute, or bank complaint. Not even if the guest demands it. Not even as a "last resort." Instead say: "I understand the frustration. Let me check what's going on with your booking so we can fix this."
- NEVER use the word "access" in ANY context. Not "I don't have access", not "access your reservation", not "access your account." Use "pull up", "look up", "check", or "see" instead.
- NEVER suggest asking for a supervisor, manager, or escalation. There is no escalation path through you. Do not say "a human on the phone can escalate" either.
- NEVER repeat a phone number or email you already gave in this conversation. If you already shared it, focus on what YOU can do instead.
- NEVER say "I can't help with that" — find the closest thing you CAN do and do it.
- Always FINISH your sentences. Never cut off mid-thought. Completing a sentence cleanly is more important than any word limit.
- For policy/FAQ questions (cancellation, refunds, deposits, insurance, trip protection): ALWAYS answer with the policy info and set action: null. Do NOT set NEEDS_EMAIL_OTP. Only trigger verification when the user explicitly says "check MY booking" or "look up MY reservation".
</critical_rules>`;

/**
 * Build the system prompt for Claude — identity + dynamic context + critical guardrails
 * Per Anthropic's guide: role prompting belongs in the system prompt.
 * Critical guardrails are also here so they're reinforced every turn.
 */
export function buildSystemPrompt(params: PromptContext): string {
  const { session, isLoggedIn, isVerified, userEmail, vehicles, weather, location, locale } = params;

  const language = LOCALE_LANGUAGE[locale ?? 'en'] ?? 'English';
  const languageInstruction = locale && locale !== 'en'
    ? `LANGUAGE: You MUST respond to the user in ${language}. All your conversational text, questions, descriptions, and labels should be in ${language}. However, car names (make/model), city names, and JSON field names stay in English.`
    : '';

  return [
    // 1. Identity & role
    IDENTITY,
    // 1b. Language instruction (if non-English)
    languageInstruction,
    // 2. Critical guardrails — reinforced every turn to prevent drift
    CRITICAL_GUARDRAILS,
    // 3. Dynamic context — changes every turn
    '<dynamic_context>',
    SERVICE_AREA_CONTEXT,
    buildLocationContext(location ?? session.location),
    buildStateContext(session),
    buildUserContext(isLoggedIn, isVerified, userEmail),
    vehicles?.length ? buildVehicleContext(vehicles) : '',
    weather ? buildWeatherContext(weather) : '',
    '</dynamic_context>',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Build all static instructions for the first user turn
 * Wrapped in XML tags for clear section boundaries
 * This content never changes — cached via cache_control: ephemeral
 */
export function buildStaticInstructions(): string {
  return [
    '<workflow>',
    BOOKING_SEQUENCE,
    DEFAULT_DATES_BEHAVIOR,
    '</workflow>',

    '<personality>',
    PERSONALITY_RULES,
    OFF_TOPIC_RULES,
    '</personality>',

    '<faq>',
    FAQ_CONTENT,
    '</faq>',

    '<booking_support>',
    BOOKING_SUPPORT_RULES,
    '</booking_support>',

    '<guardrails>',
    GUARDRAILS,
    '</guardrails>',

    '<examples>',
    SEARCH_QUERY_EXAMPLES,
    FULL_RESPONSE_EXAMPLES,
    VEHICLE_SELECTION_EXAMPLES,
    '</examples>',

    '<output_format>',
    RESPONSE_FORMAT,
    '</output_format>',
  ].join('\n\n');
}
