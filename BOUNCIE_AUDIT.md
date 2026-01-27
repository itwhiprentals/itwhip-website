# Bouncie API Full Audit

**Prepared for:** ItWhip Vehicle Tracking Integration
**Date:** January 26, 2026
**Purpose:** Complete documentation audit for Bouncie OBD integration
**Status:** VERIFIED from official sources

---

## Sources

- [Bouncie API Documentation](https://docs.bouncie.dev/)
- [Bouncie Developer Portal](https://www.bouncie.dev/login)
- [Bouncie Device Page](https://www.bouncie.com/device)
- [Bouncie Fleet Page](https://www.bouncie.com/fleet)
- [Bouncie API Blog Post](https://blog.bouncie.com/blog/streamline-your-workflow-with-bouncies-api-and-zapier-integrations)
- [Bouncie Data Export Blog](https://blog.bouncie.com/blog/understanding-vehicle-data-exports-from-bouncie)
- [Bouncie Community Forum](https://community.bouncie.com/)
- [Ruby API Client (GitHub)](https://github.com/streetsmartslabs/bouncie)
- [Home Assistant Integration](https://github.com/mandarons/ha-bouncie)

---

## Table of Contents
1. [Overview](#overview)
2. [How Bouncie Works](#how-bouncie-works)
3. [API Documentation](#api-documentation)
4. [Data Points Available](#data-points-available)
5. [Webhooks](#webhooks)
6. [Features](#features)
7. [Pricing](#pricing)
8. [Hardware Specifications](#hardware-specifications)
9. [Implementation Requirements](#implementation-requirements)
10. [Bouncie vs Smartcar Comparison](#bouncie-vs-smartcar-comparison)

---

## Overview

Bouncie is an OBD-II (On-Board Diagnostics) device and platform that provides GPS tracking, vehicle health monitoring, and driving behavior analysis. Unlike Smartcar which uses manufacturer APIs, Bouncie requires a physical device plugged into the vehicle's OBD-II port.

**Platform Scale (Verified):**
- 6.7 billion miles tracked
- 714 million trips completed
- 397,000 vehicles managed
- 21,000 fleet customers

**Core Value Proposition:**
- Real-time GPS tracking
- Works on any OBD-II vehicle (1996+)
- No reliance on manufacturer connectivity
- OBD diagnostic trouble codes (DTCs)
- Trip history and driving behavior scoring
- Geofencing with alerts
- Speed and behavior alerts

---

## How Bouncie Works

### Device Installation

1. **Purchase Device**: Order from bouncie.com ($89.99 one-time)
2. **Receive Device**: Ships within 3-5 business days
3. **Plug In**: Insert into OBD-II port (usually under dashboard, driver side)
4. **Activate**: Device auto-registers with Bouncie servers (no activation fees)
5. **Configure**: Set up alerts, geofences via app or API

### Data Flow

```
Vehicle → OBD-II Port → Bouncie Device → 4G LTE → Bouncie Cloud → Your API
```

The device:
- Reads OBD-II data (engine codes, diagnostics)
- Uses GPS + GLONASS module for location
- 3-axis accelerometer for motion/crash detection
- 4G LTE CAT M1 cellular (with 3G UMTS/HSPA fallback)
- Internal SIM card and antenna

---

## API Documentation

### Official Resources

| Resource | URL |
|----------|-----|
| API Documentation | https://docs.bouncie.dev/ |
| Developer Portal | https://www.bouncie.dev/login |

### Authentication

Bouncie uses OAuth2 authentication:

```ruby
# Example from Ruby client
client = Bouncie::Client.new(
  api_key: [MY_API_KEY],
  authorization_code: [MY_AUTHORIZATION_CODE]
)
```

**OAuth Flow:**
1. Register application at Bouncie Developer Portal
2. Redirect user to Bouncie authorization page with your client parameters
3. User logs in with Bouncie credentials and authorizes device access
4. Bouncie sends authorization code to your redirect URL
5. Use authorization code + API key for subsequent API calls
6. Authorization code can be persisted for subsequent use

### API Methods

The API supports two patterns:

| Pattern | Description |
|---------|-------------|
| **REST API (PULL)** | Poll for data on-demand |
| **Webhooks (PUSH)** | Receive real-time events |

**Known Endpoints (from Ruby client):**

```ruby
# Get all vehicles
vehicles = client.vehicles

# Get trips for a specific vehicle
trips = client.trips(imei: [VEHICLE_IMEI])
```

### Polling

For REST API polling, the recommended interval is configurable (default: 10 seconds based on Home Assistant integration).

---

## Data Points Available

### Trip Data (Verified from Exports)

| Category | Data Points |
|----------|-------------|
| **Vehicle Info** | Year, make, model, engine details, nickname, license plate, VIN |
| **Trip Metrics** | Start/end locations with GPS coordinates, odometer readings, distance traveled, duration, idle time |
| **Speed Data** | Maximum speed, average speed |
| **Fuel Data** | Fuel usage, fuel economy calculations |
| **Driving Events** | Speeding alerts, hard braking, rapid acceleration |
| **Zone Events** | Geo-zone entry/exit, curfew violations |
| **Other Events** | Idle events, fuel warnings |

### Care/Maintenance Data

| Category | Data Points |
|----------|-------------|
| **Service History** | Service names, service centers, completion status |
| **Scheduling** | Last completion dates, upcoming due dates |
| **Maintenance Alerts** | Automated reminders based on mileage or time intervals |
| **Documentation** | User-added notes about vehicle requirements |

### Real-Time Data

| Data Point | Description |
|------------|-------------|
| GPS Location | Lat/lng coordinates via GPS + GLONASS |
| Vehicle Status | Running/stopped, idle time |
| Battery Voltage | 12V battery health |
| Diagnostic Codes | Engine trouble codes (DTC) |

---

## Webhooks

### Available Webhook Types

| Webhook | Data Included | GPS Coordinates |
|---------|---------------|-----------------|
| **Start** | Vehicle started | ❌ No |
| **Stop** | Vehicle stopped | ❌ No |
| **Trip Finished** | Full trip data, start/end locations, stats | ✅ Yes |

**Important Limitation:** The start and stop webhooks do NOT provide GPS coordinates. Only the "trip finished" webhook includes full location data.

### Webhook Reliability

| Setting | Value |
|---------|-------|
| Failure Threshold | 0.95 (950/1000 failures in 4 hours = disabled) |
| Minimum Sample | 100 messages in 4 hours |
| Retry Strategy | Exponential backoff up to 11 hours |

**Recommendations:**
- Use message queues (RMQ, SQS, MQTT) to persist incoming webhook data
- Ensure your endpoint responds quickly to avoid timeouts
- Handle retries gracefully

### Zapier Integration

Bouncie integrates with Zapier, supporting:
- Location changes
- Idle time events
- Speed threshold alerts
- Connection to 6,000+ apps (Slack, Google Sheets, Airtable, Trello, etc.)

---

## Features

### GPS & Location
- ✅ Real-time GPS tracking
- ✅ GPS + GLONASS for accuracy
- ✅ Route history with detailed trip data
- ✅ Interactive map interface

### Safety & Alerts
- ✅ Impact/accident detection (3-axis accelerometer)
- ✅ Speed monitoring and alerts
- ✅ Hard braking detection
- ✅ Rapid acceleration detection
- ✅ Geofencing with entry/exit alerts
- ✅ Curfew alerts

### Vehicle Health
- ✅ Engine diagnostic trouble codes (DTC)
- ✅ Battery voltage monitoring
- ✅ Maintenance reminders (mileage/time based)
- ✅ Fuel monitoring

### Other
- ✅ Silent operation
- ✅ Tamper detection
- ✅ Multi-vehicle fleet dashboard
- ✅ Trip reporting and analytics
- ✅ Driver behavior scoring

---

## Pricing

### Consumer Pricing (Verified)

| Item | Cost |
|------|------|
| Device (one-time) | **$89.99** |
| Monthly Subscription | **$9.65/month** |

### Fleet Pricing (Verified)

| Item | Cost |
|------|------|
| Device (one-time) | **$89.99** |
| Monthly Subscription (3+ devices) | **$8.35/month per device** |

**No contracts, no activation fees, no hidden fees.**

### API Access

- API access available through Developer Portal
- May require business/fleet account
- Contact: developer@bouncie.com for enterprise inquiries

---

## Hardware Specifications

### Physical Specs (Verified)

| Specification | Value |
|---------------|-------|
| Height | 1.75 inches |
| Width | 1.875 inches |
| Depth | 1.0 inch |
| Weight | 1.13 ounces |

### Connectivity

| Specification | Value |
|---------------|-------|
| Primary | 4G LTE CAT M1 |
| Fallback | 3G UMTS/HSPA |
| SIM | Internal (included) |
| Antenna | Built-in cellular antenna |

### GPS

| Specification | Value |
|---------------|-------|
| Receiver | Internal GPS |
| Constellations | GPS + GLONASS |

### Sensors

| Specification | Value |
|---------------|-------|
| Accelerometer | 3-axis with auto-normalization |
| Purpose | Motion detection, crash detection |

### Certifications

- FCC certified
- PTCRB certified
- CE certified
- RoHS compliant

### Vehicle Compatibility

Works with **most vehicles 1996 and newer** that have an OBD-II port.

**Note:** Electric vehicles have limited compatibility as most EVs don't have traditional OBD-II ports.

---

## Implementation Requirements

### Environment Variables

```env
BOUNCIE_API_KEY=your_api_key
BOUNCIE_AUTHORIZATION_CODE=your_auth_code
BOUNCIE_REDIRECT_URI=https://itwhip.com/api/bouncie/callback
BOUNCIE_WEBHOOK_SECRET=your_webhook_secret
```

### Database Schema (Proposed)

```sql
-- Store connected Bouncie devices
CREATE TABLE bouncie_devices (
  id UUID PRIMARY KEY,
  host_id UUID REFERENCES rental_hosts(id),
  device_imei VARCHAR(15) UNIQUE,
  api_key TEXT,
  authorization_code TEXT,
  vehicle_id UUID REFERENCES cars(id),
  nickname VARCHAR(100),
  vin VARCHAR(17),
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP,
  last_synced_at TIMESTAMP
);

-- Store geofences
CREATE TABLE bouncie_geofences (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES bouncie_devices(id),
  name VARCHAR(100),
  center_lat DECIMAL(10, 7),
  center_lng DECIMAL(10, 7),
  radius_meters INTEGER,
  alert_on_enter BOOLEAN DEFAULT true,
  alert_on_exit BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- Store trip history
CREATE TABLE bouncie_trips (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES bouncie_devices(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  start_lat DECIMAL(10, 7),
  start_lng DECIMAL(10, 7),
  end_lat DECIMAL(10, 7),
  end_lng DECIMAL(10, 7),
  distance_miles DECIMAL(8, 2),
  duration_minutes INTEGER,
  max_speed_mph INTEGER,
  avg_speed_mph INTEGER,
  hard_brakes INTEGER DEFAULT 0,
  rapid_accelerations INTEGER DEFAULT 0,
  idle_minutes INTEGER DEFAULT 0,
  fuel_used_gallons DECIMAL(5, 2),
  created_at TIMESTAMP
);
```

### API Endpoints to Build

```
POST /api/bouncie/connect       // Initiate OAuth flow
GET  /api/bouncie/callback      // Handle OAuth callback
POST /api/bouncie/disconnect    // Disconnect device
GET  /api/bouncie/devices       // List connected devices
GET  /api/bouncie/devices/:id   // Get device details
GET  /api/bouncie/devices/:id/location    // Get current location
GET  /api/bouncie/devices/:id/trips       // Get trip history
POST /api/webhooks/bouncie      // Receive webhook events
```

---

## Bouncie vs Smartcar Comparison

| Feature | Bouncie | Smartcar |
|---------|---------|----------|
| **Hardware Required** | Yes (OBD device $89.99) | No |
| **Monthly Cost** | $8.35-$9.65/month | ~$2/vehicle |
| **Setup Time** | 3-5 days (shipping) | Instant |
| **Vehicle Compatibility** | Any OBD-II (1996+) | Connected vehicles only |
| **Real-time GPS** | ✅ Yes | On-demand only |
| **Geofencing** | ✅ Yes | ❌ No |
| **Speed Alerts** | ✅ Yes | ❌ No |
| **Harsh Driving Detection** | ✅ Yes | ❌ No |
| **Crash Detection** | ✅ Yes | ❌ No |
| **Trip History** | ✅ Detailed | ❌ No |
| **Diagnostic Codes** | ✅ Full OBD-II | Limited |
| **Remote Lock/Unlock** | ❌ No | ✅ Yes |
| **EV Charging Control** | ❌ No | ✅ Yes |
| **Tire Pressure** | ❌ No | ✅ Yes (some vehicles) |

### Bouncie-Only Features

These require Bouncie (not available via Smartcar):
1. Real-time GPS (continuous tracking)
2. Geofencing with unlimited zones
3. Speed alerts and harsh driving detection
4. Crash/accident detection
5. Detailed trip history with driving scores
6. OBD-II diagnostic trouble codes
7. Curfew alerts
8. Battery voltage monitoring

### Smartcar-Only Features

These require Smartcar (not available via Bouncie):
1. Remote lock/unlock
2. EV charging control (start/stop)
3. No hardware required
4. Instant setup (OAuth flow)
5. Tire pressure data (TPMS)

---

## ItWhip+ Integration Strategy

When a host connects **both Smartcar AND Bouncie**:

| Feature | Source | Why |
|---------|--------|-----|
| Real-time GPS | Bouncie | Continuous 4G tracking |
| Geofencing | Bouncie | Not available in Smartcar |
| Speed/Driving Alerts | Bouncie | Real-time accelerometer |
| Trip History | Bouncie | Detailed logs |
| Lock/Unlock | Smartcar | Remote control |
| EV Charging | Smartcar | Native API |
| Odometer | Both | Cross-validate for Mileage Forensics™ |
| Fuel/Battery Level | Smartcar | More accurate from ECU |
| Diagnostics | Bouncie | Full OBD-II codes |

---

## Next Steps for ItWhip

1. **Register at Bouncie Developer Portal** - https://www.bouncie.dev/login
2. **Request API documentation access** - Review full endpoint specs
3. **Test with a device** - Purchase one device for development
4. **Build OAuth integration** - Similar to Smartcar flow
5. **Implement webhooks** - For real-time trip events
6. **Test geofencing** - Key feature for rental protection

---

## Questions for Bouncie

1. Fleet/enterprise API pricing for 50+ devices?
2. White-label device options?
3. Webhook for geofence enter/exit events? (community noted this may be missing)
4. Rate limits for REST API polling?
5. Custom branding for guest-facing alerts?
