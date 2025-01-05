import { useRouter } from 'next/router';
import React from 'react';
import { getThread, ThreadResponse } from '@/services/postService';
import Post from '@/components/post';
import styled from 'styled-components';
import { GetServerSideProps } from 'next'
import Head from 'next/head'


interface ThreadPageProps {
  metadata: {
    title: string
    description: string
    openGraph: {
      title: string
      image: string
      description: string
      url: string
      siteName: string
      locale: string
      type: string
    }
  }
  threadData: ThreadResponse | null
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const postId = context.params?.postId as string;
    const token = context.req.cookies['accessToken'];

    const threadData = await getThread(Number(postId), 0, 10, token);

    return {
      props: {
        metadata: {
          title: `${threadData.parentPost.username} no Toiter`,
          description: threadData.parentPost.content,
          openGraph: {
            title: `${threadData.parentPost.username} no Toiter`,
            description: threadData.parentPost.content,
            url: `${process.env.NEXT_PUBLIC_HOST}/thread/${postId}`,
            image: threadData.parentPost.profilePicture,
            siteName: 'Toiter',
            locale: 'pt_BR',
            type: 'article'
          }
        },
        threadData // Pass the full thread data
      }
    }
  } catch (error) {
    // Handle errors gracefully
    return {
      props: {
        metadata: {
          title: 'Post não encontrado',
          description: 'O post que você procura não foi encontrado.',
          openGraph: {/* ... */}
        },
        threadData: null
      }
    }
  }
}

const PostId = ({ metadata, threadData }: ThreadPageProps) => {
  const router = useRouter();
  const { from } = router.query;

  const handleBack = () => {
    if (from) {
      router.push(from as string);
    } else {
      router.push('/feed');
    }
  };

  if (!threadData) {
    return <ErrorMessage>Thread não encontrada.</ErrorMessage>;
  }

  return (
    <ThreadContainer>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <meta property="og:image" content={metadata.openGraph.image} />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
      </Head>
      
      <Header>
        <BackButton onClick={handleBack}>Voltar</BackButton>
        <Title>Visualização de Thread</Title>
      </Header>

      <Post post={threadData.parentPost} />
      
      <RepliesTitle>Respostas</RepliesTitle>
      
      {threadData.childPosts.length > 0 ? (
        threadData.childPosts.map((reply) => (
          <Post key={reply.id} post={reply} />
        ))
      ) : (
        <NoRepliesMessage>Sem respostas ainda.</NoRepliesMessage>
      )}
    </ThreadContainer>
  );
};

export default PostId;

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
