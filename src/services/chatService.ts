import api from './api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export interface ChatPreview {
    chatId: number;
    receiverUsername: string;
    lastMessageSender: string;
    lastMessageContent: string;
    lastMessageSentDate: string;
}

export interface Message {
    chatId: number;
    message: string;
    sender: string;
    timestamp: string;
}

export interface ChatsResponse {
    content: ChatPreview[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface FollowingResponse {
    content: string[];
    totalPages: number;
    totalElements: number;
    size: number;
    page: number;
}

class ChatService {
    private stompClient: any = null;
    private messageHandlers: ((message: Message) => void)[] = [];

    async getMyChats(): Promise<ChatsResponse> {
        console.log('📬 Fetching chat list...');
        try {
            const { data } = await api.get('chats/my-chats');
            console.log(`✅ Retrieved ${data.content.length} chats`);
            return data;
        } catch (error) {
            console.error('❌ Error fetching chats:', error);
            throw error;
        }
    }

    async getFollowing(username: string = '', page: number = 0, size: number = 10): Promise<FollowingResponse> {
        console.log(`👥 Fetching following users... [search: "${username}", page: ${page}, size: ${size}]`);
        try {
            const { data } = await api.get('users/following', {
                params: { username, page, size }
            });
            console.log(`✅ Found ${data.content.length} following users`);
            return data;
        } catch (error) {
            console.error('❌ Error fetching following users:', error);
            throw error;
        }
    }

    async startChat(username: string): Promise<number> {
        console.log(`💬 Starting new chat with ${username}...`);
        try {
            const { data } = await api.post(`chats/start/${username}`);
            console.log(`✅ Chat started successfully. Chat ID: ${data.chatId}`);
            return data.chatId;
        } catch (error) {
            console.error(`❌ Error starting chat with ${username}:`, error);
            throw error;
        }
    }

    connectToWebSocket(jwtToken: string) {
        if (this.stompClient?.connected) {
            console.log('📡 WebSocket already connected, skipping connection...');
            return;
        }
    
        console.log('📡 Initializing WebSocket connection...');
    
        const socket = new SockJS('/api/chat');
        this.stompClient = Stomp.over(socket);
    
        return new Promise((resolve, reject) => {
            const connectHeaders = {
                Authorization: `Bearer ${jwtToken}`
            };
    
            console.log('🔑 Connecting with headers:', connectHeaders);
    
            this.stompClient.connect(
                connectHeaders,
                () => {
                    console.log('🔗 WebSocket connected successfully');
                    this.stompClient.subscribe('/user/queue/messages', (message: any) => {
                        try {
                            const parsedMessage = JSON.parse(message.body);
                            console.log('📨 Received message:', parsedMessage);
                            console.log(`📨 Message in chat ${parsedMessage.chatId}: ${parsedMessage.message}`);
                            this.messageHandlers.forEach(handler => handler(parsedMessage));
                        } catch (e) {
                            console.error('❌ Error processing message:', e);
                            console.error('❌ Original message:', message);
                        }
                    });
                    resolve(true);
                },
                (error: any) => {
                    console.error('❌ WebSocket connection error:', error);
                    reject(error);
                }
            );
    
            socket.onclose = () => {
                console.log('🚫 Socket closed');
                this.stompClient = null;
            };
        });
    }

    disconnectWebSocket() {
        if (this.stompClient?.connected) {
            console.log('👋 Disconnecting WebSocket...');
            this.stompClient.disconnect();
        }
        this.messageHandlers = [];
        console.log('🧹 Cleared message handlers');
    }

    sendMessage(chatId: number, message: string) {
        if (!this.stompClient?.connected) {
            console.error('❌ Cannot send message: WebSocket not connected');
            throw new Error('WebSocket not connected');
        }
        console.log(`📤 Sending message to chat ${chatId}:`, message);
        this.stompClient.send(`/app/chat/${chatId}/message`, {}, message);
    }

    onMessage(handler: (message: Message) => void) {
        console.log('➕ Adding new message handler');
        this.messageHandlers.push(handler);
        return () => {
            console.log('➖ Removing message handler');
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }
}

export const chatService = new ChatService();
