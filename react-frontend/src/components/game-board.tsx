
import { cn } from "@/lib/utils"
import type { CellState } from "./battleship-game"

interface GameBoardProps {
  board: CellState[][]
  ships: CellState[][]
  onCellClick: (row: number, col: number) => void
  isPlayerBoard: boolean
  gamePhase: "placement" | "battle" | "gameOver"
}

export function GameBoard({ board, ships, onCellClick, isPlayerBoard, gamePhase }: GameBoardProps) {
  const getCellClassName = (row: number, col: number) => {
    const cellState = board[row][col]
    const hasShip = ships[row][col] === "ship"

    const baseClasses =
      "w-8 h-8 border border-blue-300 dark:border-blue-600 cursor-pointer transition-colors duration-200 flex items-center justify-center text-xs font-bold"

    // Base water color
    let stateClasses = "bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"

    // Show ships on player board or if hit
    if (isPlayerBoard && hasShip && cellState === "empty") {
      stateClasses = "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
    }

    // Hit states
    if (cellState === "hit") {
      stateClasses = "bg-red-500 dark:bg-red-600 text-white"
    } else if (cellState === "miss") {
      stateClasses = "bg-blue-300 dark:bg-blue-600 text-blue-800 dark:text-blue-200"
    } else if (cellState === "sunk") {
      stateClasses = "bg-red-700 dark:bg-red-800 text-white"
    }

    return cn(baseClasses, stateClasses)
  }

  const getCellContent = (row: number, col: number) => {
    const cellState = board[row][col]

    if (cellState === "hit") return "💥"
    if (cellState === "miss") return "○"
    if (cellState === "sunk") return "💀"

    return ""
  }

  return (
    <div className="inline-block">
      {/* Column headers */}
      <div className="flex mb-1">
        <div className="w-8 h-6"></div>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="w-8 h-6 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Game board with row headers */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row header */}
          <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
            {String.fromCharCode(65 + rowIndex)}
          </div>

          {/* Board cells */}
          {row.map((_, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={gamePhase === "gameOver"}
            >
              {getCellContent(rowIndex, colIndex)}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
