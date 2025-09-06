export const GameRoomService = {
    createGameRoom: async (gameRoomName: string): Promise<boolean> => {
        return !gameRoomName.trim();
    },
    getGameRooms: async (): Promise<GameRoom[]> => {
        return gameRooms;
    }
}

const gameRooms: GameRoom[] = [
    { id: 1, name: "Beginner's Cove" },
    { id: 2, name: "Admiral's Arena" },
    { id: 3, name: "Captain's Challenge" },
    { id: 4, name: "Naval Warriors" },
    { id: 5, name: "Ocean Battlefield" },
  ];

export type GameRoom = {
    id: number,
    name: string
};