import api from './api';
import type { PostData } from '@/models/PostData';

interface PostPayload {
    content: string;
    parentPostId?: number | null;
    repostParentId?: number | null;
}

const createFormData = (postData: PostPayload, media?: File | null): FormData => {
    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
    if (media) {
        formData.append('media', media);
    }
    return formData;
};

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

export const getPostById = async (postId: number): Promise<PostData> => {
    try {
        const { data } = await api.get(`posts/${postId}`);
        return data;
    } catch (error) {
        console.error('Erro ao buscar post:', error);
        throw error;
    }
};

export const getReplies = async (postId: number, page: number, size: number) => {
    try {
        const { data } = await api.get(`posts/${postId}/replies`, {
            params: { page, size },
        });
        return data;
    } catch (error) {
        console.error('Erro ao buscar respostas:', error);
        throw error;
    }
};

export const createPost = async (
    content: string,
    media?: File | null,
    parentPostId?: number | null,
    repostParentId?: number | null
): Promise<PostData> => {
    try {
        const postData = {
            content,
            parentPostId: parentPostId || null,
            repostParentId: repostParentId || null
        };
        
        const formData = createFormData(postData, media);
        
        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar post:', error);
        throw error;
    }
};

export const deletePost = async (postId: number) => {
    try {
        const response = await api.delete(`/posts/${postId}`);
        return response.status === 204;
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        throw error;
    }
};

export const createRepost = async (repostParentId: number): Promise<PostData> => {
    try {
        const postData = {
            content: '',
            repostParentId
        };
        
        const formData = createFormData(postData);
        
        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao repostar:', error);
        throw error;
    }
};

export const repostWithComment = async (repostParentId: number, content: string, media?: File | null): Promise<PostData> => {
    try {
        const postData = {
            content,
            repostParentId
        };
        
        const formData = createFormData(postData, media);
        
        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao repostar com comentário:', error);
        throw error;
    }
};

export const createReply = async (parentPostId: number, content: string, media?: File | null): Promise<PostData> => {
    try {
        const postData = {
            parentPostId,
            content
        };
        
        const formData = createFormData(postData, media);
        
        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao responder post:', error);
        throw error;
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

export const getThread = async (
    id: number,
    page: number,
    size: number
): Promise<ThreadResponse> => {
    try {
        const { data } = await api.get(`posts/thread/${id}`, {
            params: { page, size }
        });

        return transformThreadResponse(data);
    } catch (error) {
        console.error('Erro ao buscar thread:', error);
        throw error;
    }
};

function transformThreadResponse(response: any): ThreadResponse {
    return {
        ...response,
        childPosts: response.childPosts ? response.childPosts.map((child: any) => child.post) : [],
    };
}