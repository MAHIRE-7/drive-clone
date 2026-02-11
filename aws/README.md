# Google Drive Clone - AWS Deployment Guide

## Architecture Overview
- **MongoDB Server**: Private subnet (Docker container)
- **Backend Server**: Private subnet (Node.js API on port 5000)
- **Frontend Server**: Public subnet (React app with Nginx reverse proxy on port 80)

---

## Quick Setup with Scripts

### 1. MongoDB Server (Private Subnet)
```bash
wget https://raw.githubusercontent.com/MAHIRE-7/drive-clone/main/aws/mongodb.sh
chmod +x mongodb.sh
./mongodb.sh
```

### 2. Backend Server (Private Subnet)
```bash
wget https://raw.githubusercontent.com/MAHIRE-7/drive-clone/main/aws/backend.sh
chmod +x backend.sh
# Edit backend.sh and replace <MONGODB_PRIVATE_IP> and <FRONTEND_PUBLIC_IP>
nano backend.sh
./backend.sh
```

### 3. Frontend Server (Public Subnet)
```bash
wget https://raw.githubusercontent.com/MAHIRE-7/drive-clone/main/aws/frontend.sh
chmod +x frontend.sh
# Edit frontend.sh and replace <FRONTEND_PUBLIC_IP> and <BACKEND_PRIVATE_IP>
nano frontend.sh
./frontend.sh
```

### 4. Access Application
Open browser: `http://<FRONTEND_PUBLIC_IP>`

---

## Manual Setup Instructions

---

## Setup Scripts

Three automated setup scripts are provided:

1. **mongodb.sh** - Sets up MongoDB with Docker
2. **backend.sh** - Sets up Node.js backend with PM2
3. **frontend.sh** - Sets up React frontend with Nginx

**Before running scripts, update these placeholders:**
- `<MONGODB_PRIVATE_IP>` - MongoDB server's private IP
- `<BACKEND_PRIVATE_IP>` - Backend server's private IP  
- `<FRONTEND_PUBLIC_IP>` - Frontend server's public IP

---

## Manual Setup Instructions

## 1. Database Server Setup (Private Subnet)

### Install Docker
```bash
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
sudo newgrp docker
```

### Run MongoDB Container
```bash
docker run -d \
  --name mongodb \
  -p 0.0.0.0:27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -e MONGO_INITDB_DATABASE=drive-clone \
  -v mongodb_data:/data/db \
  --restart always \
  mongo:7
```

### Verify MongoDB
```bash
docker ps
docker logs mongodb
```

### Security Group Rules
- **Inbound**: Port 27017 from Backend server security group only
- **Outbound**: All traffic

---

## 2. Backend Server Setup (Private Subnet)

### Install Node.js
```bash
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/MAHIRE-7/drive-clone
sudo chown -R $USER:$USER drive-clone
cd drive-clone/backend
```

### Install Dependencies
```bash
npm install
```

### Create .env File
```bash
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://admin:admin123@<MONGODB_PRIVATE_IP>:27017/drive-clone?authSource=admin
JWT_SECRET=your_production_secret_key_change_this
FRONTEND_URL=http://<FRONTEND_PUBLIC_IP>
EOF
```

**Replace:**
- `<MONGODB_PRIVATE_IP>` with MongoDB server's private IP
- `<FRONTEND_PUBLIC_IP>` with Frontend server's public IP

### Create Uploads Directory
```bash
mkdir -p uploads
chmod 777 uploads
```

### Install PM2 and Start Backend
```bash
sudo npm install -g pm2
pm2 start src/server.js --name drive-backend
pm2 startup
pm2 save
```

### Verify Backend
```bash
pm2 status
pm2 logs drive-backend
curl http://localhost:5000/api/auth/profile
# Should return: {"error":"Please authenticate"}
```

### Security Group Rules
- **Inbound**: Port 5000 from Frontend server security group
- **Outbound**: Port 27017 to MongoDB, All to Internet (for npm)

