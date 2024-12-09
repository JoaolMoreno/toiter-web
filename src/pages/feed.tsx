import React, {useEffect, useState} from 'react';
import { getFeed } from '@/services/postService';
import { useAuth } from '@/context/AuthContext';
import styled from "styled-components";
import Post from '@/components/post';
import {useFeedContext} from "@/context/FeedProvider";
import withAuth from "@/hoc/withAuth";
import Modal from "@/components/modal";
import { createPost } from '@/services/postService';

const Feed = () => {
    const { isAuthenticated, logout } = useAuth();
    const [inputContent, setInputContent] = useState('');
    const {
        posts, setPosts,
        page, setPage,
        hasMore, setHasMore,
        loading, setLoading
    } = useFeedContext();

    const [isModalOpen, setModalOpen] = useState(false); // Estado para controlar o modal

    const handleCreateNewPost = () => {
        setModalOpen(true); // Abre o modal para criar um post
    };

    const handleSubmitPost = async (content: string) => {
        try {
            const newPost = await createPost(content); // Chama a API para criar o post
            setPosts((prevPosts) => [newPost, ...prevPosts]); // Adiciona o novo post ao início do feed
            setModalOpen(false); // Fecha o modal
        } catch (error) {
            console.error('Erro ao criar novo post:', error);
        }
    };

    const loadPosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            console.log("Carregando posts, página:", page);
            const data = await getFeed(page, 10);
            setPosts((prev) => [...prev, ...data.content]);

            const totalPages = Math.ceil(data.totalElements / 10);
            setHasMore(page + 1 < totalPages);
            console.log("Posts carregados:", data.content.length);
        } catch (error) {
            console.error("Erro ao carregar posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadPosts();
    }, [isAuthenticated, page]);

    return (
        <Container>
            <Header>
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
    background-color: #d8f3dc;
    position: relative;
`;

export const Header = styled.div`
    display: flex;
    justify-content: flex-end;
    background-color: #95d5b2;
    padding: 10px 20px;
`;

export const LogoutButton = styled.button`
    background-color: #74c69d;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    color: #081c15;
    cursor: pointer;
    font-size: 14px;
    &:hover {
        background-color: #52b788;
    }
`;

export const FeedContainer = styled.div`
    margin: 0 auto;
    padding: 20px;
    max-width: 600px;
`;

export const FeedTitle = styled.h1`
    font-size: 24px;
    color: #081c15;
    text-align: center;
    margin-bottom: 20px;
`;

export const CreatePostContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    background-color: #eaf5e6;
    padding: 10px;
    border-radius: 8px;
`;

export const CreatePostInput = styled.input`
    flex: 1;
    border: 1px solid #95d5b2;
    border-radius: 4px;
    padding: 10px;
    font-size: 14px;
    color: #1b4332;
    &::placeholder {
        color: #2d6a4f;
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
