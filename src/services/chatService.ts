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
    id: number;
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
            if (typeof window !== 'undefined') {
                localStorage.setItem('my_chats', JSON.stringify(data));
            }
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

    async syncChatMessages(chatId: number): Promise<Message[]> {
        console.log(`🔄 Syncing messages for chat ${chatId}`);

        // Retrieve messages saved in localStorage
        const storedMessagesStr = typeof window !== 'undefined' ? localStorage.getItem(`chat_${chatId}_messages`) : null;
        let localMessages: Message[] = storedMessagesStr ? JSON.parse(storedMessagesStr) : [];

        // If there are no local messages, fetch all paginated messages
        if (!localMessages.length) {
            return await this.fetchAllMessages(chatId);
        }

        // If there are local messages, fetch until a known message is found
        return await this.fetchMessagesUntilKnown(chatId, localMessages);
    }

    private async fetchAllMessages(chatId: number): Promise<Message[]> {
        const allMessages: Message[] = [];
        let page = 0;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await api.get(`chats/${chatId}/messages`, {
                    params: { page, size: pageSize }
                });

                const messages = response.data.content.map((msg: any) => ({
                    id: msg.id,
                    chatId: msg.chatId,
                    message: msg.message,
                    sender: msg.sender,
                    timestamp: msg.sentDate
                }));

                allMessages.push(...messages);

                hasMore = !response.data.last;
                page++;

                // Save progress in localStorage in reversed order
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(allMessages));
                }

                console.log(`📥 Fetched page ${page} for chat ${chatId}, total messages: ${allMessages.length}`);
            } catch (error) {
                console.error(`❌ Error fetching messages page ${page}:`, error);
                throw error;
            }
        }

        return allMessages;
    }

    // Helper function to parse timestamp to numeric ID
    private parseTimestampToId(timestamp?: string): number {
        return parseInt((timestamp?.split('.')[0] || '0').replace(/\D/g, ''));
    }

    private async fetchMessagesUntilKnown(chatId: number, localMessages: Message[]): Promise<Message[]> {
        let page = 0;
        const pageSize = 100;
        let hasMore = true;
        const allMessages = [...localMessages];
        const latestLocalId = Math.max(...localMessages.map(m => this.parseTimestampToId(m.timestamp)));

        while (hasMore) {
            try {
                const response = await api.get(`chats/${chatId}/messages`, {
                    params: { page, size: pageSize }
                });

                const messages = response.data.content.map((msg: any) => ({
                    chatId: msg.chatId,
                    message: msg.message,
                    sender: msg.sender,
                    timestamp: msg.sentDate
                }));

                // Check if a known message is found
                const hasKnownMessage = messages.some((msg: { timestamp: string; }) => {
                    const msgId = this.parseTimestampToId(msg.timestamp);
                    return msgId <= latestLocalId;
                });

                allMessages.unshift(...messages.filter((msg: { timestamp: string; }) => {
                    const msgId = this.parseTimestampToId(msg.timestamp);
                    return msgId > latestLocalId;
                }));

                if (hasKnownMessage) {
                    hasMore = false;
                } else {
                    hasMore = !response.data.last;
                    page++;
                }

                // Save progress in localStorage in reversed order
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(allMessages));
                }

                console.log(`📥 Synced page ${page} for chat ${chatId}, total messages: ${allMessages.length}`);
            } catch (error) {
                console.error(`❌ Error syncing messages page ${page}:`, error);
                throw error;
            }
        }

        return allMessages;
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
                            const receivedMessage = JSON.parse(message.body);
                            console.log('📨 Received message:', receivedMessage);

                            const formattedMessage: Message = {
                                id: receivedMessage.id,
                                chatId: receivedMessage.chatId,
                                message: receivedMessage.message,
                                sender: receivedMessage.sender,
                                timestamp: receivedMessage.sentDate || receivedMessage.timestamp
                            };

                            console.log(`📨 Message in chat ${formattedMessage.chatId}: ${formattedMessage.message}`);
                            this.messageHandlers.forEach(handler => handler(formattedMessage));
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
