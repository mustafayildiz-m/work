import { useState, useEffect, useCallback } from 'react';

export const useIslamicNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false
  });

  const fetchNews = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/islamic-news?limit=${limit}&offset=${offset}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNews(data.news || []);
      setPagination({
        limit: data.pagination?.limit || limit,
        offset: data.pagination?.offset || offset,
        total: data.pagination?.total || data.totalCount || 0,
        hasMore: data.hasMore || false
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching news:', err);
      
      // Fallback to mock data if API is not available
      if (err.message.includes('fetch')) {
        const mockNews = [
          {
            id: 1,
            title: "İslami Haberler API'si şu anda kullanılamıyor",
            description: "Lütfen daha sonra tekrar deneyin veya sistem yöneticisi ile iletişime geçin.",
            image_url: null,
            source_name: "Sistem",
            pub_date: new Date().toISOString(),
            category: "bilgi",
            country: "turkey",
            language: "turkish"
          }
        ];
        setNews(mockNews);
        setPagination({
          limit,
          offset,
          total: 1,
          hasMore: false
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const searchNews = useCallback(async (query, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/islamic-news/search/${encodeURIComponent(query)}?limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNews(data.news || []);
      setPagination({
        limit: data.pagination?.limit || limit,
        offset: 0,
        total: data.pagination?.total || data.totalCount || 0,
        hasMore: data.hasMore || false
      });
    } catch (err) {
      setError(err.message);
      console.error('Error searching news:', err);
      
      // Fallback for search errors
      if (err.message.includes('fetch')) {
        setNews([]);
        setPagination({
          limit,
          offset: 0,
          total: 0,
          hasMore: false
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      const newOffset = pagination.offset + pagination.limit;
      fetchNews(pagination.limit, newOffset);
    }
  }, [pagination, loading, fetchNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    pagination,
    fetchNews,
    searchNews,
    loadMore,
    refetch: () => fetchNews(pagination.limit, 0)
  };
};
