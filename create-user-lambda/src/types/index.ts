/**
 * Request payload for creating a user
 */
export interface CreateUserRequest {
  username: string;
}

/**
 * Response payload after creating a user
 */
export interface CreateUserResponse {
  id: string;
  username: string;
  totalGames: number;
  totalWins: number;
}

/**
 * Error response payload
 */
export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * User entity to save and return
 */
export interface User {
  id: number;
  name: string;
  totalGames: number;
  totalWins: number;
}
