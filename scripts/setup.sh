#!/bin/bash

echo "Setting up Video Streaming Platform with Gradle..."

# Create databases
echo "Creating MySQL databases..."
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS auth_db;"
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS user_db;"
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS video_db;"

# Build all services
echo "Building all services..."
./gradlew clean build -x test

echo "Setup complete!"
echo "Run 'docker-compose up' in the docker folder to start containers"
echo "Run './gradlew bootRun' in any service directory to start that service"

