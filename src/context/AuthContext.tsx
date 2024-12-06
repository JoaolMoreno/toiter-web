import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login as loginService, logout as logoutService, checkSession } from '../services/auth';
import api from "@/services/api";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Função para verificar sessão
    const verifySession = async () => {
        const token = localStorage.getItem('accessToken'); // Recupera o token salvo

        if (token) {
            // Configura o token no header do Axios
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Verifica a validade do token no backend
            const sessionValid = await checkSession();
            setIsAuthenticated(sessionValid);

            if (!sessionValid) {
                localStorage.removeItem('accessToken');
                delete api.defaults.headers.common['Authorization'];
            }
        } else {
            setIsAuthenticated(false);
        }
    };

    // Verifica a sessão ao carregar o app
    useEffect(() => {
        verifySession();
    }, []);

    // Função de login
    const login = async (email: string, password: string) => {
        await loginService(email, password);
        setIsAuthenticated(true);
        await router.push('/feed');
    };

    // Função de logout
    const logout = async () => {
        await logoutService();
        setIsAuthenticated(false);
        await router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
