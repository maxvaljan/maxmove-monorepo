#!/bin/bash

# AWS Deployment Script
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

echo -e "${BLUE}🚀 Starting MaxMove AWS deployment...${NC}"

# Build and tag Docker images for ECR
echo -e "${YELLOW}📦 Building Docker images for AWS deployment...${NC}"
docker-compose -f docker-compose.aws.yml build

# Get AWS configuration
if [ -f .env.aws ]; then
    source .env.aws
    AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
    AWS_REGION=${AWS_REGION}
    ECR_BACKEND=${ECR_BACKEND:-maxmove-backend}
    ECR_WEB_UI=${ECR_WEB_UI:-maxmove-web-ui}
    
    echo -e "${BLUE}Tagging images for ECR...${NC}"
    docker tag maxmove-monorepo_backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:latest
    docker tag maxmove-monorepo_web-ui:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_WEB_UI}:latest
    
    echo -e "${BLUE}Logging in to ECR...${NC}"
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    echo -e "${BLUE}Pushing images to ECR...${NC}"
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:latest
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_WEB_UI}:latest
    
    echo -e "${GREEN}✅ Images pushed to ECR successfully!${NC}"
    echo -e "${YELLOW}Now update your ECS services to use the new images:${NC}"
    echo -e "aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_BACKEND_SERVICE} --force-new-deployment"
    echo -e "aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_WEB_UI_SERVICE} --force-new-deployment"
else
    echo -e "${YELLOW}⚠️ .env.aws file not found. Skipping ECR push.${NC}"
    echo -e "${YELLOW}To deploy to AWS ECR and ECS, create a .env.aws file with your AWS settings.${NC}"
    
    # Just run the containers locally
    echo -e "${BLUE}Starting containers locally...${NC}"
    docker-compose -f docker-compose.aws.yml up -d
    
    echo -e "${GREEN}✅ Containers started locally.${NC}"
    echo -e "${BLUE}Backend API: http://localhost:${BACKEND_PORT:-3000}${NC}"
    echo -e "${BLUE}Web UI: http://localhost:${WEB_UI_PORT:-3001}${NC}"
fi