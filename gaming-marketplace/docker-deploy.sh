#!/bin/bash

# Docker deployment script for Gaming Marketplace
set -e

echo "🐳 Starting Docker deployment..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t gaming-marketplace:latest .

# Stop and remove existing container if it exists
echo "🔄 Stopping existing container..."
docker stop gaming-marketplace 2>/dev/null || true
docker rm gaming-marketplace 2>/dev/null || true

# Run the new container
echo "🚀 Starting new container..."
docker run -d \
  --name gaming-marketplace \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  gaming-marketplace:latest

# Show container status
echo "📊 Container status:"
docker ps | grep gaming-marketplace

echo "✅ Docker deployment completed!"
echo "🌐 Your application is now running at http://localhost"