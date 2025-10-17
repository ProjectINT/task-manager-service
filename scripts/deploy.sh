#!/bin/bash

# Deploy script for production server
# This script should be run on the server at /var/www/task-manager-service

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Check if we're in the correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ docker-compose.prod.yml not found!${NC}"
    echo "Please run this script from /var/www/task-manager-service directory"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file from .env.server.example"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

# Pull latest image
echo -e "${YELLOW}📦 Pulling latest Docker image...${NC}"
docker pull ghcr.io/${GITHUB_REPOSITORY}:latest

# Stop old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Start new containers
echo -e "${YELLOW}▶️  Starting new containers...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Wait for backend to be ready (max 60 seconds)
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in $(seq 1 60); do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi

    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Backend failed to start within 120 seconds${NC}"
        echo "Showing logs:"
        docker compose -f docker-compose.prod.yml logs backend
        exit 1
    fi

    echo "Attempt $i/60: Waiting for backend..."
    sleep 2
done

# Show status
echo -e "\n${YELLOW}📊 Service status:${NC}"
docker compose -f docker-compose.prod.yml ps

# Test health endpoint
echo -e "\n${YELLOW}🏥 Health check:${NC}"
if command -v jq &> /dev/null; then
    curl -s http://localhost:3001/api/health | jq '.'
else
    curl -s http://localhost:3001/api/health
fi

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "Backend is running on ${GREEN}http://localhost:3001${NC}"
