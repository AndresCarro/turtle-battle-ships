import type { ShipInput } from "@/models/models"

export type CellState = "empty" | "ship" | "hit" | "miss" | "sunk"

export interface Ship {
  name: string
  size: number
  placed: boolean
  positions: { row: number; col: number }[]
  hits: number
  sunk: boolean
};

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
};

export interface PlacementState {
  selectedShip: number | null
  orientation: "horizontal" | "vertical"
  ships: Ship[]
};

export const BOARD_SIZE = 10

export const INITIAL_SHIPS: Ship[] = [
  { name: "Carrier", size: 5, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Battleship", size: 4, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Submarine", size: 3, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Submarine", size: 3, placed: false, positions: [], hits: 0, sunk: false },
  { name: "Destroyer", size: 2, placed: false, positions: [], hits: 0, sunk: false },
];

export const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill("empty"))
};

export const frontendToBackendShipType = (frontendName: string): ShipInput['type'] => {
  const mapping: Record<string, ShipInput['type']> = {
    "Carrier": "CARRIER",
    "Battleship": "BATTLESHIP", 
    "Cruiser": "SUBMARINE", // Assuming Cruiser maps to SUBMARINE
    "Submarine": "SUBMARINE",
    "Destroyer": "DESTROYER"
  }
  return mapping[frontendName] || "DESTROYER"
};

export const backendToFrontendShipName = (backendType: ShipInput['type']): string => {
  const mapping: Record<ShipInput['type'], string> = {
    "CARRIER": "Carrier",
    "BATTLESHIP": "Battleship",
    "SUBMARINE": "Submarine",
    "DESTROYER": "Destroyer"
  }
  return mapping[backendType] || "Destroyer"
};

export const convertShipToBackendFormat = (ship: Ship): ShipInput => {
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
};

export const convertBackendShipToFrontend = (backendShip: import("@/models/models").Ship): Ship => {
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
};

export const canPlaceShip = (
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
};

export const placeShip = (
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
};

export const checkShipSunk = (ship: Ship, board: CellState[][]): boolean => {
  return ship.positions.every((pos) => board[pos.row][pos.col] === "hit" || board[pos.row][pos.col] === "sunk")
};

export const markShipAsSunk = (board: CellState[][], ship: Ship): CellState[][] => {
  const newBoard = board.map((row) => [...row])
  ship.positions.forEach((pos) => {
    if (newBoard[pos.row][pos.col] === "hit") {
      newBoard[pos.row][pos.col] = "sunk"
    }
  })
  return newBoard
};