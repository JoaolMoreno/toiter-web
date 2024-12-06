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
        const { data } = await api.get(`posts/user/${username}`, {
            params: { page, size },
        });
        return data;
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
    }
};
