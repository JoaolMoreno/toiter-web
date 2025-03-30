import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { chatService } from '@/services/chatService';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-bottom: 1px solid #eee;
  outline: none;
  font-size: 16px;

  &:focus {
    border-bottom: 1px solid #0084ff;
  }

  &::placeholder {
    color: #999;
  }
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

const UserItem = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: #f0f2f5;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
`;

const UserName = styled.div`
  font-size: 16px;
  color: #333;
`;

interface NewChatModalProps {
    onStartChat: (username: string) => void;
    onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onStartChat, onClose }) => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await chatService.getFollowing(search);
                setUsers(response.content);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Nova mensagem</ModalTitle>
                    <CloseButton onClick={onClose}>✕</CloseButton>
                </ModalHeader>
                <SearchInput
                    type="text"
                    placeholder="Pesquisar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <UserList>
                    {users.map(username => (
                        <UserItem
                            key={username}
                            onClick={() => {
                                onStartChat(username);
                                onClose();
                            }}
                        >
                            <UserAvatar />
                            <UserName>{username}</UserName>
                        </UserItem>
                    ))}
                </UserList>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default NewChatModal;