import { createFileRoute } from '@tanstack/react-router'
import { BattleshipGame } from '@/components/battleship-game'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <main className="p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">Battleship</h1>
          <p className="text-blue-700 dark:text-blue-300">Sink all enemy ships to win!</p>
        </div>
        <BattleshipGame />
      </div>
    </main>
  )
}
