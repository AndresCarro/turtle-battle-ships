#!/bin/bash

# Configuration
IMAGE_NAME="list-game-rooms-lambda"
CONTAINER_NAME="list-game-rooms-lambda-local"
PORT=9001

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "Warning: .env file not found. Using default values."
    echo "Create a .env file based on .env.example for database configuration."
fi

echo "=========================================="
echo "Running Lambda Function Locally"
echo "=========================================="
echo "Image: $IMAGE_NAME"
echo "Port: $PORT"
echo "=========================================="

# Stop and remove existing container if running
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build the Docker image
echo "Building Docker image..."
docker build --platform linux/amd64 -t $IMAGE_NAME:latest .

# Run the container
echo "Starting container..."
# For Linux, use host.docker.internal or --network host
# For connecting to services on the host machine
docker run -d \
  --name $CONTAINER_NAME \
  --add-host=host.docker.internal:host-gateway \
  -p $PORT:8080 \
  -e DB_HOST="${DB_HOST:-host.docker.internal}" \
  -e DB_PORT="${DB_PORT:-5432}" \
  -e DB_NAME="${DB_NAME:-battleship}" \
  -e DB_USER="${DB_USER:-postgres}" \
  -e DB_PASSWORD="${DB_PASSWORD:-password}" \
  -e DB_SSL="${DB_SSL:-false}" \
  $IMAGE_NAME:latest

echo "=========================================="
echo "✓ Lambda function is running locally!"
echo "=========================================="
echo ""
echo "Test with curl:"
echo "curl -XPOST 'http://localhost:$PORT/2015-03-31/functions/function/invocations' \\"
echo "  -d '{}'"
echo ""
echo "View logs:"
echo "docker logs -f $CONTAINER_NAME"
echo ""
echo "Stop the container:"
echo "docker stop $CONTAINER_NAME"
