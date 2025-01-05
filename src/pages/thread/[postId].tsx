import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getThread } from '@/services/postService';
import { PostData } from '@/models/PostData';
import Post from '@/components/post';
import styled from 'styled-components';
import withAuth from "@/hoc/withAuth";
import { GetServerSideProps } from 'next'
import Head from 'next/head'

interface ThreadPageProps {
  metadata: {
    title: string
    description: string
    openGraph: {
      title: string
      description: string
      url: string
      siteName: string
      locale: string
      type: string
    }
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const postId = context.params?.postId as string

    const threadData = await getThread(Number(postId), 0, 1)

    return {
      props: {
        metadata: {
          title: `${threadData.parentPost.username} no Toiter`,
          description: threadData.parentPost.content,
          openGraph: {
            title: `${threadData.parentPost.username} no Toiter`,
            description: threadData.parentPost.content,
            url: `https://toiter.lpmrn.com/thread/${postId}`,
            siteName: 'Toiter',
            locale: 'pt_BR',
            type: 'article'
          }
        },
        threadData
      }
    }
  } catch (error) {
    return {
      props: {
        metadata: {
          title: 'Post não encontrado',
          description: 'O post que você procura não foi encontrado.',
          openGraph: {
            title: 'Post não encontrado',
            description: 'O post que você procura não foi encontrado.',
            url: `https://toiter.lpmrn.com/thread/${context.params?.postId}`,
            siteName: 'Toiter',
            locale: 'pt_BR',
            type: 'article'
          }
        }
      }
    }
  }
}

const PostId = ({ metadata }: ThreadPageProps) => {
  const router = useRouter();
  const { postId, from } = router.query;

  const [parentPost, setParentPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (from) {
      router.push(from as string);
    } else {
      router.push('/feed');
    }
  };

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
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <meta property="og:type" content={metadata.openGraph.type} />
      </Head>
      <Header>
        <BackButton onClick={handleBack}>Voltar</BackButton>
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

export default withAuth<ThreadPageProps>(PostId)


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
