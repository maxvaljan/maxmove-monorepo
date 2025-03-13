#\!/bin/bash
# Script to create ECR repositories

# Load AWS configuration
source .env.aws

# Create backend repository
echo "Creating ECR repository for backend..."
aws ecr create-repository --repository-name $ECR_BACKEND --region $AWS_REGION

# Create web-ui repository
echo "Creating ECR repository for web-ui..."
aws ecr create-repository --repository-name $ECR_WEB_UI --region $AWS_REGION

echo "ECR repositories created successfully\!"
