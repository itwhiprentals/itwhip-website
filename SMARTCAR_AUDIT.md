# Smartcar API Full Audit

**Prepared for:** ItWhip Vehicle Tracking Integration
**Date:** January 26, 2026
**Purpose:** Complete documentation audit before building Smartcar onboarding flow

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication & OAuth Flow](#authentication--oauth-flow)
3. [API Endpoints (Complete List)](#api-endpoints-complete-list)
4. [Permissions & Scopes](#permissions--scopes)
5. [Webhooks](#webhooks)
6. [Rate Limits & Quotas](#rate-limits--quotas)
7. [Pricing Tiers](#pricing-tiers)
8. [Compatible Vehicles](#compatible-vehicles)
9. [Tesla-Specific Requirements](#tesla-specific-requirements)
10. [SDKs Available](#sdks-available)
11. [Implementation Requirements](#implementation-requirements)

---

## Overview

Smartcar is a vehicle API platform that provides a standardized interface to read vehicle data and send commands across 37+ vehicle brands. Instead of integrating with each OEM separately, you integrate once with Smartcar.

**Core Value Proposition:**
- Single API for all vehicle brands
- OAuth-based consent flow (user links their vehicle)
- No hardware required - uses existing vehicle telematics
- Handles token refresh and OEM differences

---

## Authentication & OAuth Flow

### How Smartcar Connect Works

1. **User Redirect**: Your app redirects user to Smartcar Connect
2. **User Login**: User logs into their vehicle account (Tesla, Ford, etc.)
3. **Permission Grant**: User approves requested permissions
4. **Authorization Code**: Smartcar redirects back with `code` parameter
5. **Token Exchange**: Your server exchanges code for access/refresh tokens
6. **API Requests**: Use access token to make vehicle requests

### Token Lifecycle

| Token Type | Validity | Notes |
|------------|----------|-------|
| Access Token | **2 hours** | Used for API requests |
| Refresh Token | **60 days** | Use to get new access tokens |
| Authorization Code | ~10 minutes | One-time use |

### Connect URL Construction

```
https://connect.smartcar.com/oauth/authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_REDIRECT_URI
  &scope=read_vehicle_info read_odometer read_location
  &mode=live  // or 'test' for simulator
  &state=YOUR_STATE_VALUE
```

### Token Exchange (Server-Side)

```javascript
// Node.js SDK
const smartcar = require('smartcar');

const client = new smartcar.AuthClient({
  clientId: process.env.SMARTCAR_CLIENT_ID,
  clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
  redirectUri: 'https://itwhip.com/api/smartcar/callback'
});

// Exchange authorization code for tokens
const access = await client.exchangeCode(authorizationCode);
// Returns: { accessToken, refreshToken, refreshExpiration }

// Refresh tokens before expiry
const newAccess = await client.exchangeRefreshToken(refreshToken);
```

---

## API Endpoints (Complete List)

### Vehicle Data Endpoints (GET)

| Endpoint | Description | Scope Required |
|----------|-------------|----------------|
| `/vehicles/{id}` | Get vehicle info (make, model, year) | `read_vehicle_info` |
| `/vehicles/{id}/vin` | Get VIN | `read_vin` |
| `/vehicles/{id}/odometer` | Get odometer reading | `read_odometer` |
| `/vehicles/{id}/location` | Get GPS coordinates | `read_location` |
| `/vehicles/{id}/fuel` | Get fuel tank level (%) | `read_fuel` |
| `/vehicles/{id}/battery` | Get EV battery level (%) | `read_battery` |
| `/vehicles/{id}/battery/capacity` | Get battery capacity (kWh) | `read_battery` |
| `/vehicles/{id}/charge` | Get charging status | `read_charge` |
| `/vehicles/{id}/charge/limit` | Get charge limit | `read_charge` |
| `/vehicles/{id}/engine/oil` | Get oil life remaining | `read_engine_oil` |
| `/vehicles/{id}/tires/pressure` | Get tire pressures | `read_tires` |
| `/vehicles/{id}/security` | Get lock status | `read_security` |
| `/vehicles/{id}/permissions` | Get granted permissions | (automatic) |
| `/vehicles/{id}/service/history` | Get service history | `read_service_history` |

### Control Endpoints (POST)

| Endpoint | Description | Scope Required |
|----------|-------------|----------------|
| `/vehicles/{id}/security` | Lock/unlock doors | `control_security` |
| `/vehicles/{id}/charge` | Start/stop charging | `control_charge` |
| `/vehicles/{id}/charge/limit` | Set charge limit | `control_charge` |
| `/vehicles/{id}/navigation/destination` | Send destination to nav | `control_navigation` |

### Brand-Specific Endpoints

Some brands have additional endpoints:

**Tesla:**
- `/vehicles/{id}/tesla/virtual_key` - Check virtual key status
- `/vehicles/{id}/tesla/speedometer` - Get speed
- `/vehicles/{id}/tesla/compass` - Get heading

**Chevrolet/Cadillac:**
- `/vehicles/{id}/chevrolet/charge/voltmeter` - Charging voltage
- `/vehicles/{id}/chevrolet/charge/ammeter` - Charging amperage

**BMW/MINI:**
- Brand-specific charge completion time

---

## Permissions & Scopes

### Scope Naming Convention

- `read_*` - Read-only data access
- `control_*` - Send commands to vehicle

### Complete Scope List

```
read_vehicle_info    // Make, model, year
read_vin             // Vehicle identification number
read_odometer        // Mileage
read_location        // GPS coordinates
read_fuel            // Fuel tank level
read_battery         // EV battery state of charge
read_charge          // Charging status
read_engine_oil      // Oil life remaining
read_tires           // Tire pressure
read_security        // Lock status
read_service_history // Service records

control_security     // Lock/unlock
control_charge       // Start/stop charging
control_navigation   // Send destination
```

### Required Scopes

Use `required:` prefix to mandate a scope:

```
required:read_fuel
```

If user tries to connect a Tesla (which doesn't have fuel), they'll see "No Compatible Vehicles" error.

### Recommended Scopes for ItWhip

For fleet tracking, we recommend:
```
read_vehicle_info
read_vin
read_odometer
read_location
read_fuel          // ICE vehicles
read_battery       // EVs
control_security   // Lock/unlock (optional)
```

---

## Webhooks

Smartcar offers three webhook types:

### 1. Scheduled Webhooks

Receive vehicle data on a cadence you choose (hourly, daily, etc.)

**Benefits:**
- No token management - Smartcar handles refresh
- No rate limit concerns - data pushed to you
- Set-and-forget for recurring data

**Setup:**
1. Create webhook in Smartcar Dashboard
2. Select "Scheduled" type
3. Choose frequency (hourly, daily, etc.)
4. Select data points (odometer, location, fuel, etc.)
5. Verify callback URI

### 2. Event-Based Webhooks

Real-time notifications for vehicle events:
- Charging started/stopped
- Vehicle unlocked
- Trip completed

### 3. Diagnostic Webhooks (Early Access)

Receive Diagnostic Trouble Codes (DTCs) when they occur.

### Callback Verification

Smartcar verifies your webhook endpoint using HMAC-SHA256:

```javascript
const smartcar = require('@smartcar/webhooks');

// Verify incoming webhook
const isValid = smartcar.verifySignature(
  payload,
  signature,  // From SC-Signature header
  applicationManagementToken
);
```

### Retry Policy

- Smartcar expects 2xx response
- If no success: retries 5 times over 10 minutes
- After continued failure: webhook auto-disabled

---

## Rate Limits & Quotas

### Smartcar API Rate Limit

| Limit Type | Value | Notes |
|------------|-------|-------|
| Request bucket | 120 requests | Refills at 2/min |
| Error code | `RATE_LIMIT:SMARTCAR_API` | When exceeded |

### Per-Vehicle Monthly Quota

Your plan specifies max API calls per vehicle per month:
- Free: 1,000 calls/vehicle/month
- Build: Higher limits
- Enterprise: Custom

Error: `VEHICLE_REQUEST_LIMIT` when exceeded

### OEM Upstream Limits

Vehicle manufacturers have their own limits. Smartcar can't control these.

Error: `UPSTREAM:RATE_LIMIT` - wait for OEM reset

---

## Pricing Tiers

### Free Tier
- **1,000 API calls** per month
- Up to **5 vehicles**
- Basic endpoints only
- Good for testing

### Build Plan (~$70/month)
- Everything in Free
- Brand-specific APIs
- Vehicle Simulator access
- 7-day log history

### Scale Plan (Custom pricing)
- Everything in Build
- Managed onboarding support
- Batch request access
- 30-day log history
- Priority support

### Enterprise Plan ($12K-25K/year)
- Everything in Scale
- Single Select / Brand Select
- 365-day log history
- Dedicated support
- Custom SLAs

### Smartcar Garage Program (Startups)

**Eligibility:**
- Under 2 years old
- Less than $1M in funding
- Fewer than 5 employees

**Benefits:**
- High volume free API calls
- 20 vehicles for 3 months
- 1:1 support
- Test fleet access

---

## Compatible Vehicles

### Supported Regions
- **United States**: 37+ brands
- **Canada**: 37+ brands
- **Europe**: 30 countries (Austria, Belgium, France, Germany, UK, etc.)

### Major Supported Brands

**US Full Support:**
- Audi
- BMW / MINI
- Buick
- Cadillac
- Chevrolet
- Chrysler
- Dodge
- Ford / Lincoln
- GMC
- Honda
- Hyundai
- Infiniti
- Jaguar / Land Rover
- Jeep
- Kia
- Lexus
- Mazda
- Mercedes-Benz
- Nissan
- Porsche
- Ram
- Subaru
- Tesla
- Toyota
- Volkswagen
- Volvo

### Feature Availability by Brand

Not all features work on all brands. Examples:
- **read_fuel**: Not available on EVs (Tesla, etc.)
- **control_security**: Not available on all brands
- **read_location**: May require additional OEM subscription

### VIN Compatibility Check

Use Smartcar's Compatibility API to check if a specific vehicle is supported:

```
GET /v2.0/compatibility?vin=XXXXX&scope=read_location
```

---

## Tesla-Specific Requirements

### Virtual Key System

Tesla now requires virtual keys for third-party apps to send commands.

**Affected Models:**
- All Model 3 and Model Y
- 2021+ Model S and Model X

**What Virtual Keys Enable:**
- Lock/unlock
- Start/stop charging
- Climate control
- Trunk open

**Virtual Key Pairing Flow:**

1. User connects via Smartcar Connect
2. Smartcar prompts for virtual key pairing
3. User approves in Tesla app
4. Key is installed on vehicle

### Check Virtual Key Status

```
GET /v2.0/vehicles/{id}/tesla/virtual_key
```

Response:
```json
{
  "isPaired": true
}
```

### Smartcar's Tesla Integration

- Smartcar hosts a Smartcar-branded virtual key
- Enterprise customers can use their own branded key
- Smartcar handles all Tesla Fleet API complexity

### Migration Note

Tesla required all third-party apps to migrate to new API by January 2024. Smartcar handles this - you don't need to worry about Tesla's Fleet API directly.

---

## SDKs Available

### Backend SDKs

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `smartcar` | `npm install smartcar` |
| Python | `smartcar` | `pip install smartcar` |
| Java | `com.smartcar:java-sdk` | Maven |
| Ruby | `smartcar` | `gem install smartcar` |
| Go | `github.com/smartcar/go-sdk` | `go get` |

### Frontend SDKs

| Platform | Package | Purpose |
|----------|---------|---------|
| JavaScript | `@smartcar/javascript-sdk` | Client-side Connect flow |
| React | Available | Connect button component |
| iOS | Available | Native Connect flow |
| Android | Available | Native Connect flow |

### Webhook SDK

```
npm install @smartcar/webhooks
```

For payload verification and signature validation.

---

## Implementation Requirements

### What You Need Before Building

1. **Smartcar Developer Account**
   - Register at https://dashboard.smartcar.com
   - Get Client ID and Client Secret

2. **Application Registration**
   - Set redirect URI(s)
   - Configure allowed scopes
   - Set mode (test/live)

3. **Server-Side Token Storage**
   - Securely store access tokens
   - Store refresh tokens
   - Implement refresh logic before expiry

4. **Webhook Endpoint** (Optional but recommended)
   - HTTPS required
   - Implement signature verification
   - Return 2xx within timeout

### Environment Variables Needed

```env
SMARTCAR_CLIENT_ID=your_client_id
SMARTCAR_CLIENT_SECRET=your_client_secret
SMARTCAR_REDIRECT_URI=https://itwhip.com/api/smartcar/callback
SMARTCAR_MODE=test  # or 'live' for production
SMARTCAR_WEBHOOK_SECRET=your_webhook_secret  # if using webhooks
```

### Database Schema Requirements

```sql
-- Store connected vehicles
CREATE TABLE smartcar_vehicles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  vehicle_id VARCHAR(255) UNIQUE,  -- Smartcar vehicle ID
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  vin VARCHAR(17),
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  connected_at TIMESTAMP,
  last_synced_at TIMESTAMP
);

-- Store webhook subscriptions
CREATE TABLE smartcar_webhooks (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES smartcar_vehicles(id),
  webhook_id VARCHAR(255),  -- Smartcar webhook ID
  type VARCHAR(50),  -- 'scheduled', 'event', 'diagnostic'
  created_at TIMESTAMP
);
```

---

## Recommended ItWhip Integration Flow

### Host Onboarding Flow

```
1. Host clicks "Connect Vehicle" in Partner Portal
                    ↓
2. Host selects tracking provider (Smartcar, Bouncie, etc.)
                    ↓
3. For Smartcar: Redirect to Smartcar Connect
   URL: https://connect.smartcar.com/oauth/authorize?...
                    ↓
4. Host logs into their vehicle account (Tesla, Ford, etc.)
                    ↓
5. Host grants permissions (location, odometer, etc.)
                    ↓
6. Smartcar redirects to: /api/smartcar/callback?code=xxx
                    ↓
7. Server exchanges code for tokens
                    ↓
8. Server fetches vehicle info and stores
                    ↓
9. Server subscribes vehicle to scheduled webhook
                    ↓
10. Host sees connected vehicle in dashboard
```

### API Endpoints to Build

```
POST /api/smartcar/connect       // Generate auth URL
GET  /api/smartcar/callback      // Handle OAuth callback
POST /api/smartcar/disconnect    // Disconnect vehicle
GET  /api/smartcar/vehicles      // List connected vehicles
GET  /api/smartcar/vehicles/:id  // Get vehicle data
POST /api/webhooks/smartcar      // Receive webhook events
```

---

## Key Takeaways for Jordan Call

1. **ItWhip is building a multi-provider tracking system** - Smartcar is one of several providers (alongside Bouncie, custom OEM integrations)

2. **We want to offer Smartcar as a "no hardware" option** - Hosts with newer connected vehicles can use Smartcar instead of buying OBD devices

3. **Our use cases align with Smartcar's strengths:**
   - Location tracking for rental fleet
   - Odometer sync for mileage monitoring
   - Lock/unlock for keyless handoff (premium feature)

4. **We're early-stage** - May qualify for Garage Program

5. **Questions to ask Jordan:**
   - What's the best pricing tier for a growing fleet platform?
   - How do hosts typically handle multi-vehicle connections?
   - Any fleet-specific features coming soon?
   - Co-marketing opportunities?

---

## Sources

- [Smartcar API Reference](https://smartcar.com/docs/api/)
- [Smartcar Connect Flow](https://smartcar.com/docs/getting-started/tutorials/backend)
- [Smartcar Pricing](https://smartcar.com/pricing)
- [Smartcar Webhooks](https://smartcar.com/docs/getting-started/tutorials/webhooks-scheduled)
- [Smartcar GitHub](https://github.com/smartcar)
- [Smartcar Usage Limits](https://smartcar.com/docs/help/api-limits)
- [Tesla Virtual Key Integration](https://smartcar.com/blog/tesla-api-available)
- [Smartcar Garage Program](https://smartcar.com/blog/garage-program)
