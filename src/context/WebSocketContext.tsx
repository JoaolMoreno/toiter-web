import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { chatService, Message } from '@/services/chatService';

interface WebSocketContextProps {
    connected: boolean;
    connect: (token: string) => void;
    disconnect: () => void;
    sendMessage: (chatId: number, message: string) => void;
    subscribeToMessages: (handler: (message: Message) => void) => () => void;
}

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const handlersRef = useRef<((message: Message) => void)[]>([]);

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
            handlersRef.current = [];
        }
    };

    const sendMessage = (chatId: number, message: string) => {
        if (connected) {
            chatService.sendMessage(chatId, message);
        }
    };

    const subscribeToMessages = (handler: (message: Message) => void) => {
        handlersRef.current = [...handlersRef.current, handler];
        return () => {
            handlersRef.current = handlersRef.current.filter(h => h !== handler);
        };
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            connect(token);
        }

        // Configura a subscrição ao WebSocket uma vez
        const unsubscribe = chatService.onMessage((message: Message) => {
            handlersRef.current.forEach(handler => handler(message));
        });

        return () => {
            disconnect();
            unsubscribe();
        };
    }, []); // Sem dependências, roda apenas na montagem/desmontagem

    return (
        <WebSocketContext.Provider value={{ connected, connect, disconnect, sendMessage, subscribeToMessages }}>
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