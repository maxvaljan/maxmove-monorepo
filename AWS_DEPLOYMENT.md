# MaxMove AWS Deployment Guide

This guide provides step-by-step instructions for deploying the MaxMove application to AWS using Docker.

## Overview

We'll use the following AWS services:
- **AWS Elastic Container Service (ECS)** - for running Docker containers
- **AWS Elastic Load Balancer (ELB)** - for routing traffic
- **Amazon Route 53** - for DNS management (if you have a custom domain)

## Prerequisites

- AWS account with sufficient permissions
- AWS CLI installed and configured locally
- Your custom domain name (optional)
- Docker installed locally (for testing)

## Step 1: Setup AWS Environment

### Create an ECR Repository

1. Log in to the AWS Management Console
2. Navigate to Elastic Container Registry (ECR)
3. Click "Create repository"
4. Name it `maxmove-backend` and `maxmove-web-ui`
5. Click "Create repository"

### Set Up Authentication

```bash
# Install AWS CLI if you haven't already
brew install awscli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID and Secret Access Key when prompted

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Step 2: Prepare Docker Images for AWS

1. Update your `.env` file with production values:

```
# AWS deployment settings
BACKEND_PORT=3000
WEB_UI_PORT=3000  # Both use port 3000 in container
CUSTOM_DOMAIN=yourdomain.com

# Backend Configuration
SUPABASE_URL=your_actual_supabase_url
SUPABASE_KEY=your_actual_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
STRIPE_SECRET_KEY=your_actual_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_actual_webhook_secret
JWT_SECRET=your_secure_jwt_secret
RESEND_API_KEY=your_actual_resend_api_key

# CORS settings for AWS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

2. Build and push Docker images to ECR:

```bash
# Set your AWS account ID and region
AWS_ACCOUNT_ID=your_aws_account_id
AWS_REGION=us-east-1

# Build and push backend image
cd backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/maxmove-backend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/maxmove-backend:latest
cd ..

# Build and push web-ui image
cd frontend/web-ui
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/maxmove-web-ui:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/maxmove-web-ui:latest
cd ../..
```

## Step 3: Create ECS Cluster and Task Definitions

### Create an ECS Cluster

1. Go to the ECS console
2. Click "Create Cluster"
3. Choose "Networking only" (Fargate)
4. Name it "maxmove-cluster"
5. Create a new VPC or use an existing one
6. Click "Create"

### Create Task Definitions

#### Backend Task Definition

1. Go to "Task Definitions" in ECS
2. Click "Create new Task Definition"
3. Select "Fargate"
4. Name it "maxmove-backend-task"
5. Set Task Role to "ecsTaskExecutionRole"
6. Set Task Memory to 1GB and CPU to 0.5 vCPU
7. Add a container:
   - Name: "backend"
   - Image: YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/maxmove-backend:latest
   - Port mappings: 3000
   - Environment variables: Add all the environment variables from your .env file
8. Click "Create"

#### Web UI Task Definition

1. Create another Task Definition
2. Name it "maxmove-web-ui-task"
3. Set Task Role to "ecsTaskExecutionRole"
4. Set Task Memory to 1GB and CPU to 0.5 vCPU
5. Add a container:
   - Name: "web-ui"
   - Image: YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/maxmove-web-ui:latest
   - Port mappings: 3000
   - Environment variables: Add the following:
     - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
6. Click "Create"

## Step 4: Create ECS Services

### Create Backend Service

1. In your ECS cluster, click "Create Service"
2. Select the "maxmove-backend-task" definition
3. Name the service "maxmove-backend-service"
4. Set Number of tasks to 1 (to start)
5. Select "Rolling update" for deployment type
6. In the Network Configuration:
   - VPC: Your VPC
   - Subnets: Select at least two subnets
   - Security group: Create one with inbound port 3000 open
   - Auto-assign public IP: ENABLED
7. Configure Load Balancing:
   - Select Application Load Balancer
   - Create a new ALB named "maxmove-backend-alb"
   - Port: 80 (we'll add HTTPS later)
   - Create a target group "maxmove-backend-tg"
8. Click "Next step" and "Create Service"

### Create Web UI Service

1. Create another service, similar to the backend
2. Select the "maxmove-web-ui-task" definition
3. Name the service "maxmove-web-ui-service"
4. Configure as above, but create a different ALB named "maxmove-web-ui-alb"

## Step 5: Configure DNS and HTTPS

### Set Up Route 53 (if you have a custom domain)

1. Go to Route 53 console
2. Create a hosted zone for your domain
3. Add A records:
   - yourdomain.com → web-ui ALB
   - api.yourdomain.com → backend ALB

### Set Up SSL Certificates

1. Go to AWS Certificate Manager
2. Request a public certificate for:
   - yourdomain.com
   - *.yourdomain.com
3. Complete domain validation
4. Update both ALBs to use HTTPS:
   - Add a listener on port 443
   - Select your certificate
   - Update security groups to allow 443
   - Add a rule to redirect HTTP to HTTPS

## Step 6: Automation Script

Create a deployment script to make future updates easier:

```bash
#!/bin/bash
# aws-deploy.sh

# Set variables
AWS_ACCOUNT_ID=your_aws_account_id
AWS_REGION=us-east-1
ECR_BACKEND=maxmove-backend
ECR_WEB_UI=maxmove-web-ui
ECS_CLUSTER=maxmove-cluster
ECS_BACKEND_SERVICE=maxmove-backend-service
ECS_WEB_UI_SERVICE=maxmove-web-ui-service

# Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend
echo "Building and pushing backend image..."
cd backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND:latest
cd ..

# Build and push web-ui
echo "Building and pushing web-ui image..."
cd frontend/web-ui
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_WEB_UI:latest
cd ../..

# Update ECS services
echo "Updating ECS services with new images..."
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_BACKEND_SERVICE --force-new-deployment
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_WEB_UI_SERVICE --force-new-deployment

echo "Deployment completed!"
```

Save this as `aws-deploy.sh` in your root directory, make it executable with `chmod +x aws-deploy.sh`, and use it for future deployments.

## Step 7: Monitoring and Troubleshooting

### View Container Logs

1. Go to ECS console > Clusters > maxmove-cluster
2. Select the service you want to check
3. Click on the running task
4. Click on "Logs" tab for each container

### Health Checks

1. Visit your load balancer URLs to check if the services are responding
2. Check the target group health in EC2 > Target Groups

### Common Issues

- **Container failing to start**: Check ECS logs for error messages
- **Health checks failing**: Ensure ports are correctly configured in task definition
- **Network issues**: Verify security group settings allow necessary traffic
- **Environment variables**: Check if all required variables are set in the task definition

## Step 8: Updating Your Application

When you need to update your application:

1. Make changes to your code and commit
2. Run the aws-deploy.sh script: `./aws-deploy.sh`
3. The script will:
   - Build new Docker images
   - Push to ECR
   - Update your ECS services
   - Perform a rolling deployment (zero downtime)

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Schedule scaling to reduce capacity during off-hours
- Use AWS Cost Explorer to monitor spending

## Security Best Practices

1. Store secrets in AWS Secrets Manager or Parameter Store
2. Enable AWS CloudTrail for auditing
3. Implement least privilege IAM policies
4. Enable Multi-Factor Authentication (MFA) for AWS users
5. Regularly update dependencies and Docker images

## Conclusion

You've successfully deployed MaxMove to AWS using Docker! This setup provides a robust, scalable infrastructure that will grow with your application. For further assistance, refer to AWS documentation or reach out for help when needed.