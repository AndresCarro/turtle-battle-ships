#!/bin/bash

# Test script for local Lambda function
PORT=9002

echo "=========================================="
echo "Testing Lambda Function Locally"
echo "=========================================="

# Test 1: Create a new game room
echo ""
echo "Test 1: Creating game room 'Epic Battle' for player 'Alice'..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Epic Battle\",\"username\":\"Alice\"}"
  }'

echo -e "\n"

# Test 2: Create another game room
echo "Test 2: Creating game room 'Naval Warfare' for player 'Bob'..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Naval Warfare\",\"username\":\"Bob\"}"
  }'

echo -e "\n"

# Test 3: Create game room with special characters
echo "Test 3: Creating game room 'Battle Royale 2025!' for player 'Charlie'..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Battle Royale 2025!\",\"username\":\"Charlie\"}"
  }'

echo -e "\n"

# Test 4: Missing gameRoomName (should fail with 400 or error)
echo "Test 4: Missing gameRoomName (should fail)..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"username\":\"Dave\"}"
  }'

echo -e "\n"

# Test 5: Missing username (should fail with 400 or error)
echo "Test 5: Missing username (should fail)..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Test Room\"}"
  }'

echo -e "\n"

# Test 6: Empty body (should fail with 400)
echo "Test 6: Empty body (should fail)..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{}'

echo -e "\n"
echo "=========================================="
echo "Tests completed!"
echo "=========================================="
