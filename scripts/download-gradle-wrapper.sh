#!/bin/bash

echo "Downloading Gradle 8.5 wrapper JAR..."

# Create the gradle/wrapper directory if it doesn't exist
mkdir -p /Users/ather/IdeaProjects/video-streaming-platform/gradle/wrapper

# Change to the wrapper directory
cd /Users/ather/IdeaProjects/video-streaming-platform/gradle/wrapper

# Download Gradle distribution
curl -L https://services.gradle.org/distributions/gradle-8.5-bin.zip -o gradle-8.5-bin.zip

if [ $? -ne 0 ]; then
    echo "❌ Failed to download Gradle"
    exit 1
fi

# Extract the distribution
unzip -q gradle-8.5-bin.zip

if [ $? -ne 0 ]; then
    echo "❌ Failed to extract Gradle"
    rm -f gradle-8.5-bin.zip
    exit 1
fi

# Copy the wrapper jar
cp gradle-8.5/lib/gradle-wrapper.jar .

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy gradle-wrapper.jar"
    rm -rf gradle-8.5 gradle-8.5-bin.zip
    exit 1
fi

# Cleanup
rm -rf gradle-8.5 gradle-8.5-bin.zip

echo "✅ Gradle wrapper JAR downloaded successfully!"
echo "✅ You can now run: ./gradlew clean build -x test"

