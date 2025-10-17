#!/bin/bash

# Gaming Marketplace Deployment Script
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting and formatting
echo "🔍 Running code quality checks..."
npm run lint
npm run format:check

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "📦 Building application..."
npm run build

# Create deployment package
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="gaming-marketplace-${TIMESTAMP}.tar.gz"

echo "📋 Creating deployment package..."
tar -czf $PACKAGE_NAME dist/ package.json package-lock.json nginx.conf server-setup.sh

echo "✅ Deployment package created: $PACKAGE_NAME"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Upload $PACKAGE_NAME to your VPS"
echo "2. Run: chmod +x server-setup.sh && ./server-setup.sh"
echo "3. Extract package: tar -xzf $PACKAGE_NAME -C /var/www/gaming-marketplace"
echo "4. Configure Nginx and start the application"