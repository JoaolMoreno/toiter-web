import api from './api';

// Authentication via HttpOnly cookies
// The backend sets accessToken and refresh_token cookies on successful login
export const login = async (email: string, password: string) => {
    try {
        // Login request - backend will set HttpOnly cookies
        await api.post('/auth/login', { 
            usernameOrEmail: email, 
            password 
        });

        // Get user data from /me endpoint
        // Authentication is handled via cookies sent automatically
        const userData = await api.get('/users/me');
        
        return { 
            username: userData.data.username 
        };
        
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout - clears HttpOnly cookies on the backend
export const logout = async () => {
    try {
        await api.post('/auth/logout');
        console.log('Logout bem-sucedido');
    } catch (error: any) {
        console.error('Erro ao fazer logout:', error.response?.data || error.message);
    }
};

// Check session validity using HttpOnly cookies
export const checkSession = async () => {
    try {
        // Session check via cookies - no token manipulation needed
        await api.get('/auth/check-session');
        console.log('Sessão válida');
        return true;
    } catch (error) {
        console.error('Sessão inválida ou expirada:', error);
        return false;
    }
};
