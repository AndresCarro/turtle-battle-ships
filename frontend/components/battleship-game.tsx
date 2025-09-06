"use client"

import { useState, useEffect } from "react"
import { GameBoard } from "./game-board"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export type CellState = "empty" | "ship" | "hit" | "miss" | "sunk"

export interface Ship {
  name: string
  size: number
  placed: boolean
  positions: { row: number; col: number }[]
  hits: number
  sunk: boolean
}

export interface GameState {
  playerBoard: CellState[][]
  enemyBoard: CellState[][]
  playerShips: CellState[][]
  enemyShips: CellState[][]
  currentPlayer: "player" | "enemy"
  gamePhase: "placement" | "battle" | "gameOver"
  winner: "player" | "enemy" | null
  playerStats: { hits: number; misses: number; shipsRemaining: number }
  enemyStats: { hits: number; misses: number; shipsRemaining: number }
}

export interface PlacementState {
  selectedShip: number | null
  orientation: "horizontal" | "vertical"
  ships: Ship[]
}

export interface AIState {
  mode: "hunt" | "target"
  targetQueue: { row: number; col: number }[]
  lastHit: { row: number; col: number } | null
  direction: "horizontal" | "vertical" | null
}

const BOARD_SIZE = 10

const INITIAL_SHIPS: Ship[] = [
  { name: "Carrier", size: 5, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Battleship", size: 4, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Cruiser", size: 3, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Submarine", size: 3, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Destroyer", size: 2, placed: false, positions: [], hits: 0, sunk: false },
]

// Initialize empty board
const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill("empty"))
}

const canPlaceShip = (
  board: CellState[][],
  row: number,
  col: number,
  size: number,
  orientation: "horizontal" | "vertical",
): boolean => {
  if (orientation === "horizontal") {
    if (col + size > BOARD_SIZE) return false
    for (let i = 0; i < size; i++) {
      if (board[row][col + i] === "ship") return false
    }
  } else {
    if (row + size > BOARD_SIZE) return false
    for (let i = 0; i < size; i++) {
      if (board[row + i][col] === "ship") return false
    }
  }
  return true
}

const placeShip = (
  board: CellState[][],
  row: number,
  col: number,
  size: number,
  orientation: "horizontal" | "vertical",
): { board: CellState[][]; positions: { row: number; col: number }[] } => {
  const newBoard = board.map((row) => [...row])
  const positions: { row: number; col: number }[] = []

  if (orientation === "horizontal") {
    for (let i = 0; i < size; i++) {
      newBoard[row][col + i] = "ship"
      positions.push({ row, col: col + i })
    }
  } else {
    for (let i = 0; i < size; i++) {
      newBoard[row + i][col] = "ship"
      positions.push({ row: row + i, col })
    }
  }

  return { board: newBoard, positions }
}

const checkShipSunk = (ship: Ship, board: CellState[][]): boolean => {
  return ship.positions.every((pos) => board[pos.row][pos.col] === "hit" || board[pos.row][pos.col] === "sunk")
}

const checkWinCondition = (ships: Ship[]): boolean => {
  return ships.every((ship) => ship.sunk)
}

const markShipAsSunk = (board: CellState[][], ship: Ship): CellState[][] => {
  const newBoard = board.map((row) => [...row])
  ship.positions.forEach((pos) => {
    if (newBoard[pos.row][pos.col] === "hit") {
      newBoard[pos.row][pos.col] = "sunk"
    }
  })
  return newBoard
}

