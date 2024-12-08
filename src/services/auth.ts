import api from './api';

export const login = async (email: string, password: string) => {
    try {
        const { data } = await api.post('/auth/login', { usernameOrEmail: email, password });

        // Salva o token de acesso no localStorage
        localStorage.setItem('accessToken', data.accessToken);

        // Configura o header de Authorization para futuras requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        console.log('Login bem-sucedido');
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw new Error('Falha no login');
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
        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        console.log('Sessão válida');
        return true;
    } catch (error) {
        console.error('Sessão inválida ou expirada:', error);
        return false;
    }
};
