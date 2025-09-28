import { Button } from "@/components/ui/button";
import { Board } from "../board";
import { BaseComponent } from "./base";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Board as BoardType, GameRoom } from "@/types";
import { useState } from "react";
import { SHIPS } from "@/constants";
import { placeShip } from "@/domain/placing-ships";
import { cn } from "@/utils/ui";

export function PlacingShips({ room, board, setBoard, submitFleet }: { room: GameRoom, board: BoardType, setBoard: (board: BoardType) => void, submitFleet: () => void }) {
    const [selectedShip, setSelectedShip] = useState("");
    const [orientation, setOrientation] = useState("horizontal");
    const [usedShips, setUsedShips] = useState<string[]>([]);

    const handleCellClick = (i: number, j: number) => {
        if (!selectedShip) return;
        const newBoard = placeShip(board, selectedShip, i, j, orientation as "horizontal" | "vertical");
        if (newBoard) {
            setBoard(newBoard);
            setUsedShips([...usedShips, selectedShip]);
            setSelectedShip("");
        }
    }

    return (
        <BaseComponent room={room}>
            <div className="p-4 mb-4 border border-dashed border-border rounded-lg text-center space-y-4">
                <h1 className="text-2xl font-bold grow">Let's start by placing your fleet...</h1>
                <div className="flex gap-12 items-start justify-around">
                    <div>
                        <p className="mb-2">Place all of the available ships:</p>
                        <RadioGroup value={selectedShip} onValueChange={setSelectedShip}>
                            {Object.entries(SHIPS).map(([key, ship]) => (
                                [...Array(ship.count)].map((_, i) => {
                                    const shipId = `${key}-${i}`;
                                    return (
                                        <div className={cn("flex items-center gap-3", usedShips.includes(shipId) && "opacity-50")} key={shipId}>
                                            <RadioGroupItem value={shipId} id={shipId} disabled={usedShips.includes(shipId)} />
                                            <Label htmlFor={shipId}>{ship.name} ({ship.size} places)</Label>
                                        </div>
                                    )
                                })
                            ))}
                        </RadioGroup>
                    </div>
                    <div>
                        <p className="mb-2">Select the orientation of the ship:</p>
                        <RadioGroup value={orientation} onValueChange={setOrientation}>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="horizontal" id="r6" />
                                <Label htmlFor="r6">Horizontal</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="vertical" id="r7" />
                                <Label htmlFor="r7">Vertical</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <Button disabled={usedShips.length !== Object.values(SHIPS).reduce((acc, ship) => acc + ship.count, 0)} onClick={submitFleet}>
                    Submit fleet
                </Button>
            </div>
            <div className="flex justify-center">
                <Board board={board} allowClick={true} onClick={handleCellClick} />
            </div>
        </BaseComponent>
    )
}