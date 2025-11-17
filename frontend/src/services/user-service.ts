import { useAuthStore } from '@/store/auth-store';
import { API_URL, handleResponse } from './api-utils';
import type { Player } from '@/types';

const usersEndpointPrefix = 'users';
const friendsEndpointPrefix = 'friends';

export const UserService = {
  createUser: async (username: string): Promise<Player | null> => {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/${usersEndpointPrefix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username }),
    });
    return handleResponse<Player>(response);
  },
  getFriendsListFromUser: async (username: string): Promise<Player[]> => {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/${friendsEndpointPrefix}?username=${username}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    return handleResponse<Player[]>(response);
  }
};
