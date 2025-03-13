#!/bin/bash
# Script to build and push Docker images to ECR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load AWS configuration
source .env.aws

# Login to ECR
echo -e "${BLUE}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend image
echo -e "${BLUE}Building and pushing backend image...${NC}"
cd backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest
cd ..

# Build and push web-ui image
echo -e "${BLUE}Building and pushing web-ui image...${NC}"
cd frontend/web-ui
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest
cd ../..

# Tag images with timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo -e "${BLUE}Tagging images with timestamp: ${TIMESTAMP}...${NC}"
docker tag $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:$TIMESTAMP
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:$TIMESTAMP

docker tag $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:$TIMESTAMP
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:$TIMESTAMP

echo -e "${GREEN}✅ Images built and pushed successfully!${NC}"
echo -e "${BLUE}Backend image: ${NC}$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest"
echo -e "${BLUE}Web UI image: ${NC}$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest"