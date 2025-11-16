#!/bin/bash

# Add Friend Lambda Build Script
echo "Building add-friend-lambda..."

# Remove existing dist
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "Files in dist:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi