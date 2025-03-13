#!/bin/bash

# MaxMove Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found. Please create one based on .env.example${NC}"
    exit 1
fi

# Get environment from args or default to production
ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}🚀 Starting MaxMove deployment in $ENV environment...${NC}"

# Build and start containers
echo -e "${YELLOW}📦 Building containers...${NC}"
docker-compose -f $COMPOSE_FILE build

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f $COMPOSE_FILE up -d

echo -e "${YELLOW}🔍 Checking service health...${NC}"
sleep 5

# Check if backend is running
BACKEND_STATUS=$(docker-compose -f $COMPOSE_FILE ps -q backend | xargs docker inspect -f '{{.State.Status}}')

if [ "$BACKEND_STATUS" == "running" ]; then
    echo -e "${GREEN}✅ Backend service is running.${NC}"
else
    echo -e "${RED}❌ Backend service failed to start. Check logs with: docker-compose -f $COMPOSE_FILE logs backend${NC}"
    exit 1
fi

# Check if web-ui is running
WEB_UI_STATUS=$(docker-compose -f $COMPOSE_FILE ps -q web-ui | xargs docker inspect -f '{{.State.Status}}')

if [ "$WEB_UI_STATUS" == "running" ]; then
    echo -e "${GREEN}✅ Web UI service is running.${NC}"
else
    echo -e "${RED}❌ Web UI service failed to start. Check logs with: docker-compose -f $COMPOSE_FILE logs web-ui${NC}"
    exit 1
fi

# Get the ports and domain from .env
source .env
BACKEND_PORT=${BACKEND_PORT:-3000}
WEB_UI_PORT=${WEB_UI_PORT:-3001}
CUSTOM_DOMAIN=${CUSTOM_DOMAIN:-localhost}

echo ""
echo -e "${GREEN}✨ Deployment complete! Services are running:${NC}"

# Display local and custom domain URLs if available
if [ "$CUSTOM_DOMAIN" != "localhost" ] && [ "$CUSTOM_DOMAIN" != "" ]; then
    echo -e "${BLUE}📡 Backend API:${NC}"
    echo -e "  - Local: http://localhost:$BACKEND_PORT"
    echo -e "  - Production: https://api.$CUSTOM_DOMAIN"
    
    echo -e "${BLUE}🌐 Web UI:${NC}"
    echo -e "  - Local: http://localhost:$WEB_UI_PORT"
    echo -e "  - Production: https://$CUSTOM_DOMAIN"
    
    echo -e "${YELLOW}⚠️  Remember to set up your DNS and web server/proxy to point to these services!${NC}"
else
    echo -e "${BLUE}📡 Backend API: http://localhost:$BACKEND_PORT${NC}"
    echo -e "${BLUE}🌐 Web UI: http://localhost:$WEB_UI_PORT${NC}"
fi

echo ""
echo -e "${BLUE}📋 Management commands:${NC}"
echo -e "   View logs: ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f [backend|web-ui]${NC}"
echo -e "   Restart services: ${YELLOW}docker-compose -f $COMPOSE_FILE restart${NC}"
echo -e "   Stop services: ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "   Update and redeploy: ${YELLOW}git pull && ./deploy.sh${NC}"