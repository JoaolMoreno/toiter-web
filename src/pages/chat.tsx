import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import withAuth from '@/hoc/withAuth';
import {WebSocketProvider} from "@/context/WebSocketContext";

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
  return (
    <>
      <Head>
        <title>Messages | Toiter</title>
      </Head>
      <ChatPageContainer>
          <WebSocketProvider>
            <ChatComponent />
          </WebSocketProvider>
      </ChatPageContainer>
    </>
  );
};

export default withAuth(ChatPage);