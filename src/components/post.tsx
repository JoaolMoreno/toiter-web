import React, { useState } from 'react';
import { PostData } from '@/models/PostData';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { createReply, createRepost, createRepostWithComment, deletePost, likePost, unlikePost } from '@/services/postService';
import Modal from '@/components/modal';
import RepostMenu from '@/components/RepostMenu';
import { useAuth } from '@/context/AuthContext';
import PostText from './postText';

interface PostProps {
    post: PostData;
    onToggleLike?: (postId: number, isLiked: boolean) => void;
    isAuthenticated?: boolean;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    // Estados de controle
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isHoveringPost, setIsHoveringPost] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);

    // Contadores e flags
    const [repostsCount, setRepostsCount] = useState(post.repostsCount);
    const [repliesCount, setRepliesCount] = useState(post.repliesCount);
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isReposted, setIsReposted] = useState(post.isReposted);

    // Modal de reply e repost
    const [isModalOpen, setModalOpen] = useState(false);
    const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
    const [isCardClickable, setCardClickable] = useState(true);
    const [modalType, setModalType] = useState<'reply' | 'repostWithComment'>();
    const [showToast, setShowToast] = useState(false);

    if (isRemoved) return null;

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

    const handleMenuOpen = () => {
        setMenuOpen(!isMenuOpen);
        setTimeout(() => {
            setMenuOpen(false);
        }, 3000);
    };

    const handleDeletePost = async () => {
        try {
            await deletePost(post.id);
            setIsRemoved(true);
        } catch (error) {
            console.error('Erro ao excluir post:', error);
        }
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
            <PostWrapper
                onClick={() => handleViewThread(post.id)}
                onMouseEnter={() => setIsHoveringPost(true)}
                onMouseLeave={() => setIsHoveringPost(false)}
                isHoveringPost={isHoveringPost}
            >
                {isRepost && !isRepostWithComment && (
                    <RepostBanner>
                        <RepostIcon>🔁</RepostIcon>
                        <span>Repostado por <strong>{post.username}</strong></span>
                    </RepostBanner>
                )}

                <MainContent>
                    <LeftColumn>
                        <Avatar
                            src={showData.profilePicture || '/default-profile.png'}
                            alt={showData?.username}
                            onMouseEnter={(e) => {
                                e.stopPropagation();
                                setIsHoveringPost(false);
                            }}
                            onMouseLeave={(e) => {
                                e.stopPropagation();
                                setIsHoveringPost(true);
                            }}
                            onClick={(e) => handleProfileClick(e, showData?.username)}
                        />
                    </LeftColumn>

                    <RightColumn>
                        <HeaderRow>
                            <UserName
                                onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    setIsHoveringPost(false);
                                }}
                                onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    setIsHoveringPost(true);
                                }}
                                onClick={(e) => handleProfileClick(e, showData?.username)}
                            >
                                {showData?.username}
                            </UserName>
                            <PostTime>{formatTimestamp(showData?.createdAt)}</PostTime>

                            {showData?.username === user?.username && (
                                <PostMenu>
                                    <MenuButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMenuOpen();
                                        }}
                                    >
                                        &#x2026; {/* Ícone de três pontos */}
                                    </MenuButton>
                                    {isMenuOpen && (
                                        <MenuOptions>
                                            <DeleteOptionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmOpen(true);
                                                }}
                                            >
                                                Excluir
                                            </DeleteOptionButton>
                                        </MenuOptions>
                                    )}
                                </PostMenu>
                            )}
                            {isDeleteConfirmOpen && (
                                <ConfirmationOverlay
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <DeleteConfirmationBox>
                                        <ModalTitle>Deseja mesmo excluir?</ModalTitle>
                                        <ButtonsRow>
                                            <DeleteButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePost();
                                                }}
                                            >
                                                Sim
                                            </DeleteButton>

                                            <CancelButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmOpen(false);
                                                }}
                                            >
                                                Não
                                            </CancelButton>
                                        </ButtonsRow>
                                    </DeleteConfirmationBox>
                                </ConfirmationOverlay>
                            )}
                        </HeaderRow>
                        <PostText content={showData?.content || ''} />

                        {isRepostWithComment && post.repostPostData && (
                            <QuotedPost>
                                <QuotedHeader>
                                    <QuotedAvatar
                                        src={post.repostPostData.profilePicture || '/default-profile.png'}
                                        alt={post.repostPostData.username}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (post.repostPostData?.username) {
                                                handleProfileClick(e, post.repostPostData.username);
                                            }
                                        }}
                                    />
                                    <QuotedUserInfo>
                                        <UserName
                                            onClick={(e) => {
                                                if (post.repostPostData?.username) {
                                                    handleProfileClick(e, post.repostPostData.username);
                                                }
                                            }}
                                        >
                                            {post.repostPostData?.username}
                                        </UserName>
                                        <PostTime>{formatTimestamp(post.repostPostData.createdAt)}</PostTime>
                                    </QuotedUserInfo>
                                </QuotedHeader>
                                <PostText content={post.repostPostData?.content || ''} />
                            </QuotedPost>
                        )}

                        <ActionButtons>
                            <ActionButton
                                onMouseEnter={() => setIsHoveringPost(false)}
                                onMouseLeave={() => setIsHoveringPost(true)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeToggle(post.id);
                                }}
                            >
                                {isLiked ? '❤️' : '🤍'}
                                <ActionMetric>{likesCount}</ActionMetric>
                            </ActionButton>

                            <ActionButton
                                onMouseEnter={() => setIsHoveringPost(false)}
                                onMouseLeave={() => setIsHoveringPost(true)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReply();
                                }}
                            >
                                💬
                                <ActionMetric>{repliesCount}</ActionMetric>
                            </ActionButton>

                            <ActionButton
                                isActive={isReposted}
                                onMouseEnter={() => setIsHoveringPost(false)}
                                onMouseLeave={() => setIsHoveringPost(true)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepost();
                                }}
                            >
                                🔁
                                <ActionMetric>{repostsCount}</ActionMetric>
                            </ActionButton>

                            <ShareWrapper>
                                <ActionButton
                                    onMouseEnter={(e) => {
                                        e.stopPropagation();
                                        setIsHoveringPost(false);
                                    }}
                                    onMouseLeave={(e) => {
                                        e.stopPropagation();
                                        setIsHoveringPost(true);
                                    }}
                                    onClick={handleShare}
                                >
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

const PostWrapper = styled.article<{ isHoveringPost: boolean }>`
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${({ isHoveringPost }) =>
        isHoveringPost ? 'rgba(0, 0, 0, 0.03)' : 'transparent'};
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
  color: ${({ theme, isActive }) =>
        isActive ? theme.colors.primary : theme.colors.textLight};
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
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
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

const PostMenu = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  &:focus {
    outline: none;
  }
`;

const MenuOptions = styled.div`
  position: absolute;
  top: 2rem;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const DeleteButton = styled.button`
  background-color: #e53e3e;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #c53030;
  }
`;

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const DeleteConfirmationBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
  text-align: center;
`;

const CancelButton = styled.button`
  background-color: #e2e8f0;
  color: #1a202c;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #cbd5e0;
  }
`;

const DeleteOptionButton = styled.button`
  background-color: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  width: 100%;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  &:hover {
    background-color: #c53030;
    transform: scale(1.05);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(229, 62, 62, 0.8);
  }
  &:active {
    transform: scale(0.95);
  }
`;
