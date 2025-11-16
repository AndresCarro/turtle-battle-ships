export interface FriendsListResponse {
  friendsList: User[];
}

export interface FriendsListRequest {
  username: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface User {
    id: number;
    name: string;
    totalGames: number;
    totalWins: number;
}