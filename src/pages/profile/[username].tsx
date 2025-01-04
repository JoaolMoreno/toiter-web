import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import withAuth from '@/hoc/withAuth';
import { UserProfile } from '@/models/UserProfile';
import { getUserProfile, followUser, unfollowUser, updateUserProfile } from '@/services/userService';
import { getPostsByUser } from '@/services/postService';
import Post from '@/components/post';
import { PostData } from '@/models/PostData';
import { useAuth } from '@/context/AuthContext';
import { EditProfileModal } from '@/components/editProfileModal';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { username } = router.query;
  const { from } = router.query;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = user?.username === username;

  const handleBack = () => {
    if (from) {
      router.push(from as string);
    } else {
      router.push('/feed');
    }
  };

  const loadProfile = async () => {
    if (!username) return;
    try {
      const data = await getUserProfile(username as string);
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadPosts = async () => {
    if (!username || !hasMore) return;
    try {
      const data = await getPostsByUser(username as string, page, 10);
      setPosts(prev => [...prev, ...data.content]);
      setHasMore(page < data.totalPages - 1);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile.username);
      } else {
        await followUser(profile.username);
      }
      setProfile(prev =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
              followersCount: prev.isFollowing
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }
          : null
      );
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
    }
  };

  useEffect(() => {
    if (username) {
      loadProfile();
      loadPosts();
    }
  }, [username]);

  useEffect(() => {
    if (username && hasMore) {
      loadPosts();
    }
  }, [page]);

  if (!profile) return <LoadingMessage>Carregando perfil...</LoadingMessage>;

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>Voltar</BackButton>
      </Header>
      <ProfileHeader imageUrl={profile.headerImageUrl}>
        <ProfileImageWrapper>
          <ProfileImage src={profile.profileImageUrl} alt={profile.username} />
        </ProfileImageWrapper>
      </ProfileHeader>
      <ProfileInfo>
        <UserInfo>
          <DisplayName>{profile.displayName}</DisplayName>
          <Username>
            @{profile.username}
            {profile.isFollowingMe && (
              <FollowsYouBadge>Segue você</FollowsYouBadge>
            )}
          </Username>
          <Bio>{profile.bio}</Bio>
          <Stats>
            <StatItem>
              <strong>{profile.postsCount}</strong> Posts
            </StatItem>
            <StatItem>
              <strong>{profile.followersCount}</strong> Seguidores
            </StatItem>
            <StatItem>
              <strong>{profile.followingCount}</strong> Seguindo
            </StatItem>
          </Stats>
          {isOwnProfile ? (
            <EditButton onClick={() => setIsEditModalOpen(true)}>
              Editar Perfil
            </EditButton>
          ) : (
            <FollowButton
              isFollowing={profile.isFollowing}
              onClick={handleFollow}
            >
              {profile.isFollowing ? 'Deixar de Seguir' : 'Seguir'}
            </FollowButton>
          )}
        </UserInfo>
      </ProfileInfo>
      <PostsSection>
        <PostsTitle>Posts</PostsTitle>
        {posts.map(post => (
          <Post key={post.id} post={post} />
        ))}
        {hasMore && (
          <LoadMoreButton onClick={() => setPage(prev => prev + 1)}>
            Carregar mais
          </LoadMoreButton>
        )}
      </PostsSection>
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await updateUserProfile(data);
            await loadProfile();
            setIsEditModalOpen(false);
          } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
          }
        }}
        currentDisplayName={profile.displayName}
        currentBio={profile.bio}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  background-color: #000;
  color: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1a1a;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #333;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background-color: #1da1f2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0d8ddb;
  }
`;

const ProfileHeader = styled.div<{ imageUrl: string }>`
  position: relative;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  height: 200px;
  border-radius: 12px 12px 0 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProfileImageWrapper = styled.div`
  position: absolute;
  left: 50%;
  bottom: -50px;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border: 4px solid ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0 0 12px 12px;
  padding: 60px 24px 24px;
  margin-top: -12px;
`;

const UserInfo = styled.div`
  text-align: center;
  margin-top: 16px;
`;

const DisplayName = styled.h1`
  font-size: 20px;
`;

const Username = styled.p`
  font-size: 16px;
  color: #8899a6;
`;

const FollowsYouBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Bio = styled.p`
  margin: 8px 0;
  font-size: 14px;
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
`;

const StatItem = styled.div`
  font-size: 14px;
  strong {
    font-size: 16px;
  }
`;

const FollowButton = styled.button<{ isFollowing: boolean }>`
  margin-top: 16px;
  background-color: ${({ isFollowing }) => (isFollowing ? '#657786' : '#1da1f2')};
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const EditButton = styled.button`
  margin-top: 16px;
  background-color: transparent;
  color: #1da1f2;
  border: 1px solid #1da1f2;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1da1f2;
    color: white;
  }
`;

const PostsSection = styled.div`
  margin-top: 20px;
`;

const PostsTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
`;

const LoadMoreButton = styled.button`
  background-color: #1da1f2;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 20px auto;
`;

const LoadingMessage = styled.p`
  text-align: center;
  margin: 20px 0;
`;

export default withAuth(ProfilePage);
