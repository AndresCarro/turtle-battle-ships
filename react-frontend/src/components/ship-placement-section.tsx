import { useRef, useState } from "react"
import { convertShipToBackendFormat, type PlacementState } from "./battleship-game-utils"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import type { Game, ShipInput } from "@/models/models"
import { GameService } from "@/services/games-service"
import { toast } from "@/hooks/use-toast"


export const ShipPlacementSection = ({placementState, setPlacementState, gameRoom, currentUsername, opponentUsername, isWaitingForOpponent, setIsWaitingForOpponent, initializeBattlePhase}:{placementState: PlacementState; setPlacementState: (placementState: PlacementState) => void; gameRoom: Game; currentUsername: string; opponentUsername: string | undefined; isWaitingForOpponent: boolean; setIsWaitingForOpponent: (isWaiting: boolean) => void; initializeBattlePhase: () => void;}) => {
    const [isFleetSubmitted, setIsFleetSubmitted] = useState(false);
    const [isSubmittingFleet, setIsSubmittingFleet] = useState(false);

    const fleetPollingInterval = useRef<NodeJS.Timeout | null>(null);

    const startBattle = async () => {
        if (isSubmittingFleet) return
        
        try {
          setIsSubmittingFleet(true)
          
          const shipsToSubmit: ShipInput[] = placementState.ships
            .filter(ship => ship.placed)
            .map(ship => convertShipToBackendFormat(ship))
          
          await GameService.postFleet(gameRoom.id, currentUsername, shipsToSubmit)
          setIsFleetSubmitted(true)
          setIsWaitingForOpponent(true)
          
          toast({
            title: "Fleet submitted!",
            description: "Waiting for opponent to place their ships...",
          })
          
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

    const allShipsPlaced = placementState.ships.every((ship) => ship.placed);

    return (
        <Card className="p-6 w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-white mb-4">Place Your Ships</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {placementState.ships.map((ship, index) => (
              <Button
                key={ship.id}
                variant={placementState.selectedShip === index ? "default" : "outline"}
                onClick={() =>
                    setPlacementState({
                        ...placementState,
                        selectedShip: ship.placed ? null : index
                    })
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
              onClick={() => setPlacementState({ ...placementState, orientation: "horizontal" })}
            >
              Horizontal
            </Button>
            <Button
              variant={placementState.orientation === "vertical" ? "default" : "outline"}
              size="sm"
              className="text-white"
              onClick={() => setPlacementState({ ...placementState, orientation: "vertical" })}
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
    )
}