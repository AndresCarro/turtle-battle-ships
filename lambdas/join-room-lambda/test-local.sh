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
echo "Creating users..."
run_test "Create user 'ash_ketchum'" "$URL_USERS" '{"username": "ash_ketchum"}'
run_test "Create user 'misty_waterflower'" "$URL_USERS" '{"username": "misty_waterflower"}'
run_test "Create user 'brock_rock'" "$URL_USERS" '{"username": "brock_rock"}'
run_test "Create user 'gary_oak'" "$URL_USERS" '{"username": "gary_oak"}'

# 2️⃣ Crear salas de juego
echo "Creating game rooms..."
run_test "Create game 'PalletTownArena'" "$URL_GAMES" '{"username": "ash_ketchum", "gameRoomName": "PalletTownArena"}'
run_test "Create game 'CeruleanArena'" "$URL_GAMES" '{"username": "misty_waterflower", "gameRoomName": "CeruleanArena"}'

# 3️⃣ Tests de join-room
echo "Testing joinRoom Lambda..."
run_test "Join game 1 as 'brock_rock'" "$URL_JOIN" '{"pathParameters": {"id": "1"}, "body": "{\"username\": \"brock_rock\"}"}'
run_test "Join game 2 as 'ash_ketchum'" "$URL_JOIN" '{"pathParameters": {"id": "2"}, "body": "{\"username\": \"ash_ketchum\"}"}'
run_test "Try joining full game 1 again as 'gary_oak'" "$URL_JOIN" '{"pathParameters": {"id": "1"}, "body": "{\"username\": \"gary_oak\"}"}'
run_test "Join non-existent game (should fail)" "$URL_JOIN" '{"pathParameters": {"id": "9999"}, "body": "{\"username\": \"team_rocket\"}"}'
run_test "Missing username (should fail)" "$URL_JOIN" '{"pathParameters": {"id": "1"}, "body": "{}"}'

echo "=========================================="
echo "✓ Tests completed!"
echo "=========================================="
