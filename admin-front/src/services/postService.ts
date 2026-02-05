import axios from 'axios';

export interface Translation {
  id: string;
  language: string;
  content: string;
  mediaUrls: string[];
  fileUrls: string[];
  status?: 'draft' | 'pending' | 'approved' | null; // Nullable - moderasyon sistemi sonradan eklenecek
  translatedBy?: number | null;
  approvedBy?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  scholarId: number;
  translations: Translation[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAxiosInstance = () => {
  const AUTH_TOKEN = localStorage.getItem('access_token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : undefined,
    },
  });
};

export const postService = {
  createPost: async (formData: FormData): Promise<Post> => {
    const axiosInstance = getAxiosInstance();
    const response = await axiosInstance.post('/scholar-posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getScholarPosts: async (scholarId: string, language?: string): Promise<Post[]> => {
    const axiosInstance = getAxiosInstance();
    const params = language ? { language } : {};
    const response = await axiosInstance.get(`/scholar-posts/scholar/${scholarId}`, { params });
    return response.data;
  },

  getPost: async (postId: string, language?: string): Promise<Post> => {
    const axiosInstance = getAxiosInstance();
    const params = language ? { language } : {};
    const response = await axiosInstance.get(`/scholar-posts/${postId}`, { params });
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    const axiosInstance = getAxiosInstance();
    await axiosInstance.delete(`/scholar-posts/${postId}`);
  },

  // Translation güncelleme/ekleme
  updateTranslation: async (
    postId: string,
    language: string,
    formData: FormData
  ): Promise<Translation> => {
    const axiosInstance = getAxiosInstance();
    const response = await axiosInstance.patch(
      `/scholar-posts/${postId}/translations/${language}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Translation silme
  deleteTranslation: async (postId: string, language: string): Promise<void> => {
    const axiosInstance = getAxiosInstance();
    await axiosInstance.delete(`/scholar-posts/${postId}/translations/${language}`);
  },
}; 