#!/bin/sh
set -e

echo "🚀 Starting communication-service entrypoint..."

# Run database migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"
echo "🎯 Starting communication-service..."

# Start the application
exec node dist/index.js
