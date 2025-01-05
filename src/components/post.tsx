import React, { useState } from 'react';
import { PostData } from '@/models/PostData';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { createReply, createRepost, createRepostWithComment, likePost, unlikePost } from "@/services/postService";
import Modal from "@/components/modal";
import RepostMenu from "@/components/RepostMenu";

interface PostProps {
    post: PostData;
    onToggleLike?: (postId: number, isLiked: boolean) => void;
}

interface ToastProps {
    visible: boolean;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isReposted, setIsReposted] = useState(post.isReposted);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
    const [modalType, setModalType] = useState<'reply' | 'repostWithComment'>();
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);

    const formatTimestamp = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 60) {
            return `${diffMins}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/thread/${post.id}`;
        navigator.clipboard.writeText(shareUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const ShareIcon = () => (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );

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

    const handleUsernameClick = (e: React.MouseEvent, username: string) => {
        e.stopPropagation();
        const currentPath = window.location.pathname;
        router.push({
            pathname: `/profile/${username}`,
            query: { from: currentPath }
        });
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
            await createRepost(post.id);
            setIsReposted(true);
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
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao enviar:', error);
        }
    };

    const handleViewThread = (postId: number) => {
        const currentPath = window.location.pathname;
        router.push({
            pathname: `/thread/${postId}`,
            query: { from: currentPath }
        });
    };

    const isRepost = post.repostParentId !== null;
    const isRepostWithComment = isRepost && post.content && post.content !== '';
    const showData = isRepost && !isRepostWithComment && post.repostPostData
        ? post.repostPostData
        : post;

    return (
        <Page>
            <PostContainer onClick={() => handleViewThread(post.id)}>
                {isRepost && !isRepostWithComment && (
                    <RepostIndicator>
                        🔁 Repostado por <strong>{post.username}</strong>
                    </RepostIndicator>
                )}
                <UserHeader>
                    <Username onClick={(e) => handleUsernameClick(e, showData?.username)}>
                        {showData?.username}
                    </Username>
                    <TimeStamp>{formatTimestamp(showData?.createdAt)}</TimeStamp>
                </UserHeader>
                <Content>{showData?.content}</Content>

                {/* Container do Post Original */}
                {isRepostWithComment && post.repostPostData && (
                    <RepostContainer
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewThread(post.repostPostData!.id);
                        }}
                    >
                        <UserHeader>
                            <Username>{post.repostPostData!.username}</Username>
                            <TimeStamp>{formatTimestamp(post.repostPostData.createdAt)}</TimeStamp>
                        </UserHeader>
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
                    <ShareContainer>
                        <Toast visible={showToast}>Link Copiado!</Toast>
                        <ShareButton onClick={handleShare}>
                            <ShareIcon />
                        </ShareButton>
                    </ShareContainer>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
`;

const PostContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const UserHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Username = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const TimeStamp = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const Content = styled.p`
  width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
  line-height: 1.5;
  margin-bottom: 16px;
`;

const Metrics = styled.small`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  width: 100%;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
  justify-content: center;
`;

const LikeButton = styled.button`
    background-color: #f8d7da;
    border: none;
    border-radius: 4px;
    color: #721c24;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #f5c6cb;
    }
`;
const ReplyButton = styled.button`
    background-color: #d4edda;
    border: none;
    border-radius: 4px;
    color: #155724;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #c3e6cb;
    }
`;

const RepostButton = styled.button`
    background-color: #cce5ff;
    border: none;
    border-radius: 4px;
    color: #004085;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #b8daff;
    }
`;

const ShareButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: 4px;
    color: white;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    &:hover {
        background-color: ${({ theme }) => theme.colors.secondary};
    }
`;

const Toast = styled.div<ToastProps>`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 8px;
    opacity: ${({ visible }) => visible ? '1' : '0'};
    transition: opacity 0.2s;
`;

const ShareContainer = styled.div`
    position: relative;
    display: inline-block;
`;
