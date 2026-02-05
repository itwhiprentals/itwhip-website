// app/lib/ai-booking/token-counting.ts
// Token counting utilities for pre-validation and context management

import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// CONFIGURATION
// =============================================================================

// Maximum context size before we need to trim conversation history
// Leave room for output tokens and tool definitions
export const MAX_INPUT_TOKENS = 50000

// Minimum messages to keep when trimming (3 turns = 6 messages)
export const MIN_MESSAGES_TO_KEEP = 6

// =============================================================================
// TYPES
// =============================================================================

export interface TokenCountResult {
  inputTokens: number
  needsTrimming: boolean
  trimmedMessages?: Anthropic.MessageParam[]
}

// =============================================================================
// TOKEN COUNTING
// =============================================================================

/**
 * Count tokens and validate context size before making API call
 * Returns trimmed messages if context is too large
 */
export async function countAndValidateTokens(
  client: Anthropic,
  model: string,
  systemPrompt: string,
  messages: Anthropic.MessageParam[],
  tools?: Anthropic.Tool[]
): Promise<TokenCountResult> {
  try {
    // Count tokens for the current context
    const countParams: Anthropic.MessageCountTokensParams = {
      model,
      system: systemPrompt,
      messages,
    }

    if (tools) {
      countParams.tools = tools
    }

    const countResult = await client.messages.countTokens(countParams)
    const inputTokens = countResult.input_tokens

    if (inputTokens <= MAX_INPUT_TOKENS) {
      return { inputTokens, needsTrimming: false }
    }

    // Need to trim - remove older messages but keep the system context
    let trimmedMessages = [...messages]

    while (trimmedMessages.length > MIN_MESSAGES_TO_KEEP) {
      // Remove the oldest pair of messages (user + assistant)
      trimmedMessages = trimmedMessages.slice(2)

      const newCountParams: Anthropic.MessageCountTokensParams = {
        model,
        system: systemPrompt,
        messages: trimmedMessages,
      }

      if (tools) {
        newCountParams.tools = tools
      }

      const newCount = await client.messages.countTokens(newCountParams)

      if (newCount.input_tokens <= MAX_INPUT_TOKENS) {
        return {
          inputTokens: newCount.input_tokens,
          needsTrimming: true,
          trimmedMessages,
        }
      }
    }

    // Even with minimum messages we're over - return what we have
    return {
      inputTokens,
      needsTrimming: true,
      trimmedMessages,
    }
  } catch (error) {
    console.warn('[token-counting] Failed to count tokens, proceeding without validation:', error)
    return { inputTokens: 0, needsTrimming: false }
  }
}

/**
 * Estimate token count for a string (rough approximation)
 * Useful for quick checks before calling the API
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

/**
 * Check if a message is likely to exceed the max message length
 */
export function isMessageTooLong(message: string, maxChars: number = 500): boolean {
  return message.length > maxChars
}
