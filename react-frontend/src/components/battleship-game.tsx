
import { useState, useEffect, useRef } from "react"
import { GameBoard } from "./game-board"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { GameService } from "@/services/games-service"
import { useToast } from "@/hooks/use-toast"
import type { Game, ShipInput } from "@/models/models"

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

// Ship type mapping utilities
const frontendToBackendShipType = (frontendName: string): ShipInput['type'] => {
  const mapping: Record<string, ShipInput['type']> = {
    "Carrier": "CARRIER",
    "Battleship": "BATTLESHIP", 
    "Cruiser": "SUBMARINE", // Assuming Cruiser maps to SUBMARINE
    "Submarine": "SUBMARINE",
    "Destroyer": "DESTROYER"
  }
  return mapping[frontendName] || "DESTROYER"
}

const backendToFrontendShipName = (backendType: ShipInput['type']): string => {
  const mapping: Record<ShipInput['type'], string> = {
    "CARRIER": "Carrier",
    "BATTLESHIP": "Battleship",
    "SUBMARINE": "Submarine", // Using Submarine for backend SUBMARINE
    "DESTROYER": "Destroyer"
  }
  return mapping[backendType] || "Destroyer"
}

// Convert frontend ship positions to backend ShipInput format
const convertShipToBackendFormat = (ship: Ship): ShipInput => {
  if (ship.positions.length === 0) {
    throw new Error(`Ship ${ship.name} has no positions`)
  }
  
  const firstPos = ship.positions[0]
  const orientation: ShipInput['orientation'] = 
    ship.positions.length > 1 && ship.positions[1].row === firstPos.row 
      ? "HORIZONTAL" 
      : "VERTICAL"
  
  return {
    type: frontendToBackendShipType(ship.name),
    x: firstPos.col, // Frontend col -> Backend x
    y: firstPos.row, // Frontend row -> Backend y  
    orientation
  }
}

