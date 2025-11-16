import { API_URL, handleResponse } from './api-utils';

export interface AddFriendRequest {
  userId: number;
  friendId: number;
}

export interface AddFriendResponse {
  success: boolean;
  message: string;
  friendship?: {
    id: number;
    userId: number;
    friendId: number;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: string;
  };
}

const friendsEndpointPrefix = 'friends';

export const FriendService = {
  addFriend: async (userId: number, friendId: number): Promise<AddFriendResponse> => {
    const response = await fetch(`${API_URL}/${friendsEndpointPrefix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendId }),
    });
    return handleResponse<AddFriendResponse>(response);
  },
};