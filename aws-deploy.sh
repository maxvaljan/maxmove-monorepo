#!/bin/bash
# MaxMove AWS Deployment Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.aws file exists
if [ ! -f .env.aws ]; then
    echo -e "${RED}Error: .env.aws file not found. Please create one with your AWS settings${NC}"
    echo -e "Example:"
    echo -e "AWS_ACCOUNT_ID=123456789012"
    echo -e "AWS_REGION=us-east-1"
    echo -e "ECR_BACKEND=maxmove-backend"
    echo -e "ECR_WEB_UI=maxmove-web-ui"
    echo -e "ECS_CLUSTER=maxmove-cluster"
    echo -e "ECS_BACKEND_SERVICE=maxmove-backend-service"
    echo -e "ECS_WEB_UI_SERVICE=maxmove-web-ui-service"
    exit 1
fi

# Load variables from .env.aws
source .env.aws

# Check for required variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ] || [ -z "$ECR_BACKEND" ] || [ -z "$ECR_WEB_UI" ] || [ -z "$ECS_CLUSTER" ] || [ -z "$ECS_BACKEND_SERVICE" ] || [ -z "$ECS_WEB_UI_SERVICE" ]; then
    echo -e "${RED}Error: Missing required variables in .env.aws${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    echo -e "Run: brew install awscli"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured or invalid.${NC}"
    echo -e "Run: aws configure"
    exit 1
fi

# Login to ECR
echo -e "${BLUE}Logging in to Amazon ECR...${NC}"
if ! aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com; then
    echo -e "${RED}Error: Failed to log in to ECR.${NC}"
    exit 1
fi

# Build and push backend
echo -e "${BLUE}Building and pushing backend image...${NC}"
cd backend
if ! docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest .; then
    echo -e "${RED}Error: Failed to build backend image.${NC}"
    exit 1
fi

if ! docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest; then
    echo -e "${RED}Error: Failed to push backend image to ECR.${NC}"
    exit 1
fi
cd ..

# Build and push web-ui
echo -e "${BLUE}Building and pushing web-ui image...${NC}"
cd frontend/web-ui
if ! docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest .; then
    echo -e "${RED}Error: Failed to build web-ui image.${NC}"
    exit 1
fi

if ! docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest; then
    echo -e "${RED}Error: Failed to push web-ui image to ECR.${NC}"
    exit 1
fi
cd ../..

# Add a timestamp tag
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo -e "${BLUE}Tagging images with timestamp: ${TIMESTAMP}...${NC}"
docker tag $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:$TIMESTAMP
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:$TIMESTAMP

docker tag $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:$TIMESTAMP
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:$TIMESTAMP

# Update ECS services
echo -e "${BLUE}Updating ECS services with new images...${NC}"
if ! aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_BACKEND_SERVICE --force-new-deployment; then
    echo -e "${RED}Error: Failed to update backend service.${NC}"
    echo -e "${YELLOW}This is normal if you haven't set up ECS services yet.${NC}"
else
    echo -e "${GREEN}Backend service updated successfully.${NC}"
fi

if ! aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_WEB_UI_SERVICE --force-new-deployment; then
    echo -e "${RED}Error: Failed to update web-ui service.${NC}"
    echo -e "${YELLOW}This is normal if you haven't set up ECS services yet.${NC}"
else
    echo -e "${GREEN}Web UI service updated successfully.${NC}"
fi

echo -e "${GREEN}✅ Deployment process completed!${NC}"
echo -e "${YELLOW}Note: New containers may take a few minutes to start and be available.${NC}"
echo -e "${BLUE}To check deployment status:${NC}"
echo -e "  AWS Console > ECS > Clusters > ${ECS_CLUSTER} > Services"