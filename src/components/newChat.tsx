import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { chatService } from '../services/chatService';

const Container = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundAlt};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  margin-bottom: 10px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const UserList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: ${props => props.theme.colors.text};
  
  &:hover {
    background: ${props => props.theme.colors.backgroundElevated};
  }
`;

interface NewChatProps {
  onStartChat: (username: string) => void;
}

const NewChat: React.FC<NewChatProps> = ({ onStartChat }) => {
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
    <Container>
      <SearchInput
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <UserList>
        {users.map(username => (
          <UserItem
            key={username}
            onClick={() => onStartChat(username)}
          >
            {username}
          </UserItem>
        ))}
      </UserList>
    </Container>
  );
};

export default NewChat;