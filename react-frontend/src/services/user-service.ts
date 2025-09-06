import { API_URL } from "./api-utils";

export const UserService = {
    createUser: async (username: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            
            if (response.status !== 201) {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    }
}