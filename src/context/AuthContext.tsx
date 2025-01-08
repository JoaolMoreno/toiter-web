import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login as loginService, logout as logoutService, checkSession } from '../services/auth';
import api from "@/services/api";
import { User } from '@/models/UserProfile';
import { toast } from 'react-toastify';

interface AuthContextType {
    isAuthenticated: boolean | undefined;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const verifySession = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const sessionValid = await checkSession();

                if (sessionValid) {
                    const { data } = await api.get('/users/me');
                    setUser({
                        username: data.username,
                        profileImageId: data.profileImageId as number
                    });
                    setIsAuthenticated(true);
                } else {
                    clearUserData();
                }
            } else {
                clearUserData();
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            clearUserData();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        verifySession();
    }, []);

    const clearUserData = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userData = await loginService(email, password);

            // Fetch user profile data immediately after login
            const { data } = await api.get('/users/me');
            setUser({
                username: data.username,
                profileImageId: data.profileImageId as number
            });
            setIsAuthenticated(true);

            await router.push('/feed');
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data || 'Erro ao fazer login');
            } else {
                toast.error('Erro ao fazer login');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutService();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
            await router.push('/auth/login');
        } catch (error: any) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
