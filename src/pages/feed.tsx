import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router'; 
import { getFeed } from '@/services/postService';
import { useAuth } from '@/context/AuthContext';
import styled from "styled-components";
import Post from '@/components/post';
import {useFeedContext} from "@/context/FeedProvider";
import withAuth from "@/hoc/withAuth";
import Modal from "@/components/modal";
import { createPost } from '@/services/postService';
import { getImageById } from '@/services/imageService';

interface ProfileImageProps {
    imageId: number | null;
}

const Feed = () => {
    const router = useRouter();
    const { isAuthenticated, logout, user } = useAuth();
    const [inputContent, setInputContent] = useState('');
    const {
        posts, setPosts,
        page, setPage,
        hasMore, setHasMore,
        loading, setLoading
    } = useFeedContext();

    const [isModalOpen, setModalOpen] = useState(false);

    const handleProfileClick = () => {
        if (user?.username) {
            router.push(`/profile/${user.username}`);
        }
    };

    const loadPosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            console.log("Carregando posts, página:", page);
            const data = await getFeed(page, 10);
            
            // Prevent duplicates
            setPosts((prev) => {
                const existingIds = new Set(prev.map(post => post.id));
                const newPosts = data.content.filter((post: { id: number; }) => !existingIds.has(post.id));
                return [...prev, ...newPosts];
            });

            const totalPages = Math.ceil(data.totalElements / 10);
            setHasMore(page + 1 < totalPages);
        } catch (error) {
            console.error("Erro ao carregar posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (!hasMore || loading) return;

        const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
        const scrollThreshold = document.documentElement.offsetHeight - 100;

        if (scrollPosition >= scrollThreshold) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);

    const ProfileImage = ({ imageId }: ProfileImageProps) => {
        const [imageUrl, setImageUrl] = useState<string>('');
    
        useEffect(() => {
            const loadImage = async () => {
                if (imageId) {
                    try {
                        const url = await getImageById(imageId);
                        setImageUrl(url);
                    } catch (error) {
                        console.error('Error loading profile image:', error);
                    }
                }
            };
            loadImage();
        }, [imageId]);
    
        return (
            <StyledProfileImage 
                src={imageUrl || '/default-profile.png'} 
                alt="Profile" 
            />
        );
    };

    const handleCreateNewPost = () => {
        setModalOpen(true);
    };

    const handleSubmitPost = async (content: string) => {
        try {
            const newPost = await createPost(content);
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao criar novo post:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadPosts();
    }, [isAuthenticated, page]);

    return (
        <Container>
            <Header>
                <ProfileButton onClick={handleProfileClick}>
                <ProfileImage imageId={user!.profileImageId} />
                </ProfileButton>
                <LogoutButton onClick={() => logout()}>Logout</LogoutButton>
            </Header>

            <FeedContainer>
                <FeedTitle>Seu Feed</FeedTitle>
                <CreatePostContainer>
                    <CreatePostInput placeholder="No que você está pensando?"
                                     value={inputContent}
                                     onChange={(e) => setInputContent(e.target.value)}/>
                    <CreatePostButton onClick={handleCreateNewPost}>Postar</CreatePostButton>
                </CreatePostContainer>

                {posts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                    />
                ))}
                {loading && <LoadingMessage>Carregando mais posts...</LoadingMessage>}
                {!hasMore && <EndMessage>Você chegou ao final do feed!</EndMessage>}

                <FloatingButton onClick={handleCreateNewPost}>+</FloatingButton>
            </FeedContainer>

            {/* Modal para criar novo post */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmitPost}
                    title="Criar Novo Post"
                    postType="post"
                    initialContent={inputContent}
                />
            )}
        </Container>
    );
};
export default withAuth(Feed);

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.div`
    background-color: ${({ theme }) => theme.colors.backgroundElevated};
    padding: 16px 24px;
    width: 100%;
    display: flex;
    justify-content: space-between; // Change from flex-end to space-between
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const StyledProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${({ theme }) => theme.colors.primary};
`;

export const LogoutButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const FeedContainer = styled.div`
    margin: 0 auto;
    padding: 20px;
    max-width: 900px;
`;

export const FeedTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
`;

export const CreatePostContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CreatePostInput = styled.input`
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CreatePostButton = styled.button`
    background-color: #95d5b2;
    border: none;
    border-radius: 4px;
    color: #081c15;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 14px;
    &:hover {
        background-color: #74c69d;
    }
`;

export const LoadingMessage = styled.p`
    text-align: center;
    color: #555;
    font-size: 14px;
`;

export const EndMessage = styled.p`
    text-align: center;
    color: #1b4332;
    font-weight: bold;
    font-size: 16px;
    margin-top: 20px;
`;

export const FloatingButton = styled.button`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #52b788;
    color: #fff;
    font-size: 24px;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    &:hover {
        background-color: #40916c;
    }
`;

const ProfileButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.8;
    }
`;
