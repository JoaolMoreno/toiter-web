import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { chatService } from '@/services/chatService';

interface WebSocketContextProps {
    connected: boolean;
    connect: (token: string) => void;
    disconnect: () => void;
    sendMessage: (chatId: number, message: string) => void;
}

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [connected, setConnected] = useState(false);

    const connect = (token: string) => {
        if (token && !connected) {
            const result = chatService.connectToWebSocket(token);
            if (result) {
                result
                    .then(() => setConnected(true))
                    .catch(err => console.error('Failed to connect WebSocket:', err));
            } else {
                setConnected(true);
            }
        }
    };

    const disconnect = () => {
        if (connected) {
            chatService.disconnectWebSocket();
            setConnected(false);
        }
    };

    const sendMessage = (chatId: number, message: string) => {
        if (connected) {
            chatService.sendMessage(chatId, message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            connect(token);
        }

        return () => {
            disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ connected, connect, disconnect, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};