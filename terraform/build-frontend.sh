#!/bin/bash

# Script to build the frontend React project
# This script is called by Terraform during deployment and accepts additional
# Cognito-related build-time values so the SPA can be built with the correct
# hosted UI configuration baked in as VITE_* env vars.

set -euo pipefail

echo "🚀 Building Frontend React Project"
echo "===================================="

if [ "$#" -ne 6 ]; then
    echo "❌ Error: Expected 6 arguments, got $#"
    echo "Usage: $0 BACKEND_URL WEBSOCKETS_URL COGNITO_DOMAIN COGNITO_CLIENT_ID COGNITO_CALLBACK_URL FRONTEND_DIR"
    exit 1
fi

# Get parameters from Terraform
BACKEND_URL="${1:-http://localhost:3000}"
WEBSOCKETS_URL="${2:-http://localhost:3001}"

COGNITO_DOMAIN="${3}"
COGNITO_CLIENT_ID="${4}"
COGNITO_CALLBACK_URL="${5}"

FRONTEND_DIR="${6:-../frontend}"


echo "📋 Configuration:"
echo "   Backend URL: $BACKEND_URL"
echo "   Websockets URL: $WEBSOCKETS_URL"
echo "   Frontend Directory: $FRONTEND_DIR"
echo "   Cognito Domain: ${COGNITO_DOMAIN}"
echo "   Cognito Client ID: ${COGNITO_CLIENT_ID}"
echo "   Cognito Callback URL: ${COGNITO_CALLBACK_URL}"
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
VITE_COGNITO_DOMAIN="$COGNITO_DOMAIN" \
VITE_COGNITO_CLIENT_ID="$COGNITO_CLIENT_ID" \
VITE_COGNITO_CALLBACK_URL="$COGNITO_CALLBACK_URL" \
npm run build

echo ""
echo "✅ Frontend build complete!"
echo "   Build output: $FRONTEND_DIR/dist"
