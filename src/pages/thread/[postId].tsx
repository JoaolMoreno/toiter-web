import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getThread } from '@/services/postService';
import { PostData } from '@/models/PostData';
import Post from '@/components/post';
import styled from 'styled-components';
import withAuth from "@/hoc/withAuth";

const PostId = () => {
    const router = useRouter();
    const { postId } = router.query;

    const [parentPost, setParentPost] = useState<PostData | null>(null);
    const [replies, setReplies] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    const loadThread = async () => {
        try {
            setLoading(true);
            if (!postId) return;

            const data = await getThread(Number(postId), 0, 10);
            setParentPost(data.parentPost);
            setReplies(data.childPosts || []);
        } catch (error) {
            console.error("Erro ao carregar a thread:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadThread();
    }, [postId]);

    if (loading) {
        return <LoadingMessage>Carregando thread...</LoadingMessage>;
    }

    if (!parentPost) {
        return <ErrorMessage>Thread não encontrada.</ErrorMessage>;
    }

    return (
        <ThreadContainer>
            <Header>
                <BackButton onClick={() => router.back()}>Voltar</BackButton>
                <Title>Visualização de Thread</Title>
            </Header>

            {/* Post Principal */}
            <Post
                post={parentPost}
            />

            <RepliesTitle>Respostas</RepliesTitle>

            {/* Replies */}
            {replies.length > 0 ? (
                replies.map((reply) => (
                    <Post
                        key={reply.id}
                        post={reply}
                    />
                ))
            ) : (
                <NoRepliesMessage>Sem respostas ainda.</NoRepliesMessage>
            )}
        </ThreadContainer>
    );
};

export default withAuth(PostId);


const ThreadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  min-height: 100vh;
  padding: 20px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.regular};
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.regular};
`;

const RepliesTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin: 24px 0 16px;
  text-align: center;
`;

const NoRepliesMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.regular};
`;
