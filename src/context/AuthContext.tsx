import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login as loginService, logout as logoutService, checkSession } from '../services/auth';
import api from "@/services/api";
import { User } from '@/models/UserProfile';

interface AuthContextType {
    isAuthenticated: boolean | undefined;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
  
    const verifySession = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const sessionValid = await checkSession();
                
                if (sessionValid) {
                    const { data } = await api.get('/users/me');
                    setUser({
                        username: data.username
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
        try {
            // Get user data including username from auth service
            const userData = await loginService(email, password);
            
            setUser({ 
                username: userData.username 
            });
            setIsAuthenticated(true);
            
            await router.push('/feed');
        } catch (error) {
            console.error("Login error:", error);
            throw error;
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
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
