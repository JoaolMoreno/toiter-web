import React, { useState } from 'react';
import { PostData } from '@/models/PostData';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { createReply, createRepost, createRepostWithComment, likePost, unlikePost } from '@/services/postService';
import Modal from '@/components/modal';
import RepostMenu from '@/components/RepostMenu';
import { useAuth } from '@/context/AuthContext';

interface PostProps {
    post: PostData;
    onToggleLike?: (postId: number, isLiked: boolean) => void;
    isAuthenticated?: boolean;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const { isAuthenticated } = useAuth();
    const [repostsCount, setRepostsCount] = useState(post.repostsCount);
    const [repliesCount, setRepliesCount] = useState(post.repliesCount);
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isReposted, setIsReposted] = useState(post.isReposted);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
    const [isCardClickable, setCardClickable] = useState(true);
    const [modalType, setModalType] = useState<'reply' | 'repostWithComment'>();
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);

    const formatTimestamp = (dateString: string): string => {
        const date = new Date(`${dateString}Z`);
        const now = new Date();

        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 0) {
            return 'Agora mesmo';
        } else if (diffMins < 60) {
            return `${diffMins}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
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
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
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
            console.error('Erro ao curtir:', error);
        }
    };

    const handleProfileClick = (e: React.MouseEvent, username: string) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        const currentPath = window.location.pathname;
        router.push({
            pathname: `/profile/${username}`,
            query: { from: currentPath }
        });
    };

    const handleReply = () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        setModalType('reply');
        setModalOpen(true);
        setCardClickable(false);
    };

    const handleRepost = () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        setRepostMenuOpen(true);
        setCardClickable(false);
    };

    const handleRepostSimple = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        try {
            await createRepost(post.id);
            setIsReposted(true);
            setRepostsCount(repostsCount + 1);
            setRepostMenuOpen(false);
            setCardClickable(true);
        } catch (error) {
            console.error('Erro ao repostar:', error);
        }
    };

    const handleRepostWithComment = () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        setModalType('repostWithComment');
        setModalOpen(true);
        setRepostMenuOpen(false);
        setCardClickable(false);
    };

    const handleSubmit = async (content: string) => {
        try {
            if (modalType === 'reply') {
                await createReply(post.id, content);
                setRepliesCount(repliesCount + 1);
            } else if (modalType === 'repostWithComment') {
                await createRepostWithComment(post.id, content);
                setRepostsCount(repostsCount + 1);
            }
            setModalOpen(false);
            setCardClickable(true);
        } catch (error) {
            console.error('Erro ao enviar:', error);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setCardClickable(true);
    };

    const handleRepostMenuClose = () => {
        setRepostMenuOpen(false);
        setCardClickable(true);
    };

    const handleViewThread = (postId: number) => {
        if (!isCardClickable) return;
        const currentPath = window.location.pathname;
        router.push({
            pathname: `/thread/${postId}`,
            query: { from: currentPath },
        });
    };

    const isRepost = post.repostParentId !== null;
    const isRepostWithComment = isRepost && post.content && post.content !== '';
    const showData = isRepost && !isRepostWithComment && post.repostPostData
        ? post.repostPostData
        : post;

    return (
        <Page>
            <PostWrapper onClick={() => handleViewThread(post.id)}>
                {isRepost && !isRepostWithComment && (
                    <RepostBanner>
                        <RepostIcon>🔁</RepostIcon>
                        <span>Repostado por <strong>{post.username}</strong></span>
                    </RepostBanner>
                )}

                <MainContent>
                    <LeftColumn>
                        <Avatar src={showData.profilePicture || '/default-profile.png'} alt={showData?.username} onClick={(e) => handleProfileClick(e, showData?.username)} />
                    </LeftColumn>

                    <RightColumn>
                        <HeaderRow>
                            <UserName onClick={(e) => handleProfileClick(e, showData?.username)}>{showData?.username}</UserName>
                            <PostTime>{formatTimestamp(showData?.createdAt)}</PostTime>
                        </HeaderRow>

                        <PostText>{showData?.content}</PostText>

                        {isRepostWithComment && post.repostPostData && (
                            <QuotedPost>
                                <QuotedHeader>
                                    <QuotedAvatar
                                        src={post.repostPostData.profilePicture || '/default-profile.png'}
                                        alt={post.repostPostData.username}
                                        onClick={(e) => {
                                            if (post.repostPostData?.username) {
                                                handleProfileClick(e, post.repostPostData.username);
                                            }
                                        }}
                                    />
                                    <QuotedUserInfo>
                                        <UserName onClick={(e) => {
                                            if (post.repostPostData?.username) {
                                                handleProfileClick(e, post.repostPostData.username);
                                            }
                                        }}>{post.repostPostData?.username}</UserName>
                                        <PostTime>{formatTimestamp(post.repostPostData.createdAt)}</PostTime>
                                    </QuotedUserInfo>
                                </QuotedHeader>
                                <PostText>{post.repostPostData?.content}</PostText>
                            </QuotedPost>
                        )}

                        <ActionButtons>
                            <ActionButton onClick={(e) => {
                                e.stopPropagation();
                                handleLikeToggle(post.id);
                            }}>
                                {isLiked ? '❤️' : '🤍'}
                                <ActionMetric>{likesCount}</ActionMetric>
                            </ActionButton>

                            <ActionButton onClick={(e) => {
                                e.stopPropagation();
                                handleReply();
                            }}>
                                💬
                                <ActionMetric>{repliesCount}</ActionMetric>
                            </ActionButton>

                            <ActionButton
                                isActive={isReposted}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepost();
                                }}
                            >
                                🔁
                                <ActionMetric>{repostsCount}</ActionMetric>
                            </ActionButton>

                            <ShareWrapper>
                                <ActionButton onClick={handleShare}>
                                    <ShareIcon />
                                </ActionButton>
                                <ToastNotification $visible={showToast}>Link Copiado!</ToastNotification>
                            </ShareWrapper>
                        </ActionButtons>
                    </RightColumn>
                </MainContent>

                <RepostMenu
                    isOpen={isRepostMenuOpen}
                    onClose={handleRepostMenuClose}
                    onRepost={handleRepostSimple}
                    onQuoteRepost={handleRepostWithComment}
                />

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSubmit={handleSubmit}
                    postType={modalType!}
                    parentPostContent={showData?.content}
                    parentUsername={showData?.username}
                    title={modalType === 'reply' ? 'Responder' : 'Repostar com Comentário'}
                />
            </PostWrapper>
        </Page>
    );
};

export default Post;

const Page = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px;
`;

const PostWrapper = styled.article`
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
`;

const RepostBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 14px;
    margin-bottom: 8px;
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
`;

const LeftColumn = styled.div`
    flex-shrink: 0;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Avatar = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const UserName = styled.span`
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    
    &:hover {
        text-decoration: underline;
    }
`;

const PostTime = styled.span`
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 14px;
`;

const PostText = styled.p`
    color: ${({ theme }) => theme.colors.text};
    font-size: 16px;
    line-height: 1.6;
    margin: 8px 0;
    white-space: pre-wrap;
`;

const QuotedPost = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 12px;
    margin-top: 8px;
`;

const QuotedHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
`;

const QuotedAvatar = styled.img`
    width: 24px;
    height: 24px;
    border-radius: 50%;
`;

const QuotedUserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const ActionButtons = styled.div`
    display: flex;
    justify-content: space-between;
    max-width: 425px;
    margin-top: 12px;
`;

const ActionButton = styled.button<{ isActive?: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: none;
    background: none;
    color: ${({ theme, isActive }) => isActive ? theme.colors.primary : theme.colors.textLight};
    cursor: pointer;
    transition: all 0.2s;
    font-size: 18px;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
        background-color: ${({ theme }) => `${theme.colors.primary}10`};
        border-radius: 50px;
    }
`;

const ActionMetric = styled.span`
    font-size: 16px;
`;

const ShareWrapper = styled.div`
    position: relative;
`;

const ToastNotification = styled.div<{ $visible: boolean }>`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${({ theme }) => theme.colors.text};
    color: black;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    opacity: ${props => props.$visible ? 1 : 0};
    visibility: ${props => props.$visible ? 'visible' : 'hidden'};
    transition: opacity 0.2s;
    pointer-events: none;
    white-space: nowrap;
`;

const RepostIcon = styled.span`
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 14px;
    margin-right: 4px;
    display: inline-flex;
    align-items: center;
`;
