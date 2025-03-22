import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { chatService, ChatPreview, Message } from '../services/chatService';
import NewChat from './newChat';

const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

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
  background: ${props => props.isMine ? '#0084ff' : '#f0f2f5'};
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

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUsername] = useState(() => localStorage.getItem('username') || '');

  const loadChats = useCallback(async () => {
    try {
      const response = await chatService.getMyChats();
      setChats(response.content);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, []);

  useEffect(() => {
    loadChats();
    const token = localStorage.getItem('accessToken');
    console.log(token)
    if (token) {
        console.log('🔌 Connecting to WebSocket... 3');
      chatService.connectToWebSocket(token);
    }

    const cleanup = chatService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
      loadChats(); // Reload chat list to update last messages
    });

    return () => {
      cleanup();
      chatService.disconnectWebSocket();
    };
  }, [loadChats]);

  const handleSendMessage = async () => {
    if (!selectedChatId || !newMessage.trim()) return;

    try {
      chatService.sendMessage(selectedChatId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStartChat = async (username: string) => {
    try {
      const chatId = await chatService.startChat(username);
      setSelectedChatId(chatId);
      await loadChats();
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <ChatContainer>
      <Sidebar>
        {/* <NewChat onStartChat={handleStartChat} /> */}
        <ChatList>
          {chats.map(chat => (
            <ChatItem
              key={chat.chatId}
              active={chat.chatId === selectedChatId}
              onClick={() => setSelectedChatId(chat.chatId)}
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

      <ChatWindow>
        {selectedChatId ? (
          <>
            <MessageList>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  isMine={msg.sender === currentUsername}
                >
                  {msg.message}
                </MessageBubble>
              ))}
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
    </ChatContainer>
  );
};

export default Chat;