import React, {useState} from 'react';
import styled from 'styled-components';

interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (content: string) => Promise<void>,
    title: string,
    postType: 'post' | 'reply' | 'repostWithComment',
    parentPostContent?: string,
    parentUsername?: string,
    initialContent?: string
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         onSubmit,
                                         title,
                                         postType,
                                         parentPostContent,
                                         parentUsername,
                                         initialContent
                                     }) => {
    const [content, setContent] = useState(initialContent);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            if (!content) return; // Evita postar conteúdo vazio
            await onSubmit(content); // Chama a função onSubmit passada como prop
            setContent(''); // Limpa o conteúdo após o envio
            onClose(); // Fecha o modal
        } catch (error) {
            console.error('Erro ao postar:', error);
        }
    };

    return (
        <Overlay>
            <ModalContainer>
                <Header>
                    <CloseButton onClick={onClose}>Cancelar</CloseButton>
                    <Title>{title}</Title>
                    <PostButton onClick={handleSubmit}>Postar</PostButton>
                </Header>
                <Body>
                    {/* Exibição condicional para reply e repost */}
                    {(postType === 'reply' || postType === 'repostWithComment') && parentUsername && (
                        <Username>{parentUsername}</Username>
                    )}
                    {(postType === 'reply' || postType === 'repostWithComment') && parentPostContent && (
                        <PostPreview>{parentPostContent}</PostPreview>
                    )}
                    <TextArea
                        placeholder={
                            postType === 'post'
                                ? 'No que você está pensando?'
                                : postType === 'reply'
                                    ? 'Digite sua resposta...'
                                    : 'Adicione um comentário...'
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Body>
            </ModalContainer>
        </Overlay>
    );
};

export default Modal;

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

const CloseButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.text};
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
`;

const PostButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Body = styled.div`
  margin-top: 16px;
`;

const PostPreview = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Username = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;
