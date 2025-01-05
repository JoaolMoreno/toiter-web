import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const servicePostUrl = process.env.SERVICE_POST_URL;

const isServer = typeof window === 'undefined';
const baseURL = isServer ? servicePostUrl : '/api';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Solicita um novo token de acesso
                const { data } = await axios.post(
                    '/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem('accessToken', data.accessToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error('Erro ao renovar token:', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