export function BattleshipGame() {
  const [gameState, setGameState] = useState<GameState>({
    playerBoard: createEmptyBoard(),
    enemyBoard: createEmptyBoard(),
    playerShips: createEmptyBoard(),
    enemyShips: createEmptyBoard(),
    currentPlayer: "player",
    gamePhase: "placement",
    winner: null,
    playerStats: { hits: 0, misses: 0, shipsRemaining: 5 },
    enemyStats: { hits: 0, misses: 0, shipsRemaining: 5 },
  })

  const [placementState, setPlacementState] = useState<PlacementState>({
    selectedShip: null,
    orientation: "horizontal",
    ships: [...INITIAL_SHIPS],
  })

  const [enemyShipsData, setEnemyShipsData] = useState<Ship[]>([])
  const [playerShipsData, setPlayerShipsData] = useState<Ship[]>([])

  const [aiState, setAIState] = useState<AIState>({
    mode: "hunt",
    targetQueue: [],
    lastHit: null,
    direction: null,
  })

  useEffect(() => {
    if (gameState.currentPlayer === "enemy" && gameState.gamePhase === "battle") {
      const timer = setTimeout(() => {
        performAIAttack()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.gamePhase])

  const performAIAttack = () => {
    let targetCell: { row: number; col: number } | null = null

    if (aiState.mode === "target" && aiState.targetQueue.length > 0) {
      // Target mode: attack cells adjacent to hits
      targetCell = aiState.targetQueue.shift()!
    } else {
      // Hunt mode: find available cells with strategic spacing
      const availableCells: { row: number; col: number }[] = []

      // Use checkerboard pattern for more efficient hunting
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (gameState.playerBoard[row][col] === "empty") {
            // Prioritize checkerboard pattern for better ship detection
            if ((row + col) % 2 === 0) {
              availableCells.unshift({ row, col })
            } else {
              availableCells.push({ row, col })
            }
          }
        }
      }

      if (availableCells.length === 0) return

      const randomIndex = Math.floor(Math.random() * Math.min(availableCells.length, 3))
      targetCell = availableCells[randomIndex]
    }

    if (!targetCell) return

    const { row, col } = targetCell
    const newPlayerBoard = [...gameState.playerBoard.map((row) => [...row])]
    let isHit = false
    let hitShip: Ship | null = null

    if (gameState.playerShips[row][col] === "ship") {
      newPlayerBoard[row][col] = "hit"
      isHit = true

      hitShip = playerShipsData.find((ship) => ship.positions.some((pos) => pos.row === row && pos.col === col)) || null

      if (hitShip) {
        hitShip.hits++

        if (checkShipSunk(hitShip, newPlayerBoard)) {
          hitShip.sunk = true
          const boardWithSunkShip = markShipAsSunk(newPlayerBoard, hitShip)
          newPlayerBoard.splice(0, newPlayerBoard.length, ...boardWithSunkShip)

          // Ship sunk: return to hunt mode
          setAIState({
            mode: "hunt",
            targetQueue: [],
            lastHit: null,
            direction: null,
          })
        } else {
          // Hit but not sunk: enter target mode
          const newTargets: { row: number; col: number }[] = []

          if (aiState.lastHit && aiState.direction) {
            // Continue in the established direction
            if (aiState.direction === "horizontal") {
              if (col > aiState.lastHit.col && col + 1 < BOARD_SIZE && newPlayerBoard[row][col + 1] === "empty") {
                newTargets.push({ row, col: col + 1 })
              }
              if (col < aiState.lastHit.col && col - 1 >= 0 && newPlayerBoard[row][col - 1] === "empty") {
                newTargets.push({ row, col: col - 1 })
              }
            } else {
              if (row > aiState.lastHit.row && row + 1 < BOARD_SIZE && newPlayerBoard[row + 1][col] === "empty") {
                newTargets.push({ row: row + 1, col })
              }
              if (row < aiState.lastHit.row && row - 1 >= 0 && newPlayerBoard[row - 1][col] === "empty") {
                newTargets.push({ row: row - 1, col })
              }
            }
          } else {
            // First hit or determine direction
            const adjacentCells = [
              { row: row - 1, col, dir: "vertical" as const },
              { row: row + 1, col, dir: "vertical" as const },
              { row, col: col - 1, dir: "horizontal" as const },
              { row, col: col + 1, dir: "horizontal" as const },
            ]

            adjacentCells.forEach(({ row: r, col: c, dir }) => {
              if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newPlayerBoard[r][c] === "empty") {
                newTargets.push({ row: r, col: c })
              }
            })

            // If we have a previous hit, determine direction
            if (aiState.lastHit) {
              const direction = row === aiState.lastHit.row ? "horizontal" : "vertical"
              setAIState((prev) => ({ ...prev, direction }))
            }
          }

          setAIState((prev) => ({
            mode: "target",
            targetQueue: [...prev.targetQueue.filter((t) => !(t.row === row && t.col === col)), ...newTargets],
            lastHit: { row, col },
            direction: prev.direction,
          }))
        }
      }
    } else {
      newPlayerBoard[row][col] = "miss"

      // Remove this cell from target queue if it was there
      setAIState((prev) => ({
        ...prev,
        targetQueue: prev.targetQueue.filter((t) => !(t.row === row && t.col === col)),
      }))
    }

    const newEnemyStats = {
      ...gameState.enemyStats,
      hits: isHit ? gameState.enemyStats.hits + 1 : gameState.enemyStats.hits,
      misses: !isHit ? gameState.enemyStats.misses + 1 : gameState.enemyStats.misses,
      shipsRemaining: playerShipsData.filter((ship) => !ship.sunk).length,
    }

    const enemyWon = checkWinCondition(playerShipsData)

    setGameState((prev) => ({
      ...prev,
      playerBoard: newPlayerBoard,
      currentPlayer: "player",
      enemyStats: newEnemyStats,
      gamePhase: enemyWon ? "gameOver" : "battle",
      winner: enemyWon ? "enemy" : null,
    }))
  }

  const handleCellClick = (row: number, col: number, isPlayerBoard: boolean) => {
    if (gameState.gamePhase === "placement" && isPlayerBoard) {
      if (placementState.selectedShip === null) return

      const ship = placementState.ships[placementState.selectedShip]
      if (ship.placed) return

      if (canPlaceShip(gameState.playerShips, row, col, ship.size, placementState.orientation)) {
        const { board: newPlayerShips, positions } = placeShip(
          gameState.playerShips,
          row,
          col,
          ship.size,
          placementState.orientation,
        )
        const newShips = [...placementState.ships]
        newShips[placementState.selectedShip] = {
          ...newShips[placementState.selectedShip],
          placed: true,
          positions,
        }

        setGameState((prev) => ({
          ...prev,
          playerShips: newPlayerShips,
        }))

        setPlacementState((prev) => ({
          ...prev,
          ships: newShips,
          selectedShip: null,
        }))
      }
      return
    }

    if (gameState.gamePhase !== "battle") return
    if (isPlayerBoard) return
    if (gameState.currentPlayer !== "player") return

    const newEnemyBoard = [...gameState.enemyBoard.map((row) => [...row])]

    if (newEnemyBoard[row][col] !== "empty") return

    let isHit = false
    let hitShip: Ship | null = null

    if (gameState.enemyShips[row][col] === "ship") {
      newEnemyBoard[row][col] = "hit"
      isHit = true

      hitShip = enemyShipsData.find((ship) => ship.positions.some((pos) => pos.row === row && pos.col === col)) || null

      if (hitShip) {
        hitShip.hits++

        if (checkShipSunk(hitShip, newEnemyBoard)) {
          hitShip.sunk = true
          const boardWithSunkShip = markShipAsSunk(newEnemyBoard, hitShip)
          newEnemyBoard.splice(0, newEnemyBoard.length, ...boardWithSunkShip)
        }
      }
    } else {
      newEnemyBoard[row][col] = "miss"
    }

    const newPlayerStats = {
      ...gameState.playerStats,
      hits: isHit ? gameState.playerStats.hits + 1 : gameState.playerStats.hits,
      misses: !isHit ? gameState.playerStats.misses + 1 : gameState.playerStats.misses,
      shipsRemaining: enemyShipsData.filter((ship) => !ship.sunk).length,
    }

    const playerWon = checkWinCondition(enemyShipsData)

    setGameState((prev) => ({
      ...prev,
      enemyBoard: newEnemyBoard,
      currentPlayer: playerWon ? "player" : "enemy",
      playerStats: newPlayerStats,
      gamePhase: playerWon ? "gameOver" : "battle",
      winner: playerWon ? "player" : null,
    }))
  }

  const startBattle = () => {
    const enemyShips = createEmptyBoard()
    const ships: Ship[] = INITIAL_SHIPS.map((ship) => ({ ...ship, positions: [], hits: 0, sunk: false }))

    ships.forEach((ship) => {
      let placed = false
      while (!placed) {
        const row = Math.floor(Math.random() * BOARD_SIZE)
        const col = Math.floor(Math.random() * BOARD_SIZE)
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"

        if (canPlaceShip(enemyShips, row, col, ship.size, orientation)) {
          const { board: newBoard, positions } = placeShip(enemyShips, row, col, ship.size, orientation)
          ship.positions = positions

          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (newBoard[r][c] === "ship" && enemyShips[r][c] !== "ship") {
                enemyShips[r][c] = "ship"
              }
            }
          }
          placed = true
        }
      }
    })

    const playerShips = placementState.ships.map((ship) => ({ ...ship }))
    setPlayerShipsData(playerShips)

    setEnemyShipsData(ships)
    setGameState((prev) => ({
      ...prev,
      enemyShips,
      gamePhase: "battle",
    }))
  }

  const resetGame = () => {
    setGameState({
      playerBoard: createEmptyBoard(),
      enemyBoard: createEmptyBoard(),
      playerShips: createEmptyBoard(),
      enemyShips: createEmptyBoard(),
      currentPlayer: "player",
      gamePhase: "placement",
      winner: null,
      playerStats: { hits: 0, misses: 0, shipsRemaining: 5 },
      enemyStats: { hits: 0, misses: 0, shipsRemaining: 5 },
    })
    setPlacementState({
      selectedShip: null,
      orientation: "horizontal",
      ships: [...INITIAL_SHIPS],
    })
    setEnemyShipsData([])
    setPlayerShipsData([])
    setAIState({
      mode: "hunt",
      targetQueue: [],
      lastHit: null,
      direction: null,
    })
  }

  const allShipsPlaced = placementState.ships.every((ship) => ship.placed)

  return (
    <div className="flex flex-col items-center gap-8">
      {gameState.gamePhase === "gameOver" && (
        <Card className="p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            {gameState.winner === "player" ? "Victory!" : "Defeat!"}
          </h2>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {gameState.winner === "player"
              ? "Congratulations! You sunk all enemy ships!"
              : "The enemy has sunk all your ships!"}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div className="font-medium">Your Stats</div>
              <div>Hits: {gameState.playerStats.hits}</div>
              <div>Misses: {gameState.playerStats.misses}</div>
              <div>
                Accuracy:{" "}
                {gameState.playerStats.hits + gameState.playerStats.misses > 0
                  ? Math.round(
                      (gameState.playerStats.hits / (gameState.playerStats.hits + gameState.playerStats.misses)) * 100,
                    )
                  : 0}
                %
              </div>
            </div>
            <div>
              <div className="font-medium">Enemy Stats</div>
              <div>Hits: {gameState.enemyStats.hits}</div>
              <div>Misses: {gameState.enemyStats.misses}</div>
              <div>
                Accuracy:{" "}
                {gameState.enemyStats.hits + gameState.enemyStats.misses > 0
                  ? Math.round(
                      (gameState.enemyStats.hits / (gameState.enemyStats.hits + gameState.enemyStats.misses)) * 100,
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
          <Button onClick={resetGame} className="w-full">
            Play Again
          </Button>
        </Card>
      )}

      {gameState.gamePhase === "placement" && (
        <Card className="p-6 w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Place Your Ships</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {placementState.ships.map((ship, index) => (
              <Button
                key={ship.name}
                variant={placementState.selectedShip === index ? "default" : "outline"}
                onClick={() =>
                  setPlacementState((prev) => ({
                    ...prev,
                    selectedShip: ship.placed ? null : index,
                  }))
                }
                disabled={ship.placed}
                className="flex items-center gap-2"
              >
                {ship.name} ({ship.size})
                {ship.placed && (
                  <Badge variant="secondary" className="ml-1">
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Orientation:</span>
            <Button
              variant={placementState.orientation === "horizontal" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlacementState((prev) => ({ ...prev, orientation: "horizontal" }))}
            >
              Horizontal
            </Button>
            <Button
              variant={placementState.orientation === "vertical" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlacementState((prev) => ({ ...prev, orientation: "vertical" }))}
            >
              Vertical
            </Button>
          </div>

          {allShipsPlaced && (
            <Button onClick={startBattle} className="w-full">
              Start Battle!
            </Button>
          )}
        </Card>
      )}

      {gameState.gamePhase === "battle" && (
        <Card className="p-4 w-full max-w-2xl">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {gameState.currentPlayer === "player" ? "Your Turn" : "Enemy Turn"}
            </div>
            {gameState.currentPlayer === "enemy" && (
              <div className="text-sm text-blue-600 dark:text-blue-400">AI is thinking...</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-medium text-center mb-2">Your Stats</div>
              <div>Hits: {gameState.playerStats.hits}</div>
              <div>Misses: {gameState.playerStats.misses}</div>
              <div>Enemy Ships: {gameState.playerStats.shipsRemaining}</div>
              <div>
                Accuracy:{" "}
                {gameState.playerStats.hits + gameState.playerStats.misses > 0
                  ? Math.round(
                      (gameState.playerStats.hits / (gameState.playerStats.hits + gameState.playerStats.misses)) * 100,
                    )
                  : 0}
                %
              </div>
            </div>
            <div>
              <div className="font-medium text-center mb-2">Enemy Stats</div>
              <div>Hits: {gameState.enemyStats.hits}</div>
              <div>Misses: {gameState.enemyStats.misses}</div>
              <div>Your Ships: {gameState.enemyStats.shipsRemaining}</div>
              <div>
                Accuracy:{" "}
                {gameState.enemyStats.hits + gameState.enemyStats.misses > 0
                  ? Math.round(
                      (gameState.enemyStats.hits / (gameState.enemyStats.hits + gameState.enemyStats.misses)) * 100,
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Your Fleet</h2>
          <Card className="p-4">
            <GameBoard
              board={gameState.playerBoard}
              ships={gameState.playerShips}
              onCellClick={(row, col) => handleCellClick(row, col, true)}
              isPlayerBoard={true}
              gamePhase={gameState.gamePhase}
            />
          </Card>
        </div>

        {gameState.gamePhase === "battle" && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Enemy Waters</h2>
            <Card className="p-4">
              <GameBoard
                board={gameState.enemyBoard}
                ships={gameState.enemyShips}
                onCellClick={(row, col) => handleCellClick(row, col, false)}
                isPlayerBoard={false}
                gamePhase={gameState.gamePhase}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
