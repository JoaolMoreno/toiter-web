import React, {useEffect, useState} from 'react';
import { getFeed } from '@/services/postService';
import { useAuth } from '@/context/AuthContext';
import styled from "styled-components";
import Post from '@/components/post';
import {useFeedContext} from "@/context/FeedProvider";
import withAuth from "@/hoc/withAuth";
import Modal from "@/components/modal";
import { createPost } from '@/services/postService';
import Head from 'next/head';

const Feed = () => {
    const { isAuthenticated} = useAuth();
    const [inputContent, setInputContent] = useState('');
    const {
        posts, setPosts,
        page, setPage,
        hasMore, setHasMore,
        loading, setLoading
    } = useFeedContext();

    const [isModalOpen, setModalOpen] = useState(false);

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

    const handleCreateNewPost = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setInputContent('');
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
            <Head>
                <title>Feed</title>
            </Head>
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
                    onClose={handleModalClose}
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
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    min-height: 100vh;
`;

export const FeedContainer = styled.div`
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px;
`;

export const FeedTitle = styled.h1`
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    padding: 16px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CreatePostContainer = styled.div`
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.backgroundElevated};
    border-radius: 8px;
    margin-bottom: 16px;
`;

const CreatePostInput = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 16px;
    resize: none;
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const CreatePostButton = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 24px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    font-weight: bold;
    cursor: pointer;
    align-self: flex-end;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryHover};
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
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
    font-size: 24px;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
    z-index: 100;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryHover};
        transform: scale(1.05);
    }
`;
