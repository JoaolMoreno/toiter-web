import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { chatService, ChatPreview } from '@/services/chatService';
import NewChatModal from './newChatModal';

const Sidebar = styled.div`
    width: 320px;
    display: flex;
    flex-direction: column;
    background: white;
    border-right: 1px solid ${props => props.theme.colors.border};
    height: 100%;

    @media (max-width: 768px) {
        width: 100%;
        height: 100%;
    }
`;

const SearchContainer = styled.div`
    padding: 15px;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #eee;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    margin-bottom: 0 !important;
    border-radius: 20px;
    background: #fff;
    outline: none;

    &:focus {
        border-color: #0084ff;
    }

    &::placeholder {
        color: #999;
    }
`;

const NewChatButton = styled.button`
  padding: 8px 12px;
  border-radius: 20px;
  background: #0084ff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0073e6;
  }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div<{ active: boolean }>`
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: ${props => (props.active ? '#e6f0fa' : 'transparent')};
  transition: background 0.2s;

  &:hover {
    background: #e6f0fa;
  }

  h4 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  p {
    margin: 5px 0 0;
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    font-size: 12px;
    color: #999;
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
                                                                 setChats,
                                                             }) => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const filteredChats = chats.filter(chat =>
        chat.receiverUsername.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Sidebar>
                <SearchContainer>
                    <SearchInput
                        type="text"
                        placeholder="Pesquisar chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <NewChatButton onClick={() => setIsModalOpen(true)}>
                        Novo Chat
                    </NewChatButton>
                </SearchContainer>
                <ChatList>
                    {filteredChats.map(chat => (
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
            {isModalOpen && (
                <NewChatModal
                    onStartChat={onStartChat}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default ChatListComponent;