#!/bin/bash
set -e

# Get instance metadata
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Get MongoDB endpoint from Parameter Store or hardcode
MONGODB_ENDPOINT=$(aws ssm get-parameter --name "/drive-clone/mongodb-endpoint" --region $REGION --query 'Parameter.Value' --output text 2>/dev/null || echo "mongodb-private-ip:27017")

# Get ALB DNS from Parameter Store
FRONTEND_ALB=$(aws ssm get-parameter --name "/drive-clone/frontend-alb" --region $REGION --query 'Parameter.Value' --output text 2>/dev/null || echo "http://frontend-alb.example.com")

cd /home/ubuntu

sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs awscli

git clone https://github.com/MAHIRE-7/drive-clone
sudo chown -R $USER:$USER drive-clone
cd drive-clone/backend
npm install

cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://admin:admin123@${MONGODB_ENDPOINT}/drive-clone?authSource=admin
JWT_SECRET=$(aws ssm get-parameter --name "/drive-clone/jwt-secret" --region $REGION --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || echo "default-secret-change-me")
FRONTEND_URL=${FRONTEND_ALB}
EOF

mkdir -p uploads
chmod 777 uploads

sudo npm install -g pm2
pm2 start src/server.js --name drive-backend
pm2 startup
pm2 save

echo "Backend setup complete on instance: $INSTANCE_IP"
