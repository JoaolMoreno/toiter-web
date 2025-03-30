import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Message } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

const ChatWindow = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
`;

const MessageList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
    max-width: 70%;
    padding: 12px 18px;
    border-radius: 20px;
    background: ${props => (props.isMine ? '#0084ff' : '#e6e6e6')};
    color: ${props => (props.isMine ? 'white' : '#333')};
    align-self: ${props => (props.isMine ? 'flex-end' : 'flex-start')};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 15px;
    line-height: 1.4;
`;

const InputArea = styled.div`
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    background: #fff;
`;

const Input = styled.input`
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 25px;
    outline: none;
    font-size: 15px;

    &:focus {
        border-color: #0084ff;
    }

    &::placeholder {
        color: #999;
    }
`;

const SendButton = styled.button`
    padding: 12px 20px;
    border-radius: 25px;
    background: #0084ff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.2s;

    &:hover {
        background: #0073e6;
    }
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
`;

interface ChatWindowComponentProps {
    selectedChatId: number | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (chatId: number, message: string) => void;
}

const ChatWindowComponent: React.FC<ChatWindowComponentProps> = ({
                                                                     selectedChatId,
                                                                     messages,
                                                                     setMessages,
                                                                     sendMessage,
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