#!/bin/bash

# Stop all services
# Usage: ./scripts/stop-all.sh [--clean]

set -e

echo "🛑 Stopping all services..."

if [ "$1" == "--clean" ]; then
  echo "⚠️  Cleaning mode: This will remove all containers and volumes!"
  read -p "Are you sure? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    echo "✅ All services stopped and data cleaned"
  else
    echo "❌ Cancelled"
    exit 1
  fi
else
  docker compose down
  echo "✅ All services stopped (data preserved)"
  echo "💡 To remove all data, run: ./scripts/stop-all.sh --clean"
fi
