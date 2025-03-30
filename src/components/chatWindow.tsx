import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Message } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

const ChatWindow = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    background: #fff;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    margin-right: 10px;
`;

const Username = styled.h3`
    flex: 1;
    text-align: center;
    margin: 0;
`;

const MessageList = styled.div`
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const InputArea = styled.div`
    display: flex;
    padding: 10px;
    border-top: 1px solid #eee;
`;

const Input = styled.input`
    flex: 1;
    padding: 8px;
    margin-bottom: 0 !important;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const SendButton = styled.button`
    margin-left: 10px;
    padding: 8px 16px;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const Placeholder = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
    max-width: 60%;
    padding: 6px 7px 8px 9px;
    background: ${props => (props.isMine ? '#007bff' : '#f1f1f1')};
    color: ${props => (props.isMine ? '#fff' : '#000')};
    border-radius: 8px;
    align-self: ${props => (props.isMine ? 'flex-end' : 'flex-start')};
`;

interface ChatWindowComponentProps {
    selectedChatId: number | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (chatId: number, message: string) => void;
    onBack?: () => void;
    receiverUsername?: string;
}

const ChatWindowComponent: React.FC<ChatWindowComponentProps> = ({
                                                                     selectedChatId,
                                                                     messages,
                                                                     setMessages,
                                                                     sendMessage,
                                                                     onBack,
                                                                     receiverUsername,
                                                                 }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!selectedChatId || !newMessage.trim()) return;

        try {
            sendMessage(selectedChatId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <ChatWindow>
            {selectedChatId && receiverUsername && (
                <Header>
                    <BackButton onClick={onBack}>←</BackButton>
                    <Username>{receiverUsername}</Username>
                </Header>
            )}
            {selectedChatId ? (
                <>
                    <MessageList>
                        {messages
                            .filter(msg => msg.chatId === selectedChatId)
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .map((msg, index) => (
                                <MessageBubble
                                    key={index}
                                    isMine={msg.sender === user?.username}
                                >
                                    {msg.message}
                                </MessageBubble>
                            ))}
                        <div ref={messagesEndRef} />
                    </MessageList>
                    <InputArea>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Digite uma mensagem..."
                        />
                        <SendButton onClick={handleSendMessage}>Enviar</SendButton>
                    </InputArea>
                </>
            ) : (
                <Placeholder>Selecione um chat para começar a conversar</Placeholder>
            )}
        </ChatWindow>
    );
};

export default ChatWindowComponent;