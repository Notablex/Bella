#!/bin/sh
set -e

echo "🚀 Starting subscription-service entrypoint..."

# Run database migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"
echo "🎯 Starting subscription-service..."

# Start the application
exec node dist/index.js
