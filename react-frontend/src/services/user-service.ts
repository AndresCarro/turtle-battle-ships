export const UserService = {
    createUser: async (username: string): Promise<boolean> => {
        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            
            if (response.status !== 200) {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    }
}