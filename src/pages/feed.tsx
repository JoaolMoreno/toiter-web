import React, { useEffect, useState } from 'react';
import { getPostsByUser } from '@/services/postService';
import { useAuth } from '@/context/AuthContext';
import { PostData } from '@/models/PostData';
import styled from "styled-components";

const Feed = () => {
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Tamanho fixo da página
    const [hasMore, setHasMore] = useState(true); // Se ainda há mais posts para carregar
    const [loading, setLoading] = useState(false); // Estado para evitar requisições duplicadas

    const username = 'joao'; // Nome de usuário fixo para teste

    // Função para carregar posts
    const loadPosts = async () => {
        if (!hasMore || loading) return; // Impede carregar se não há mais páginas ou já está carregando

        setLoading(true); // Indica que estamos carregando mais posts

        try {
            console.log('Carregando posts...');
            const data = await getPostsByUser(username, page, size);

            // Atualiza os posts
            setPosts((prevPosts) => [...prevPosts, ...data.content]);

            // Calcula se há mais páginas
            const totalPages = Math.ceil(data.totalElements / size);
            setHasMore(page + 1 < totalPages); // Se a próxima página existir, ainda há mais
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        } finally {
            console.log('Finalizando carregamento...');
            setLoading(false); // Finaliza o carregamento
        }
    };

    // Função para verificar o fim da rolagem
    const handleScroll = () => {
        if (!hasMore || loading) return; // Impede carregar mais se já não há mais posts ou está carregando

        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100 // Detecta próximo ao final da tela
        ) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    // Adiciona o evento de rolagem
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loading]); // Atualiza o evento quando hasMore ou loading mudarem

    // Carrega os posts quando a página muda
    useEffect(() => {
        if (isAuthenticated) {
            loadPosts();
        }
    }, [isAuthenticated, page]);

    if (!isAuthenticated) {
        return <div>Carregando...</div>;
    }

    return (
        <FeedContainer>
            <FeedTitle>Seu Feed</FeedTitle>
            {posts.map((post) => (
                <PostCard key={post.id}>
                    <h3>{post.username}</h3>
                    <p>{post.content}</p>
                    <small>
                        Curtidas: {post.likesCount} | Respostas: {post.repliesCount} | Reposts: {post.repostsCount}
                    </small>
                </PostCard>
            ))}
            {loading && <LoadingMessage>Carregando mais posts...</LoadingMessage>}
            {!hasMore && <EndMessage>Você chegou ao final do feed!</EndMessage>}
        </FeedContainer>
    );
};

export default Feed;

// Estilos com styled-components
export const FeedContainer = styled.div`
    //max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const FeedTitle = styled.h1`
    font-size: 24px;
    color: #333;
    text-align: center;
    margin-bottom: 20px;
`;

export const PostCard = styled.div`
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #fff;

    h3 {
        margin: 0;
        color: #007bff;
        font-size: 18px;
    }

    p {
        margin: 10px 0;
        color: #444;
        font-size: 14px;
        line-height: 1.6;
    }

    small {
        display: block;
        margin-top: 10px;
        color: #888;
        font-size: 12px;
    }
`;

export const LoadingMessage = styled.p`
    text-align: center;
    color: #555;
    font-size: 14px;
`;

export const EndMessage = styled.p`
  text-align: center;
  color: #007bff;
  font-weight: bold;
  font-size: 16px;
  margin-top: 20px;
`;
