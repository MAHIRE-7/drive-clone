#!/bin/bash
set -e

cd /home/ubuntu

sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
sudo newgrp docker

docker run -d \
  --name mongodb \
  -p 0.0.0.0:27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -e MONGO_INITDB_DATABASE=drive-clone \
  -v mongodb_data:/data/db \
  --restart always \
  mongo:7

echo "MongoDB setup complete!"
echo "Verify with: docker ps"
echo "Check logs: docker logs mongodb"
