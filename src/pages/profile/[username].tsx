import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import withAuth from '@/hoc/withAuth';
import { UserProfile } from '@/models/UserProfile';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  updateUserProfile,
  updateProfileImage,
  updateHeaderImage
} from '@/services/userService';
import { getPostsByUser } from '@/services/postService';
import Post from '@/components/post';
import { PostData } from '@/models/PostData';
import { useAuth } from '@/context/AuthContext';
import { EditProfileModal } from '@/components/editProfileModal';
import { EditImageModal } from '@/components/editImageModal';
import Head from 'next/head';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { username } = router.query;
  const { from } = router.query;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [imageEditType, setImageEditType] = useState<'profile' | 'header'>('profile');
  const isOwnProfile = user?.username === username;

  const handleEditProfile = () => {
    setProfileModalOpen(true);
  };

  const handleEditProfileImage = () => {
    setImageEditType('profile');
    setImageModalOpen(true);
  };

  const handleEditHeaderImage = () => {
    setImageEditType('header');
    setImageModalOpen(true);
  };

  const handleBack = () => {
    event?.preventDefault();
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
    if (!username || !hasMore || loading) return;
    setLoading(true);

    try {
      const data = await getPostsByUser(username as string, page, 10);

      // Prevent duplicates by checking IDs
      setPosts(prev => {
        const existingIds = new Set(prev.map(post => post.id));
        const newPosts = data.content.filter((post: { id: number; }) => !existingIds.has(post.id));
        return [...prev, ...newPosts];
      });

      setHasMore(page < data.totalPages - 1);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  // Load posts when page changes
  useEffect(() => {
    if (username && hasMore) {
      loadPosts();
    }
  }, [page, username]);

  const handleScroll = () => {
    if (!hasMore || loading) return;

    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.offsetHeight - 100;

    if (scrollPosition >= scrollThreshold) {
      setPage(prev => prev + 1);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
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
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  if (!profile) return <LoadingMessage>Carregando perfil...</LoadingMessage>;

  return (
    <Container>
      <Head>
        <title>{profile.username} no Toiter</title>
      </Head>
      <Profile>
        <ProfileHeader imageUrl={profile.headerImageUrl}>
          <BackButton onClick={handleBack}>← Voltar</BackButton>
          {isOwnProfile && (
            <EditHeaderButton onClick={handleEditHeaderImage}>
              ✏️ Editar Imagem
            </EditHeaderButton>
          )}
        </ProfileHeader>
        <ProfileInfo>
          {isOwnProfile ? (
            <EditProfileButton onClick={() => handleEditProfile()}>
              Editar Perfil
            </EditProfileButton>
          ) : (
            <FollowButton $isFollowing={profile.isFollowing}
              onClick={handleFollow}
              disabled={isFollowLoading}>
              {profile.isFollowing ? 'Seguindo' : 'Seguir'}
            </FollowButton>
          )}
          <ProfileImageWrapper>
            <ProfileImageContainer onClick={isOwnProfile ? handleEditProfileImage : undefined}>
              <ProfileImage
                src={profile.profileImageUrl}
                alt={profile.username}
              />
            </ProfileImageContainer>
          </ProfileImageWrapper>
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
          </UserInfo>
        </ProfileInfo>
      </Profile>
      <PostsSection>
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
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await updateUserProfile(data);
            setProfile(prev => prev ? { ...prev, ...data } : prev);
            setProfileModalOpen(false);
          } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
          }
        }}
        currentDisplayName={profile.displayName}
        currentBio={profile.bio}
      />

      <EditImageModal
        isOpen={isImageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSubmit={async (file) => {
          try {
            if (imageEditType === 'profile') {
              await updateProfileImage(file);
            } else {
              await updateHeaderImage(file);
            }
            await loadProfile();
            setImageModalOpen(false);
          } catch (error) {
            console.error('Erro ao atualizar imagem:', error);
          }
        }}
        type={imageEditType}
        currentImage={imageEditType === 'profile'
          ? profile?.profileImageUrl
          : profile?.headerImageUrl}
      />
    </Container>
  );
};

const EditHeaderButton = styled.button`
  position: absolute;
  top: 24px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
  opacity: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const ProfileHeader = styled.div<{ imageUrl: string }>`
  position: relative;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  width: 100%;
  padding-bottom: 25%;
  max-height: 280px;
  border-radius: 12px 12px 0 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 1;
  margin-top: 25px;

  &:hover {
    ${EditHeaderButton} {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding-bottom: 33.33%;
  }
`;


const Profile = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;

  @media (max-width: 768px) {
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    padding: 0 8px;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 24px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  background-color: #000;
  color: #fff;
  position: relative;
`;

const ProfileInfo = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0 0 12px 12px;
  padding: 40px 24px 24px;
  margin-top: -12px;
`;

const ProfileImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: -80px auto 16px;
  width: 100px;
  height: 100px;
  border: 3px solid ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;


const ProfileImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  z-index: 3;

  &:hover {
    ${props =>
    props.onClick &&
    `
      &::after {
        content: '✏️';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        z-index: 4;
      }
    `}
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  text-align: center;
  margin-top: 16px;
`;

const DisplayName = styled.h1`
  font-size: 18px;
  margin-bottom: 4px;
`;

const Username = styled.p`
  font-size: 14px;
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
  font-size: 13px;
  text-align: center;
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
`;

const StatItem = styled.div`
  font-size: 13px;
  strong {
    font-size: 14px;
  }
`;

const FollowButton = styled.button<{ $isFollowing: boolean }>`
  position: absolute;
  top: 30px;
  right: 20px;
  background-color: ${({ $isFollowing }) => ($isFollowing ? '#657786' : '#1da1f2')};
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $isFollowing }) => ($isFollowing ? '#556677' : '#198ae0')};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EditProfileButton = styled.button`
  position: absolute;
  top: 30px;
  right: 20px;
  background-color: transparent;
  color: #1da1f2;
  border: 1px solid #1da1f2;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1da1f2;
    color: white;
  }
`;


const PostsSection = styled.div`
  margin-top: 16px;
`;

const LoadMoreButton = styled.button`
  background-color: #1da1f2;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 16px auto;
`;

const LoadingMessage = styled.p`
  text-align: center;
  margin: 16px 0;
`;

export default withAuth(ProfilePage);
