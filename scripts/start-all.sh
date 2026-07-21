#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-all.sh – Start both the Taska backend and Expo dev server
# ─────────────────────────────────────────────────────────────
# Usage:
#   bash scripts/start-all.sh
#
# This script:
#   1. Starts the backend (port 5000)
#   2. Starts the Expo dev server (port 8081)
#   3. Prints the Expo QR code URL for Expo Go
# ─────────────────────────────────────────────────────────────
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
MOBILE_DIR="$ROOT_DIR/mobile"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  Taska – Starting all services                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Kill any existing processes ──────────────────────
echo "› Cleaning up any existing processes..."
pkill -f "ts-node src/index.ts" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
sleep 1

# ── 2. Start the backend ────────────────────────────────
echo "› Starting backend (port 5000)..."
cd "$BACKEND_DIR"
nohup npx ts-node src/index.ts > /tmp/taska-backend.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID (log: /tmp/taska-backend.log)"

# ── 3. Start Expo dev server ────────────────────────────
echo "› Starting Expo dev server..."
cd "$MOBILE_DIR"
nohup npx expo start > /tmp/taska-expo.log 2>&1 &
EXPO_PID=$!
echo "  Expo PID: $EXPO_PID (log: /tmp/taska-expo.log)"

# ── 4. Wait for services to be ready ────────────────────
echo ""
echo "› Waiting for services to start..."
sleep 6

# Check backend
if curl -s --connect-timeout 2 http://localhost:5000/api/v1/health > /dev/null 2>&1; then
  echo "  ✅ Backend is running on http://localhost:5000"
else
  echo "  ❌ Backend failed to start. Check /tmp/taska-backend.log"
fi

# Check Expo
if lsof -i :8081 > /dev/null 2>&1; then
  echo "  ✅ Expo dev server is running on http://localhost:8081"
  echo ""
  echo "  📱 Scan the QR code from your terminal or use the Expo Go app"
  echo "     to connect. The QR code appears in the Expo server output."
  echo ""
  echo "  🔗 Or open the Metro bundler in your browser:"
  echo "     http://localhost:8081"
  echo ""
  echo "     From there, you can copy the 'exp://' URL to open in Expo Go."
else
  echo "  ⏳ Expo still starting up... check /tmp/taska-expo.log"
  echo "     Run: cat /tmp/taska-expo.log"
fi

echo ""
echo "── Quick Test ──────────────────────────────────────"
echo "  Health:  curl http://localhost:5000/api/v1/health"
echo "  Send OTP: curl -X POST http://localhost:5000/api/v1/auth/send-otp \\"
echo '    -H "Content-Type: application/json" -d '"'{\"phoneNumber\": \"+251911234567\"}'"
echo ""
echo "  Logs:"
echo "    Backend: tail -f /tmp/taska-backend.log"
echo "    Expo:    tail -f /tmp/taska-expo.log"
echo ""
echo "  To stop all services:"
echo "    pkill -f 'ts-node src/index.ts'; pkill -f 'expo start'"
echo "────────────────────────────────────────────────────"
