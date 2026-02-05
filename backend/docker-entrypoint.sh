#!/bin/sh
set -e

echo "🔄 Waiting for MySQL to be ready..."
until nc -z mysql 3306; do
  echo "⏳ MySQL is unavailable - sleeping"
  sleep 2
done

echo "✅ MySQL is ready!"
echo "🔄 Running migrations..."

npm run migration:run

echo "✅ Migrations completed!"
echo "🚀 Starting application..."

exec node dist/src/main.js

