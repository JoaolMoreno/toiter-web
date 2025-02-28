import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { getImageById } from '@/services/imageService';
import { useEffect, useState } from 'react';

interface ProfileImageProps {
    imageId: number | null | undefined;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const isAuthPage = router.pathname.startsWith('/auth');

    if (isAuthPage) {
        return <>{children}</>;
    }

    if (isLoading && !isAuthenticated) {
        return (
            <>
                <Header>
                    <LoadingState>Carregando...</LoadingState>
                </Header>
                <Main>{children}</Main>
            </>
        );
    }

    const handleProfileClick = () => {
        if (user?.username) {
            router.push(`/profile/${user.username}`);
        }
    };

    const ProfileImage = ({ imageId }: ProfileImageProps) => {
        const [imageUrl, setImageUrl] = useState<string>('');
        const [isLoading, setIsLoading] = useState(true);
        const { user } = useAuth();
    
        useEffect(() => {
            const loadImage = async () => {
                if (!user) return;
                
                setIsLoading(true);
                if (imageId) {
                    try {
                        const url = await getImageById(imageId);
                        setImageUrl(url);
                    } catch (error) {
                        console.error('Error loading profile image:', error);
                        setImageUrl('/default-profile.png');
                    }
                } else {
                    setImageUrl('/default-profile.png');
                }
                setIsLoading(false);
            };
    
            loadImage();
        }, [imageId, user]);
    
        if (isLoading) {
            return <LoadingProfileImage />;
        }
    
        return (
            <StyledProfileImage
                src={imageUrl}
                alt="Profile"
                onError={(e) => {
                    e.currentTarget.src = '/default-profile.png';
                }}
            />
        );
    };

    const renderHeaderContent = () => {
        return isAuthenticated ? (
            <>
                <ProfileButton onClick={handleProfileClick}>
                    <ProfileImage imageId={user?.profileImageId} />
                </ProfileButton>
                <AppName onClick={() => router.push('/')}>toiter</AppName>
                <LogoutButton onClick={() => logout()}>Logout</LogoutButton>
            </>
        ) : (
            <>
                <AppName onClick={() => router.push('/')}>toiter</AppName>
                <LoginButton onClick={() => router.push('/auth/login')}>
                    Login
                </LoginButton>
            </>
        );
    };

    return (
        <>
            <Header>
                {renderHeaderContent()}
            </Header>
            <Main>{children}</Main>
        </>
    );
};

export default Layout;

const LoadingState = styled.div`
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.regular};
`;

const Header = styled.div`
    background-color: ${({ theme }) => theme.colors.backgroundElevated};
    padding: 0 24px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const AppName = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    padding-bottom: 2px;
    border-bottom: 2px solid transparent;

    &:hover {
        opacity: 0.8;
        border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
    }
`;

const StyledProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${({ theme }) => theme.colors.primary};
`;

const ProfileButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.8;
    }
`;

const LogoutButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: ${({ theme }) => theme.fontSizes.regular};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ theme }) => theme.colors.secondary};
        transform: translateY(-1px);
    }
`;

const Main = styled.main`
    
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-1px);
  }
`;

const LoadingProfileImage = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            opacity: 1;
        }
    }
`;