// Convert backend Ship to frontend Ship format
const convertBackendShipToFrontend = (backendShip: import("@/models/models").Ship): Ship => {
  const positions: { row: number; col: number }[] = []
  
  for (let i = 0; i < backendShip.length; i++) {
    if (backendShip.orientation === "HORIZONTAL") {
      positions.push({ 
        row: backendShip.y, // Backend y -> Frontend row
        col: backendShip.x + i // Backend x -> Frontend col
      })
    } else {
      positions.push({ 
        row: backendShip.y + i, // Backend y -> Frontend row
        col: backendShip.x // Backend x -> Frontend col
      })
    }
  }
  
  return {
    name: backendToFrontendShipName(backendShip.type),
    size: backendShip.length,
    placed: true,
    positions,
    hits: 0, // Will be calculated from shots
    sunk: false // Will be calculated from hits
  }
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

export function BattleshipGame({gameRoom, currentUsername}:{gameRoom: Game, currentUsername: string}) {
  const { toast } = useToast()
  
  const isPlayer1 = gameRoom.player1 === currentUsername
  const opponentUsername = isPlayer1 ? gameRoom.player2 : gameRoom.player1
  
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
  
  const [isFleetSubmitted, setIsFleetSubmitted] = useState(false)
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false)
  const [isSubmittingFleet, setIsSubmittingFleet] = useState(false)
  const [isSubmittingShot, setIsSubmittingShot] = useState(false)
  const [lastShotCount, setLastShotCount] = useState(0)
  
  const fleetPollingInterval = useRef<NodeJS.Timeout | null>(null)
  const shotPollingInterval = useRef<NodeJS.Timeout | null>(null);

  const startFleetPolling = () => {
    if (fleetPollingInterval.current) {
      clearInterval(fleetPollingInterval.current)
    }
    
    fleetPollingInterval.current = setInterval(async () => {
      try {
        if (!opponentUsername) {
          console.warn("No opponent found, stopping fleet polling")
          if (fleetPollingInterval.current) {
            clearInterval(fleetPollingInterval.current)
            fleetPollingInterval.current = null
          }
          return
        }
        
        const opponentFleets = await GameService.getFleets(gameRoom.id, opponentUsername)
        
        if (opponentFleets.length > 0) {
          setIsWaitingForOpponent(false)
          await initializeBattlePhase()
          if (fleetPollingInterval.current) {
            clearInterval(fleetPollingInterval.current)
            fleetPollingInterval.current = null
          }
        }
      } catch (error) {
        console.error("Failed to check opponent fleet status:", error)
      }
    }, 2000) // Poll every 2 seconds
  }
  
  const initializeBattlePhase = async () => {
    try {
      if (!opponentUsername) {
        throw new Error("No opponent found")
      }
      
      const allFleets = await GameService.getFleets(gameRoom.id)
      
      const playerFleet = allFleets.filter(ship => ship.player === currentUsername)
      const opponentFleet = allFleets.filter(ship => ship.player === opponentUsername)
      
      const playerShips = playerFleet.map(ship => convertBackendShipToFrontend(ship))
      const opponentShips = opponentFleet.map(ship => convertBackendShipToFrontend(ship))
      
      const enemyShips = createEmptyBoard()
      opponentShips.forEach(ship => {
        ship.positions.forEach(pos => {
          enemyShips[pos.row][pos.col] = "ship"
        })
      })
      
      setPlayerShipsData(playerShips)
      setEnemyShipsData(opponentShips)
      
      setGameState(prev => ({
        ...prev,
        enemyShips,
        gamePhase: "battle",
      }))
      
      startShotPolling()
      
      toast({
        title: "Battle begins!",
        description: "Both players are ready. Take your first shot!",
      })
      
    } catch (error) {
      console.error("Failed to initialize battle phase:", error)
      toast({
        title: "Error",
        description: "Failed to start battle. Please refresh and try again.",
        variant: "destructive",
      })
    }
  }
  
  const startShotPolling = () => {
    if (shotPollingInterval.current) {
      clearInterval(shotPollingInterval.current)
    }
    
    shotPollingInterval.current = setInterval(async () => {
      try {
        const shots = await GameService.getShots(gameRoom.id)
        
        if (shots.length > lastShotCount) {
          await processShotsUpdate(shots)
          setLastShotCount(shots.length)
        }
      } catch (error) {
        console.error("Failed to get shots:", error)
      }
    }, 1000)
  }
  
  const processShotsUpdate = async (shots: import("@/models/models").Shot[]) => {
    const playerShots = shots.filter(shot => shot.player === currentUsername)
    const opponentShots = shots.filter(shot => shot.player === opponentUsername)
    
    const newPlayerBoard = createEmptyBoard()
    let playerHits = 0
    
    opponentShots.forEach(shot => {
      const row = shot.y // Backend y -> Frontend row
      const col = shot.x // Backend x -> Frontend col
      
      if (shot.hit) {
        newPlayerBoard[row][col] = "hit"
        playerHits++
      } else {
        newPlayerBoard[row][col] = "miss"
      }
    })
    
    const newEnemyBoard = createEmptyBoard()
    let enemyHits = 0
    
    playerShots.forEach(shot => {
      const row = shot.y // Backend y -> Frontend row  
      const col = shot.x // Backend x -> Frontend col
      
      if (shot.hit) {
        newEnemyBoard[row][col] = "hit"
        enemyHits++
      } else {
        newEnemyBoard[row][col] = "miss"
      }
    })
    
    // Determine whose turn it is (player with fewer shots goes next)
    const isPlayerTurn = playerShots.length <= opponentShots.length
    
    updateShipStatus(playerShipsData, opponentShots, setPlayerShipsData)
    updateShipStatus(enemyShipsData, playerShots, setEnemyShipsData)
    
    const playerWon = enemyShipsData.every(ship => ship.sunk)
    const opponentWon = playerShipsData.every(ship => ship.sunk)
    
    setGameState(prev => ({
      ...prev,
      playerBoard: newPlayerBoard,
      enemyBoard: newEnemyBoard,
      currentPlayer: isPlayerTurn ? "player" : "enemy",
      gamePhase: playerWon || opponentWon ? "gameOver" : "battle",
      winner: playerWon ? "player" : opponentWon ? "enemy" : null,
      playerStats: {
        hits: enemyHits,
        misses: playerShots.length - enemyHits,
        shipsRemaining: enemyShipsData.filter(ship => !ship.sunk).length
      },
      enemyStats: {
        hits: playerHits,
        misses: opponentShots.length - playerHits,
        shipsRemaining: playerShipsData.filter(ship => !ship.sunk).length
      }
    }))
  }
  
  const updateShipStatus = (
    ships: Ship[], 
    shots: import("@/models/models").Shot[], 
    setShips: React.Dispatch<React.SetStateAction<Ship[]>>
  ) => {
    const updatedShips = ships.map(ship => {
      let hits = 0
      ship.positions.forEach(pos => {
        const shotHit = shots.find(shot => 
          shot.x === pos.col && shot.y === pos.row && shot.hit
        )
        if (shotHit) hits++
      })
      
      return {
        ...ship,
        hits,
        sunk: hits === ship.size
      }
    })
    
    setShips(updatedShips)
  }

  useEffect(() => {
    return () => {
      if (fleetPollingInterval.current) {
        clearInterval(fleetPollingInterval.current)
        fleetPollingInterval.current = null
      }
      if (shotPollingInterval.current) {
        clearInterval(shotPollingInterval.current)
        shotPollingInterval.current = null
      }
    }
  }, [])
  
  useEffect(() => {
    if (gameState.gamePhase === "gameOver") {
      if (shotPollingInterval.current) {
        clearInterval(shotPollingInterval.current)
        shotPollingInterval.current = null
      }
    }
  }, [gameState.gamePhase]);

  const handleCellClick = async (row: number, col: number, isPlayerBoard: boolean) => {
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
    if (isSubmittingShot) return

    // Check if cell already shot
    if (gameState.enemyBoard[row][col] !== "empty") return

    try {
      setIsSubmittingShot(true)
      
      // Submit shot to API
      const shotResult = await GameService.postShot(
        gameRoom.id, 
        currentUsername, 
        col, // Frontend col -> Backend x
        row  // Frontend row -> Backend y
      )
      
      // Update local board immediately for better UX
      const newEnemyBoard = [...gameState.enemyBoard.map((row) => [...row])]
      newEnemyBoard[row][col] = shotResult.hit ? "hit" : "miss"
      
      let hitShip: Ship | null = null
      
      if (shotResult.hit) {
        // Find the ship that was hit
        hitShip = enemyShipsData.find((ship) => 
          ship.positions.some((pos) => pos.row === row && pos.col === col)
        ) || null

        if (hitShip) {
          hitShip.hits++

          if (checkShipSunk(hitShip, newEnemyBoard)) {
            hitShip.sunk = true
            const boardWithSunkShip = markShipAsSunk(newEnemyBoard, hitShip)
            newEnemyBoard.splice(0, newEnemyBoard.length, ...boardWithSunkShip)
          }
        }
      }

      const newPlayerStats = {
        ...gameState.playerStats,
        hits: shotResult.hit ? gameState.playerStats.hits + 1 : gameState.playerStats.hits,
        misses: !shotResult.hit ? gameState.playerStats.misses + 1 : gameState.playerStats.misses,
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
      
    } catch (error) {
      console.error("Failed to submit shot:", error)
      toast({
        title: "Error",
        description: "Failed to submit shot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingShot(false)
    }
  };

  const startBattle = async () => {
    if (isSubmittingFleet) return
    
    try {
      setIsSubmittingFleet(true)
      
      // Convert placed ships to backend format
      const shipsToSubmit: ShipInput[] = placementState.ships
        .filter(ship => ship.placed)
        .map(ship => convertShipToBackendFormat(ship))
      
      // Submit player's fleet to backend
      await GameService.postFleet(gameRoom.id, currentUsername, shipsToSubmit)
      setIsFleetSubmitted(true)
      setIsWaitingForOpponent(true)
      
      toast({
        title: "Fleet submitted!",
        description: "Waiting for opponent to place their ships...",
      })
      
      // Start polling for opponent's fleet status
      startFleetPolling()
      
    } catch (error) {
      console.error("Failed to submit fleet:", error)
      toast({
        title: "Error",
        description: "Failed to submit fleet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingFleet(false)
    }
  }

  const allShipsPlaced = placementState.ships.every((ship) => ship.placed);

  return (
    <div className="flex flex-col items-center gap-8">
      {gameState.gamePhase === "gameOver" && (
        <Card className="p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {gameState.winner === "player" ? "Victory!" : "Defeat!"}
          </h2>
          <p className="text-white mb-4">
            {gameState.winner === "player"
              ? "Congratulations! You sunk all enemy ships!"
              : "The enemy has sunk all your ships!"}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-white">
            <div>
              <h4 className="font-medium text-white">{currentUsername}'s Stats</h4>
              <p className="text-white">Hits: <span className="text-white">{gameState.playerStats.hits}</span></p>
              <p className="text-white">Misses: <span className="text-white">{gameState.playerStats.misses}</span></p>
              <p className="text-white">
                Accuracy:{" "}
                <span className="text-white">
                  {gameState.playerStats.hits + gameState.playerStats.misses > 0
                    ? Math.round(
                        (gameState.playerStats.hits / (gameState.playerStats.hits + gameState.playerStats.misses)) * 100,
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">{opponentUsername || "Opponent"}'s Stats</h4>
              <p className="text-white">Hits: <span className="text-white">{gameState.enemyStats.hits}</span></p>
              <p className="text-white">Misses: <span className="text-white">{gameState.enemyStats.misses}</span></p>
              <p className="text-white">
                Accuracy:{" "}
                <span className="text-white">
                  {gameState.enemyStats.hits + gameState.enemyStats.misses > 0
                    ? Math.round(
                        (gameState.enemyStats.hits / (gameState.enemyStats.hits + gameState.enemyStats.misses)) * 100,
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {gameState.gamePhase === "placement" && (
        <Card className="p-6 w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-white mb-4">Place Your Ships</h3>

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
                className="flex items-center gap-2 text-white"
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
            <span className="text-sm font-medium text-white">Orientation:</span>
            <Button
              variant={placementState.orientation === "horizontal" ? "default" : "outline"}
              size="sm"
              className="text-white"
              onClick={() => setPlacementState((prev) => ({ ...prev, orientation: "horizontal" }))}
            >
              Horizontal
            </Button>
            <Button
              variant={placementState.orientation === "vertical" ? "default" : "outline"}
              size="sm"
              className="text-white"
              onClick={() => setPlacementState((prev) => ({ ...prev, orientation: "vertical" }))}
            >
              Vertical
            </Button>
          </div>

          {allShipsPlaced && !isFleetSubmitted && (
            <Button 
              onClick={startBattle} 
              className="bg-green-600 hover:bg-green-700 text-white"
              variant="default"
              disabled={isSubmittingFleet}
            >
              {isSubmittingFleet ? "Submitting Fleet..." : "Start Battle!"}
            </Button>
          )}
          
          {isWaitingForOpponent && (
            <div className="text-center p-4">
              <h4 className="text-lg font-semibold text-white mb-2">
                Waiting for opponent...
              </h4>
              <p className="text-sm text-white">
                {opponentUsername ? `Waiting for ${opponentUsername} to place their ships` : "Waiting for opponent to place their ships"}
              </p>
            </div>
          )}
        </Card>
      )}

      {gameState.gamePhase === "battle" && (
        <Card className="p-4 w-full max-w-2xl">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {gameState.currentPlayer === "player" ? "Your Turn" : `${opponentUsername || "Opponent"}'s Turn`}
            </h3>
            {gameState.currentPlayer === "enemy" && (
              <p className="text-sm text-white">
                Waiting for {opponentUsername || "opponent"} to make their move...
              </p>
            )}
            {isSubmittingShot && (
              <p className="text-sm text-white">
                Submitting shot...
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm text-white">
            <div>
              <h4 className="font-medium text-center mb-2 text-white">{currentUsername}'s Stats</h4>
              <p className="text-white">Hits: <span className="text-white">{gameState.playerStats.hits}</span></p>
              <p className="text-white">Misses: <span className="text-white">{gameState.playerStats.misses}</span></p>
              <p className="text-white">{opponentUsername || "Opponent"} Ships: <span className="text-white">{gameState.playerStats.shipsRemaining}</span></p>
              <p className="text-white">
                Accuracy:{" "}
                <span className="text-white">
                  {gameState.playerStats.hits + gameState.playerStats.misses > 0
                    ? Math.round(
                        (gameState.playerStats.hits / (gameState.playerStats.hits + gameState.playerStats.misses)) * 100,
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-center mb-2 text-white">{opponentUsername || "Opponent"}'s Stats</h4>
              <p className="text-white">Hits: <span className="text-white">{gameState.enemyStats.hits}</span></p>
              <p className="text-white">Misses: <span className="text-white">{gameState.enemyStats.misses}</span></p>
              <p className="text-white">Your Ships: <span className="text-white">{gameState.enemyStats.shipsRemaining}</span></p>
              <p className="text-white">
                Accuracy:{" "}
                <span className="text-white">
                  {gameState.enemyStats.hits + gameState.enemyStats.misses > 0
                    ? Math.round(
                        (gameState.enemyStats.hits / (gameState.enemyStats.hits + gameState.enemyStats.misses)) * 100,
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-4">Your Fleet</h2>
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
            <h2 className="text-xl font-semibold text-white mb-4">{opponentUsername || "Opponent"}'s Waters</h2>
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
};
