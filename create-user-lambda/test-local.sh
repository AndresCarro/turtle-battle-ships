#!/bin/bash

# Test script for local Lambda function
PORT=9000

echo "=========================================="
echo "Testing Lambda Function Locally"
echo "=========================================="

# Test 1: Create a new user
echo ""
echo "Test 1: Creating user 'john_doe'..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"username\":\"john_doe\"}"
  }'

echo -e "\n"

# Test 2: Create another user
echo "Test 2: Creating user 'jane_smith'..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"username\":\"jane_smith\",\"email\":\"jane@example.com\"}"
  }'

echo -e "\n"

# Test 3: Try to create the same user again (should return existing user)
echo "Test 3: Creating 'john_doe' again (should return existing)..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"username\":\"john_doe\"}"
  }'

echo -e "\n"

# Test 4: Missing username (should fail with 400)
echo "Test 4: Missing username (should fail)..."
curl -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{}"
  }'

echo -e "\n"
echo "=========================================="
echo "Tests completed!"
echo "=========================================="
