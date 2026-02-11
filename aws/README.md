Database server cofiguration 
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
sudo newgrp docker
docker run -d --name mongod -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin  -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:latest

on Frontend and Backend Server 
sudo git clone https://github.com/MAHIRE-7/drive-clone
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs