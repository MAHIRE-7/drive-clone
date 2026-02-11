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
cd drive-clone/backend
npm install

cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://admin:admin123@<MONGODB_PRIVATE_IP>:27017/drive-clone?authSource=admin
JWT_SECRET=your_production_secret_key_change_this
FRONTEND_URL=http://<FRONTEND_PUBLIC_IP>
EOF

mkdir -p uploads
chmod 777 uploads

sudo npm install -g pm2
pm2 start src/server.js --name drive-backend
pm2 startup
pm2 save

echo "Backend setup complete!"
echo "Verify with: pm2 logs drive-backend"
echo "Test with: curl http://localhost:5000/api/auth/profile"
