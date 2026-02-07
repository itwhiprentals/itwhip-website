// app/lib/ai-booking/tools.ts
// Tool definitions for Claude AI booking assistant
// Extracted for modularity and reusability

import Anthropic from '@anthropic-ai/sdk'
import { searchVehicles } from './search-bridge'
import type { SearchQuery } from './types'
import { fetchWeatherContext } from './weather-bridge'
import { BookingSession, VehicleSummary } from './types'
import prisma from '@/app/lib/database/prisma'

// =============================================================================
// SAFE CALCULATOR
// =============================================================================

/**
 * Safely evaluate a mathematical expression
 * Only allows numbers and basic operators (+, -, *, /, parentheses)
 * Prevents code injection by using regex validation
 */
function safeCalculate(expression: string): number | string {
  // Remove whitespace and validate characters
  const cleaned = expression.replace(/\s/g, '')

  // Only allow: digits, decimal points, and operators
  if (!/^[\d.+\-*/()]+$/.test(cleaned)) {
    return 'Error: Invalid characters in expression'
  }

  // Prevent empty expressions
  if (!cleaned || cleaned.length === 0) {
    return 'Error: Empty expression'
  }

  try {
    // Use Function constructor for safer evaluation than eval
    // This creates an isolated scope
    const calculate = new Function(`return (${cleaned})`)
    const result = calculate()

    // Validate result is a number
    if (typeof result !== 'number' || !isFinite(result)) {
      return 'Error: Invalid result'
    }

    // Round to 2 decimal places for currency
    return Math.round(result * 100) / 100
  } catch {
    return 'Error: Could not evaluate expression'
  }
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

// Extended tool type with allowed_callers for Programmatic Tool Calling (PTC)
interface PTCTool extends Anthropic.Tool {
  allowed_callers?: string[]
}

// Code execution tool for Programmatic Tool Calling
export const CODE_EXECUTION_TOOL = {
  type: 'code_execution_20250825' as const,
  name: 'code_execution',
}

// Models that support Programmatic Tool Calling (PTC)
// NOTE: Haiku does NOT support PTC, only code execution
const PTC_SUPPORTED_MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-5-20251101',
]

/**
 * Check if a model supports Programmatic Tool Calling
 */
export function supportsPTC(modelId: string): boolean {
  return PTC_SUPPORTED_MODELS.some(m => modelId.includes(m.replace('claude-', '')))
}

