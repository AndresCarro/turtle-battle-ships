
import { useState, useEffect, useRef, useCallback } from "react"
import { GameBoard } from "./game-board"
import { Card } from "./ui/card"
import { GameService } from "@/services/games-service"
import { GameRoomService } from "@/services/game-room-service"
import { useToast } from "@/hooks/use-toast"
import type { Game, Shot } from "@/models/models"
import { canPlaceShip, checkShipSunk, convertBackendShipToFrontend, createEmptyBoard, GameStatus, INITIAL_SHIPS, markShipAsSunk, placeShip, type GameState, type PlacementState, type Ship } from "./battleship-game-utils"
import { GameOverSection } from "./game-over-section"
import { ShipPlacementSection } from "./ship-placement-section"
import { DuringGameBattleStats } from "./during-game-battle-stats"

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
    gameStatus: GameStatus.SHIPS_SETUP,
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
  
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false)
  const [isSubmittingShot, setIsSubmittingShot] = useState(false)
  const [lastShotCount, setLastShotCount] = useState(0)
  
  const shotPollingInterval = useRef<NodeJS.Timeout | null>(null)
  const gameStatusPollingInterval = useRef<NodeJS.Timeout | null>(null)

  const startGameStatusPolling = useCallback(() => {
    if (gameStatusPollingInterval.current) {
      clearInterval(gameStatusPollingInterval.current)
    }
    
    gameStatusPollingInterval.current = setInterval(async () => {
      try {
        const updatedGameRoom = await GameRoomService.getGameRoom(gameRoom.id.toString())

        if (updatedGameRoom.status === GameStatus.FINISHED) {
          if (shotPollingInterval.current) {
            clearInterval(shotPollingInterval.current)
            shotPollingInterval.current = null
          }
          if (gameStatusPollingInterval.current) {
            clearInterval(gameStatusPollingInterval.current)
            gameStatusPollingInterval.current = null
          }
          setGameState(prev => ({
            ...prev,
            gameStatus: GameStatus.FINISHED,
            winner: updatedGameRoom.winner === currentUsername ? 'player' : 'enemy'
          }));
          return;
        }
        if (updatedGameRoom.status === GameStatus.SHIPS_SETUP) {
          setGameState(prev => ({
            ...prev,
            gameStatus: GameStatus.SHIPS_SETUP,
          }));
          return;
        }
        if (updatedGameRoom.status === GameStatus.IN_PROGRESS) {
          setGameState(prev => ({
            ...prev,
            gameStatus: GameStatus.IN_PROGRESS,
            currentPlayer: updatedGameRoom.currentTurn === currentUsername ? 'player' : 'enemy',
          }))
        }
      } catch (error) {
        console.error("Failed to check game status:", error)
      }
    }, 2000) // Poll every 2 seconds
  }, [gameRoom.id, currentUsername]);

  const initializeBattlePhase = async () => {
    try {
      if (!opponentUsername) {
        throw new Error("No opponent found")
      }
      if (gameState.gameStatus !== GameStatus.IN_PROGRESS) {
        return;
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
        gameStatus: GameStatus.IN_PROGRESS,
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
  
  const processShotsUpdate = async (shots: Shot[]) => {
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
    
    const updatedPlayerShips = playerShipsData.map(ship => {
      let hits = 0
      ship.positions.forEach(pos => {
        const shotHit = opponentShots.find(shot => 
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
    
    const updatedEnemyShips = enemyShipsData.map(ship => {
      let hits = 0
      ship.positions.forEach(pos => {
        const shotHit = playerShots.find(shot => 
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
    
    setPlayerShipsData(updatedPlayerShips)
    setEnemyShipsData(updatedEnemyShips)
    
    setGameState(prev => ({
      ...prev,
      playerBoard: newPlayerBoard,
      enemyBoard: newEnemyBoard,
      currentPlayer: gameState.currentPlayer,
      playerStats: {
        hits: enemyHits,
        misses: playerShots.length - enemyHits,
        shipsRemaining: updatedEnemyShips.filter(ship => !ship.sunk).length
      },
      enemyStats: {
        hits: playerHits,
        misses: opponentShots.length - playerHits,
        shipsRemaining: updatedPlayerShips.filter(ship => !ship.sunk).length
      }
    }))
  }
  
  useEffect(() => {
    startGameStatusPolling()
    
    return () => {
      if (shotPollingInterval.current) {
        clearInterval(shotPollingInterval.current)
        shotPollingInterval.current = null
      }
      if (gameStatusPollingInterval.current) {
        clearInterval(gameStatusPollingInterval.current)
        gameStatusPollingInterval.current = null
      }
    }
  }, [startGameStatusPolling]);
  
  useEffect(() => {
    if (gameState.gameStatus === GameStatus.FINISHED) {
      if (shotPollingInterval.current) {
        clearInterval(shotPollingInterval.current)
        shotPollingInterval.current = null
      }
      if (gameStatusPollingInterval.current) {
        clearInterval(gameStatusPollingInterval.current)
        gameStatusPollingInterval.current = null
      }
    }
  }, [gameState.gameStatus]);

  const handleCellClick = async (row: number, col: number, isPlayerBoard: boolean) => {
    if (gameState.gameStatus === GameStatus.SHIPS_SETUP && isPlayerBoard) {
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

    if (gameState.gameStatus !== GameStatus.IN_PROGRESS) return
    if (isPlayerBoard) return
    if (gameState.currentPlayer !== 'player') return
    if (isSubmittingShot) return
    if (gameState.enemyBoard[row][col] !== "empty") return

    try {
      setIsSubmittingShot(true)
      const shotResult = await GameService.postShot(
        gameRoom.id, 
        currentUsername, 
        col, // Frontend col -> Backend x
        row  // Frontend row -> Backend y
      );
      
      const newEnemyBoard = [...gameState.enemyBoard.map((row) => [...row])]
      newEnemyBoard[row][col] = shotResult.hit ? "hit" : "miss"
      
      const updatedEnemyShips = [...enemyShipsData]
      let hitShip: Ship | null = null
      
      if (shotResult.hit) {
        hitShip = updatedEnemyShips.find((ship) => 
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

      setEnemyShipsData(updatedEnemyShips)

      const newPlayerStats = {
        ...gameState.playerStats,
        hits: shotResult.hit ? gameState.playerStats.hits + 1 : gameState.playerStats.hits,
        misses: !shotResult.hit ? gameState.playerStats.misses + 1 : gameState.playerStats.misses,
        shipsRemaining: updatedEnemyShips.filter((ship) => !ship.sunk).length,
      }

      setGameState((prev) => ({
        ...prev,
        enemyBoard: newEnemyBoard,
        playerStats: newPlayerStats,
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

  return (
    <div className="flex flex-col items-center gap-8">
      {gameState.gameStatus === GameStatus.FINISHED && (
        <GameOverSection gameState={gameState} username={currentUsername} opponentsUsername={opponentUsername} />
      )}

      {gameState.gameStatus === GameStatus.SHIPS_SETUP && (
        <ShipPlacementSection placementState={placementState} setPlacementState={setPlacementState} currentUsername={currentUsername} gameRoom={gameRoom} isWaitingForOpponent={isWaitingForOpponent} setIsWaitingForOpponent={setIsWaitingForOpponent} initializeBattlePhase={initializeBattlePhase} opponentUsername={opponentUsername}/>
      )}

      {gameState.gameStatus === GameStatus.IN_PROGRESS && (
        <DuringGameBattleStats currentUsername={currentUsername} gameState={gameState} isSubmittingShot={isSubmittingShot} opponentUsername={opponentUsername}/>
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
              gamePhase={gameState.gameStatus}
            />
          </Card>
        </div>

        {gameState.gameStatus === GameStatus.IN_PROGRESS && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-4">{opponentUsername || "Opponent"}'s Waters</h2>
            <Card className="p-4">
              <GameBoard
                board={gameState.enemyBoard}
                ships={gameState.enemyShips}
                onCellClick={(row, col) => handleCellClick(row, col, false)}
                isPlayerBoard={false}
                gamePhase={gameState.gameStatus}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
};
