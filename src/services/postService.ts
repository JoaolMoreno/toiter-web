import api from './api';
import {PostData} from '@/models/PostData';

export const getPostsByUser = async (username: string, page: number, size: number) => {
    try {
        console.log('Buscando posts do usuário:', username);
        const { data } = await api.get(`posts/user/${username}`, {
            params: { page, size },
        });
        console.log('Posts encontrados:', data);
        return data;
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
    }
};

export const getFeed = async (page: number, size: number) => {
    try {
        console.log('Buscando feed');
        const { data } = await api.get('posts', {
            params: { page, size },
        });
        console.log('Feed encontrado:', data);
        return data;
    } catch (error) {
        console.error('Erro ao buscar feed:', error);
        throw error;
    }
};

export const likePost = async (postId: number) => {
    try {
        const response = await api.post(`/posts/${postId}/like`);
        return response.status === 204;
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        return false;
    }
};

export const unlikePost = async (postId: number) => {
    try {
        const response = await api.delete(`/posts/${postId}/like`);
        return response.status === 204;
    } catch (error) {
        console.error('Erro ao descurtir post:', error);
        return false;
    }
};

export interface ThreadResponse {
    parentPost: PostData;
    childPosts: PostData[];
    hasNext: boolean;
    totalElements: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

export const getThread = async (id: number, page: number, size: number): Promise<ThreadResponse> => {
    try {
        const { data } = await api.get(`posts/thread/${id}`, { params: { page, size } });

        return transformThreadResponse(data);
    } catch (error) {
        console.error('Erro ao buscar thread:', error);
        throw error;
    }
};

function transformThreadResponse(response: any): ThreadResponse {
    return {
        ...response,
        childPosts: response.childPosts.map((child: any) => child.post), // Extraindo o objeto `post`
    };
}