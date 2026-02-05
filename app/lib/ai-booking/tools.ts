// app/lib/ai-booking/tools.ts
// Tool definitions for Claude AI booking assistant
// Extracted for modularity and reusability

import Anthropic from '@anthropic-ai/sdk'
import { searchVehicles, SearchQuery } from './search-bridge'
import { fetchWeatherContext } from './weather-bridge'
import { BookingSession, VehicleSummary } from './types'

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

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
]

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
                vehicles: vehicles.slice(0, 6).map(v => ({
                  id: v.id,
                  name: `${v.year} ${v.make} ${v.model}`,
                  dailyRate: v.dailyRate,
                  depositAmount: v.depositAmount,
                  seats: v.seats,
                  transmission: v.transmission,
                  features: v.features?.slice(0, 3),
                })),
              })
            : JSON.stringify({ found: 0, message: 'No vehicles found matching criteria. Suggest broadening the search.' }),
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
