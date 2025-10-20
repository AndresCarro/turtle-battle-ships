#!/bin/bash

# Script to build the frontend React project
# This script is called by Terraform during deployment

set -e  # Exit on error

echo "🚀 Building Frontend React Project"
echo "===================================="

# Get parameters from Terraform
BACKEND_URL="${1:-http://localhost:3000}"
WEBSOCKETS_URL="${2:-http://localhost:3001}"
FRONTEND_DIR="${3:-../frontend}"

echo "📋 Configuration:"
echo "   Backend URL: $BACKEND_URL"
echo "   Websockets URL: $WEBSOCKETS_URL"
echo "   Frontend Directory: $FRONTEND_DIR"
echo ""

# Navigate to frontend directory (relative to terraform directory)
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "🔨 Building frontend with production configuration..."

# Build with environment variables
VITE_BACKEND_URL="$BACKEND_URL" \
VITE_WEBSOCKETS_URL="$WEBSOCKETS_URL" \
npm run build

echo ""
echo "✅ Frontend build complete!"
echo "   Build output: $FRONTEND_DIR/dist"
