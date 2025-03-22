import { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';
import withAuth from '@/hoc/withAuth';

// Dynamically import chat components to avoid SSR issues with WebSocket
const ChatComponent = dynamic(() => import('@/components/chat'), {
  ssr: false
});

const ChatPageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 60px);
  margin: 0 auto;
  padding: 20px;
`;

const ChatPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/auth/login');
//     }
//   }, [isAuthenticated, router]);

//   if (!isAuthenticated) {
//     return null;
//   }

  return (
    <>
      <Head>
        <title>Messages | Toiter</title>
      </Head>
      <ChatPageContainer>
        <ChatComponent />
      </ChatPageContainer>
    </>
  );
};

export default withAuth(ChatPage);