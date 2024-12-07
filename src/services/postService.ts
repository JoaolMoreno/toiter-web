import api from './api';
import { PostData } from '@/models/PostData';

export const getPostsByUser = async (username: string, page: number, size: number): Promise<{
    content: PostData[];
    pageable: { pageNumber: number; pageSize: number };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
}> => {
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

export const getFeed = async (page: number, size: number): Promise<{
    content: PostData[];
    pageable: { pageNumber: number; pageSize: number };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
}> => {
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
}