// Base booking tools without allowed_callers (for Haiku and non-PTC models)
export const BOOKING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_vehicles',
    description: 'Search for available rental vehicles based on location, dates, and preferences. Call this when the user wants to see available cars.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location: {
          type: 'string',
          description: 'City or area in Arizona (e.g., "Phoenix", "Scottsdale", "Tempe")',
        },
        pickupDate: {
          type: 'string',
          description: 'Pickup date in YYYY-MM-DD format',
        },
        returnDate: {
          type: 'string',
          description: 'Return date in YYYY-MM-DD format',
        },
        pickupTime: {
          type: 'string',
          description: 'Pickup time in HH:mm format (optional)',
        },
        returnTime: {
          type: 'string',
          description: 'Return time in HH:mm format (optional)',
        },
        carType: {
          type: 'string',
          description: 'Vehicle type filter: SUV, Sedan, Truck, Luxury, Sports, Electric',
        },
        make: {
          type: 'string',
          description: 'Vehicle make filter: Tesla, BMW, Toyota, etc.',
        },
        priceMin: {
          type: 'number',
          description: 'Minimum daily price in USD',
        },
        priceMax: {
          type: 'number',
          description: 'Maximum daily price in USD',
        },
        seats: {
          type: 'number',
          description: 'Minimum number of seats required',
        },
        transmission: {
          type: 'string',
          description: 'Transmission type: automatic or manual',
        },
        noDeposit: {
          type: 'boolean',
          description: 'Filter for vehicles with no security deposit',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'get_weather',
    description: 'Get current weather for a city in Arizona. Call this when weather is relevant to vehicle recommendations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string',
          description: 'City name in Arizona',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'select_vehicle',
    description: 'Select a vehicle for booking. Call this when the user confirms they want a specific vehicle.',
    input_schema: {
      type: 'object' as const,
      properties: {
        vehicleId: {
          type: 'string',
          description: 'The ID of the selected vehicle',
        },
        vehicleName: {
          type: 'string',
          description: 'Human-readable name of the vehicle (e.g., "2024 Tesla Model 3")',
        },
      },
      required: ['vehicleId', 'vehicleName'],
    },
  },
  {
    name: 'update_booking_details',
    description: 'Update or confirm booking details like location and dates. Call this when extracting booking info from user messages.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location: {
          type: 'string',
          description: 'City or area in Arizona',
        },
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        startTime: {
          type: 'string',
          description: 'Start time in HH:mm format',
        },
        endTime: {
          type: 'string',
          description: 'End time in HH:mm format',
        },
        vehicleType: {
          type: 'string',
          description: 'Preferred vehicle type',
        },
      },
    },
  },
  {
    name: 'get_reviews',
    description: 'Get guest reviews for a specific vehicle. Call when user asks about reviews, ratings, what renters think, or whether a car is good.',
    input_schema: {
      type: 'object' as const,
      properties: {
        vehicleId: {
          type: 'string',
          description: 'The vehicle ID from the AVAILABLE CARS list (the [ID: ...] value)',
        },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'calculator',
    description: `Calculate arithmetic expressions. ALWAYS use this for ANY math - never do math in your head.

Common calculations:
1. BUDGET → DAILY RATE: "$350 for 4 days" → calculate("350 / 4") = $87.50/day → use as priceMax
2. TOTAL CHECKOUT (with deposit): (rate × days × 1.234) + deposit
   - Honda $29 × 3 days + $0 deposit = calculate("29 * 3 * 1.234 + 0") = $107.36
   - BMW $79 × 3 days + $500 deposit = calculate("79 * 3 * 1.234 + 500") = $792.46
3. BUDGET CHECK: Does car fit budget? calculate("(rate * days * 1.234) + deposit") ≤ budget?

CRITICAL: Always include depositAmount in total calculations! Check the car's deposit in AVAILABLE CARS list.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate (e.g., "350 / 4" for budget per day, "29 * 7 * 1.234" for total cost with fees)',
        },
        purpose: {
          type: 'string',
          description: 'What this calculation is for (e.g., "total cost for Honda Accord $29/day × 7 days with fees")',
        },
      },
      required: ['expression'],
    },
  },
]

/**
 * Get tools with PTC (allowed_callers) enabled for models that support it
 * For Haiku and other non-PTC models, returns regular tools
 */
export function getToolsForModel(modelId: string): (typeof CODE_EXECUTION_TOOL | PTCTool)[] {
  if (!supportsPTC(modelId)) {
    // Haiku and other non-PTC models: use regular tools without allowed_callers
    return BOOKING_TOOLS
  }

  // Sonnet/Opus: add code_execution tool and allowed_callers
  const ptcTools: PTCTool[] = BOOKING_TOOLS.map(tool => ({
    ...tool,
    allowed_callers: ['code_execution_20250825'],
  }))

  return [CODE_EXECUTION_TOOL, ...ptcTools]
}

// Legacy function for backwards compatibility
export function getAllToolsWithPTC(): (typeof CODE_EXECUTION_TOOL | PTCTool)[] {
  // Returns PTC-enabled tools (use getToolsForModel for model-aware selection)
  const ptcTools: PTCTool[] = BOOKING_TOOLS.map(tool => ({
    ...tool,
    allowed_callers: ['code_execution_20250825'],
  }))
  return [CODE_EXECUTION_TOOL, ...ptcTools]
}

// =============================================================================
// TOOL RESULT TYPE
// =============================================================================

export interface ToolResult {
  type: 'tool_result'
  tool_use_id: string
  content: string
}

export interface ToolExecutionResult {
  results: ToolResult[]
  vehicles: VehicleSummary[] | null
  weather: unknown
  updatedSession: BookingSession
}

// =============================================================================
// TOOL EXECUTION
// =============================================================================

export async function executeTools(
  toolUses: Anthropic.ToolUseBlock[],
  session: BookingSession
): Promise<ToolExecutionResult> {
  const results: ToolResult[] = []
  let vehicles: VehicleSummary[] | null = null
  let weather: unknown = null
  let updatedSession = { ...session }

  for (const toolUse of toolUses) {
    const input = toolUse.input as Record<string, unknown>

    switch (toolUse.name) {
      case 'search_vehicles': {
        const searchQuery: SearchQuery = {
          location: input.location as string,
          pickupDate: input.pickupDate as string | undefined,
          returnDate: input.returnDate as string | undefined,
          pickupTime: input.pickupTime as string | undefined,
          returnTime: input.returnTime as string | undefined,
          carType: input.carType as string | undefined,
          make: input.make as string | undefined,
          priceMin: input.priceMin as number | undefined,
          priceMax: input.priceMax as number | undefined,
          seats: input.seats as number | undefined,
          transmission: input.transmission as string | undefined,
          noDeposit: input.noDeposit as boolean | undefined,
        }

        vehicles = await searchVehicles(searchQuery)

        // FALLBACK: If 0 results, automatically expand to Phoenix metro
        let expandedSearch = false
        const requestedLocation = input.location as string
        if (vehicles.length === 0 && requestedLocation) {
          const expandedQuery: SearchQuery = {
            ...searchQuery,
            location: 'Phoenix, AZ', // Expand to main metro area
          }
          vehicles = await searchVehicles(expandedQuery)
          if (vehicles.length > 0) {
            expandedSearch = true
            console.log(`[tools] Expanded search from ${requestedLocation} to Phoenix, found ${vehicles.length} vehicles`)
          }
        }

        // Update session with search context
        if (input.location) updatedSession.location = input.location as string
        if (input.pickupDate) updatedSession.startDate = input.pickupDate as string
        if (input.returnDate) updatedSession.endDate = input.returnDate as string
        if (input.pickupTime) updatedSession.startTime = input.pickupTime as string
        if (input.returnTime) updatedSession.endTime = input.returnTime as string
        if (input.carType) updatedSession.vehicleType = input.carType as string

        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: vehicles.length > 0
            ? JSON.stringify({
                found: vehicles.length,
                expandedSearch,
                originalLocation: expandedSearch ? requestedLocation : undefined,
                expandedTo: expandedSearch ? 'Phoenix metro area' : undefined,
                vehicles: vehicles.slice(0, 12).map(v => ({
                  id: v.id,
                  name: `${v.year} ${v.make} ${v.model}`,
                  dailyRate: v.dailyRate,
                  depositAmount: v.depositAmount,
                  seats: v.seats,
                  transmission: v.transmission,
                  location: v.location,
                  vehicleType: v.vehicleType,
                  instantBook: v.instantBook,
                })),
              })
            : JSON.stringify({ found: 0, message: 'No vehicles available in Phoenix metro area for these dates.' }),
        })
        break
      }

      case 'get_weather': {
        const city = input.city as string
        weather = await fetchWeatherContext(city)
        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: weather
            ? JSON.stringify(weather)
            : JSON.stringify({ error: 'Weather data not available' }),
        })
        break
      }

      case 'select_vehicle': {
        const vehicleId = input.vehicleId as string
        updatedSession.vehicleId = vehicleId
        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ selected: true, vehicleId }),
        })
        break
      }

      case 'update_booking_details': {
        if (input.location) updatedSession.location = input.location as string
        if (input.startDate) updatedSession.startDate = input.startDate as string
        if (input.endDate) updatedSession.endDate = input.endDate as string
        if (input.startTime) updatedSession.startTime = input.startTime as string
        if (input.endTime) updatedSession.endTime = input.endTime as string
        if (input.vehicleType) updatedSession.vehicleType = input.vehicleType as string

        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ updated: true, details: input }),
        })
        break
      }

      case 'get_reviews': {
        const vehicleId = input.vehicleId as string
        try {
          const reviews = await prisma.rentalReview.findMany({
            where: { carId: vehicleId, isVisible: true },
            orderBy: { rating: 'desc' },
            take: 5,
            select: {
              rating: true,
              title: true,
              comment: true,
              createdAt: true,
              isVerified: true,
              reviewerProfile: {
                select: { name: true },
              },
            },
          })

          // Get aggregate stats
          const stats = await prisma.rentalReview.aggregate({
            where: { carId: vehicleId, isVisible: true },
            _avg: { rating: true },
            _count: true,
          })

          const formattedReviews = reviews.map(r => ({
            rating: r.rating,
            title: r.title || null,
            comment: r.comment ? r.comment.slice(0, 300) : null,
            reviewer: r.reviewerProfile?.name?.split(' ')[0] || 'Guest', // First name only
            verified: r.isVerified,
            date: r.createdAt.toISOString().split('T')[0],
          }))

          results.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({
              averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
              totalReviews: stats._count,
              reviews: formattedReviews,
            }),
          })
        } catch (error) {
          console.error('[tools] get_reviews error:', error)
          results.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ averageRating: null, totalReviews: 0, reviews: [] }),
          })
        }
        break
      }

      case 'calculator': {
        const expression = input.expression as string
        const purpose = input.purpose as string | undefined
        const result = safeCalculate(expression)

        console.log(`[tools] Calculator: ${expression} = ${result}${purpose ? ` (${purpose})` : ''}`)

        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({
            expression,
            result,
            purpose,
            // Provide guidance on how to use the result
            usage: typeof result === 'number'
              ? `Use ${Math.floor(result)} as priceMax for search_vehicles if this was a budget calculation`
              : 'Calculation error - ask user to clarify'
          }),
        })
        break
      }

      default:
        results.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: `Unknown tool: ${toolUse.name}` }),
        })
    }
  }

  return { results, vehicles, weather, updatedSession }
}
