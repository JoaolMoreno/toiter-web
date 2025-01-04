import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import withAuth from '@/hoc/withAuth';
import { UserProfile } from '@/models/UserProfile';
import { getUserProfile, followUser, unfollowUser, updateProfileImage, updateHeaderImage, updateUserProfile } from '@/services/userService';
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
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.username === username;
  console.log('Current user:', user);
  console.log('URL username:', username);
  console.log('Is own profile:', isOwnProfile);

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
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setLoading(false);
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
      setProfile(prev => prev ? {
        ...prev, 
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      } : null);
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
    }
  };

  const handleImageUpload = async (type: 'profile' | 'header', file: File) => {
    try {
      if (type === 'profile') {
        await updateProfileImage(file);
      } else {
        await updateHeaderImage(file);
      }
      await loadProfile();
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
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

  if (loading) return <LoadingMessage>Carregando perfil...</LoadingMessage>;
  if (!profile) return <LoadingMessage>Perfil não encontrado</LoadingMessage>;

  return (
    <ProfileContainer>
      <Header>
        <BackButton onClick={handleBack}>Voltar</BackButton>
      </Header>

      <ProfileHeader imageUrl={profile.headerImageUrl || '/default-header.png'}>
        {isOwnProfile && (
            <ImageUploadOverlay>
              <ImageInput
                  id="header-image"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('header', file);
                  }}
              />
              <ImageLabel htmlFor="header-image">Alterar capa</ImageLabel>
            </ImageUploadOverlay>
        )}
      </ProfileHeader>

      <ProfileContent>
        <ProfileImageSection>
          <ProfileImageWrapper>
            <ProfileImage
                src={profile.profileImageUrl || '/default-profile.png'}
                alt={profile.displayName}
            />
            {isOwnProfile && (
                <ImageUploadOverlay>
                  <ImageInput
                      id="profile-image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('profile', file);
                      }}
                  />
                  <ImageLabel htmlFor="profile-image">Alterar foto</ImageLabel>
                </ImageUploadOverlay>
            )}
          </ProfileImageWrapper>
        </ProfileImageSection>

        <UserInfo>
          <DisplayName>{profile.displayName}</DisplayName>
          <Username>@{profile.username}</Username>
          <Bio>{profile.bio}</Bio>
          
          <Stats>
            <StatItem><strong>{profile.postsCount}</strong> Posts</StatItem>
            <StatItem><strong>{profile.followersCount}</strong> Seguidores</StatItem>
            <StatItem><strong>{profile.followingCount}</strong> Seguindo</StatItem>
          </Stats>

          {isOwnProfile ? (
            <EditButton onClick={() => setIsEditModalOpen(true)}>
              Editar Perfil
            </EditButton>
          ) : (
            <FollowButton 
              onClick={handleFollow}
              isFollowing={profile.isFollowing}
            >
              {profile.isFollowing ? 'Deixar de Seguir' : 'Seguir'}
            </FollowButton>
          )}
        </UserInfo>

        <PostsContainer>
          <PostsTitle>Posts</PostsTitle>
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
          {hasMore && (
            <LoadMoreButton onClick={() => setPage(prev => prev + 1)}>
              Carregar mais
            </LoadMoreButton>
          )}
        </PostsContainer>
      </ProfileContent>

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
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ProfileHeader = styled.div<{ imageUrl: string }>`
  position: relative;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  height: 150px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Separador */
`;

const ProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -36px;
  left: 16px;
  border: 4px solid ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  overflow: hidden;
  width: 72px;
  height: 72px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: -36px;
`;

const DisplayName = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const Username = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.regular};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
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
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const ProfileContent = styled.div`
  position: relative;
  margin-top: -48px;
  padding: 0 24px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Separador */
  margin-bottom: 24px; /* Espaçamento entre os contêineres */

  @media (max-width: 768px) {
    padding: 0 16px;
    margin-top: -36px;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileImageSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Bio = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.regular};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  line-height: 1.5;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const StatItem = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};

  strong {
    color: ${({ theme }) => theme.colors.textLight};
  }

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const ImageUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: inherit;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

const ImageLabel = styled.label`
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
    gap: 12px;
  }
`;

const LoadMoreButton = styled.button`
  background-color: ${({ theme }) => theme.colors.backgroundElevated};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  border-radius: 20px;
  margin: 16px auto;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const ImageInput = styled.input.attrs({ type: 'file' })`
  display: none;
`;

const EditButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

const PostsTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FollowButton = styled.button<{ isFollowing: boolean }>`
  margin-top: 16px;
  background-color: ${({ theme, isFollowing }) =>
      isFollowing ? theme.colors.backgroundElevated : theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme, isFollowing }) =>
        isFollowing ? theme.colors.error : theme.colors.secondary};
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  padding: 20px;
`;

export default withAuth(ProfilePage);