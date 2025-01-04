import React, { useState } from 'react';
import { PostData } from '@/models/PostData';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import {createReply, createRepost, createRepostWithComment, likePost, unlikePost} from "@/services/postService";
import Modal from "@/components/modal";
import RepostMenu from "@/components/RepostMenu";

interface PostProps {
    post: PostData;
    onToggleLike?: (postId: number, isLiked: boolean) => void;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isReposted, setIsReposted] = useState(post.isReposted); // Estado para indicar repost
    const [isModalOpen, setModalOpen] = useState(false);
    const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
    const [modalType, setModalType] = useState<'reply' | 'repostWithComment'>(); // Tipo de modal
    const router = useRouter();

    const handleLikeToggle = async (postId: number) => {
        try {
            if (isLiked) {
                const success = await unlikePost(postId);
                if (success) {
                    setIsLiked(false);
                    setLikesCount(likesCount - 1);
                }
            } else {
                const success = await likePost(postId);
                if (success) {
                    setIsLiked(true);
                    setLikesCount(likesCount + 1);
                }
            }
        } catch (error) {
            console.error('Erro ao curtir/descurtir:', error);
        }
    };

    const handleReply = () => {
        setModalType('reply');
        setModalOpen(true);
    };

    const handleRepost = () => {
        setRepostMenuOpen(true);
    };

    const handleRepostSimple = async () => {
        try {
            await createRepost(post.id); // Chamada à API para repost simples
            setIsReposted(true); // Marca o post como repostado
            setRepostMenuOpen(false);
        } catch (error) {
            console.error('Erro ao repostar:', error);
        }
    };

    const handleRepostWithComment = () => {
        setModalType('repostWithComment');
        setModalOpen(true);
        setRepostMenuOpen(false);
    };

    const handleSubmit = async (content: string) => {
        try {
            if (modalType === 'reply') {
                await createReply(post.id, content);
            } else if (modalType === 'repostWithComment') {
                await createRepostWithComment(post.id, content);
            }
            setModalOpen(false); // Fecha o modal após a postagem
        } catch (error) {
            console.error('Erro ao enviar:', error);
        }
    };

    const handleViewThread = (postId: number) => router.push(`/thread/${postId}`);

    const isRepost = post.repostParentId !== null;
    const isRepostWithComment = isRepost && post.content && post.content !== '';
    const showData = isRepost && !isRepostWithComment && post.repostPostData
        ? post.repostPostData
        : post; // Exibe os dados do original para repost simples

    return (
        <Page>
            <PostContainer onClick={() => handleViewThread(post.id)}>
                {isRepost && !isRepostWithComment && (
                    <RepostIndicator>
                        🔁 Repostado por <strong>{post.username}</strong>
                    </RepostIndicator>
                )}
                <Username>{showData?.username}</Username>
                <Content>{showData?.content}</Content>

                {/* Container do Post Original */}
                {isRepostWithComment && post.repostPostData && (
                    <RepostContainer
                        onClick={(e) => {
                            e.stopPropagation(); // Impede o clique de propagar
                            handleViewThread(post.repostPostData!.id); // Usa ! para garantir que não seja null
                        }}
                    >
                        <Username>{post.repostPostData!.username}</Username>
                        <Content>{post.repostPostData!.content}</Content>
                        <Metrics>
                            Curtidas: {post.repostPostData!.likesCount} | Respostas: {post.repostPostData!.repliesCount} | Reposts: {post.repostPostData!.repostsCount}
                        </Metrics>
                    </RepostContainer>
                )}

                <Metrics>
                    Curtidas: {likesCount} | Respostas: {showData?.repliesCount} | Reposts: {showData?.repostsCount}
                </Metrics>

                <ButtonRow>
                    <LikeButton onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(post.id);
                    }}>
                        {isLiked ? '❤️ Descurtir' : '🤍 Curtir'}
                    </LikeButton>

                    <ReplyButton onClick={(e) => {
                        e.stopPropagation();
                        handleReply();
                    }}>
                        💬 Responder
                    </ReplyButton>

                    <RepostButton
                        style={{ backgroundColor: isReposted ? '#95d5b2' : undefined }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRepost();
                        }}
                    >
                        🔁 Repostar
                    </RepostButton>
                </ButtonRow>
            </PostContainer>

            {isRepostMenuOpen && (
                <RepostMenu
                    isOpen={isRepostMenuOpen}
                    onClose={() => setRepostMenuOpen(false)}
                    onRepost={handleRepostSimple}
                    onQuoteRepost={handleRepostWithComment}
                />
            )}

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                    postType={modalType!}
                    parentPostContent={showData?.content}
                    parentUsername={showData?.username}
                    title={
                        modalType === 'reply'
                            ? 'Responder'
                            : modalType === 'repostWithComment'
                                ? 'Repostar com Comentário'
                                : ''
                    }
                />
            )}
        </Page>
    );
}

    export default Post;

export const Page = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
`;

const RepostIndicator = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-bottom: 8px;
`;

const RepostContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const PostContainer = styled.div`
  width: 100%;
  max-width: 900px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Username = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 600;
  margin-bottom: 8px;
`;

const Content = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
  line-height: 1.5;
  margin-bottom: 16px;
`;

const Metrics = styled.small`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const LikeButton = styled.button`
    background-color: #f8d7da; /* Rosa claro */
    border: none;
    border-radius: 4px;
    color: #721c24; /* Vermelho escuro */
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #f5c6cb; /* Rosa mais claro */
    }
`;
const ReplyButton = styled.button`
    background-color: #d4edda; /* Verde claro */
    border: none;
    border-radius: 4px;
    color: #155724; /* Verde escuro */
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #c3e6cb; /* Verde mais claro */
    }
`;
const RepostButton = styled.button`
    background-color: #cce5ff; /* Azul claro */
    border: none;
    border-radius: 4px;
    color: #004085; /* Azul escuro */
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #b8daff; /* Azul mais claro */
    }
`;
