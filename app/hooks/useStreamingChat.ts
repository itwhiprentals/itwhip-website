// app/hooks/useStreamingChat.ts
// Custom hook for handling streaming AI chat responses

import { useState, useCallback, useRef } from 'react'
import type {
  BookingSession,
  VehicleSummary,
  BookingSummary,
  BookingAction,
} from '@/app/lib/ai-booking/types'

// =============================================================================
// TYPES
// =============================================================================

interface StreamingState {
  isStreaming: boolean
  isThinking: boolean
  currentText: string
  session: BookingSession | null
  vehicles: VehicleSummary[] | null
  summary: BookingSummary | null
  action: BookingAction | null
  suggestions: string[]
  error: string | null
  isRateLimited: boolean
  toolsInUse: Array<{ name: string; input: unknown }>
}

interface StreamingOptions {
  onTextChunk?: (text: string) => void
  onToolUse?: (tools: Array<{ name: string; input: unknown }>) => void
  onVehicles?: (vehicles: VehicleSummary[]) => void
  onComplete?: (response: StreamingResponse) => void
  onError?: (error: string) => void
}

interface StreamingResponse {
  session: BookingSession
  vehicles: VehicleSummary[] | null
  summary: BookingSummary | null
  action: BookingAction | null
  suggestions: string[]
  tokensUsed: number
}

interface SendMessageParams {
  message: string
  session: BookingSession | null
  previousVehicles?: VehicleSummary[] | null
  userId?: string | null
  visitorId?: string | null
}

// =============================================================================
// HOOK
// =============================================================================

export function useStreamingChat(options: StreamingOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isThinking: false,
    currentText: '',
    session: null,
    vehicles: null,
    summary: null,
    action: null,
    suggestions: [],
    error: null,
    isRateLimited: false,
    toolsInUse: [],
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async ({
    message,
    session,
    previousVehicles,
    userId,
    visitorId,
  }: SendMessageParams) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Reset state
    setState(prev => ({
      ...prev,
      isStreaming: true,
      isThinking: false,
      currentText: '',
      error: null,
      isRateLimited: false,
      toolsInUse: [],
    }))

    try {
      const response = await fetch('/api/ai/booking/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session,
          previousVehicles,
          userId,
          visitorId,
        }),
        signal: abortController.signal,
      })

      // Handle rate limit (429) separately
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({ error: 'Rate limit reached' }))
        setState(prev => ({
          ...prev,
          isStreaming: false,
          isThinking: false,
          error: errorData.error || 'Daily limit reached. Please try again tomorrow.',
          isRateLimited: true,
        }))
        options.onError?.(errorData.error || 'Rate limit reached')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to connect to AI service')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream available')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        let eventType = ''
        let eventData = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7)
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6)

            if (eventType && eventData) {
              try {
                const data = JSON.parse(eventData)
                handleEvent(eventType, data)
              } catch (e) {
                console.warn('Failed to parse SSE data:', eventData)
              }
              eventType = ''
              eventData = ''
            }
          }
        }
      }

      function handleEvent(event: string, data: unknown) {
        switch (event) {
          case 'session':
            setState(prev => ({
              ...prev,
              session: (data as { session: BookingSession }).session,
            }))
            break

          case 'thinking':
            setState(prev => ({ ...prev, isThinking: true }))
            break

          case 'text': {
            const { text } = data as { text: string }
            fullText += text
            setState(prev => ({ ...prev, currentText: fullText }))
            options.onTextChunk?.(text)
            break
          }

          case 'tool_use': {
            const { tools } = data as { tools: Array<{ name: string; input: unknown }> }
            setState(prev => ({ ...prev, toolsInUse: tools, isThinking: true }))
            options.onToolUse?.(tools)
            break
          }

          case 'vehicles': {
            const { vehicles } = data as { vehicles: VehicleSummary[] }
            setState(prev => ({ ...prev, vehicles, isThinking: false }))
            options.onVehicles?.(vehicles)
            break
          }

          case 'context_trimmed':
            console.log('[streaming] Context trimmed:', data)
            break

          case 'done': {
            const response = data as StreamingResponse
            setState(prev => ({
              ...prev,
              isStreaming: false,
              isThinking: false,
              session: response.session,
              vehicles: response.vehicles,
              summary: response.summary,
              action: response.action as BookingAction | null,
              suggestions: response.suggestions || [],
              toolsInUse: [],
            }))
            options.onComplete?.(response)
            break
          }

          case 'error': {
            const { error } = data as { error: string }
            // Detect rate limit errors from message content
            const isRateLimit = error.toLowerCase().includes('limit') ||
                               error.toLowerCase().includes('rate') ||
                               error.toLowerCase().includes('try again tomorrow')
            setState(prev => ({
              ...prev,
              isStreaming: false,
              isThinking: false,
              error,
              isRateLimited: isRateLimit,
            }))
            options.onError?.(error)
            break
          }

          default:
            console.log('[streaming] Unknown event:', event, data)
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return // Request was cancelled, ignore
      }

      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setState(prev => ({
        ...prev,
        isStreaming: false,
        isThinking: false,
        error: errorMessage,
      }))
      options.onError?.(errorMessage)
    }
  }, [options])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isThinking: false,
    }))
  }, [])

  const reset = useCallback(() => {
    cancel()
    setState({
      isStreaming: false,
      isThinking: false,
      currentText: '',
      session: null,
      vehicles: null,
      summary: null,
      action: null,
      suggestions: [],
      error: null,
      isRateLimited: false,
      toolsInUse: [],
    })
  }, [cancel])

  return {
    ...state,
    sendMessage,
    cancel,
    reset,
  }
}

// =============================================================================
// LEGACY FALLBACK HOOK (non-streaming)
// =============================================================================

export function useLegacyChat() {
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async ({
    message,
    session,
    previousVehicles,
    userId,
    visitorId,
  }: SendMessageParams): Promise<StreamingResponse | null> => {
    setLoading(true)

    try {
      const response = await fetch('/api/ai/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session,
          previousVehicles,
          userId,
          visitorId,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      return data as StreamingResponse
    } catch (error) {
      console.error('Chat error:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, sendMessage }
}
