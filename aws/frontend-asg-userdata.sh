#!/bin/bash
set -e

# Get instance metadata
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Get Backend ALB DNS from Parameter Store
BACKEND_ALB=$(aws ssm get-parameter --name "/drive-clone/backend-alb" --region $REGION --query 'Parameter.Value' --output text 2>/dev/null || echo "backend-alb-internal.example.com")

cd /home/ubuntu

sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs awscli nginx

git clone https://github.com/MAHIRE-7/drive-clone
sudo chown -R $USER:$USER drive-clone
cd drive-clone/frontend
npm install

cat > .env << EOF
REACT_APP_API_URL=/api
EOF

npm run build

sudo npm install -g pm2 serve
pm2 start "serve -s build -l 3000" --name drive-frontend
pm2 startup
pm2 save

# Configure Nginx with dynamic backend
sudo tee /etc/nginx/sites-available/drive-proxy << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://${BACKEND_ALB}:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Authorization \$http_authorization;
        proxy_pass_header Authorization;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/drive-proxy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "Frontend setup complete on instance: $INSTANCE_IP"
