#!/bin/bash
set -e

# Cargar variables del .env
export $(grep -v '^#' .env | xargs)

IMAGE_NAME="${DOCKER_USERNAME}/turtle-battle-ships"
IMAGE_TAG="latest"

# Login a Docker Hub usando el access token
echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

# Build la imagen
docker build -f .dockerfile -t "$IMAGE_NAME:$IMAGE_TAG" .

# Push a Docker Hub
docker push "$IMAGE_NAME:$IMAGE_TAG"

echo "✅ Imagen subida a Docker Hub: $IMAGE_NAME:$IMAGE_TAG"
