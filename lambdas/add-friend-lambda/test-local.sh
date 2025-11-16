#!/bin/bash

# Test script for add-friend lambda locally
echo "Testing add-friend lambda locally..."

# Sample test payload
PAYLOAD='{
  "body": "{\"userId\": 1, \"friendId\": 2}",
  "httpMethod": "POST",
  "headers": {
    "Content-Type": "application/json"
  }
}'

echo "Test payload:"
echo $PAYLOAD | jq .

# Note: This is a mock test. For real testing, you would need:
# 1. A local database running
# 2. Environment variables set
# 3. AWS SAM or similar local testing framework

echo "To test locally, set these environment variables:"
echo "export DB_HOST=localhost"
echo "export DB_PORT=5432"
echo "export DB_NAME=turtlebattleshipsdb"
echo "export DB_USER=dbadmin"
echo "export DB_PASSWORD=your_password"
echo "export DB_SSL=false"