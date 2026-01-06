#!/bin/bash
# Stripe Webhook Listener for Local Development
# Run this in a separate terminal while testing Stripe Connect

echo "🔗 Starting Stripe webhook listener..."
echo ""
echo "This will forward Stripe Connect events to your local server."
echo "Keep this terminal open while testing."
echo ""
echo "Events being forwarded:"
echo "  - account.updated (for auto-approval)"
echo "  - account.application.deauthorized"
echo ""

stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect --events account.updated,account.application.deauthorized
