export const GRID_SIZE = 10;

export enum GameRoomStatuses {
    WAITING = "WAITING",
    IN_GAME = "IN_GAME",
    FINISHED = "FINISHED"
}

export const SHIPS = {
    "carrier": { size: 5, count: 1, name: "Carrier" },
    "battleship": { size: 4, count: 1, name: "Battleship" },
    "submarine": { size: 3, count: 2, name: "Submarine" },
    "destroyer": { size: 2, count: 1, name: "Destroyer" },
}