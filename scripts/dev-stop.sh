#!/usr/bin/env bash
set -euo pipefail

PID_FILE=".dev-server.pid"
PORT_FILE=".dev-server.port"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No PID file found. App is likely not running."
  if [[ -f "$PORT_FILE" ]]; then
    PORT="$(cat "$PORT_FILE")"
    lsof -ti tcp:"$PORT" | xargs -I {} kill {} 2>/dev/null || true
    rm -f "$PORT_FILE"
  fi
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  pkill -P "$PID" 2>/dev/null || true
  kill "$PID"
  echo "Stopped app (pid $PID)."
else
  echo "PID $PID is not running."
fi

if [[ -f "$PORT_FILE" ]]; then
  PORT="$(cat "$PORT_FILE")"
  lsof -ti tcp:"$PORT" | xargs -I {} kill {} 2>/dev/null || true
fi

rm -f "$PID_FILE"
rm -f "$PORT_FILE"
