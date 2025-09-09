import router from "@/router";
import type { GameState } from "./battleship-game-utils"
import { Button } from "./ui/button";
import { Card } from "./ui/card"


export const GameOverSection = ({gameState, username, opponentsUsername}:{gameState: GameState; username: string; opponentsUsername: string | undefined}) => {
    return (
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
              <h4 className="font-medium text-white">{username}'s Stats</h4>
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
              <h4 className="font-medium text-white">{opponentsUsername || "Opponent"}'s Stats</h4>
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
          <div>
            <Button 
              onClick={() =>
                router.navigate({ 
                  to: '/game-rooms',
                  search: { username: username }
                })
              } 
              className="bg-green-600 hover:bg-green-700 text-white"
              variant="default"
            >
              Back to game rooms
            </Button>
          </div>
        </Card>
    )
}