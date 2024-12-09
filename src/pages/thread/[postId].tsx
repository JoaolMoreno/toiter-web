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
    background-color: #f9f9f9;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #95d5b2;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
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

const Title = styled.h1`
  font-size: 20px;
  color: #081c15;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #555;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: red;
  font-size: 16px;
`;

const RepliesTitle = styled.h2`
  font-size: 18px;
  color: #081c15;
  margin-top: 20px;
  text-align: center;
`;

const NoRepliesMessage = styled.p`
  text-align: center;
  color: #555;
  font-size: 14px;
`;