---

## 3. Frontend Server Setup (Public Subnet)

### Install Node.js
```bash
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/MAHIRE-7/drive-clone
sudo chown -R $USER:$USER drive-clone
cd drive-clone/frontend
```

### Install Dependencies
```bash
npm install
```

### Create .env File
```bash
cat > .env << EOF
REACT_APP_API_URL=/api
EOF
```

### Build Frontend
```bash
npm run build
```

### Install PM2 and Serve
```bash
sudo npm install -g pm2 serve
pm2 start "serve -s build -l 3000" --name drive-frontend
pm2 startup
pm2 save
```

### Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/drive-proxy << 'EOF'
server {
    listen 80;
    server_name <FRONTEND_PUBLIC_IP>;

    # Serve frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://<BACKEND_PRIVATE_IP>:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}
EOF
```

**Replace:**
- `<FRONTEND_PUBLIC_IP>` with your frontend server's public IP
- `<BACKEND_PRIVATE_IP>` with backend server's private IP

### Enable Nginx
```bash
sudo ln -s /etc/nginx/sites-available/drive-proxy /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Security Group Rules
- **Inbound**: Port 80 from 0.0.0.0/0 (public access)
- **Outbound**: Port 5000 to Backend, All to Internet

---

## 4. Testing

### Test Backend API
```bash
# From frontend server
curl http://<BACKEND_PRIVATE_IP>:5000/api/auth/profile
# Should return: {"error":"Please authenticate"}
```

### Test Registration
```bash
curl -X POST http://<BACKEND_PRIVATE_IP>:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Access Application
Open browser: `http://<FRONTEND_PUBLIC_IP>`

---

## 5. Troubleshooting

### Check Services
```bash
# Backend
pm2 status
pm2 logs drive-backend

# Frontend
pm2 logs drive-frontend

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# MongoDB
docker logs mongodb
```

### Test Connectivity
```bash
# Backend to MongoDB
telnet <MONGODB_PRIVATE_IP> 27017

# Frontend to Backend
curl http://<BACKEND_PRIVATE_IP>:5000/api/auth/profile
```

### Common Issues

**MongoDB Connection Failed:**
- Check: `docker ps`
- Verify security group allows port 27017
- Add `?authSource=admin` to connection string

**Backend Not Reachable:**
- Check: `ss -tlnp | grep 5000`
- Verify security group allows port 5000
- Check .env file exists

**Upload Fails:**
- Create: `mkdir -p uploads && chmod 777 uploads`

---

## 6. Maintenance

### Restart Services
```bash
pm2 restart drive-backend
pm2 restart drive-frontend
sudo systemctl restart nginx
docker restart mongodb
```

### Update Application
```bash
# Backend
cd /opt/drive-clone/backend
git pull
npm install
pm2 restart drive-backend

# Frontend
cd /opt/drive-clone/frontend
git pull
npm install
npm run build
pm2 restart drive-frontend
```

### View Logs
```bash
pm2 logs drive-backend --lines 100
pm2 logs drive-frontend --lines 100
sudo tail -f /var/log/nginx/access.log
```

---

## Architecture Diagram

```
Internet
   |
   v
[Frontend EC2 - Public Subnet]
   - Nginx (Port 80)
   - React App (Port 3000)
   |
   | (Nginx Reverse Proxy)
   v
[Backend EC2 - Private Subnet]
   - Node.js API (Port 5000)
   |
   v
[MongoDB EC2 - Private Subnet]
   - MongoDB (Port 27017)
```

---

## Security Best Practices

1. Use MongoDB Atlas instead of self-hosted
2. Enable HTTPS with Let's Encrypt
3. Use Application Load Balancer
4. Enable CloudWatch logging
5. Use Secrets Manager for credentials
6. Implement rate limiting
7. Regular security updates
8. Strong JWT_SECRET in production
9. Restrict security groups
10. Enable VPC Flow Logs
