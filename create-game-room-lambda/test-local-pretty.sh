#!/bin/bash

# Test script for local Lambda function with pretty output
PORT=9002

echo "=========================================="
echo "Testing Create Game Room Lambda"
echo "=========================================="

# Test 1: Create a new game room
echo ""
echo "Test 1: Creating game room 'Epic Battle' for player 'Alice'..."
echo ""

RESPONSE=$(curl -s -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Epic Battle\",\"username\":\"Alice\"}"
  }')

if command -v jq &> /dev/null; then
  echo "$RESPONSE" | jq
  if [ "$(echo "$RESPONSE" | jq -r '.statusCode')" = "201" ]; then
    echo "✓ Game room created successfully!"
    echo "Game ID: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.id')"
    echo "Name: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.name')"
    echo "Player 1: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.player1')"
    echo "Status: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.status')"
  fi
else
  echo "$RESPONSE"
fi

echo ""
echo "=========================================="

# Test 2: Create another game room
echo ""
echo "Test 2: Creating game room 'Naval Warfare' for player 'Bob'..."
echo ""

RESPONSE=$(curl -s -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"gameRoomName\":\"Naval Warfare\",\"username\":\"Bob\"}"
  }')

if command -v jq &> /dev/null; then
  echo "$RESPONSE" | jq
  if [ "$(echo "$RESPONSE" | jq -r '.statusCode')" = "201" ]; then
    echo "✓ Game room created successfully!"
    echo "Game ID: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.id')"
    echo "Name: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.name')"
    echo "Player 1: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.player1')"
    echo "Status: $(echo "$RESPONSE" | jq -r '.body' | jq -r '.status')"
  fi
else
  echo "$RESPONSE"
fi

echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="
