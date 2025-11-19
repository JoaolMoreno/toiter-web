import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer ? import.meta.env.SERVICE_POST_URL : '/api';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Response interceptor for handling 401 errors
// Note: Authentication is now handled via HttpOnly cookies
// No manual token refresh or Authorization header manipulation
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Request token refresh - backend will set new HttpOnly cookies
                await axios.post(
                    '/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                // Retry the original request with refreshed cookies
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
