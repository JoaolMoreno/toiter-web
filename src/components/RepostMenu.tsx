import React from 'react';
import styled from 'styled-components';

interface RepostMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onRepost: () => void;
    onQuoteRepost: () => void;
}

const RepostMenu: React.FC<RepostMenuProps> = ({ isOpen, onClose, onRepost, onQuoteRepost }) => {
    if (!isOpen) return null;

    return (
        <MenuOverlay onClick={onClose}>
            <MenuContainer onClick={(e) => e.stopPropagation()}>
                <MenuItem onClick={onRepost}>Repostar</MenuItem>
                <MenuItem onClick={onQuoteRepost}>Repostar com comentário</MenuItem>
            </MenuContainer>
        </MenuOverlay>
    );
};

export default RepostMenu;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const MenuContainer = styled.div`
  background-color: #1c1c1e;
  border-radius: 10px;
  width: 300px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: #2c2c2e;
  }
`;
