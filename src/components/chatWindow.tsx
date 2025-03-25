import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Message } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

const ChatWindow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 16px;
  background: ${props => props.isMine ? '#0084ff' : '#4CAF50'};
  color: ${props => props.isMine ? 'white' : 'black'};
  align-self: ${props => props.isMine ? 'flex-end' : 'flex-start'};
`;

const InputArea = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 20px;
  outline: none;

  &:focus {
    border-color: #0084ff;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border-radius: 20px;
  background: #0084ff;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background: #0073e6;
  }
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
                                                                     sendMessage
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
                            placeholder="Type a message..."
                        />
                        <SendButton onClick={handleSendMessage}>Send</SendButton>
                    </InputArea>
                </>
            ) : (
                <div style={{ padding: 20, textAlign: 'center' }}>
                    Select a chat to start messaging
                </div>
            )}
        </ChatWindow>
    );
};

export default ChatWindowComponent;