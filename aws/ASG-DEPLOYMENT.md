# Auto Scaling Group Deployment Guide

## Architecture with ASG

```
Internet
   |
   v
[Application Load Balancer - Public]
   |
   v
[Frontend ASG - Public Subnet]
   - Multiple EC2 instances
   - Auto scales based on load
   |
   v
[Application Load Balancer - Internal]
   |
   v
[Backend ASG - Private Subnet]
   - Multiple EC2 instances
   - Auto scales based on load
   |
   v
[MongoDB - Private Subnet]
   - Single instance or MongoDB Atlas
```

---

## Prerequisites

### 1. Store Configuration in AWS Systems Manager Parameter Store

```bash
# MongoDB endpoint
aws ssm put-parameter \
  --name "/drive-clone/mongodb-endpoint" \
  --value "10.0.1.100:27017" \
  --type String

# JWT Secret (encrypted)
aws ssm put-parameter \
  --name "/drive-clone/jwt-secret" \
  --value "your-super-secret-jwt-key" \
  --type SecureString

# Frontend ALB DNS (will be updated after ALB creation)
aws ssm put-parameter \
  --name "/drive-clone/frontend-alb" \
  --value "http://frontend-alb-123456.us-east-1.elb.amazonaws.com" \
  --type String

# Backend ALB DNS (will be updated after ALB creation)
aws ssm put-parameter \
  --name "/drive-clone/backend-alb" \
  --value "backend-alb-internal-123456.us-east-1.elb.amazonaws.com" \
  --type String
```

---

## Step 1: Create MongoDB (Single Instance or Atlas)

**Option A: Single EC2 Instance**
```bash
# Use mongodb.sh script on a single EC2 instance
# Note: For production, use MongoDB Atlas or RDS DocumentDB
```

**Option B: MongoDB Atlas (Recommended)**
- Create cluster at mongodb.com/cloud/atlas
- Get connection string
- Update Parameter Store with Atlas endpoint

---

## Step 2: Create Backend Infrastructure

### 2.1 Create Internal Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name drive-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /api/auth/profile \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create internal ALB
aws elbv2 create-load-balancer \
  --name drive-backend-alb \
  --subnets subnet-private1 subnet-private2 \
  --security-groups sg-backend-alb \
  --scheme internal \
  --type application

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <backend-alb-arn> \
  --protocol HTTP \
  --port 5000 \
  --default-actions Type=forward,TargetGroupArn=<backend-tg-arn>
```

### 2.2 Create Launch Template for Backend

```bash
aws ec2 create-launch-template \
  --launch-template-name drive-backend-lt \
  --version-description "Backend v1" \
  --launch-template-data '{
    "ImageId": "ami-xxxxx",
    "InstanceType": "t3.small",
    "IamInstanceProfile": {
      "Name": "EC2-SSM-Role"
    },
    "SecurityGroupIds": ["sg-backend"],
    "UserData": "'$(base64 -w 0 backend-asg-userdata.sh)'"
  }'
```

### 2.3 Create Auto Scaling Group for Backend

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name drive-backend-asg \
  --launch-template LaunchTemplateName=drive-backend-lt,Version='$Latest' \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns <backend-tg-arn> \
  --vpc-zone-identifier "subnet-private1,subnet-private2" \
  --health-check-type ELB \
  --health-check-grace-period 300
```

### 2.4 Update Parameter Store with Backend ALB DNS

```bash
BACKEND_ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names drive-backend-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

aws ssm put-parameter \
  --name "/drive-clone/backend-alb" \
  --value "$BACKEND_ALB_DNS" \
  --type String \
  --overwrite
```

---

## Step 3: Create Frontend Infrastructure

### 3.1 Create Public Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name drive-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx \
  --health-check-path / \
  --health-check-interval-seconds 30

# Create public ALB
aws elbv2 create-load-balancer \
  --name drive-frontend-alb \
  --subnets subnet-public1 subnet-public2 \
  --security-groups sg-frontend-alb \
  --scheme internet-facing \
  --type application

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <frontend-alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=<frontend-tg-arn>
```

### 3.2 Create Launch Template for Frontend

```bash
aws ec2 create-launch-template \
  --launch-template-name drive-frontend-lt \
  --version-description "Frontend v1" \
  --launch-template-data '{
    "ImageId": "ami-xxxxx",
    "InstanceType": "t3.small",
    "IamInstanceProfile": {
      "Name": "EC2-SSM-Role"
    },
    "SecurityGroupIds": ["sg-frontend"],
    "UserData": "'$(base64 -w 0 frontend-asg-userdata.sh)'"
  }'
```

### 3.3 Create Auto Scaling Group for Frontend

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name drive-frontend-asg \
  --launch-template LaunchTemplateName=drive-frontend-lt,Version='$Latest' \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns <frontend-tg-arn> \
  --vpc-zone-identifier "subnet-public1,subnet-public2" \
  --health-check-type ELB \
  --health-check-grace-period 300
```

### 3.4 Update Parameter Store with Frontend ALB DNS

```bash
FRONTEND_ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names drive-frontend-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

aws ssm put-parameter \
  --name "/drive-clone/frontend-alb" \
  --value "http://$FRONTEND_ALB_DNS" \
  --type String \
  --overwrite
```

---

## Step 4: Configure Auto Scaling Policies

### Backend Scaling Policy (CPU-based)

```bash
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name drive-backend-asg \
  --policy-name backend-scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 70.0
  }'
```

### Frontend Scaling Policy (Request-based)

```bash
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name drive-frontend-asg \
  --policy-name frontend-scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ALBRequestCountPerTarget",
      "ResourceLabel": "app/drive-frontend-alb/xxx/targetgroup/drive-frontend-tg/yyy"
    },
    "TargetValue": 1000.0
  }'
```

---

## Step 5: IAM Role for EC2 Instances

Create IAM role with these policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/drive-clone/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeTags"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Security Groups

### Frontend ALB SG
- Inbound: Port 80 from 0.0.0.0/0

### Frontend Instance SG
- Inbound: Port 80 from Frontend ALB SG

### Backend ALB SG
- Inbound: Port 5000 from Frontend Instance SG

### Backend Instance SG
- Inbound: Port 5000 from Backend ALB SG

### MongoDB SG
- Inbound: Port 27017 from Backend Instance SG

---

## Access Application

```
http://<FRONTEND_ALB_DNS>
```

---

## Benefits of ASG Setup

1. **High Availability** - Multiple instances across AZs
2. **Auto Scaling** - Scales based on load
3. **Load Balancing** - Distributes traffic evenly
4. **Self Healing** - Unhealthy instances replaced automatically
5. **Zero Downtime Deployments** - Rolling updates
6. **Cost Optimization** - Scale down during low traffic

---

## Monitoring

```bash
# View ASG status
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names drive-backend-asg drive-frontend-asg

# View ALB health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

---

## Updating Application

1. Update user data script
2. Create new launch template version
3. Update ASG to use new version
4. Instances will be replaced gradually

```bash
# Update launch template
aws ec2 create-launch-template-version \
  --launch-template-name drive-backend-lt \
  --source-version 1 \
  --launch-template-data file://new-config.json

# Update ASG
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name drive-backend-asg \
  --launch-template LaunchTemplateName=drive-backend-lt,Version='$Latest'

# Start instance refresh for rolling update
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name drive-backend-asg
```
