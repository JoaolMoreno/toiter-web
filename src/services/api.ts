import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
    baseURL: 'http://localhost/api', // URL do backend
    withCredentials: true, // Permite envio de cookies HTTP-only
});

// Interceptador para renovar token automaticamente
api.interceptors.response.use(
    (response) => response, // Requisição bem-sucedida
    async (error) => {
        const originalRequest = error.config;

        // Verifica se o erro foi causado por token expirado
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Evita múltiplas tentativas no mesmo request

            try {
                // Solicita um novo token de acesso
                const { data } = await axios.post(
                    'http://localhost/api/auth/refresh',
                    {},
                    { withCredentials: true } // Envia cookies HTTP-only para o backend
                );

                // Salva o novo token no localStorage
                localStorage.setItem('accessToken', data.accessToken);

                // Atualiza o header de Authorization com o novo token
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

                // Reenvia a requisição original
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Erro ao renovar token:', refreshError);
                return Promise.reject(refreshError); // Propaga o erro para o chamador
            }
        }

        return Promise.reject(error); // Propaga outros erros
    }
);

export default api;
