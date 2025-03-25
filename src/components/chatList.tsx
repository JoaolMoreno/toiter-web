import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { chatService, ChatPreview } from '@/services/chatService';
import NewChat from './newChat';

const Sidebar = styled.div`
  width: 320px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div<{ active: boolean }>`
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: ${props => props.active ? '#f0f2f5' : 'transparent'};

  &:hover {
    background: #f0f2f5;
  }
`;

interface ChatListComponentProps {
    selectedChatId: number | null;
    onSelectChat: (chatId: number) => void;
    onStartChat: (username: string) => void;
    chats: ChatPreview[];
    setChats: React.Dispatch<React.SetStateAction<ChatPreview[]>>;
}

const ChatListComponent: React.FC<ChatListComponentProps> = ({
                                                                 selectedChatId,
                                                                 onSelectChat,
                                                                 onStartChat,
                                                                 chats,
                                                                 setChats
                                                             }) => {
    const loadChats = useCallback(async () => {
        console.log('📬 Loading chats...');
        try {
            const response = await chatService.getMyChats();
            setChats(response.content);
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    }, [setChats]);

    useEffect(() => {
        const storedChats = localStorage.getItem('my_chats');
        if (storedChats) {
            setChats(JSON.parse(storedChats).content);
        }
        loadChats();
    }, [loadChats]);

    return (
        <Sidebar>
            <NewChat onStartChat={onStartChat} />
            <ChatList>
                {chats.map(chat => (
                    <ChatItem
                        key={chat.chatId}
                        active={chat.chatId === selectedChatId}
                        onClick={() => onSelectChat(chat.chatId)}
                    >
                        <h4>{chat.receiverUsername}</h4>
                        <p>{chat.lastMessageContent}</p>
                        <small>
                            {new Date(chat.lastMessageSentDate).toLocaleTimeString()}
                        </small>
                    </ChatItem>
                ))}
            </ChatList>
        </Sidebar>
    );
};

export default ChatListComponent;