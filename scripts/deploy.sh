#!/bin/bash

# Deploy script for production server
# This script should be run on the server at /var/www/task-manager-service

set -e

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.server.example"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

# Pull latest image
echo "📦 Pulling latest Docker image..."
docker pull ghcr.io/${GITHUB_REPOSITORY}:latest

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose -f docker-compose.prod.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "⏳ Waiting for backend to be healthy..."
timeout 60 sh -c 'until docker compose -f docker-compose.prod.yml ps | grep -q "healthy"; do sleep 2; done' || {
    echo "❌ Health check failed!"
    docker compose -f docker-compose.prod.yml logs backend
    exit 1
}

# Show status
echo "✅ Deployment successful!"
docker compose -f docker-compose.prod.yml ps

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -f http://localhost:3001/api/health || {
    echo "❌ Health endpoint failed!"
    exit 1
}

echo ""
echo "🎉 Deployment completed successfully!"
echo "Backend is running on http://localhost:3001"
