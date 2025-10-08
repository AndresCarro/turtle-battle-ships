import { API_URL, handleResponse } from './api-utils';
import type { Player } from '@/types';

const usersEndpointPrefix = 'users';

export const UserService = {
  createUser: async (username: string): Promise<Player | null> => {
    const response = await fetch(`${API_URL}/${usersEndpointPrefix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return handleResponse<Player>(response);
  },
};
