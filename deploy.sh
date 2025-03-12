#!/bin/bash

# MaxMove Deployment Script
set -e

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# Get environment from args or default to production
ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting MaxMove deployment in $ENV environment..."

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose -f $COMPOSE_FILE build
docker-compose -f $COMPOSE_FILE up -d

echo "🔍 Checking service health..."
sleep 5

# Check if backend is running
BACKEND_STATUS=$(docker-compose -f $COMPOSE_FILE ps -q backend | xargs docker inspect -f '{{.State.Status}}')

if [ "$BACKEND_STATUS" == "running" ]; then
    echo "✅ Backend service is running."
else
    echo "❌ Backend service failed to start. Check logs with: docker-compose -f $COMPOSE_FILE logs backend"
    exit 1
fi

# Check if web-ui is running
WEB_UI_STATUS=$(docker-compose -f $COMPOSE_FILE ps -q web-ui | xargs docker inspect -f '{{.State.Status}}')

if [ "$WEB_UI_STATUS" == "running" ]; then
    echo "✅ Web UI service is running."
else
    echo "❌ Web UI service failed to start. Check logs with: docker-compose -f $COMPOSE_FILE logs web-ui"
    exit 1
fi

# Get the ports from .env or use defaults
source .env
BACKEND_PORT=${BACKEND_PORT:-3000}
WEB_UI_PORT=${WEB_UI_PORT:-3001}

echo ""
echo "✨ Deployment complete! Services are running:"
echo "📡 Backend API: http://localhost:$BACKEND_PORT"
echo "🌐 Web UI: http://localhost:$WEB_UI_PORT"
echo ""
echo "📋 To view logs:"
echo "   Backend: docker-compose -f $COMPOSE_FILE logs -f backend"
echo "   Web UI: docker-compose -f $COMPOSE_FILE logs -f web-ui"
echo ""
echo "🛑 To stop services: docker-compose -f $COMPOSE_FILE down"