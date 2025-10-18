#!/bin/bash

# Test script for local Lambda function with pretty output
PORT=9001

echo "=========================================="
echo "Testing Lambda Function Locally"
echo "=========================================="

# Test: List all game rooms
echo ""
echo "Test: Listing all game rooms..."
echo ""

RESPONSE=$(curl -s -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" \
  -H "Content-Type: application/json" \
  -d '{}')

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
  echo "$RESPONSE" | jq
  echo ""
  echo "Games in response body:"
  echo "$RESPONSE" | jq -r '.body' | jq '.games[] | "ID: \(.id) | Name: \(.name) | Status: \(.status) | Players: \(.player1) vs \(.player2 // "waiting")"'
else
  echo "$RESPONSE"
fi

echo ""
echo "=========================================="
echo "Test completed!"
echo "=========================================="
