import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import withAuth from '@/hoc/withAuth';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import { chatService, ChatPreview, Message } from '@/services/chatService';
import React, { useEffect, useState, useCallback } from 'react';

const ChatListComponent = dynamic(() => import('@/components/chatList'), { ssr: false });
const ChatWindowComponent = dynamic(() => import('@/components/chatWindow'), { ssr: false });

const ChatContainer = styled.div`
    display: flex;
    height: 100%;
    max-height: 85vh;
    background: #fff;
    @media (max-width: 768px) {
        display: block;
    }
`;

const ChatPageContainer = styled.div`
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
`;

const ChatPageContent: React.FC = () => {
    const { sendMessage, subscribeToMessages } = useWebSocket();
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [syncedChats, setSyncedChats] = useState<Record<number, number>>({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadMessages = useCallback(async (chatId: number) => {
        try {
            const now = Date.now();
            const lastSynced = syncedChats[chatId] || 0;
            const needsSync = now - lastSynced > 5 * 60 * 1000; // 5 minutes

            if (needsSync) {
                console.log(`Syncing messages for chat ${chatId} (last synced ${lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'never'})`);
                const syncedMessages = await chatService.syncChatMessages(chatId);
                setMessages(syncedMessages);
                setSyncedChats(prev => ({ ...prev, [chatId]: now }));
            } else {
                console.log(`Using cached messages for chat ${chatId}`);
                const storedMessagesStr = localStorage.getItem(`chat_${chatId}_messages`);
                if (storedMessagesStr) {
                    setMessages(JSON.parse(storedMessagesStr));
                }
            }
        } catch (error) {
            console.error('Failed to sync messages:', error);
        }
    }, [syncedChats]);

    const updateChatPreview = useCallback((message: Message) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.chatId === message.chatId
                    ? {
                        ...chat,
                        lastMessageContent: message.message,
                        lastMessageSender: message.sender,
                        lastMessageSentDate: message.timestamp,
                    }
                    : chat
            )
        );
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((message: Message) => {
            if (message.chatId === selectedChatId) {
                setMessages(prev => {
                    const updated = [...prev, message];
                    localStorage.setItem(`chat_${selectedChatId}_messages`, JSON.stringify(updated));
                    return updated;
                });
            }
            updateChatPreview(message);
        });

        return () => unsubscribe();
    }, [selectedChatId, updateChatPreview, subscribeToMessages]);

    useEffect(() => {
        if (selectedChatId) {
            loadMessages(selectedChatId);
        }
    }, [selectedChatId, loadMessages]);

    const handleStartChat = async (username: string) => {
        try {
            const chatId = await chatService.startChat(username);
            setSelectedChatId(chatId);
            const response = await chatService.getMyChats();
            setChats(response.content);
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    return (
        <ChatContainer>
            {isMobile ? (
                selectedChatId ? (
                    <ChatWindowComponent
                        selectedChatId={selectedChatId}
                        messages={messages}
                        setMessages={setMessages}
                        sendMessage={sendMessage}
                        onBack={() => setSelectedChatId(null)}
                        receiverUsername={chats.find(chat => chat.chatId === selectedChatId)?.receiverUsername}
                    />
                ) : (
                    <ChatListComponent
                        selectedChatId={selectedChatId}
                        onSelectChat={setSelectedChatId}
                        onStartChat={handleStartChat}
                        chats={chats}
                        setChats={setChats}
                    />
                )
            ) : (
                <>
                    <ChatListComponent
                        selectedChatId={selectedChatId}
                        onSelectChat={setSelectedChatId}
                        onStartChat={handleStartChat}
                        chats={chats}
                        setChats={setChats}
                    />
                    <ChatWindowComponent
                        selectedChatId={selectedChatId}
                        messages={messages}
                        setMessages={setMessages}
                        sendMessage={sendMessage}
                        onBack={() => setSelectedChatId(null)}
                        receiverUsername={chats.find(chat => chat.chatId === selectedChatId)?.receiverUsername}
                    />
                </>
            )}
        </ChatContainer>
    );
};

const ChatPage = () => {
    return (
        <>
            <Head>
                <title>Messages | Toiter</title>
            </Head>
            <ChatPageContainer>
                <WebSocketProvider>
                    <ChatPageContent />
                </WebSocketProvider>
            </ChatPageContainer>
        </>
    );
};

export default withAuth(ChatPage);