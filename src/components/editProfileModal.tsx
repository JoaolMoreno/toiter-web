import React, { useState } from 'react';
import styled from 'styled-components';
import { UpdatedUser } from '@/models/UserProfile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatedUser) => void;
  currentDisplayName: string;
  currentBio: string;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentDisplayName,
  currentBio,
}: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [bio, setBio] = useState(currentBio);

  const handleSubmit = async () => {
    try {
      await onSubmit({ displayName, bio });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <Title>Editar Perfil</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>

        <Form>
          {/* <InputGroup>
            <Label>Nome</Label>
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
            />
          </InputGroup> */}

          <InputGroup>
            <Label>Bio</Label>
            <TextArea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Sua biografia"
            />
          </InputGroup>

          <ButtonGroup>
            <CancelButton onClick={onClose}>Cancelar</CancelButton>
            <SaveButton onClick={handleSubmit}>Salvar</SaveButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  width: 500px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Form = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundElevated};
  }
`;

const SaveButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  resize: vertical;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;
