#!/bin/bash
set -e

cd /home/ubuntu

sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

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

sudo apt update
sudo apt install nginx -y

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

sudo ln -s /etc/nginx/sites-available/drive-proxy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "Frontend setup complete!"
echo "Access the app at: http://<FRONTEND_PUBLIC_IP>"




