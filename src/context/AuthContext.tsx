import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login as loginService, logout as logoutService, checkSession } from '../services/auth';
import api from "@/services/api";

interface AuthContextType {
    isAuthenticated: boolean | undefined;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const router = useRouter();

    const verifySession = async () => {
        console.log("Verificando sessão...");
        try {
            const token = localStorage.getItem('accessToken');
            console.log("Token recuperado:", token);

            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const sessionValid = await checkSession();
                console.log("Sessão válida:", sessionValid);
                setIsAuthenticated(sessionValid);

                if (!sessionValid) {
                    console.warn("Sessão inválida, removendo token.");
                    localStorage.removeItem('accessToken');
                    delete api.defaults.headers.common['Authorization'];
                }
            } else {
                console.info("Nenhum token encontrado.");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        verifySession();
    }, []);

    useEffect(() => {
        verifySession();
    }, []);

    const login = async (email: string, password: string) => {
        await loginService(email, password);
        setIsAuthenticated(true);
        await router.push('/feed');
    };

    const logout = async () => {
        try {
            console.log("Fazendo logout...");
            await logoutService();
            localStorage.removeItem('accessToken');
            delete api.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
            await router.push('/auth/login');
        } catch (error: any) {
            console.error("Erro ao fazer logout:", error.response?.data || error.message);
        }
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
