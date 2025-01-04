import api from './api';

export const getImageById = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/images/${id}`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<number> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.id;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};