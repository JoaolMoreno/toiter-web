import api from './api';

export const login = async (email: string, password: string) => {
    try {
        // 1. Login to get token
        const { data } = await api.post('/auth/login', { 
            usernameOrEmail: email, 
            password 
        });

        // 2. Set token
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // 3. Get user data from /me endpoint
        const userData = await api.get('/users/me');
        
        return { 
            username: userData.data.username 
        };
        
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
        console.log('Logout bem-sucedido');
    } catch (error: any) {
        console.error('Erro ao fazer logout:', error.response?.data || error.message);
    }
};

export const checkSession = async () => {
    try {
        const { data } = await api.get('/auth/check-session');

        // Atualiza o token e o localStorage, se necessário
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        console.log('Sessão válida');
        return true;
    } catch (error) {
        console.error('Sessão inválida ou expirada:', error);
        return false;
    }
};
