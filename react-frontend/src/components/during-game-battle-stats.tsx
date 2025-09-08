import type { GameState } from "./battleship-game-utils";
import { Card } from "./ui/card";


export const DuringGameBattleStats = ({gameState, currentUsername, opponentUsername, isSubmittingShot}:{gameState: GameState; currentUsername: string; opponentUsername: string | undefined; isSubmittingShot: boolean}) => {
    return (
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
    );
}