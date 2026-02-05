import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/useLanguageContext';

export const useRecentPosts = (token) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { locale } = useLanguage();

  const fetchRecentPosts = useCallback(async () => {
    if (!token) {
      console.warn('No token provided for recent posts');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Dil parametresi ile API çağrısı
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/following/recent-posts`);
      url.searchParams.append('language', locale || 'tr');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecentPosts(data.posts || data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recent posts:', err);
      
      // Fallback to mock data if API is not available
      if (err.message.includes('fetch')) {
        const mockPosts = [
          {
            id: "mock-1",
            content: "<p>Gerçeği söylemeniz gereken on soru</p>",
            author: {
              fullName: "Test Kullanıcı",
              photoUrl: null
            },
            type: "scholar_post"
          },
          {
            id: "mock-2",
            content: "<p>Para hakkında inanılmaz beş gerçek</p>",
            author: {
              fullName: "Test Kullanıcı 2",
              photoUrl: null
            },
            type: "scholar_post"
          }
        ];
        setRecentPosts(mockPosts);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, locale]);

  useEffect(() => {
    fetchRecentPosts();
  }, [fetchRecentPosts]);

  return {
    recentPosts,
    loading,
    error,
    refetch: fetchRecentPosts
  };
};
