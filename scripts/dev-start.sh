#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3002}"
PID_FILE=".dev-server.pid"
PORT_FILE=".dev-server.port"
LOG_FILE=".dev-server.log"
BUILD_DIR=".next-dev"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Dev server already running (pid $(cat "$PID_FILE"))."
  exit 0
fi

if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  lsof -ti tcp:"$PORT" | xargs -I {} kill {}
fi

# Clear stale build output to avoid missing chunk/module errors.
rm -rf "$BUILD_DIR"

NEXT_DIST_DIR="$BUILD_DIR" nohup ./node_modules/.bin/next dev --port "$PORT" >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "$PORT" >"$PORT_FILE"

echo "Started Dave's Project Management on http://localhost:$PORT"
echo "PID: $(cat "$PID_FILE")"
echo "Log file: $LOG_FILE"
