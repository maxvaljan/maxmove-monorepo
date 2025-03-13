#!/bin/bash
# Script to deploy the AWS infrastructure using CloudFormation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load AWS configuration
source .env.aws

# Check if VPC ID is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: VPC ID is required.${NC}"
  echo -e "Usage: $0 <vpc-id> <subnet-id-1> <subnet-id-2>"
  echo -e "Example: $0 vpc-12345678 subnet-abcdef12 subnet-34567890"
  exit 1
fi

# Check if at least two subnet IDs are provided
if [ -z "$2" ] || [ -z "$3" ]; then
  echo -e "${RED}Error: At least two subnet IDs are required.${NC}"
  echo -e "Usage: $0 <vpc-id> <subnet-id-1> <subnet-id-2>"
  echo -e "Example: $0 vpc-12345678 subnet-abcdef12 subnet-34567890"
  exit 1
fi

VPC_ID=$1
SUBNET_IDS="$2\\,$3"
if [ ! -z "$4" ]; then
  SUBNET_IDS="$SUBNET_IDS\\,$4"
fi

STACK_NAME="maxmove-ecs-stack"

echo -e "${BLUE}Deploying CloudFormation stack ${STACK_NAME}...${NC}"
echo -e "${YELLOW}VPC ID: ${NC}$VPC_ID"
echo -e "${YELLOW}Subnet IDs: ${NC}${SUBNET_IDS//\\,/, }"

# Create or update the CloudFormation stack
aws cloudformation deploy \
  --template-file aws-ecs-setup.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    VpcId=$VPC_ID \
    SubnetIDs=$SUBNET_IDS \
  --capabilities CAPABILITY_IAM

# Check if the stack deployment was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ CloudFormation stack deployed successfully!${NC}"
  
  # Get the outputs from the CloudFormation stack
  echo -e "${BLUE}Getting deployment details...${NC}"
  BACKEND_ALB=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BackendLoadBalancerDNS'].OutputValue" --output text)
  WEB_UI_ALB=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='WebUiLoadBalancerDNS'].OutputValue" --output text)
  
  echo -e "${GREEN}Deployment complete! Your services are available at:${NC}"
  echo -e "${BLUE}Backend API: ${NC}http://$BACKEND_ALB"
  echo -e "${BLUE}Web UI: ${NC}http://$WEB_UI_ALB"
  echo -e ""
  echo -e "${YELLOW}Note: It may take a few minutes for the services to be fully available.${NC}"
  echo -e "${YELLOW}To check the status of your services:${NC}"
  echo -e "  AWS Console > ECS > Clusters > maxmove-cluster > Services"
else
  echo -e "${RED}❌ CloudFormation stack deployment failed. Check the AWS console for details.${NC}"
  exit 1
fi