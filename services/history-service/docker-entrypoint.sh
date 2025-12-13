#!/bin/sh
set -e

echo "Starting history-service entrypoint..."

echo "Waiting for database..."
sleep 5

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/index.js
