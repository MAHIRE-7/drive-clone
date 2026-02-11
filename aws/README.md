Database server cofiguration 
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
sudo newgrp docker
docker run -d --name mongod -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin  -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:latest

on Frontend and Backend Server 
sudo git clone https://github.com/MAHIRE-7/drive-clone
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs


on frontend server 
# On frontend server
sudo apt update
sudo apt install nginx -y

# Create nginx config
sudo tee /etc/nginx/sites-available/drive-proxy << 'EOF'
server {
    listen 80;
    server_name 65.0.185.144;

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
        proxy_pass http://12.0.141.100:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable config
sudo ln -s /etc/nginx/sites-available/drive-proxy /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx



