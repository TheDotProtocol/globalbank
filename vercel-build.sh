#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database setup
echo "🔧 Setting up database schema..."
node scripts/setup-database.js

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build process completed!" 