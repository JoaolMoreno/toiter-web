import api from './api';
import type { UserProfile, UpdatedUser } from '@/models/UserProfile';
import { getImageById } from './imageService';

export const getUserProfile = async (username: string): Promise<UserProfile> => {
  try {
    const { data } = await api.get(`/users/${username}`);
    
    // Fetch images if IDs exist
    const headerImageUrl = data.headerImageId ? 
      await getImageById(data.headerImageId) : '';
    const profileImageUrl = data.profileImageId ? 
      await getImageById(data.profileImageId) : '/default-profile.png';

    return {
      username: data.username,
      displayName: data.username,
      bio: data.bio,
      headerImageUrl,
      profileImageUrl,
      followersCount: data.followersCount,
      followingCount: data.followingCount,
      postsCount: data.postsCount || 0,
      isFollowing: data.following,
      isFollowingMe: data.isFollowingMe
    };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
};

export const updateUserProfile = async (updatedUser: UpdatedUser): Promise<void> => {
  try {
    await api.put('/users/', updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

export const updateProfileImage = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    await api.put('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    console.error('Erro ao atualizar imagem de perfil:', error);
    throw error;
  }
};

export const updateHeaderImage = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    await api.put('/users/header-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    console.error('Erro ao atualizar imagem de header:', error);
    throw error;
  }
};

export const followUser = async (username: string): Promise<void> => {
  try {
    await api.post(`/follows/${username}/follow`);
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    throw error;
  }
};

export const unfollowUser = async (username: string): Promise<void> => {
  try {
    await api.delete(`/follows/${username}/unfollow`);
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    throw error;
  }
};

export const getFollowers = async (username: string) => {
  try {
    const { data } = await api.get(`/follows/${username}/followers`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error);
    throw error;
  }
};

export const getFollowing = async (username: string) => {
  try {
    const { data } = await api.get(`/follows/${username}/followings`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar seguidos:', error);
    throw error;
  }
};