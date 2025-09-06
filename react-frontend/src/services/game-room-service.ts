export const GameRoomService = {
    createGameRoom: async (gameRoomName: string): Promise<boolean> => {
        return !!gameRoomName;
    },
    getGameRooms: async (): Promise<GameRoom[]> => {
        return gameRooms;
    },
    joinGameRoom: async (gameRoomId: number): Promise<boolean> => {
        return !!gameRoomId;
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