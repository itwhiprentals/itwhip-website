// app/lib/analytics/heartbeat.ts
// Client-side presence heartbeat — sends a ping every 30s while tab is visible.
// No React dependency. Pauses when hidden, resumes when visible.

const HEARTBEAT_INTERVAL = 30_000 // 30 seconds
let intervalId: ReturnType<typeof setInterval> | null = null
let started = false

function sendHeartbeat() {
  if (typeof window === 'undefined') return
  if (document.visibilityState !== 'visible') return

  fetch('/api/fleet/analytics/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends auth cookies for role detection
    body: JSON.stringify({ path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {})
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Tab became visible — send immediately + restart interval
    sendHeartbeat()
    if (!intervalId) {
      intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
    }
  } else {
    // Tab hidden — stop pinging
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

/**
 * Start the heartbeat. Call once on app mount.
 * Idempotent — calling multiple times is safe.
 */
export function startHeartbeat(): void {
  if (started || typeof window === 'undefined') return
  started = true

  // Send first heartbeat immediately
  sendHeartbeat()

  // Start interval
  intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

  // Pause/resume on tab visibility
  document.addEventListener('visibilitychange', onVisibilityChange)
}
