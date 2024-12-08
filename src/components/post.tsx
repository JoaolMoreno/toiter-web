import React, { useState } from 'react';
import { PostData } from '@/models/PostData';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import {likePost, unlikePost} from "@/services/postService";

interface PostProps {
    post: PostData;
    onReply: (postId: number) => void;
    onRepost: (postId: number) => void;
    onViewThread: (postId: number) => void;
}

const Post: React.FC<PostProps> = ({ post, onReply, onRepost, onViewThread }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const router = useRouter();

    const handleLikeToggle = async (postId: number) => {
        try {
            if (isLiked) {
                const success = await unlikePost(postId);
                if (success) {
                    setIsLiked(false);
                    setLikesCount(likesCount - 1);
                }
            } else {
                const success = await likePost(postId);
                if (success) {
                    setIsLiked(true);
                    setLikesCount(likesCount + 1);
                }
            }
        } catch (error) {
            console.error('Erro ao curtir/descurtir:', error);
        }
    };

    const handleReply = (postId: number) => onReply(postId);
    const handleRepost = (postId: number) => onRepost(postId);
    const handleViewThread = (postId: number) => router.push(`/thread/${postId}`);

    const isRepost = post.repostParentId !== null;
    const isRepostWithoutContent = isRepost && (!post.content || post.content === '');
    const showData = isRepostWithoutContent ? post.repostPostData : post;

    return (
        <Page>
            <PostContainer onClick={() => handleViewThread(post.id)}>
                <Username>{showData?.username}</Username>
                <Content>{showData?.content}</Content>
                <Metrics>
                    Curtidas: {likesCount} | Respostas: {showData?.repliesCount} | Reposts: {showData?.repostsCount}
                </Metrics>

                <ButtonRow>
                    <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(post.id);
                    }}>
                        {isLiked ? '❤️ Descurtir' : '🤍 Curtir'}
                    </ActionButton>

                    <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleReply(post.id);
                    }}>
                        Responder
                    </ActionButton>

                    <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleRepost(post.id);
                    }}>
                        Repostar
                    </ActionButton>
                </ButtonRow>
            </PostContainer>
        </Page>
    );
};

export default Post;

export const Page = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
`;

export const PostContainer = styled.div`
    max-width: 900px;
    min-width: 600px;
    border: 1px solid #98c379;
    background-color: #eaf5e6;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &:hover {
        background-color: #d8f3dc;
    }
`;

const Username = styled.h3`
    margin: 0;
    color: #2d6a4f;
    font-size: 18px;
`;

const Content = styled.p`
    margin: 10px 0;
    color: #1b4332;
    font-size: 14px;
    line-height: 1.6;
`;

const Metrics = styled.small`
    display: block;
    margin-top: 10px;
    color: #555;
    font-size: 12px;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

const ActionButton = styled.button`
    background-color: #95d5b2;
    border: none;
    border-radius: 4px;
    color: #081c15;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #74c69d;
    }
`;
