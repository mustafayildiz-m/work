import { useState } from 'react';
import { getToken, handle401 } from '@/utils/auth';

export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      
      if (!token) {
        handle401();
        throw new Error('Kullanıcı girişi yapılmamış');
      }

      // Get user ID from token
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const userId = decodedPayload.sub;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('user_id', userId);
      
      // Determine post type and set accordingly
      let postType = 'text';
      if (postData.imageUrl) {
        postType = 'image';
      } else if (postData.videoUrl) {
        postType = 'video';
      }
      
      formData.append('type', postType);
      formData.append('title', postData.title || '');
      formData.append('content', postData.content);
      
      // Add file if exists
      if (postData.imageUrl) {
        formData.append('file', postData.imageUrl);
      } else if (postData.videoUrl) {
        formData.append('file', postData.videoUrl);
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401();
          throw new Error('Oturum süresi dolmuş');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gönderi oluşturulurken bir hata oluştu');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        handle401();
        throw new Error('Kullanıcı girişi yapılmamış');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401();
          throw new Error('Oturum süresi dolmuş');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Dosya yüklenirken bir hata oluştu');
      }

      const result = await response.json();
      return result.fileUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    uploadFile,
    loading,
    error
  };
};
