export interface DeleteFriendsResponse {
  deletedFriendUsername: string;
}

export interface DeleteFriendsRequest {
  username: string;          
  friendToDelete: string;
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