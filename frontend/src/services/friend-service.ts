import { useAuthStore } from '@/store/auth-store';
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
    userName: number;
    friendName: number;
    createdAt: string;
  };
}

const friendsEndpointPrefix = 'friends';

export const FriendService = {
  addFriend: async (userName: string, friendName: string): Promise<AddFriendResponse> => {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/${friendsEndpointPrefix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userName, friendName }),
    });
    return handleResponse<AddFriendResponse>(response);
  },
  deleteFriend: async (username: string, friendToDelete: string): Promise<void> => {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/${friendsEndpointPrefix}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, friendToDelete }),
    });
    return handleResponse<void>(response);
  }
};