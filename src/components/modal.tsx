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

// O estilo permanece o mesmo (conforme o código original)


const Overlay = styled.div`
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

const ModalContainer = styled.div`
    background-color: #1c1c1e;
    border-radius: 10px;
    width: 500px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CloseButton = styled.button`
    background: none;
    color: #007aff;
    border: none;
    font-size: 16px;
    cursor: pointer;
`;

const Title = styled.h2`
    color: #ffffff;
`;

const Username = styled.h3`
    font-size: 16px;
    font-weight: bold;
    color: #2d6a4f;
    margin-bottom: 5px;
    text-align: left;
    width: 100%;
`;


const PostButton = styled.button`
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 5px 15px;
    cursor: pointer;
`;

const Body = styled.div`
    margin-top: 20px;
`;

const PostPreview = styled.div`
    background-color: #2c2c2e;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
    color: #ffffff;
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 100px;
    border: none;
    border-radius: 8px;
    padding: 10px;
    background-color: #2c2c2e;
    color: #ffffff;
    font-size: 16px;
    resize: none;
`;
