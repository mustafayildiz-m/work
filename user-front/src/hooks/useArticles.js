import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useArticles = (languageId, bookIds = null, search = '', page = 1, limit = 12) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit
  });

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (languageId) params.append('languageId', languageId);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search && search.trim()) params.append('search', search.trim());

      // bookIds string veya array olabilir
      if (bookIds) {
        const bookIdsString = Array.isArray(bookIds)
          ? bookIds.join(',')
          : bookIds;
        if (bookIdsString && bookIdsString.trim()) {
          params.append('bookIds', bookIdsString);
        }
      }

      const url = `${API_BASE_URL}/articles?${params.toString()}`;

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers: headers
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setArticles(data.data || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalCount || 0,
        itemsPerPage: data.pagination?.limit || limit
      });
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [languageId, bookIds, search, page, limit]);

  useEffect(() => {
    if (languageId) {
      fetchArticles();
    }
  }, [languageId, bookIds, search, page, limit, fetchArticles]);

  const goToPage = (newPage) => {
    // Bu fonksiyon sayfa değiştiğinde otomatik olarak useEffect'i tetikler
  };

  return {
    articles,
    loading,
    error,
    pagination,
    goToPage,
    refetch: fetchArticles
  };
};

