#!/bin/bash

# Puertos de los servicios
PORT_USERS=3000
PORT_GAMES=3000
PORT_JOIN=9003

URL_USERS="http://localhost:$PORT_USERS/users"
URL_GAMES="http://localhost:$PORT_GAMES/games"
URL_JOIN="http://localhost:$PORT_JOIN/2015-03-31/functions/function/invocations"

run_test() {
  local description=$1
  local url=$2
  local payload=$3
  echo ""
  echo "→ $description"
  echo "------------------------------------------"
  curl -s -X POST "$url" -H "Content-Type: application/json" -d "$payload"
  echo -e "\n"
}

echo "=========================================="
echo "Testing Flow: Create Users → Create Games → Join Rooms"
echo "=========================================="

# 1️⃣ Crear usuarios
#echo "Creating users..."
run_test "Create user 'jimmy'" "$URL_USERS" '{"username": "jimmy"}'
run_test "Create user 'pedro'" "$URL_USERS" '{"username": "pedro"}'
run_test "Create user 'tito'" "$URL_USERS" '{"username": "tito"}'
run_test "Create user 'gabriella'" "$URL_USERS" '{"username": "gabriella"}'

## 2️⃣ Crear salas de juego
#echo "Creating game rooms..."
#run_test "Create game 'game55'" "$URL_GAMES" '{"username": "jimmy", "gameRoomName": "game55"}'
#run_test "Create game 'partiditadetest'" "$URL_GAMES" '{"username": "pedro", "gameRoomName": "partiditadetest"}'
#
# 3️⃣ Tests de join-room
echo "Testing joinRoom Lambda..."
run_test "Join game 1 as 'tito'" "$URL_JOIN" '{"pathParameters": {"id": "13"}, "body": "{\"username\": \"tito\"}"}'
run_test "Join game 2 as 'jimmy'" "$URL_JOIN" '{"pathParameters": {"id": "14"}, "body": "{\"username\": \"jimmy\"}"}'
run_test "Try joining full game 1 again as 'gabriella'" "$URL_JOIN" '{"pathParameters": {"id": "1"}, "body": "{\"username\": \"gabriella\"}"}'
run_test "Join non-existent game (should fail)" "$URL_JOIN" '{"pathParameters": {"id": "9999"}, "body": "{\"username\": \"team_rocket\"}"}'
run_test "Missing username (should fail)" "$URL_JOIN" '{"pathParameters": {"id": "1"}, "body": "{}"}'

echo "=========================================="
echo "✓ Tests completed!"
echo "=========================================="
